/// <reference types="../types/google-gsi" />
/// <reference types="gapi.auth2" />

export interface GoogleAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  userEmail: string | null;
}

type AuthStateListener = (state: GoogleAuthState) => void;

export class GoogleAuthService {
  private authState: GoogleAuthState = {
    isAuthenticated: false,
    accessToken: null,
    expiresAt: null,
    userEmail: null,
  };

  private listeners: AuthStateListener[] = [];
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;
  private initialized = false;

  /**
   * Initialize the Google Identity Services client
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');
    }

    // Wait for the GIS library to load
    await this.waitForGIS();

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope:
        'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
      callback: (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          console.error('OAuth error:', response.error);
          return;
        }

        const expiresAt = Date.now() + (parseInt(response.expires_in) || 3600) * 1000;
        this.updateAuthState({
          isAuthenticated: true,
          accessToken: response.access_token,
          expiresAt,
          userEmail: null, // We'll fetch this separately
        });

        // Fetch user info
        this.fetchUserInfo(response.access_token);
      },
    });

    this.initialized = true;

    // Try to restore session from storage
    await this.restoreSession();
  }

  /**
   * Wait for the Google Identity Services library to load
   */
  private waitForGIS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.accounts) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total
      const interval = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Identity Services failed to load'));
        }
      }, 100);
    });
  }

  /**
   * Fetch user information from Google
   */
  private async fetchUserInfo(accessToken: string): Promise<void> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        this.updateAuthState({
          ...this.authState,
          userEmail: userInfo.email,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.tokenClient) {
      throw new Error('Token client not initialized');
    }

    // Request access token
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (this.authState.accessToken) {
      // Revoke the token
      google.accounts.oauth2.revoke(this.authState.accessToken, () => {
        console.log('Token revoked');
      });
    }

    this.updateAuthState({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      userEmail: null,
    });

    // Clear from storage
    await this.clearSession();
  }

  /**
   * Get current auth state
   */
  getAuthState(): GoogleAuthState {
    return { ...this.authState };
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.authState.expiresAt) return true;
    return Date.now() >= this.authState.expiresAt;
  }

  /**
   * Get access token (refreshes if expired)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.authState.isAuthenticated) return null;

    if (this.isTokenExpired()) {
      // Request a new token silently
      await this.refreshToken();
    }

    return this.authState.accessToken;
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<void> {
    if (!this.tokenClient) return;

    return new Promise((resolve, reject) => {
      this.tokenClient!.requestAccessToken({
        prompt: '',
        callback: (response: google.accounts.oauth2.TokenResponse) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          const expiresAt = Date.now() + (parseInt(response.expires_in) || 3600) * 1000;
          this.updateAuthState({
            ...this.authState,
            accessToken: response.access_token,
            expiresAt,
          });
          resolve();
        },
      });
    });
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: AuthStateListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Update auth state and notify listeners
   */
  private updateAuthState(newState: GoogleAuthState): void {
    this.authState = newState;
    this.listeners.forEach(listener => listener(newState));

    // Persist to storage
    this.persistSession();
  }

  /**
   * Persist session to IndexedDB
   */
  private async persistSession(): Promise<void> {
    try {
      const { storage } = await import('./storage');
      await storage.setAuthTokens({
        accessToken: this.authState.accessToken,
        expiresAt: this.authState.expiresAt,
        userEmail: this.authState.userEmail,
      });
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }

  /**
   * Restore session from IndexedDB
   */
  private async restoreSession(): Promise<void> {
    try {
      const { storage } = await import('./storage');
      const tokens = await storage.getAuthTokens();

      if (tokens && tokens.accessToken && tokens.expiresAt) {
        // Check if token is still valid
        if (Date.now() < tokens.expiresAt) {
          this.updateAuthState({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            expiresAt: tokens.expiresAt,
            userEmail: tokens.userEmail,
          });
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  }

  /**
   * Clear session from IndexedDB
   */
  private async clearSession(): Promise<void> {
    try {
      const { storage } = await import('./storage');
      await storage.setAuthTokens({
        accessToken: null,
        expiresAt: null,
        userEmail: null,
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }
}

export const googleAuthService = new GoogleAuthService();
