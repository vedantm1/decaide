# Azure Integration and End-to-End Development Guide for DecA(I)de

This comprehensive guide explains the role of Azure in the DecA(I)de application and provides step-by-step instructions for building the entire application from the ground up.

## Table of Contents

1. [The Role of Azure in DecA(I)de](#the-role-of-azure-in-decade)
2. [Azure Services Architecture](#azure-services-architecture)
3. [End-to-End Development Process](#end-to-end-development-process)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Database Design and Implementation](#database-design-and-implementation)
7. [Azure OpenAI Integration](#azure-openai-integration)
8. [Authentication and Security](#authentication-and-security)
9. [Testing and Quality Assurance](#testing-and-quality-assurance)
10. [Deployment and DevOps](#deployment-and-devops)
11. [Scaling and Optimization](#scaling-and-optimization)
12. [Monitoring and Analytics](#monitoring-and-analytics)

## The Role of Azure in DecA(I)de

### Core Azure Services

DecA(I)de leverages several Azure services to power its AI capabilities and infrastructure:

1. **Azure OpenAI Service**: The heart of DecA(I)de's AI capabilities, Azure OpenAI provides:
   - Large language model access (GPT-4o-mini)
   - Secure API endpoints for AI content generation
   - Token management and usage monitoring
   - Content safety and moderation capabilities

2. **Azure Key Vault**: Secures sensitive credentials including:
   - Azure OpenAI API keys
   - Database connection strings
   - Authentication secrets

3. **Azure Database for PostgreSQL**: Managed database service for storing:
   - User accounts and authentication data
   - DECA content and performance indicators
   - User activity and progress tracking
   - Subscription and billing information

4. **Azure Blob Storage**: Handles storage of:
   - Generated PDF documents
   - Media assets for animations and UI
   - User-uploaded content
   - Backup data

5. **Azure App Service**: Hosts the application components:
   - Node.js/Express backend API
   - Static frontend assets
   - API gateway and routing

6. **Azure Monitor**: Provides comprehensive monitoring:
   - Application performance metrics
   - User behavior analytics
   - AI service usage patterns
   - Error tracking and logging

### Why Azure for DecA(I)de

Azure provides critical advantages for an AI-driven educational platform like DecA(I)de:

1. **Integrated AI Services**: Azure OpenAI is fully integrated with Azure's ecosystem, simplifying development and management.

2. **Scalability**: Azure's infrastructure can scale from serving a single high school to a nationwide user base.

3. **Security Compliance**: Azure meets educational data security standards, critical for a platform serving high school students.

4. **Developer Productivity**: Azure's SDK and integration tools accelerate development and reduce maintenance overhead.

5. **Cost Management**: Azure provides flexible pricing models and cost optimization tools, important for a startup with limited initial funding.

## Azure Services Architecture

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    Azure Front Door / CDN                   │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    Azure App Service (Web)                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │ React Frontend │  │ Express.js API  │  │ Auth Service │  │
│  └────────────────┘  └────────┬────────┘  └──────────────┘  │
└────────────────────────────────┼───────────────────────────┘
                                 │
          ┌────────────────────┬─┴───────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Azure OpenAI    │  │ Azure Database   │  │ Azure Blob       │
│ Service         │  │ for PostgreSQL   │  │ Storage          │
└─────────────────┘  └──────────────────┘  └──────────────────┘
          │                    │                     │
          │                    ▼                     │
          │          ┌──────────────────┐            │
          └─────────►│ Azure Key Vault  │◄───────────┘
                     └──────────────────┘
                              │
                              ▼
                 ┌───────────────────────────┐
                 │     Azure Monitor &        │
                 │     Application Insights   │
                 └───────────────────────────┘
```

### Data Flow

1. **User Request Flow**:
   - User interacts with React frontend
   - Frontend makes API calls to Express.js backend
   - Backend authenticates and processes requests
   - Backend interacts with Azure services as needed
   - Results are returned to frontend for display

2. **AI Content Generation Flow**:
   - User requests content (roleplay, test questions, PI explanations)
   - Backend formulates appropriate prompts
   - Azure OpenAI service processes prompts
   - Generated content is processed and formatted
   - Results are stored in database and returned to user

3. **Authentication Flow**:
   - User credentials are validated by Auth Service
   - JWT tokens are issued for authenticated sessions
   - User permissions are verified for protected resources
   - Azure Key Vault secures authentication secrets

## End-to-End Development Process

This section outlines the complete process for building DecA(I)de from start to finish.

### 1. Project Setup and Planning

**Duration: 1 week**

**Steps:**

1. **Project Initialization**:
   ```bash
   mkdir decade
   cd decade
   npm init -y
   git init
   ```

2. **Environment Configuration**:
   ```bash
   # Create .gitignore
   echo "node_modules\n.env\ndist\n.vscode\n" > .gitignore
   
   # Create .env.example
   cat > .env.example << EOL
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
   EOL
   
   # Copy example to actual .env file
   cp .env.example .env
   ```

3. **Project Structure Creation**:
   ```bash
   # Create directory structure
   mkdir -p client/src/{components,pages,hooks,lib,assets}
   mkdir -p server/{routes,services,middlewares}
   mkdir -p shared
   mkdir -p scripts
   ```

4. **Package Installation**:
   ```bash
   # Install core dependencies
   npm install express typescript ts-node dotenv drizzle-orm pg @azure/openai @azure/identity passport passport-local express-session
   
   # Install development dependencies
   npm install -D @types/node @types/express @types/pg typescript ts-node-dev drizzle-kit @types/passport @types/passport-local @types/express-session
   ```

5. **TypeScript Configuration**:
   ```bash
   # Create tsconfig.json
   cat > tsconfig.json << EOL
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "esModuleInterop": true,
       "forceConsistentCasingInFileNames": true,
       "strict": true,
       "skipLibCheck": true,
       "outDir": "dist",
       "baseUrl": ".",
       "paths": {
         "@server/*": ["server/*"],
         "@shared/*": ["shared/*"]
       }
     },
     "include": ["server/**/*", "shared/**/*", "scripts/**/*"],
     "exclude": ["node_modules", "client"]
   }
   EOL
   ```

### 2. Database Setup

**Duration: 3 days**

**Steps:**

1. **Schema Definition**:
   ```typescript
   // shared/schema.ts
   import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
   import { createInsertSchema } from "drizzle-zod";
   import { z } from "zod";
   
   // User model
   export const users = pgTable("users", {
     id: serial("id").primaryKey(),
     username: text("username").notNull().unique(),
     password: text("password").notNull(),
     email: text("email"),
     eventFormat: text("event_format"), // roleplay or written
     eventCode: text("event_code"),     // event code like PBM, ACT, etc.
     eventType: text("event_type"),     // Principles, Individual Series, etc.
     instructionalArea: text("instructional_area"), // Business Management, Marketing, etc.
     sessionId: text("session_id"),     // Current session ID for multi-device control
     uiTheme: text("ui_theme").default("aquaBlue"), // UI theme preference
     colorScheme: text("color_scheme").default("memphis"), // UI color scheme
     theme: text("theme").default("light"), // Theme preference (light, dark, system)
     subscriptionTier: text("subscription_tier").default("standard"),
     streak: integer("streak").default(0),
     lastLoginDate: timestamp("last_login_date"),
     points: integer("points").default(0),
     roleplayCount: integer("roleplay_count").default(0),
     testCount: integer("test_count").default(0), 
     writtenEventCount: integer("written_event_count").default(0),
     roleplayResetDate: timestamp("roleplay_reset_date"),
     testResetDate: timestamp("test_reset_date"),
     writtenEventResetDate: timestamp("written_event_reset_date"),
     stripeCustomerId: text("stripe_customer_id"),
     stripeSubscriptionId: text("stripe_subscription_id"),
   });
   
   // Create user schema
   export const insertUserSchema = createInsertSchema(users);
   export type User = typeof users.$inferSelect;
   export type InsertUser = z.infer<typeof insertUserSchema>;
   
   // Additional models for performance indicators, practice sessions, etc.
   // ...
   ```

2. **Database Connection Setup**:
   ```typescript
   // server/db.ts
   import { drizzle } from "drizzle-orm/node-postgres";
   import { Pool } from "pg";
   import * as schema from "../shared/schema";
   
   export const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });
   
   export const db = drizzle(pool, { schema });
   ```

3. **Migration Script**:
   ```typescript
   // scripts/migrate.ts
   import { drizzle } from "drizzle-orm/node-postgres";
   import { migrate } from "drizzle-orm/node-postgres/migrator";
   import { Pool } from "pg";
   import * as dotenv from "dotenv";
   
   dotenv.config();
   
   async function main() {
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
     });
   
     const db = drizzle(pool);
   
     console.log("Running migrations...");
     await migrate(db, { migrationsFolder: "drizzle" });
     console.log("Migrations completed!");
   
     await pool.end();
   }
   
   main().catch((e) => {
     console.error("Migration failed:", e);
     process.exit(1);
   });
   ```

4. **Drizzle Configuration**:
   ```typescript
   // drizzle.config.ts
   import type { Config } from "drizzle-kit";
   import * as dotenv from "dotenv";
   
   dotenv.config();
   
   export default {
     schema: "./shared/schema.ts",
     out: "./drizzle",
     driver: "pg",
     dbCredentials: {
       connectionString: process.env.DATABASE_URL || "",
     },
   } satisfies Config;
   ```

### 3. Backend API Development

**Duration: 2 weeks**

**Steps:**

1. **Server Entry Point**:
   ```typescript
   // server/index.ts
   import express from "express";
   import session from "express-session";
   import passport from "passport";
   import dotenv from "dotenv";
   import { setupAuth } from "./auth";
   import { registerRoutes } from "./routes";
   
   dotenv.config();
   
   const app = express();
   const PORT = process.env.PORT || 3000;
   
   app.use(express.json());
   
   // Setup session management
   app.use(
     session({
       secret: process.env.SESSION_SECRET || "your-secret-key",
       resave: false,
       saveUninitialized: false,
       cookie: {
         secure: process.env.NODE_ENV === "production",
         maxAge: 24 * 60 * 60 * 1000, // 24 hours
       },
     })
   );
   
   // Initialize Passport
   app.use(passport.initialize());
   app.use(passport.session());
   
   // Setup authentication
   setupAuth(app);
   
   // Register API routes
   registerRoutes(app);
   
   // Start server
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Authentication Setup**:
   ```typescript
   // server/auth.ts
   import { Express } from "express";
   import passport from "passport";
   import { Strategy as LocalStrategy } from "passport-local";
   import bcrypt from "bcrypt";
   import { db } from "./db";
   import { users, User } from "../shared/schema";
   import { eq } from "drizzle-orm";
   
   export function setupAuth(app: Express) {
     // Passport local strategy
     passport.use(
       new LocalStrategy(async (username, password, done) => {
         try {
           const [user] = await db
             .select()
             .from(users)
             .where(eq(users.username, username))
             .limit(1);
   
           if (!user) {
             return done(null, false, { message: "Incorrect username." });
           }
   
           const isValidPassword = await bcrypt.compare(password, user.password);
   
           if (!isValidPassword) {
             return done(null, false, { message: "Incorrect password." });
           }
   
           return done(null, user);
         } catch (err) {
           return done(err);
         }
       })
     );
   
     // Serialize user for session
     passport.serializeUser((user: any, done) => {
       done(null, user.id);
     });
   
     // Deserialize user from session
     passport.deserializeUser(async (id: number, done) => {
       try {
         const [user] = await db
           .select()
           .from(users)
           .where(eq(users.id, id))
           .limit(1);
   
         done(null, user || null);
       } catch (err) {
         done(err);
       }
     });
   
     // Authentication routes
     app.post("/auth/register", async (req, res) => {
       try {
         const { username, password, email } = req.body;
   
         // Check if user already exists
         const [existingUser] = await db
           .select()
           .from(users)
           .where(eq(users.username, username))
           .limit(1);
   
         if (existingUser) {
           return res.status(400).json({ message: "Username already taken" });
         }
   
         // Hash password
         const hashedPassword = await bcrypt.hash(password, 10);
   
         // Create new user
         const [newUser] = await db
           .insert(users)
           .values({
             username,
             password: hashedPassword,
             email,
           })
           .returning();
   
         res.status(201).json({
           id: newUser.id,
           username: newUser.username,
           email: newUser.email,
         });
       } catch (error) {
         console.error("Registration error:", error);
         res.status(500).json({ message: "Error registering user" });
       }
     });
   
     app.post("/auth/login", passport.authenticate("local"), (req, res) => {
       res.json(req.user);
     });
   
     app.post("/auth/logout", (req, res) => {
       req.logout(() => {
         res.json({ message: "Logged out successfully" });
       });
     });
   
     app.get("/auth/user", (req, res) => {
       if (!req.isAuthenticated()) {
         return res.status(401).json({ message: "Not authenticated" });
       }
       res.json(req.user);
     });
   }
   ```

3. **API Routes Setup**:
   ```typescript
   // server/routes.ts
   import { Express } from "express";
   import { setupAIRoutes } from "./routes/aiRoutes";
   import { setupChatRoutes } from "./routes/chatRoutes";
   import { setupDataRoutes } from "./routes/dataRoutes";
   
   export function registerRoutes(app: Express) {
     // API routes
     setupAIRoutes(app);
     setupChatRoutes(app);
     setupDataRoutes(app);
   
     // Subscription info endpoint
     app.get("/api/subscription-tiers", (req, res) => {
       res.json(SUBSCRIPTION_LIMITS);
     });
   
     // DECA events data endpoint
     app.get("/api/deca-events", (req, res) => {
       res.json({
         categories: DECA_CATEGORIES,
         events: DECA_EVENTS,
         eventTypeGroups: EVENT_TYPE_GROUPS
       });
     });
   
     // Health check endpoint
     app.get("/api/health", (req, res) => {
       res.json({ status: "healthy" });
     });
   }
   ```

4. **Azure OpenAI Service**:
   ```typescript
   // server/services/azureOpenai.ts
   import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
   
   let openaiClient: OpenAIClient | null = null;
   
   /**
    * Get or create an Azure OpenAI client instance
    */
   export function getOpenAIClient(): OpenAIClient {
     if (!openaiClient) {
       if (!process.env.AZURE_OPENAI_KEY) {
         throw new Error("AZURE_OPENAI_KEY environment variable is required");
       }
       
       if (!process.env.AZURE_OPENAI_ENDPOINT) {
         throw new Error("AZURE_OPENAI_ENDPOINT environment variable is required");
       }
       
       const credential = new AzureKeyCredential(process.env.AZURE_OPENAI_KEY);
       openaiClient = new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT, credential);
     }
     
     return openaiClient;
   }
   
   /**
    * Generate a roleplay scenario using Azure OpenAI
    */
   export async function generateRoleplay(params: {
     instructionalArea: string;
     performanceIndicators: string[];
     difficultyLevel: string;
     businessType?: string;
   }) {
     const client = getOpenAIClient();
     const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
     
     const prompt = `
     Create a realistic DECA roleplay scenario for a ${params.difficultyLevel} difficulty level. 
     The scenario should focus on the instructional area of "${params.instructionalArea}" 
     and include the following performance indicators: ${params.performanceIndicators.join(", ")}.
     The scenario should involve a ${params.businessType || "retail business"}.
   
     Format your response as a JSON object with the following properties:
     - title: A catchy title for the roleplay
     - scenario: A 2-3 paragraph description of the business situation
     - performanceIndicators: An array of the provided performance indicators
     - difficulty: The difficulty level provided
     - businessType: The type of business involved
     - meetWith: The title/role of the person the student will be meeting with in the roleplay
     `;
     
     try {
       const response = await client.getChatCompletions(
         deploymentId,
         [
           { role: "system", content: "You are a DECA roleplay scenario generator. Create realistic, challenging, and educational DECA roleplay scenarios for high school students." },
           { role: "user", content: prompt }
         ],
         {
           temperature: 0.7,
           maxTokens: 800,
           responseFormat: { type: "json_object" }
         }
       );
       
       const roleplay = JSON.parse(response.choices[0].message?.content || "{}");
       return roleplay;
       
     } catch (error) {
       console.error("Error generating roleplay:", error);
       throw error;
     }
   }
   
   // Additional AI generation functions...
   ```

5. **AI Routes**:
   ```typescript
   // server/routes/aiRoutes.ts
   import { Express, Request, Response } from "express";
   import { generateRoleplay, generateTestQuestions } from "../services/azureOpenai";
   import { db } from "../db";
   import { users } from "../../shared/schema";
   import { eq } from "drizzle-orm";
   
   export function setupAIRoutes(app: Express) {
     // Check if user is authenticated
     function isAuthenticated(req: Request, res: Response, next: Function) {
       if (req.isAuthenticated()) {
         return next();
       }
       res.status(401).json({ message: "Authentication required" });
     }
   
     // AI status endpoint
     app.get("/api/ai/status", async (req, res) => {
       try {
         // Implementation to check Azure OpenAI status
         res.json({ status: "operational" });
       } catch (error) {
         res.status(500).json({ status: "unavailable", error: String(error) });
       }
     });
   
     // Generate roleplay endpoint
     app.post("/api/ai/generate-roleplay", isAuthenticated, async (req, res) => {
       try {
         const { instructionalArea, performanceIndicators, difficultyLevel, businessType } = req.body;
         
         if (!instructionalArea || !performanceIndicators || !difficultyLevel) {
           return res.status(400).json({ error: "Missing required parameters" });
         }
         
         // Check user subscription limits
         // Implementation for subscription checks
         
         const roleplay = await generateRoleplay({
           instructionalArea,
           performanceIndicators: Array.isArray(performanceIndicators) ? performanceIndicators : [performanceIndicators],
           difficultyLevel,
           businessType
         });
         
         res.json(roleplay);
       } catch (error) {
         console.error("Error generating roleplay:", error);
         res.status(500).json({ error: "Failed to generate roleplay" });
       }
     });
   
     // Generate test questions endpoint
     app.post("/api/ai/generate-test", isAuthenticated, async (req, res) => {
       // Implementation for test generation
     });
   
     // Written event feedback endpoint
     app.post("/api/ai/written-event-feedback", isAuthenticated, async (req, res) => {
       // Implementation for written event feedback
     });
   }
   ```

6. **Chat Routes**:
   ```typescript
   // server/routes/chatRoutes.ts
   import { Express } from "express";
   import { getOpenAIClient } from "../services/azureOpenai";
   
   export function setupChatRoutes(app: Express) {
     // Diego chat endpoint
     app.post("/api/chat/diego", async (req, res) => {
       const { message } = req.body;
       
       if (!message) {
         return res.status(400).json({ error: "Message is required" });
       }
       
       try {
         const client = getOpenAIClient();
         const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
         
         // Diego's system prompt
         const systemMessage = `You are Diego, a friendly dolphin AI assistant specialized in helping high school students prepare for DECA competitions.
         
         // Additional system instructions...`;
         
         const response = await client.getChatCompletions(
           deployment,
           [
             { role: "system", content: systemMessage },
             { role: "user", content: message }
           ]
         );
         
         res.json({
           response: response.choices[0].message?.content || "I'm not sure how to respond to that right now.",
           isUnrelated: false,
           shouldExit: false
         });
       } catch (error) {
         console.error("Error in chat:", error);
         res.status(500).json({ error: "Error processing your message" });
       }
     });
     
     // Additional chat endpoints...
   }
   ```

### 4. Frontend Development

**Duration: 3 weeks**

**Steps:**

1. **React Setup with Vite**:
   ```bash
   # Navigate to client directory
   cd client
   
   # Initialize Vite project with React and TypeScript
   npm create vite@latest . -- --template react-ts
   
   # Install dependencies
   npm install react-router-dom @tanstack/react-query axios framer-motion tailwindcss postcss autoprefixer @headlessui/react
   
   # Install development dependencies
   npm install -D postcss autoprefixer tailwindcss
   
   # Initialize Tailwind CSS
   npx tailwindcss init -p
   ```

2. **Tailwind Configuration**:
   ```javascript
   // client/tailwind.config.js
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             DEFAULT: '#0ea5e9',
             50: '#f0f9ff',
             // ... other shades
           },
           // Other color definitions
         },
         fontFamily: {
           sans: ['Inter', 'sans-serif'],
           display: ['Lexend', 'sans-serif'],
         },
         animation: {
           // Custom animations
         },
       },
     },
     plugins: [],
   }
   ```

3. **Application Entry Point**:
   ```tsx
   // client/src/main.tsx
   import React from 'react'
   import ReactDOM from 'react-dom/client'
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
   import App from './App.tsx'
   import './index.css'
   
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         retry: 1,
       },
     },
   })
   
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <QueryClientProvider client={queryClient}>
         <App />
       </QueryClientProvider>
     </React.StrictMode>,
   )
   ```

4. **Main App Component**:
   ```tsx
   // client/src/App.tsx
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
   import { Suspense, lazy } from 'react'
   import Layout from './components/Layout'
   import LoadingSpinner from './components/LoadingSpinner'
   
   // Lazy-loaded pages
   const HomePage = lazy(() => import('./pages/HomePage'))
   const LoginPage = lazy(() => import('./pages/LoginPage'))
   const RegisterPage = lazy(() => import('./pages/RegisterPage'))
   const DashboardPage = lazy(() => import('./pages/DashboardPage'))
   const RoleplayPage = lazy(() => import('./pages/RoleplayPage'))
   const TestPage = lazy(() => import('./pages/TestPage'))
   const PIExplanationPage = lazy(() => import('./pages/PIExplanationPage'))
   
   function App() {
     return (
       <Router>
         <Layout>
           <Suspense fallback={<LoadingSpinner />}>
             <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/register" element={<RegisterPage />} />
               <Route path="/dashboard" element={<DashboardPage />} />
               <Route path="/roleplay" element={<RoleplayPage />} />
               <Route path="/test" element={<TestPage />} />
               <Route path="/pi-explanation" element={<PIExplanationPage />} />
             </Routes>
           </Suspense>
         </Layout>
       </Router>
     )
   }
   
   export default App
   ```

5. **API Client Setup**:
   ```tsx
   // client/src/lib/api.ts
   import axios from 'axios'
   
   const api = axios.create({
     baseURL: '/api',
     withCredentials: true,
   })
   
   // Auth API
   export const authApi = {
     login: (username: string, password: string) => 
       api.post('/auth/login', { username, password }),
     register: (userData: any) => 
       api.post('/auth/register', userData),
     logout: () => 
       api.post('/auth/logout'),
     getCurrentUser: () => 
       api.get('/auth/user'),
   }
   
   // AI API
   export const aiApi = {
     checkStatus: () => 
       api.get('/ai/status'),
     generateRoleplay: (params: any) => 
       api.post('/ai/generate-roleplay', params),
     generateTest: (params: any) => 
       api.post('/ai/generate-test', params),
     getWrittenFeedback: (params: any) => 
       api.post('/ai/written-event-feedback', params),
   }
   
   // Chat API
   export const chatApi = {
     chatWithDiego: (message: string) => 
       api.post('/chat/diego', { message }),
     getRoleplayFeedback: (roleplayId: string, userResponse: string) => 
       api.post('/chat/roleplay-feedback', { roleplayId, userResponse }),
     explainPI: (indicator: string, category?: string) => 
       api.post('/chat/explain-pi', { indicator, category }),
   }
   
   // Data API
   export const dataApi = {
     getSubscriptionTiers: () => 
       api.get('/subscription-tiers'),
     getDecaEvents: () => 
       api.get('/deca-events'),
     getUserStats: () => 
       api.get('/user/stats'),
     getUserActivities: () => 
       api.get('/user/activities'),
   }
   
   export default api
   ```

6. **Authentication Context**:
   ```tsx
   // client/src/contexts/AuthContext.tsx
   import { createContext, useContext, useState, useEffect } from 'react'
   import { authApi } from '../lib/api'
   
   type User = {
     id: number
     username: string
     email: string | null
     subscriptionTier: string
   } | null
   
   type AuthContextType = {
     user: User
     isLoading: boolean
     login: (username: string, password: string) => Promise<void>
     register: (userData: any) => Promise<void>
     logout: () => Promise<void>
   }
   
   const AuthContext = createContext<AuthContextType | undefined>(undefined)
   
   export function AuthProvider({ children }: { children: React.ReactNode }) {
     const [user, setUser] = useState<User>(null)
     const [isLoading, setIsLoading] = useState(true)
     
     useEffect(() => {
       // Check if user is already logged in
       authApi.getCurrentUser()
         .then(response => {
           setUser(response.data)
         })
         .catch(() => {
           setUser(null)
         })
         .finally(() => {
           setIsLoading(false)
         })
     }, [])
     
     const login = async (username: string, password: string) => {
       setIsLoading(true)
       try {
         const response = await authApi.login(username, password)
         setUser(response.data)
       } finally {
         setIsLoading(false)
       }
     }
     
     const register = async (userData: any) => {
       setIsLoading(true)
       try {
         await authApi.register(userData)
         // Auto-login after registration
         await login(userData.username, userData.password)
       } finally {
         setIsLoading(false)
       }
     }
     
     const logout = async () => {
       setIsLoading(true)
       try {
         await authApi.logout()
         setUser(null)
       } finally {
         setIsLoading(false)
       }
     }
     
     return (
       <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
         {children}
       </AuthContext.Provider>
     )
   }
   
   export function useAuth() {
     const context = useContext(AuthContext)
     if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider')
     }
     return context
   }
   ```

7. **Sample Page Component**:
   ```tsx
   // client/src/pages/RoleplayPage.tsx
   import { useState } from 'react'
   import { useMutation } from '@tanstack/react-query'
   import { aiApi } from '../lib/api'
   import { useAuth } from '../contexts/AuthContext'
   
   const RoleplayPage = () => {
     const { user } = useAuth()
     const [formData, setFormData] = useState({
       instructionalArea: '',
       performanceIndicators: [''],
       difficultyLevel: 'medium',
       businessType: '',
     })
     const [roleplay, setRoleplay] = useState(null)
     
     const roleplayMutation = useMutation({
       mutationFn: (data: any) => aiApi.generateRoleplay(data),
       onSuccess: (response) => {
         setRoleplay(response.data)
       },
     })
     
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault()
       roleplayMutation.mutate(formData)
     }
     
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
       const { name, value } = e.target
       setFormData(prev => ({ ...prev, [name]: value }))
     }
     
     const handlePIChange = (index: number, value: string) => {
       const updatedPIs = [...formData.performanceIndicators]
       updatedPIs[index] = value
       setFormData(prev => ({ ...prev, performanceIndicators: updatedPIs }))
     }
     
     const addPI = () => {
       setFormData(prev => ({
         ...prev,
         performanceIndicators: [...prev.performanceIndicators, '']
       }))
     }
     
     const removePI = (index: number) => {
       const updatedPIs = [...formData.performanceIndicators]
       updatedPIs.splice(index, 1)
       setFormData(prev => ({ ...prev, performanceIndicators: updatedPIs }))
     }
     
     // JSX rendering code...
     
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-6">Generate DECA Roleplay</h1>
         
         {/* Form to generate roleplay */}
         <form onSubmit={handleSubmit} className="mb-8">
           {/* Form fields */}
         </form>
         
         {/* Display generated roleplay */}
         {roleplay && (
           <div className="bg-white p-6 rounded-lg shadow-lg">
             {/* Roleplay display */}
           </div>
         )}
       </div>
     )
   }
   
   export default RoleplayPage
   ```

## Azure OpenAI Integration

### Setting Up Azure OpenAI

Azure OpenAI is the core AI service powering DecA(I)de. Here's how to set it up:

1. **Create Azure OpenAI Resource**:
   - Log in to the Azure portal
   - Create a new Azure OpenAI resource
   - Select an appropriate region and pricing tier
   - Complete the creation process

2. **Deploy Model**:
   - Navigate to the Azure OpenAI Studio
   - Deploy the gpt-4o-mini model
   - Name the deployment appropriately (e.g., "gpt-4o-mini")
   - Configure deployment settings

3. **Get API Credentials**:
   - Get the API key from the Keys and Endpoint section
   - Note the endpoint URL
   - Configure these in your application's environment variables

### Implementing Azure OpenAI Client

1. **Install Required Packages**:
   ```bash
   npm install @azure/openai @azure/identity
   ```

2. **Create OpenAI Client**:
   ```typescript
   import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
   
   export function getOpenAIClient() {
     const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
     const key = process.env.AZURE_OPENAI_KEY;
     
     if (!endpoint || !key) {
       throw new Error("Azure OpenAI credentials not configured");
     }
     
     return new OpenAIClient(endpoint, new AzureKeyCredential(key));
   }
   ```

3. **Implement AI Features**:
   ```typescript
   // Roleplay generation
   export async function generateRoleplay(params) {
     const client = getOpenAIClient();
     const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
     
     const response = await client.getChatCompletions(
       deployment,
       [
         { role: "system", content: "You are a DECA roleplay scenario generator..." },
         { role: "user", content: `Create a roleplay scenario about ${params.topic}...` }
       ],
       {
         temperature: 0.7,
         maxTokens: 1000,
         responseFormat: { type: "json_object" }
       }
     );
     
     return JSON.parse(response.choices[0].message.content);
   }
   
   // Test question generation
   export async function generateTestQuestions(params) {
     // Similar implementation
   }
   
   // PI explanation
   export async function explainPerformanceIndicator(params) {
     // Similar implementation
   }
   ```

### Optimizing Azure OpenAI Usage

1. **Prompt Engineering**:
   - Create precise, structured prompts
   - Use system messages to define AI behavior
   - Request specific output formats (JSON)

2. **Token Management**:
   - Limit token usage with maxTokens parameter
   - Cache frequent responses to reduce API calls
   - Implement rate limiting to prevent overuse

3. **Error Handling**:
   - Implement robust error handling
   - Add retry mechanisms for transient failures
   - Provide graceful degradation when service is unavailable

4. **Security Considerations**:
   - Store API keys in Azure Key Vault
   - Implement proper access controls
   - Sanitize user input before sending to API

## Testing and Quality Assurance

### Unit Testing

Create comprehensive tests for individual components:

```typescript
// server/tests/azureOpenai.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateRoleplay } from '../services/azureOpenai'

