# DecA(I)de API Documentation

This document serves as a comprehensive guide for new developers to understand the DecA(I)de platform APIs and architecture. DecA(I)de is an AI-powered educational platform designed to help high school students prepare for DECA business competitions through various learning tools.

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [AI Features](#ai-features)
   - [Chat Features](#chat-features)
   - [User Management](#user-management)
   - [Subscription Management](#subscription-management)
   - [Data Access](#data-access)
4. [Data Models](#data-models)
5. [Integration Guidelines](#integration-guidelines)
6. [Environment Configuration](#environment-configuration)
7. [API Authentication](#api-authentication)
8. [Usage Limits](#usage-limits)

## System Overview

DecA(I)de is an educational platform that provides:

- AI-powered roleplay scenarios for DECA competition preparation
- Practice tests with automated grading
- Written event feedback
- Performance indicator training and assessment
- An interactive chat assistant (Diego) for answering DECA-related questions
- Subscription-based access with different tier limits
- Gamification features (achievements, points, etc.)

The platform leverages Azure OpenAI's GPT models to generate personalized content for students.

## Technology Stack

- **Frontend**: React.js with Framer Motion for animations
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Azure OpenAI (GPT-4o-mini)
- **Authentication**: Passport.js with session-based authentication
- **Payment Processing**: Stripe
- **Session Management**: Express-session with connect-pg-simple for PostgreSQL storage

## API Endpoints

### Authentication

Authentication is handled through Passport.js using session-based authentication.

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/auth/register` | POST | Register a new user | `{ username, password, email, eventFormat, eventCode, eventType, instructionalArea }` | User object |
| `/auth/login` | POST | Login user | `{ username, password }` | User session |
| `/auth/logout` | POST | Logout user | None | Success message |
| `/auth/user` | GET | Get current user | None | User object or 401 |

### AI Features

AI features are managed through the `/api/ai` routes:

| Endpoint | Method | Authentication | Description | Request Body | Response |
|----------|--------|----------------|-------------|-------------|----------|
| `/api/ai/status` | GET | None | Check Azure OpenAI availability | None | `{ status, deployment, message }` |
| `/api/ai/generate-roleplay` | POST | Required | Generate a DECA roleplay scenario | `{ instructionalArea, performanceIndicators, difficultyLevel, businessType? }` | Roleplay scenario JSON |
| `/api/ai/generate-test` | POST | Required | Generate DECA test questions | `{ testType, categories, numQuestions }` | Test questions JSON |
| `/api/ai/written-event-feedback` | POST | Required | Get feedback on written events | `{ eventType, content, sections? }` | Feedback JSON |

### Chat Features

Chat interactions are handled through the `/api/chat` routes:

| Endpoint | Method | Authentication | Description | Request Body | Response |
|----------|--------|----------------|-------------|-------------|----------|
| `/api/chat/diego` | POST | Optional | Chat with Diego (DECA assistant) | `{ message }` | `{ response, isUnrelated, shouldExit }` |
| `/api/chat/roleplay-feedback` | POST | Required | Get feedback on roleplay performance | `{ roleplayId, userResponse }` | `{ feedback }` |
| `/api/chat/explain-pi` | POST | Optional | Get explanation on performance indicators | `{ indicator, category? }` | `{ explanation }` |

### User Management

User management endpoints:

| Endpoint | Method | Authentication | Description | Request Body | Response |
|----------|--------|----------------|-------------|-------------|----------|
| `/api/user/settings` | POST | Required | Update user settings | `{ eventFormat?, eventCode?, eventType?, instructionalArea?, uiTheme?, colorScheme?, theme? }` | Updated user object |
| `/api/user/stats` | GET | Required | Get user statistics | None | User stats |
| `/api/user/activities` | GET | Required | Get user learning activities | None | Activity array |
| `/api/user/learning-items` | GET | Required | Get recommended learning items | None | Learning items array |

### Subscription Management

Subscription-related endpoints:

| Endpoint | Method | Authentication | Description | Request Body | Response |
|----------|--------|----------------|-------------|-------------|----------|
| `/api/subscription-tiers` | GET | None | Get available subscription tiers | None | Subscription limits object |
| `/api/user/subscription` | POST | Required | Update subscription (manual) | `{ tier }` | Updated user object |
| `/api/create-payment-intent` | POST | Required | Create a Stripe payment intent | `{ amount }` | Stripe payment intent |

### Data Access

Data access endpoints:

| Endpoint | Method | Authentication | Description | Request Body | Response |
|----------|--------|----------------|-------------|-------------|----------|
| `/api/deca-events` | GET | None | Get all DECA events data | None | `{ categories, events, eventTypeGroups }` |
| `/api/performance-indicators` | GET | Required | Get user's performance indicators | `{ category? }` | Performance indicators array |
| `/api/update-pi-status` | POST | Required | Update PI status | `{ piId, status }` | Success status |

## Data Models

The system uses the following core data models:

### User

```typescript
{
  id: number;
  username: string;
  password: string; // Hashed
  email: string | null;
  eventFormat: string | null; // roleplay or written
  eventCode: string | null;   // event code like PBM, ACT, etc.
  eventType: string | null;   // Principles, Individual Series, etc.
  instructionalArea: string | null; // Business Management, Marketing, etc.
  sessionId: string | null;   // For multi-device control
  uiTheme: string; // Default: "aquaBlue"
  colorScheme: string; // Default: "memphis"
  theme: string; // Default: "light"
  subscriptionTier: string; // Default: "standard"
  streak: number; // Default: 0
  lastLoginDate: Date | null;
  points: number; // Default: 0
  roleplayCount: number; // Default: 0
  testCount: number; // Default: 0
  writtenEventCount: number; // Default: 0
  roleplayResetDate: Date | null;
  testResetDate: Date | null;
  writtenEventResetDate: Date | null;
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
  status: string; // not_started, in_progress, completed
  lastPracticed: Date | null;
}
```

### Practice Session

```typescript
{
  id: number;
  userId: number;
  type: string; // roleplay, test, pi, chat, etc.
  score: number | null;
  completedAt: Date;
  details: string | null; // JSON string with additional details
}
```

## Integration Guidelines

When integrating with the DecA(I)de system, follow these guidelines:

1. **Authentication**: Always verify user authentication status before making authenticated API calls.

2. **Error Handling**: Handle API errors gracefully and provide user-friendly error messages.

3. **Rate Limiting**: Respect rate limits based on user subscription tiers.

4. **Content Storage**: Store generated content securely and respect the retention policies based on subscription tiers.

5. **API Versioning**: The current API version is considered v1 (implicit). Future versions will be explicitly marked.

6. **Response Formats**: All API responses are in JSON format.

7. **Cross-Origin Requests**: CORS is enabled for authorized domains only.

## Environment Configuration

The following environment variables are required for proper API functionality:

```
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session
SESSION_SECRET=your_session_secret

# Azure OpenAI
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## API Authentication

The API uses session-based authentication. Most endpoints require the user to be authenticated, which is verified through the session cookie.

Requests to authenticated endpoints without valid session cookies will receive a 401 (Unauthorized) response.

## Usage Limits

Usage is monitored and limited based on the user's subscription tier:

### Standard Tier
- 15 roleplay scenarios
- 15 test generations
- 2 written event feedback sessions
- Basic performance indicator explanations

### Plus Tier
- 25 roleplay scenarios
- 25 test generations
- 7 written event feedback sessions
- 30 performance indicator explanations

### Pro Tier
- Unlimited roleplay scenarios
- Unlimited test generations
- Unlimited written event feedback sessions
- Unlimited performance indicator explanations

These limits are reset monthly based on the subscription renewal date.

---

For more information or technical support, contact the development team.