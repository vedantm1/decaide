# MASTER PROMPT: DecA(I)de - AI-Powered DECA Competition Learning Platform

## Application Overview

DecA(I)de is an AI-powered educational platform designed to help high school students prepare for DECA (Distributive Education Clubs of America) business competitions. The platform leverages advanced AI capabilities through Azure OpenAI to generate personalized learning experiences including roleplay scenarios, practice tests, performance indicator explanations, and written event feedback.

## Core Features & Architecture

### 1. Technology Stack

**Frontend:**
- React.js with Shadcn UI components
- Framer Motion for animations
- Tailwind CSS for styling
- Vite for fast development

**Backend:**
- Express.js (Node.js) server
- PostgreSQL database with Drizzle ORM
- Azure OpenAI for AI capabilities
- Passport.js for authentication
- Stripe for payment processing

**DevOps & Deployment:**
- Package management with npm
- Version control with Git
- Workflow management with Replit workflows

### 2. Key AI Features

**Roleplay Generation:**
- Azure OpenAI generates realistic DECA roleplay scenarios
- Customizable by instructional area, performance indicators, and difficulty
- Business-specific scenarios with judge interaction simulation

**Test Question Generation:**
- AI-generated practice test questions for DECA exams
- Customizable by category, number of questions, and difficulty
- Includes multiple-choice questions with explanations

**Written Event Feedback:**
- AI analysis of written DECA projects
- Constructive feedback on organization, strategy, and presentation
- Section-by-section improvement suggestions

**Performance Indicator (PI) Explanations:**
- Clear, engaging explanations of DECA performance indicators
- Includes real-world business examples
- Delivered through character-driven explanations (Diego the Dolphin)

### 3. User Experience & Engagement

**Interactive Interface:**
- Engaging, Memphis-style UI design
- Animations and visual feedback
- Dolphin mascot (Diego) as an AI assistant

**Gamification Elements:**
- Points and achievements for completed activities
- Streaks for consistent practice
- Break reminders with mini-games

**Subscription Tiers:**
- Standard: Basic features with limits
- Plus: Enhanced features with higher limits
- Pro: Premium features with unlimited access

## Azure OpenAI Integration

### 1. Azure OpenAI Components

**Infrastructure Requirements:**
- Azure OpenAI service with gpt-4o-mini deployment
- Azure Key Vault for secure credentials storage
- Azure Cosmos DB (optional, for vector storage)
- Azure Functions (optional, for serverless capabilities)

**Key Azure Services:**
- **Azure OpenAI Service**: Core AI generation capabilities
- **Azure Key Vault**: Secure storage of API keys
- **Azure App Service**: Application hosting
- **Azure Database for PostgreSQL**: Database hosting
- **Azure Blob Storage**: Storage for documents and assets
- **Azure Monitor**: Performance monitoring and analytics

### 2. Azure OpenAI Configuration

**API Integration:**
- Use the @azure/openai npm package
- Configure with AZURE_OPENAI_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT
- Implement proper error handling and retry logic

**Prompt Engineering:**
- Specialized system prompts for each feature (roleplay, test, PI explanation)
- Response formatting with JSON structure
- Temperature settings adjusted by feature

**Model Selection:**
- Primary model: gpt-4o-mini (cost-efficient, high performance)
- Fallback to other Azure OpenAI models if needed
- Specialized deployments for different content types

### 3. Vector Store Architecture

**Clustered Data Organization:**
- Business-Admin-Core (Tests, Roleplays, PIs)
- Finance (Tests, Roleplays, PIs)
- Marketing (Tests, Roleplays, PIs)
- Hospitality & Tourism (Tests, Roleplays, PIs)
- Entrepreneurship (Tests, Roleplays, PIs)

**Implementation Strategy:**
- Uses Azure Cognitive Search or similar vector database
- Efficiently indexes and retrieves content
- Prevents cross-contamination of categories

## Development Roadmap

### 1. Foundation Phase (Weeks 1-3)

**Backend Development:**
- Set up Express.js server with TypeScript
- Configure PostgreSQL database with Drizzle ORM
- Implement authentication with Passport.js
- Create basic API endpoints for user management