// Mock the OpenAI client
vi.mock('@azure/openai', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    getChatCompletions: vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "Test Roleplay",
              scenario: "This is a test scenario",
              performanceIndicators: ["PI1", "PI2"],
              difficulty: "medium",
              businessType: "retail",
              meetWith: "Manager"
            })
          }
        }
      ]
    })
  })),
  AzureKeyCredential: vi.fn()
}))

describe('Azure OpenAI Service', () => {
  beforeEach(() => {
    // Set environment variables
    process.env.AZURE_OPENAI_KEY = 'test-key'
    process.env.AZURE_OPENAI_ENDPOINT = 'https://test-endpoint.openai.azure.com/'
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o-mini'
  })
  
  it('should generate a roleplay scenario', async () => {
    const params = {
      instructionalArea: 'Marketing',
      performanceIndicators: ['PI1', 'PI2'],
      difficultyLevel: 'medium',
      businessType: 'retail'
    }
    
    const result = await generateRoleplay(params)
    
    expect(result).toEqual({
      title: "Test Roleplay",
      scenario: "This is a test scenario",
      performanceIndicators: ["PI1", "PI2"],
      difficulty: "medium",
      businessType: "retail",
      meetWith: "Manager"
    })
  })
})
```

### Integration Testing

Test API endpoints and backend functionality:

```typescript
// server/tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { setupAIRoutes } from '../routes/aiRoutes'

