import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  colorScheme: text("color_scheme").default("memphis"), // UI color scheme (memphis, modern, classic)
  subscriptionTier: text("subscription_tier").default("standard"),
  streak: integer("streak").default(0),
  lastLoginDate: timestamp("last_login_date"),
  points: integer("points").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  eventFormat: true,
  eventCode: true,
  eventType: true,
  instructionalArea: true,
  uiTheme: true,
  colorScheme: true,
});

// Performance Indicators model
export const performanceIndicators = pgTable("performance_indicators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  indicator: text("indicator").notNull(),
  category: text("category").notNull(),
  status: text("status").default("not_started"), // not_started, in_progress, completed
  lastPracticed: timestamp("last_practiced"),
});

export const insertPISchema = createInsertSchema(performanceIndicators).pick({
  userId: true,
  indicator: true,
  category: true,
  status: true,
});

// Practice Sessions model
export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // roleplay, test, pi
  score: integer("score"),
  completedAt: timestamp("completed_at").notNull(),
  details: text("details"), // JSON string for additional details
});

export const insertSessionSchema = createInsertSchema(practiceSessions).pick({
  userId: true,
  type: true,
  score: true,
  completedAt: true,
  details: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PerformanceIndicator = typeof performanceIndicators.$inferSelect;
export type InsertPI = z.infer<typeof insertPISchema>;
export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  standard: {
    roleplays: 15,            // AI-generated roleplay scenarios per area
    tests: 15,                // Monthly test attempts
    piExplanations: "fundamental", // Fundamental PI explanations
    progressTracking: "standard", // Standard progress with leaderboard
    gamification: "basic",    // Points and achievement badges
    stars: 2,                 // Rating/quality
    price: 9.99              // USD per month
  },
  plus: {
    roleplays: 25,             // More roleplay scenarios per month
    tests: 25,                 // More practice tests per month
    piExplanations: 30,        // More performance indicator explanations
    examplePapers: 7,          // More example written event papers
    exampleDialogues: 7,       // More example roleplay dialogues
    customFeedback: true,      // Basic feedback on written events
    aiImageGeneration: false,  // No AI image generation for props/graphs
    speechToText: true,        // Basic speech-to-text features
    pdfGeneration: true,       // Enhanced PDF generation
    dataAnalytics: true,       // Basic analytics
    accessDuration: 90,        // Longer access to generated content (days)
    prioritySupport: false,    // No priority support
    stars: 3,                  // Rating/quality
    customizationOptions: 7,   // More UI customization options
    price: 19.99
  },
  pro: {
    roleplays: -1,             // Unlimited roleplay scenarios
    tests: -1,                 // Unlimited practice tests
    piExplanations: -1,        // Unlimited performance indicator explanations
    examplePapers: -1,         // Unlimited example written event papers
    exampleDialogues: -1,      // Unlimited example roleplay dialogues
    customFeedback: true,      // Advanced feedback on written events
    aiImageGeneration: true,   // AI image generation for props/graphs
    speechToText: true,        // Advanced speech-to-text features
    pdfGeneration: true,       // Premium PDF generation with branding
    dataAnalytics: true,       // Advanced analytics and insights
    accessDuration: -1,        // Permanent access to generated content
    prioritySupport: true,     // Priority support
    stars: 5,                  // Premium rating/quality
    customizationOptions: -1,  // Full UI customization options
    price: 39.99
  }
};

// DECA categories with color codes
export const DECA_CATEGORIES = {
  "Business Management and Administration": {
    color: "#F9D949", // Yellow
    colorClass: "bg-yellow-400"
  },
  "Entrepreneurship": {
    color: "#A9A9A9", // Grey
    colorClass: "bg-gray-400"
  },
  "Finance": {
    color: "#4CAF50", // Green
    colorClass: "bg-green-500"
  },
  "Hospitality and Tourism": {
    color: "#2196F3", // Blue
    colorClass: "bg-blue-500"
  },
  "Marketing": {
    color: "#F44336", // Red
    colorClass: "bg-red-500"
  },
  "Personal Financial Literacy": {
    color: "#8BC34A", // Light Green
    colorClass: "bg-green-400"
  }
};

// DECA event types for grouping
export const EVENT_TYPE_GROUPS = [
  "Principles",
  "Team Decision Making",
  "Individual Series",
  "Professional Selling and Consulting",
  "Business Operations Research",
  "Project Management",
  "Entrepreneurship",
  "Integrated Marketing Campaign",
  "Personal Financial Literacy",
  "Online Events"
];

// All DECA events organized by type
export const DECA_EVENTS = {
  // Role-play events
  roleplay: [
    // Principles Events
    {
      code: "PBM",
      name: "Principles of Business Management and Administration",
      category: "Business Management and Administration",
      type: "Principles",
      description: "Role-play format for first-year members"
    },
    {
      code: "PFN",
      name: "Principles of Finance",
      category: "Finance",
      type: "Principles",
      description: "Role-play format"
    },
    {
      code: "PMK",
      name: "Principles of Marketing",
      category: "Marketing",
      type: "Principles",
      description: "Role-play format"
    },
    {
      code: "PHT",
      name: "Principles of Hospitality and Tourism",
      category: "Hospitality and Tourism",
      type: "Principles",
      description: "Role-play format"
    },
    {
      code: "PEN",
      name: "Principles of Entrepreneurship",
      category: "Entrepreneurship",
      type: "Principles",
      description: "Role-play format"
    },
    
    // Individual Series
    {
      code: "ACT",
      name: "Accounting Applications Series",
      category: "Finance",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "AAM",
      name: "Apparel and Accessories Marketing Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "ASM",
      name: "Automotive Services Marketing Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "BFS",
      name: "Business Finance Series",
      category: "Finance",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "BSM",
      name: "Business Services Marketing Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "ENT",
      name: "Entrepreneurship Series",
      category: "Entrepreneurship",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "FMS",
      name: "Food Marketing Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "HLM",
      name: "Hotel and Lodging Management Series",
      category: "Hospitality and Tourism",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "HRM",
      name: "Human Resources Management Series",
      category: "Business Management and Administration",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "MCS",
      name: "Marketing Communications Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "QSRM",
      name: "Quick Serve Restaurant Management Series",
      category: "Hospitality and Tourism",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "RFSM",
      name: "Restaurant and Food Service Management Series",
      category: "Hospitality and Tourism",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "RMS",
      name: "Retail Merchandising Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    {
      code: "SEM",
      name: "Sports and Entertainment Marketing Series",
      category: "Marketing",
      type: "Individual Series",
      description: "Role-play format"
    },
    
    // Team Decision Making
    {
      code: "BLTDM",
      name: "Business Law and Ethics Team Decision Making",
      category: "Business Management and Administration",
      type: "Team Decision Making",
      description: "Role-play case study"
    },
    {
      code: "BTDM",
      name: "Buying and Merchandising Team Decision Making",
      category: "Marketing",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    {
      code: "ETDM",
      name: "Entrepreneurship Team Decision Making",
      category: "Entrepreneurship",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    {
      code: "FTDM",
      name: "Financial Services Team Decision Making",
      category: "Finance",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    {
      code: "HTDM",
      name: "Hospitality Services Team Decision Making",
      category: "Hospitality and Tourism",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    {
      code: "MTDM",
      name: "Marketing Management Team Decision Making",
      category: "Marketing",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    {
      code: "STDM",
      name: "Sports and Entertainment Marketing Team Decision Making",
      category: "Marketing",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    {
      code: "TTDM",
      name: "Travel and Tourism Team Decision Making",
      category: "Hospitality and Tourism",
      type: "Team Decision Making",
      description: "Role-play format"
    },
    
    // Professional Selling and Consulting
    {
      code: "FCE",
      name: "Financial Consulting",
      category: "Finance",
      type: "Professional Selling and Consulting",
      description: "Role-play format"
    },
    {
      code: "HTPS",
      name: "Hospitality and Tourism Professional Selling",
      category: "Hospitality and Tourism",
      type: "Professional Selling and Consulting",
      description: "Role-play format"
    },
    {
      code: "PSE",
      name: "Professional Selling",
      category: "Marketing",
      type: "Professional Selling and Consulting",
      description: "Role-play format"
    }
  ],
  
  // Written events
  written: [
    // Entrepreneurship
    {
      code: "EBG",
      name: "Business Growth Plan",
      category: "Entrepreneurship",
      type: "Entrepreneurship",
      description: "Prepared/written project"
    },
    {
      code: "EFB",
      name: "Franchise Business Plan",
      category: "Entrepreneurship",
      type: "Entrepreneurship",
      description: "Written business plan"
    },
    {
      code: "EIB",
      name: "Independent Business Plan",
      category: "Entrepreneurship",
      type: "Entrepreneurship",
      description: "Written business plan"
    },
    {
      code: "EIP",
      name: "Innovation Plan",
      category: "Entrepreneurship",
      type: "Entrepreneurship",
      description: "Written project"
    },
    {
      code: "ESB",
      name: "Start-Up Business Plan",
      category: "Entrepreneurship",
      type: "Entrepreneurship",
      description: "Written business plan"
    },
    {
      code: "IBP",
      name: "International Business Plan",
      category: "Entrepreneurship",
      type: "Entrepreneurship",
      description: "Written business plan"
    },
    
    // Business Operations Research
    {
      code: "BOR",
      name: "Business Services Operations Research",
      category: "Business Management and Administration",
      type: "Business Operations Research",
      description: "Written report"
    },
    {
      code: "BMOR",
      name: "Buying and Merchandising Operations Research",
      category: "Marketing",
      type: "Business Operations Research",
      description: "Written report"
    },
    {
      code: "FOR",
      name: "Finance Operations Research",
      category: "Finance",
      type: "Business Operations Research",
      description: "Written report"
    },
    {
      code: "HTOR",
      name: "Hospitality and Tourism Operations Research",
      category: "Hospitality and Tourism",
      type: "Business Operations Research",
      description: "Written report"
    },
    {
      code: "SEOR",
      name: "Sports and Entertainment Marketing Operations Research",
      category: "Marketing",
      type: "Business Operations Research",
      description: "Written report"
    },
    
    // Project Management
    {
      code: "PMBS",
      name: "Business Solutions Project",
      category: "Business Management and Administration",
      type: "Project Management",
      description: "Written project"
    },
    {
      code: "PMCD",
      name: "Career Development Project",
      category: "Business Management and Administration",
      type: "Project Management",
      description: "Written project"
    },
    {
      code: "PMCA",
      name: "Community Awareness Project",
      category: "Business Management and Administration",
      type: "Project Management",
      description: "Written project"
    },
    {
      code: "PMCG",
      name: "Community Giving Project",
      category: "Business Management and Administration",
      type: "Project Management",
      description: "Written project"
    },
    {
      code: "PMFL",
      name: "Financial Literacy Project",
      category: "Finance",
      type: "Project Management",
      description: "Written project"
    },
    {
      code: "PMSP",
      name: "Sales Project",
      category: "Marketing",
      type: "Project Management",
      description: "Written project"
    },
    
    // Integrated Marketing Campaign
    {
      code: "IMCE",
      name: "Integrated Marketing Campaign-Event",
      category: "Marketing",
      type: "Integrated Marketing Campaign",
      description: "Prepared/written project"
    },
    {
      code: "IMCP",
      name: "Integrated Marketing Campaign-Product",
      category: "Marketing",
      type: "Integrated Marketing Campaign",
      description: "Prepared/written project"
    },
    {
      code: "IMCS",
      name: "Integrated Marketing Campaign-Service",
      category: "Marketing",
      type: "Integrated Marketing Campaign",
      description: "Prepared/written project"
    },
    
    // Personal Financial Literacy
    {
      code: "PFL",
      name: "Personal Financial Literacy",
      category: "Personal Financial Literacy",
      type: "Personal Financial Literacy",
      description: "Exam based/written"
    },
    
    // Online Events
    {
      code: "SMG",
      name: "Stock Market Game",
      category: "Finance",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCAC",
      name: "Virtual Business Challenge-Accounting",
      category: "Finance",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCEN",
      name: "Virtual Business Challenge-Entrepreneurship",
      category: "Entrepreneurship",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCFA",
      name: "Virtual Business Challenge-Fashion",
      category: "Marketing",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCHM",
      name: "Virtual Business Challenge-Hotel Management",
      category: "Hospitality and Tourism",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCPF",
      name: "Virtual Business Challenge-Personal Finance",
      category: "Personal Financial Literacy",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCRS",
      name: "Virtual Business Challenge-Restaurant",
      category: "Hospitality and Tourism",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCRT",
      name: "Virtual Business Challenge-Retail",
      category: "Marketing",
      type: "Online Events",
      description: "Simulation"
    },
    {
      code: "VBCSP",
      name: "Virtual Business Challenge-Sports",
      category: "Marketing",
      type: "Online Events",
      description: "Simulation"
    }
  ]
};

// Performance Indicator categories
export const PI_CATEGORIES = [
  "Financial Analysis",
  "Business Law",
  "Marketing",
  "Management",
  "Entrepreneurship",
  "Hospitality & Tourism",
  "Business Administration"
];
