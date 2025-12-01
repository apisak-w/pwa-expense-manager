/// <reference types="gapi" />
/// <reference types="gapi.auth2" />

declare global {
  interface Window {
    google?: typeof google;
  }

  namespace google {
    namespace accounts {
      namespace oauth2 {
        interface TokenClient {
          requestAccessToken(options?: {
            prompt?: string;
            callback?: (response: TokenResponse) => void;
          }): void;
        }

        interface TokenResponse {
          access_token: string;
          expires_in: string;
          error?: string;
          error_description?: string;
        }

        function initTokenClient(config: {
          client_id: string;
          scope: string;
          callback: (response: TokenResponse) => void;
        }): TokenClient;

        function revoke(token: string, callback?: () => void): void;
      }
    }
  }
}

export {};