// Mock authentication middleware
vi.mock('../middlewares/auth', () => ({
  isAuthenticated: (req, res, next) => next()
}))

// Mock Azure OpenAI service
vi.mock('../services/azureOpenai', () => ({
  generateRoleplay: vi.fn().mockResolvedValue({
    title: "Test Roleplay",
    scenario: "This is a test scenario"
  })
}))

describe('API Routes', () => {
  const app = express()
  app.use(express.json())
  
  beforeAll(() => {
    setupAIRoutes(app)
  })
  
  it('should generate a roleplay scenario', async () => {
    const response = await request(app)
      .post('/api/ai/generate-roleplay')
      .send({
        instructionalArea: 'Marketing',
        performanceIndicators: ['PI1', 'PI2'],
        difficultyLevel: 'medium'
      })
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      title: "Test Roleplay",
      scenario: "This is a test scenario"
    })
  })
})
```

### End-to-End Testing

Test the complete user flows:

```typescript
// e2e/roleplay.test.ts
import { test, expect } from '@playwright/test'

test('generate roleplay scenario', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[name="username"]', 'testuser')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // Navigate to roleplay page
  await page.goto('/roleplay')
  
  // Fill the form
  await page.fill('input[name="instructionalArea"]', 'Marketing')
  await page.fill('input[name="performanceIndicators[0]"]', 'Explain marketing concepts')
  await page.selectOption('select[name="difficultyLevel"]', 'medium')
  
  // Submit the form
  await page.click('button[type="submit"]')
  
  // Wait for response
  await page.waitForSelector('.roleplay-result')
  
  // Check the results
  const title = await page.textContent('.roleplay-title')
  expect(title).toBeTruthy()
  
  const scenario = await page.textContent('.roleplay-scenario')
  expect(scenario).toBeTruthy()
})
```

## Deployment and DevOps

### Setting Up Azure App Service

1. **Create App Service**:
   - Log in to Azure Portal
   - Create a new App Service
   - Configure with Node.js runtime
   - Set up deployment source (GitHub, Azure DevOps, etc.)

2. **Configure Deployment**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Azure
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v2
       
       - name: Set up Node.js
         uses: actions/setup-node@v2
         with:
           node-version: '18.x'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Build frontend
         run: npm run build
       
       - name: Run tests
         run: npm test
       
       - name: Deploy to Azure
         uses: azure/webapps-deploy@v2
         with:
           app-name: 'decade-app'
           publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
           package: .
   ```

