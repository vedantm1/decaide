# DecA(I)de Platform Documentation

## Overview

DecA(I)de is an AI-powered educational platform designed specifically for DECA business competition preparation. The platform leverages Azure OpenAI's GPT models to provide personalized learning experiences including AI-generated roleplay scenarios, practice tests, written event feedback, and an interactive chat assistant named Diego the Dolphin.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: 
  - React Query for server state management and caching
  - React Context for global application state (auth, micro-interactions, UI state)
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - shadcn/ui components for consistent UI elements
  - Custom CSS files for professional themes and micro-interactions
- **Animation**: Framer Motion for complex animations and transitions
- **Background Effects**: Vanta.js for interactive 3D wave backgrounds

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed session store with connect-pg-simple
- **API Design**: RESTful endpoints organized by feature domains (AI, chat, user management)

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: 
  - Users table with subscription tiers and preferences
  - Performance indicators tracking
  - Practice sessions and scores
  - Achievements and gamification data
  - Break sessions and mini-game scores
- **Session Management**: PostgreSQL-backed session storage for persistence

## Key Components

### AI Integration
- **Service**: Azure OpenAI with GPT-4o-mini deployment
- **Features**: 
  - Roleplay scenario generation
  - Practice test question generation
  - Performance indicator explanations
  - Written event feedback
  - Diego chat assistant
- **Rate Limiting**: Subscription-based usage limits for different tiers

### Authentication System
- **Strategy**: Session-based authentication with Passport.js
- **Features**: Username/password login, secure password hashing with scrypt
- **Session Management**: 30-day persistent sessions with secure cookies

### Micro-Interactions System
- **Global Context**: MicroInteractionsProvider for centralized animation control
- **Features**: 
  - Success animations (confetti, stars, fireworks)
  - Break timer with Pomodoro technique
  - Mini-games (breathing exercises, memory games, Block Blast puzzle)
  - Diego the Dolphin mascot for contextual guidance
  - Achievement system with visual feedback

### Subscription Management
- **Payment Processing**: Stripe integration for subscription handling
- **Tiers**: Standard, Plus, and Pro with different usage limits
- **Features**: Customer portal, subscription management, usage tracking

## Data Flow

### User Authentication Flow
1. User submits credentials via login form
2. Passport.js validates against database
3. Session created and stored in PostgreSQL
4. User redirected to dashboard with authenticated state

### AI Content Generation Flow
1. User requests AI content (roleplay, test, etc.)
2. Backend validates user subscription limits
3. Azure OpenAI API called with structured prompts
4. Response parsed and returned to frontend
5. Usage counters updated in database

### Micro-Interaction Flow
1. User action triggers animation via global context
2. Animation state managed centrally
3. Visual feedback rendered with Framer Motion
4. Achievements/progress updated as needed

## External Dependencies

### AI Services
- **Azure OpenAI**: GPT-4o-mini deployment for content generation
- **Configuration**: Requires API key, endpoint, and deployment name

### Payment Processing
- **Stripe**: Subscription management and payment processing
- **Features**: Customer portal, webhook handling, subscription lifecycle

### Database
- **PostgreSQL**: Primary data storage with connection pooling
- **Neon Database**: Serverless PostgreSQL option supported

### Third-Party Libraries
- **UI Components**: Radix UI primitives via shadcn/ui
- **Animation**: Framer Motion for complex animations
- **Background Effects**: Vanta.js for 3D wave backgrounds
- **Form Handling**: React Hook Form with Zod validation

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with npm package management
- **Build Process**: Vite for frontend, esbuild for backend
- **Development Server**: Hot reload with Vite dev server and tsx for backend

### Production Deployment
- **Platform**: Configured for Replit deployment with autoscale
- **Build Commands**: `npm run build` for production assets
- **Start Command**: `npm run start` for production server
- **Port Configuration**: Internal port 5000, external port 80

### Environment Configuration
- Database URL for PostgreSQL connection
- Azure OpenAI credentials (key, endpoint, deployment)
- Session secret for secure session management
- Stripe keys for payment processing
- Optional Redis URL for caching/sessions

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.