**Frontend Development:**
- Scaffold React application with Vite
- Set up routing with wouter
- Implement responsive UI framework with Tailwind CSS
- Create core components and pages

**Azure OpenAI Integration:**
- Set up Azure OpenAI client and configuration
- Implement basic prompts for roleplay generation
- Create test question generation endpoints
- Develop PI explanation capabilities

**Database Schema:**
- User model with authentication and preferences
- Performance indicator tracking model
- Practice session recording model
- Subscription management

### 2. Feature Development (Weeks 4-6)

**AI Feature Enhancement:**
- Refine prompt engineering for all AI features
- Implement advanced roleplay scenario generation
- Develop comprehensive test question generation
- Build written event feedback capabilities

**User Experience:**
- Design and implement engaging animations
- Create the Diego dolphin assistant interface
- Develop gamification features and rewards system
- Implement subscription tier management

**Testing & Optimization:**
- Conduct comprehensive testing of all features
- Optimize Azure OpenAI API usage and costs
- Implement caching for frequently accessed data
- Ensure responsive design across all devices

### 3. Launch Preparation (Weeks 7-8)

**Final Integration:**
- Complete end-to-end testing of all features
- Optimize database queries and performance
- Implement comprehensive error handling
- Finalize authentication and security measures

**Deployment Preparation:**
- Set up production environment
- Configure monitoring and logging
- Implement analytics tracking
- Prepare marketing materials and documentation

**Launch Strategy:**
- Plan for Round Rock High School initial launch
- Prepare onboarding materials for users
- Develop marketing and promotional content
- Create support documentation and resources

## Implementation Details

### 1. File Structure and Organization

```
decade/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── App.tsx      # Main application component
│   │   └── main.tsx     # Application entry point
│   └── public/          # Static assets
├── server/              # Backend Express.js application
│   ├── routes/          # API route definitions
│   │   ├── aiRoutes.ts  # AI feature endpoints
│   │   └── chatRoutes.ts # Chat and assistant endpoints
│   ├── services/        # Business logic
│   │   └── azureOpenai.ts # Azure OpenAI service
│   ├── auth.ts          # Authentication logic
│   ├── db.ts            # Database connection
│   ├── index.ts         # Server entry point
│   └── storage.ts       # Data storage interface
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema and types
└── scripts/             # Utility scripts
    └── sync-db-schema.ts # Database synchronization
```

### 2. Database Schema

**Users Table:**
- User authentication and profile information
- Subscription tier and limits
- Preferences and settings

**Performance Indicators Table:**
- Track user progress on performance indicators
- Store category and status information
- Record last practice date

**Practice Sessions Table:**
- Record user practice activities
- Store session details, scores, and feedback
- Track completion dates and durations

### 3. API Endpoints

**Authentication:**
- POST /auth/register - Create a new user account
- POST /auth/login - Authenticate user and create session
- POST /auth/logout - End user session
- GET /auth/user - Get current user information

**AI Features:**
- GET /api/ai/status - Check Azure OpenAI availability
- POST /api/ai/generate-roleplay - Generate roleplay scenarios
- POST /api/ai/generate-test - Generate practice test questions
- POST /api/ai/written-event-feedback - Provide feedback on written events

**Chat Features:**
- POST /api/chat/diego - Chat with Diego the dolphin assistant
- POST /api/chat/roleplay-feedback - Get feedback on roleplay responses
- POST /api/chat/explain-pi - Get explanations for performance indicators

**User Data:**
- GET /api/user/stats - Get user statistics and progress
- GET /api/user/activities - Get user learning activities
- GET /api/subscription-tiers - Get available subscription tiers
- POST /api/user/subscription - Update user subscription

### 4. Azure OpenAI Implementation

**Client Configuration:**
```typescript
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

export function getOpenAIClient(): OpenAIClient {
  if (!process.env.AZURE_OPENAI_KEY) {
    throw new Error("AZURE_OPENAI_KEY environment variable is required");
  }
  
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error("AZURE_OPENAI_ENDPOINT environment variable is required");
  }
  
  const credential = new AzureKeyCredential(process.env.AZURE_OPENAI_KEY);
  return new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT, credential);
}
```