3. **Environment Configuration**:
   - Set up environment variables in App Service Configuration
   - Configure connection strings
   - Set up application settings

### Database Deployment

1. **Create Azure Database for PostgreSQL**:
   - Set up a new PostgreSQL server
   - Configure firewall rules
   - Create database user and set password

2. **Run Migrations**:
   ```bash
   # Run migrations during deployment
   npm run db:migrate
   ```

## Scaling and Optimization

### Frontend Optimization

1. **Code Splitting**:
   - Use React.lazy for component loading
   - Implement route-based code splitting
   - Optimize bundle size

2. **Performance Optimization**:
   - Implement caching strategies
   - Optimize images and assets
   - Use service workers for offline support

### Backend Scaling

1. **Horizontal Scaling**:
   - Configure App Service auto-scaling
   - Implement stateless architecture
   - Use Redis for session storage

2. **API Optimization**:
   - Implement API caching
   - Optimize database queries
   - Use connection pooling

### AI Service Optimization

1. **Token Usage Optimization**:
   - Implement prompt compression techniques
   - Cache frequently requested AI responses
   - Batch similar requests where possible

2. **Cost Management**:
   - Monitor Azure OpenAI usage
   - Implement usage quotas per user
   - Optimize model selection based on needs

## Monitoring and Analytics

### Application Insights

1. **Setup Application Insights**:
   - Create an Application Insights resource
   - Integrate with your application
   - Configure custom events and metrics

2. **Track User Behavior**:
   - Implement user journey tracking
   - Monitor feature usage
   - Track conversion rates and engagement

### Custom Analytics

1. **User Analytics**:
   - Track subscription conversions
   - Monitor feature usage by tier
   - Analyze learning patterns and outcomes

2. **AI Performance Metrics**:
   - Track response times
   - Monitor token usage
   - Analyze prompt effectiveness

## Conclusion

This guide provides a comprehensive overview of Azure's role in the DecA(I)de application and detailed steps for building the entire application from start to finish. The integration of Azure OpenAI services enables the platform to deliver personalized, AI-powered educational content for DECA students, while other Azure services provide the infrastructure, security, and scalability needed for a production-ready application.

By following this guide, you can build a robust, scalable educational platform that leverages the power of AI to enhance learning outcomes for students preparing for DECA competitions.