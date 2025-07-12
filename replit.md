# DecA(I)de Platform Architecture

## Overview

DecA(I)de is an AI-powered educational platform designed to help high school students prepare for DECA business competitions. The platform provides personalized learning experiences through AI-generated roleplay scenarios, practice tests, written event feedback, and interactive features. Built as a full-stack web application with React frontend and Express backend, it leverages Azure OpenAI for content generation and includes gamification elements to enhance user engagement.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Animation Library**: Framer Motion for micro-interactions and animations
- **State Management**: React Context API for global state (MicroInteractionsProvider)
- **Routing**: React Router for client-side navigation
- **Theme System**: Custom theme controller with Memphis-style design elements

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with session-based authentication
- **Session Storage**: PostgreSQL sessions using connect-pg-simple
- **API Structure**: RESTful endpoints organized by feature domains

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Key Entities**:
  - Users with event selection and subscription tiers
  - Performance indicators and practice sessions
  - Achievement and gamification data
  - Chat history and AI interactions

## Key Components

### AI Integration Layer
- **Service**: Azure OpenAI (GPT-4o-mini deployment)
- **SDK**: Azure OpenAI SDK 2.0.0 with proper deployment configuration
- **Use Cases**: 
  - Roleplay scenario generation
  - Practice test question creation
  - Written event feedback
  - Diego chat assistant responses
- **Error Handling**: Comprehensive error handling with fallback mechanisms

### Authentication System
- **Strategy**: Session-based authentication with Passport.js
- **Session Management**: Secure cookie-based sessions stored in PostgreSQL
- **User Management**: Registration, login, and profile management
- **Authorization**: Role-based access control for different subscription tiers

### Gamification Engine
- **Micro-Interactions**: Global animation provider with multiple animation types
- **Break Timer**: Pomodoro-style timer with three mini-games
- **Achievement System**: Points, badges, and streak tracking
- **Mascot Integration**: "Diego the Dolphin" for contextual guidance

### UI/UX Systems
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Theme System**: Dark/light mode with DECA cluster color schemes
- **Animation Framework**: Success animations, transitions, and feedback
- **Accessibility**: WCAG compliance considerations built into components

## Data Flow

### User Authentication Flow
1. User registration/login through Passport.js
2. Session creation and storage in PostgreSQL
3. Session-based route protection
4. User profile and preferences management

### AI Content Generation Flow
1. User initiates content request (roleplay, test, etc.)
2. Request validated and enriched with user context
3. Azure OpenAI API call with structured prompts
4. Response processing and formatting
5. Content delivery to frontend with animation triggers

### Gamification Flow
1. User actions tracked through MicroInteractionsProvider
2. Achievement criteria evaluation
3. Points and streak calculations
4. Animation triggers for feedback
5. Progress persistence to database

## External Dependencies

### Core Services
- **Azure OpenAI**: Primary AI service for content generation
- **PostgreSQL**: Database for user data, content, and sessions
- **Stripe**: Payment processing for subscription management

### Development Dependencies
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting
- **Tailwind CSS**: Utility-first CSS framework

### Third-Party Libraries
- **Framer Motion**: Animation library for micro-interactions
- **React Hook Form**: Form management with validation
- **Canvas Confetti**: Particle effects for celebrations
- **Radix UI**: Accessible component primitives

## Deployment Strategy

### Development Environment
- **Platform**: Replit for collaborative development
- **Database**: PostgreSQL instance (can be Neon or local)
- **Environment Variables**: Managed through Replit Secrets
- **Hot Reload**: Vite development server with TypeScript checking

### Production Considerations
- **Build Process**: Vite build for frontend, esbuild for backend
- **Environment**: NODE_ENV production configuration
- **Database**: PostgreSQL with connection pooling
- **Security**: Environment-based secrets management
- **Performance**: Optimized builds and asset compression

### Scaling Considerations
- **Database**: Drizzle ORM supports multiple PostgreSQL providers
- **API Rate Limiting**: Azure OpenAI usage monitoring
- **Session Storage**: PostgreSQL-based session scaling
- **CDN**: Static asset optimization for global delivery

## Changelog

- July 12, 2025. Implemented comprehensive PI selection system
  - Added authentic PI selection from deca-pis.json file
  - Fixed cluster mapping for all DECA career clusters
  - Added 17 comprehensive DECA events across all clusters
  - Implemented proper team vs individual event handling (7 vs 5 PIs)
  - Removed Azure OpenAI dependency in favor of reliable randomization
  - System now displays exact PI text with instructional area information
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.