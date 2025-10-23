# FlowDoors Pricing App

A modern, responsive pricing and quoting application for FlowDoors Slide-and-Stack door systems.

## Overview

The FlowDoors Pricing App enables customers to configure custom Slide-and-Stack doors and receive instant quotes. Built with Next.js 15, TypeScript, and Firebase.

## Features

- **Product Configuration**: Interactive Slide-and-Stack door configurator
- **Instant Quotes**: Real-time pricing calculations
- **Lead Management**: Capture and track customer information
- **Admin Dashboard**: Manage quotes, leads, and analytics
- **PDF Generation**: Professional quote documents
- **Email Integration**: Automated quote delivery

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **PDF Generation**: React PDF

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Firebase project (see `FLOWDOORS_FIREBASE_SETUP.md`)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to see the app.

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks
- `pnpm test` - Run tests

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utility functions
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── context/         # React context providers
```

## Configuration

See `FLOWDOORS_FIREBASE_SETUP.md` for detailed Firebase setup instructions.

## Deployment

This app is configured for deployment on Vercel with PostgreSQL database support.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/myerscreative/flowdoors-pricing-app)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Key Requirements

- PostgreSQL database (Vercel Postgres recommended)
- Firebase project with authentication
- Postmark account for email delivery
- Environment variables (see [.env.production.example](./.env.production.example))

## License

Proprietary - FlowDoors
