# DecA(I)de Platform Documentation

## Overview

DecA(I)de is an AI-powered DECA competition preparation platform designed to help high school students excel in DECA competitive events. This document provides comprehensive technical documentation for developers and stakeholders involved in the project.

## Platform Architecture

### Frontend
- **Framework**: React with TypeScript
- **State Management**: React Query for server state, React Context for global app state
- **Styling**: Tailwind CSS with shadcn components
- **Routing**: Wouter for lightweight routing
- **Animation**: Framer Motion, Lottie for complex animations
- **Data Visualization**: @visx/grid, @visx/shape, d3-scale

### Backend
- **Runtime**: Node.js with Express
- **Authentication**: Passport.js with local strategy
- **Database**: In-memory storage (MemStorage) with option to migrate to PostgreSQL
- **AI Integration**: Azure OpenAI with GPT-4o-mini deployment
- **Payment Processing**: Stripe with custom subscription management

### PWA Features
- Service worker registration for offline capabilities
- Web app manifest for home screen installation
- Responsive design for all device sizes

## Core Features

### 1. AI-Generated Roleplay Scenarios
- Dynamically generated based on event codes and performance indicators
- Customization options for difficulty level and context
- Usage limits based on subscription tier:
  - Standard: 3 roleplays/month
  - Plus: 10 roleplays/month
  - Pro: Unlimited

### 2. Practice Tests
- AI-generated questions mapped to DECA test blueprints
- User-configurable test length and content areas
- Real-time scoring and performance tracking
- Usage limits:
  - Standard: 2 tests/month
  - Plus: 8 tests/month
  - Pro: Unlimited

### 3. Performance Indicator (PI) Mastery
- Comprehensive database of all DECA PIs organized by instructional area
- AI-generated explanations with real-world business examples
- Progress tracking with mastery levels (Beginner, Intermediate, Advanced)

### 4. Written Event Support
- Structural templates for various written event categories
- AI-powered feedback on content quality
- Usage limits:
  - Standard: 2 papers/month
  - Plus: 7 papers/month
  - Pro: Unlimited

### 5. Engagement & Gamification
- Streak-based motivation system
- Achievement badges for completing various milestones
- Daily challenges with point rewards
- Micro-interactions throughout the interface
- Break timer with educational mini-games

## User Experience Design

### Interface Philosophy
The DecA(I)de interface follows these core principles:
1. **Professional Polish**: Corporate-level UI quality with attention to detail
2. **Engagement First**: Micro-interactions and animations to create an addictive experience
3. **Progressive Disclosure**: Features revealed gradually to avoid overwhelming users
4. **Contextual Help**: Guidance provided at the moment of need

### Micro-Interaction System
Over 100 micro-interactions are implemented throughout the platform:
- Success animations (confetti, stars, circles, fireworks)
- Streak counting with visual feedback
- Achievement notifications
- Break timer with mini-games
- Progress visualization with animated charts

### Mobile Experience
- Responsive design optimized for all device sizes
- Touch-friendly interface elements
- Offline capabilities through PWA implementation
- Mobile-specific navigation patterns

## Data Models

### User
```typescript
{
  id: number;
  username: string;
  password: string; // Hashed
  email: string | null;
  subscriptionTier: string; // "standard", "plus", "pro"
  eventFormat: string | null; // "roleplay", "team", "written"
  eventCode: string | null;
  eventType: string | null;
  instructionalArea: string | null;
  colorScheme: string | null;
  points: number;
  streak: number;
  lastLoginDate: Date;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}
```

### Performance Indicator
```typescript
{
  id: number;
  userId: number;
  indicator: string;
  category: string;
  status: string; // "not_started", "in_progress", "mastered"
  explanation: string | null;
  lastPracticed: Date | null;
}
```

### Practice Session
```typescript
{
  id: number;
  userId: number;
  type: string; // "roleplay", "test", "pi", "written"
  score: number | null;
  completedAt: Date;
  details: string | null;
}
```

## Authentication System

Authentication is implemented using:
- Passport.js with local strategy
- Express sessions with secure cookies
- Password hashing with scrypt
- Session validation middleware

## Subscription Management

Subscription tiers are managed through Stripe:
1. **Standard** ($9.99/month): Basic access with limited generations
2. **Plus** ($19.99/month): Increased limits, additional features
3. **Pro** ($39.99/month): Unlimited access to all platform features

Special offering: 500 free licenses for Round Rock High School students

## AI Integration

The platform uses Azure OpenAI with the following implementation details:
- GPT-4o-mini model for optimal performance and cost
- System prompts tailored to different generation needs
- Context augmentation with DECA-specific knowledge
- Rate limiting and content filtering

## Performance Optimization

- React Query for efficient data fetching and caching
- Image optimization with appropriate formats and lazy loading
- Code splitting for smaller initial bundle size
- Memoization of expensive computations
- Progressive loading techniques

## Break Timer System

The break timer feature includes three mini-games to help students refresh:
1. **Memory Game**: DECA-themed matching card game
2. **Block Blast**: Puzzle game with business-related elements
3. **Relax Break**: Guided breathing exercise with calming visuals

## Future Development Roadmap

1. **Enhanced Analytics**: More detailed performance tracking
2. **AI Tutor**: Personalized learning recommendations
3. **Team Collaboration**: Features for DECA teams to practice together
4. **Competition Simulator**: Realistic event day simulation
5. **Mobile App**: Native applications for iOS and Android

## Deployment Strategy

1. Initial testing at Round Rock High School with 500 free licenses
2. Expansion to District 5 DECA chapters
3. Statewide rollout with partnerships
4. National expansion strategy

## Branding Guidelines

### Logo Usage
- The DecA(I)de logo represents the professional and collaborative nature of DECA
- The handshake symbolizes business partnerships and professionalism
- The "I" in parentheses highlights individual contribution within team settings

### Color Palette
- Primary: #0F172A (Dark Navy)
- Secondary: #3B82F6 (Bright Blue)
- Accent: #F59E0B (Amber)
- Success: #10B981 (Emerald)
- Error: #EF4444 (Red)

### Typography
- Headings: Inter, semi-bold
- Body text: Inter, regular
- Monospace: JetBrains Mono (for code examples)

## Appendix

### Legal Considerations
- The platform does not copy official DECA materials directly
- All AI-generated content is unique and created on-demand
- 15% of profits are donated to DECA's Emerging Leader Scholarship Fund

### Development Team
- Project Lead: Vedant
- Frontend Development: [Team Members]
- Backend Development: [Team Members]
- UI/UX Design: [Team Members]