**Roleplay Generation:**
```typescript
async function generateRoleplay(params) {
  const client = getOpenAIClient();
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
  
  const prompt = `
  Create a realistic DECA roleplay scenario focusing on ${params.instructionalArea}
  with these performance indicators: ${params.performanceIndicators.join(", ")}.
  ...
  `;
  
  const response = await client.getChatCompletions(
    deploymentId,
    [
      { role: "system", content: "You are a DECA roleplay scenario generator..." },
      { role: "user", content: prompt }
    ],
    {
      temperature: 0.7,
      maxTokens: 800,
      responseFormat: { type: "json_object" }
    }
  );
  
  return JSON.parse(response.choices[0].message?.content || "{}");
}
```

### 5. User Interface Components

**Roleplay Practice Screen:**
- Interactive roleplay scenario display
- Countdown timer for preparation
- Response submission area
- AI-powered feedback display

**Test Practice Screen:**
- Multiple-choice question display
- Answer selection interface
- Progress tracking
- Score and feedback summary

**Diego Chat Interface:**
- Character-driven conversation UI
- Natural language input
- Contextual responses
- Animated feedback and suggestions

**Performance Dashboard:**
- Progress visualization
- Achievement tracking
- Usage statistics and limits
- Activity history

## User Acquisition & Growth Strategy

### 1. Initial Launch at Round Rock High School

**Partnership Strategy:**
- Offer 500 licenses to Round Rock DECA chapter
- Secure official partnership with chapter advisor
- Include platform promotion at DECA meetings and events

**"If Vedant Doesn't Make ICDC" Campaign:**
- Unique marketing hook tied to founder's performance
- Creates win-win situation for promotion
- Generates viral buzz among DECA community

### 2. Expansion Plan

**District → State → National:**
- Begin with Round Rock and expand to District 5
- Use success stories and testimonials for credibility
- Gradually expand to state and national DECA chapters

**Referral Program:**
- Implement student ambassador program
- Offer incentives for referrals and new sign-ups
- Create viral adoption through peer recommendations

### 3. Long-Term Growth

**Expand to Additional Test Prep:**
- Add SAT, ACT, and AP exam preparation
- Leverage existing user base for cross-promotion
- Maintain year-round engagement through academic seasons

**Enterprise Licensing:**
- Develop school-wide licensing options
- Partner with DECA chapters for bulk subscriptions
- Create institutional partnerships with high schools

## Development Requirements

### 1. Environment Setup

**Required Environment Variables:**
```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/decade_db

# Azure OpenAI Configuration
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# Session Configuration
SESSION_SECRET=your_session_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Development Tools:**
- Node.js v18 or later
- npm for package management
- PostgreSQL database
- Azure subscription with OpenAI access
- Stripe account for payment processing

### 2. Installation & Setup

**Installation Process:**
```bash
# Clone repository
git clone https://github.com/yourusername/decade.git
cd decade

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

**Azure OpenAI Setup:**
1. Create Azure OpenAI resource in Azure Portal
2. Deploy gpt-4o-mini model
3. Configure API keys and endpoints
4. Set up rate limits and monitoring
5. Implement secure key management

### 3. Testing & Deployment

**Testing Strategy:**
- Unit tests for core functions and utilities
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Manual testing of AI-generated content

**Deployment Process:**
1. Build frontend assets: `npm run build`
2. Configure production environment
3. Deploy backend API to hosting service
4. Set up database connection for production
5. Configure monitoring and logging
6. Launch with controlled user access

## Conclusion

DecA(I)de represents a revolutionary approach to DECA competition preparation, leveraging Azure OpenAI's advanced capabilities to create personalized, engaging learning experiences. By focusing on user engagement, practical skills development, and strategic growth, the platform is positioned to become the leading solution for DECA students nationwide.

This master prompt provides a comprehensive blueprint for building and deploying the DecA(I)de platform, covering technology stack, Azure integration, development roadmap, and growth strategy. Future development should focus on expanding AI capabilities, enhancing user experience, and scaling to additional educational domains.