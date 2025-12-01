# PWA Expense Manager

A modern, offline-capable Progressive Web App for tracking income and expenses. Built with React, TypeScript, and Vite, this application works seamlessly both online and offline with full data persistence.

## ✨ Features

### 💰 Transaction Management
- **Dual Transaction Types**: Track both expenses and income
- **Custom Categories**: Create and manage custom categories for expenses and income
- **Edit Categories**: Rename existing categories with automatic updates to all associated transactions
- **Transaction Clearing**: Mark transactions as cleared/uncleared for better reconciliation
- **Date Tracking**: Flexible date selection for each transaction
- **Recent Transactions View**: Easy-to-scan list of all your financial activities

### 📱 Progressive Web App
- **Offline Support**: Full functionality without internet connection using IndexedDB
- **Service Worker**: Automatic caching for instant loading
- **Auto-Update Detection**: Notifies users when a new version is available
- **Installable**: Add to home screen on mobile devices for native-like experience
- **Offline Indicator**: Visual feedback when offline

### 🎨 Modern UI/UX
- **Dark Mode Support**: Beautiful dark theme for reduced eye strain
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Premium Aesthetics**: Modern design with smooth animations and transitions
- **Radix UI Components**: Accessible, well-tested UI components
- **Tailwind CSS**: Utility-first styling for consistent design

### 🔧 Developer Experience
- **TypeScript**: Full type safety across the entire codebase
- **Strict TypeScript Configuration**: Enforced function return types and strict mode
- **ESLint + Prettier**: Automated code formatting and linting
- **Husky + lint-staged**: Pre-commit hooks for code quality
- **Vitest**: Comprehensive unit test coverage
- **CI/CD Pipeline**: Automated testing, linting, and building via GitHub Actions

## 🛠️ Tech Stack

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Storage**: IndexedDB (via idb)
- **PWA**: vite-plugin-pwa with Workbox
- **Testing**: Vitest + React Testing Library
- **Date Handling**: Day.js
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js >= 24.0.0
- pnpm 10 or later

### Installation

```bash
# Navigate to project directory
cd pwa-expense-manager

# Install dependencies
pnpm install
```

### Development

```bash
# Start dev server
pnpm dev

# Start dev server with network access
pnpm dev --host

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Building

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Preview with network access
pnpm preview:host
```

## 📦 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Radix UI)
│   ├── AddExpenseForm.tsx
│   ├── CategoryManager.tsx
│   ├── ExpenseList.tsx
│   ├── OfflineIndicator.tsx
│   └── UpdateNotification.tsx
├── hooks/              # Custom React hooks
├── services/           # Business logic and API services
├── lib/                # Utility functions
├── test/               # Test setup and utilities
├── types.ts            # TypeScript type definitions
└── main.tsx            # Application entry point
```

## 🧪 Testing

The project uses Vitest and React Testing Library for unit testing:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

Tests are automatically run in CI/CD pipeline on every push and pull request.

## 🚢 Deployment

The application is configured for deployment on Vercel with the following features:

- Automatic deployments on push to main branch
- Service Worker updates on each deployment
- Optimized production builds
- Environment variable support

## 📄 License

This project is private and not licensed for public use.

## 🤝 Contributing

This is a personal project. If you'd like to contribute, please follow standard contribution guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request
