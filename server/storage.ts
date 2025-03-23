import {
  User, InsertUser,
  PerformanceIndicator, InsertPI,
  PracticeSession, InsertSession,
  SUBSCRIPTION_LIMITS,
  PI_CATEGORIES,
  DECA_EVENTS
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, count, sql, getTableColumns, asc, and, isNull, isNotNull } from "drizzle-orm";
import { users, performanceIndicators, practiceSessions } from "@shared/schema";
import pg from "pg";

// Create session stores
const MemoryStore = createMemoryStore(session);

// Create PostgreSQL session store
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const PostgresSessionStore = connectPg(session);

// Define a SessionStore type for both memory and PostgreSQL session stores
type SessionStore = any;

// Interface for storage methods
export interface IStorage {
  // Session store for authentication
  sessionStore: SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateLastLogin(id: number, date: Date): Promise<User | undefined>;
  updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    uiTheme?: string,
    colorScheme?: string
  }): Promise<User | undefined>;
  updateSubscription(id: number, tier: string): Promise<User | undefined>;
  
  // Session management methods
  updateUserSession(userId: number, sessionInfo: { id: string, createdAt: Date, lastActive: Date }): Promise<boolean>;
  validateUserSession(userId: number, sessionId: string): Promise<boolean>;
  invalidateOtherSessions(userId: number, currentSessionId: string): Promise<boolean>;
  getUserSession(userId: number): Promise<{ id: string, createdAt: Date, lastActive: Date } | undefined>;
  
  // Stripe related methods
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, info: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  
  // Performance Indicators methods
  getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]>;
  updatePIStatus(userId: number, piId: number, status: string): Promise<boolean>;
  
  // Practice sessions methods
  recordPracticeSession(session: InsertSession): Promise<PracticeSession>;
  
  // Stats and activities
  getUserStats(userId: number): Promise<any>;
  getUserActivities(userId: number): Promise<any[]>;
  getLearningItems(userId: number): Promise<any[]>;
  
  // Subscription checks
  checkRoleplayAllowance(userId: number): Promise<boolean>;
  checkTestAllowance(userId: number): Promise<boolean>;
  recordRoleplayGeneration(userId: number): Promise<void>;
  recordTestGeneration(userId: number): Promise<void>;
  
  // Daily challenge
  getDailyChallenge(userId: number): Promise<any>;
  completeDailyChallenge(userId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private performanceIndicators: Map<number, PerformanceIndicator>;
  private practiceSessions: Map<number, PracticeSession>;
  private roleplayUsage: Map<number, number>; // userId -> count this month
  private testUsage: Map<number, number>; // userId -> count this month
  private userSessions: Map<number, { id: string; createdAt: Date; lastActive: Date }>;
  currentId: number;
  currentPIId: number;
  currentSessionId: number;
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.performanceIndicators = new Map();
    this.practiceSessions = new Map();
    this.roleplayUsage = new Map();
    this.testUsage = new Map();
    this.userSessions = new Map();
    this.currentId = 1;
    this.currentPIId = 1;
    this.currentSessionId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed some sample performance indicators
    this.seedPerformanceIndicators();
  }

  private seedPerformanceIndicators() {
    const samplePIs = [
      { category: "Financial Analysis", indicator: "Explain the role of finance in business" },
      { category: "Financial Analysis", indicator: "Implement budget management" },
      { category: "Financial Analysis", indicator: "Analyze managerial accounting data" },
      { category: "Financial Analysis", indicator: "Manage financial risks" },
      { category: "Financial Analysis", indicator: "Explain the concept of ROI" },
      { category: "Marketing", indicator: "Describe marketing functions and related activities" },
      { category: "Marketing", indicator: "Explain the nature of marketing plans" },
      { category: "Marketing", indicator: "Explain factors that influence customer behavior" },
      { category: "Business Law", indicator: "Explain the civil results of unethical business behavior" },
      { category: "Business Law", indicator: "Describe legal issues affecting businesses" }
    ];
    
    // We'll create these PIs for each user when they register
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    // Generate a unique session ID for this user
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Ensure all fields match the User type requirements
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      eventFormat: insertUser.eventFormat || null,
      eventCode: insertUser.eventCode || null,
      eventType: insertUser.eventType || null,
      instructionalArea: insertUser.instructionalArea || null,
      uiTheme: insertUser.uiTheme || "aquaBlue",
      colorScheme: insertUser.colorScheme || "memphis",
      subscriptionTier: "standard",
      streak: 0,
      lastLoginDate: now,
      points: 0,
      sessionId,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    
    // Store the session information
    this.userSessions.set(id, {
      id: sessionId,
      createdAt: now,
      lastActive: now
    });
    this.users.set(id, user);
    
    // Create default PIs for the user
    this.createDefaultPIs(id);
    
    return user;
  }
  
  private async createDefaultPIs(userId: number) {
    const samplePIs = [
      { category: "Financial Analysis", indicator: "Explain the role of finance in business" },
      { category: "Financial Analysis", indicator: "Implement budget management" },
      { category: "Financial Analysis", indicator: "Analyze managerial accounting data" },
      { category: "Financial Analysis", indicator: "Manage financial risks" },
      { category: "Financial Analysis", indicator: "Explain the concept of ROI" },
      { category: "Marketing", indicator: "Describe marketing functions and related activities" },
      { category: "Marketing", indicator: "Explain the nature of marketing plans" },
      { category: "Marketing", indicator: "Explain factors that influence customer behavior" },
      { category: "Business Law", indicator: "Explain the civil results of unethical business behavior" },
      { category: "Business Law", indicator: "Describe legal issues affecting businesses" }
    ];
    
    for (const pi of samplePIs) {
      const piId = this.currentPIId++;
      this.performanceIndicators.set(piId, {
        id: piId,
        userId,
        indicator: pi.indicator,
        category: pi.category,
        status: "not_started",
        lastPracticed: null
      });
    }
  }

  async updateLastLogin(id: number, date: Date): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Check if we need to update the streak
    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last login was yesterday, increment streak
      if (lastLogin.toDateString() === yesterday.toDateString()) {
        user.streak = (user.streak || 0) + 1;
      } 
      // If last login was before yesterday, reset streak
      else if (lastLogin < yesterday) {
        user.streak = 1;
      }
      // Otherwise it's the same day, no streak change
    } else {
      user.streak = 1;
    }
    
    user.lastLoginDate = date;
    this.users.set(id, user);
    return user;
  }

  async updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    uiTheme?: string,
    colorScheme?: string
  }): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    if (settings.eventFormat) user.eventFormat = settings.eventFormat;
    if (settings.eventCode) user.eventCode = settings.eventCode;
    if (settings.eventType) user.eventType = settings.eventType;
    if (settings.instructionalArea) user.instructionalArea = settings.instructionalArea;
    if (settings.uiTheme) user.uiTheme = settings.uiTheme;
    if (settings.colorScheme) user.colorScheme = settings.colorScheme;
    
    this.users.set(id, user);
    return user;
  }

  async updateSubscription(id: number, tier: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    user.subscriptionTier = tier;
    this.users.set(id, user);
    return user;
  }
  
  // Stripe related methods
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    user.stripeCustomerId = customerId;
    this.users.set(userId, user);
    return user;
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    user.stripeSubscriptionId = subscriptionId;
    this.users.set(userId, user);
    return user;
  }
  
  async updateUserStripeInfo(userId: number, info: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    user.stripeCustomerId = info.customerId;
    user.stripeSubscriptionId = info.subscriptionId;
    this.users.set(userId, user);
    return user;
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeCustomerId === customerId
    );
  }

  // Performance Indicators methods
  async getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]> {
    const userPIs = Array.from(this.performanceIndicators.values()).filter(
      pi => pi.userId === userId && (!category || pi.category === category)
    );
    
    return userPIs;
  }

  async updatePIStatus(userId: number, piId: number, status: string): Promise<boolean> {
    const pi = this.performanceIndicators.get(piId);
    if (!pi || pi.userId !== userId) return false;
    
    pi.status = status;
    pi.lastPracticed = new Date();
    this.performanceIndicators.set(piId, pi);
    
    // If completed, add points to the user
    if (status === "completed") {
      const user = await this.getUser(userId);
      if (user) {
        user.points = (user.points || 0) + 10;
        this.users.set(userId, user);
      }
    }
    
    return true;
  }

  // Practice sessions methods
  async recordPracticeSession(sessionData: InsertSession): Promise<PracticeSession> {
    const id = this.currentSessionId++;
    
    // Ensure all fields match the PracticeSession type requirements
    const session: PracticeSession = {
      id,
      userId: sessionData.userId,
      type: sessionData.type,
      score: sessionData.score || null,
      completedAt: sessionData.completedAt,
      details: sessionData.details || null
    };
    
    this.practiceSessions.set(id, session);
    
    // Add points to user
    const user = await this.getUser(sessionData.userId);
    if (user) {
      // Convert null or undefined points to 0
      const pointsToAdd = session.score || 0;
      user.points = (user.points || 0) + pointsToAdd;
      this.users.set(sessionData.userId, user);
    }
    
    return session;
  }

  // Stats and activities
  async getUserStats(userId: number): Promise<any> {
    const roleplays = Array.from(this.practiceSessions.values()).filter(
      session => session.userId === userId && session.type === "roleplay"
    ).length;
    
    const tests = Array.from(this.practiceSessions.values()).filter(
      session => session.userId === userId && session.type === "test"
    ).length;
    
    const completedPIs = Array.from(this.performanceIndicators.values()).filter(
      pi => pi.userId === userId && pi.status === "completed"
    ).length;
    
    const totalPIs = Array.from(this.performanceIndicators.values()).filter(
      pi => pi.userId === userId
    ).length;
    
    return {
      roleplays,
      tests,
      completedPIs,
      totalPIs
    };
  }

  async getUserActivities(userId: number): Promise<any[]> {
    // Get the most recent 10 activities
    const sessions = Array.from(this.practiceSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      })
      .slice(0, 10)
      .map(session => {
        let details;
        try {
          details = JSON.parse(session.details || "{}");
        } catch (e) {
          details = {};
        }
        
        let title = "";
        let description = "";
        
        if (session.type === "roleplay") {
          title = "Completed Roleplay Practice";
          description = details.title || "Roleplay scenario";
        } else if (session.type === "test") {
          title = "Practice Test Completed";
          description = details.testType || "DECA Exam";
        }
        
        return {
          id: session.id,
          type: session.type,
          title,
          description,
          score: session.score,
          date: session.completedAt
        };
      });
      
    // Also include any PI completions
    const piCompletions = Array.from(this.performanceIndicators.values())
      .filter(pi => pi.userId === userId && pi.status === "completed" && pi.lastPracticed)
      .sort((a, b) => {
        return new Date(b.lastPracticed!).getTime() - new Date(a.lastPracticed!).getTime();
      })
      .slice(0, 5)
      .map(pi => {
        return {
          id: `pi-${pi.id}`,
          type: "pi",
          title: "Mastered Performance Indicator",
          description: pi.indicator,
          points: 10,
          date: pi.lastPracticed
        };
      });
    
    // Combine and sort by date
    return [...sessions, ...piCompletions]
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 10);
  }

  async getLearningItems(userId: number): Promise<any[]> {
    // Get in-progress items (roleplay, tests, PIs)
    const inProgressPIs = Array.from(this.performanceIndicators.values())
      .filter(pi => pi.userId === userId && pi.status === "in_progress")
      .slice(0, 1)
      .map(pi => ({
        id: `pi-${pi.id}`,
        type: "pi",
        title: "Performance Indicator Mastery",
        description: pi.indicator,
        progress: 0.5,
        category: pi.category
      }));
    
    // For now, return some sample items
    return [
      {
        id: "roleplay-1",
        type: "roleplay",
        title: "Advanced Hospitality Roleplay",
        description: "Customer Service Excellence - Hotel Management",
        progress: 0.6,
        category: "Hospitality & Tourism"
      },
      {
        id: "written-1",
        type: "written",
        title: "Business Plan Development",
        description: "Written event guidance with examples",
        progress: 0.15,
        category: "Entrepreneurship"
      },
      ...inProgressPIs
    ];
  }

  // Subscription checks
  async checkRoleplayAllowance(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const tier = user.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS;
    const limit = SUBSCRIPTION_LIMITS[tier].roleplays;
    
    // Unlimited for pro
    if (limit === -1) return true;
    
    const usageCount = this.roleplayUsage.get(userId) || 0;
    return usageCount < limit;
  }

  async checkTestAllowance(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const tier = user.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS;
    const limit = SUBSCRIPTION_LIMITS[tier].tests;
    
    // Unlimited for pro
    if (limit === -1) return true;
    
    const usageCount = this.testUsage.get(userId) || 0;
    return usageCount < limit;
  }

  async recordRoleplayGeneration(userId: number): Promise<void> {
    const currentCount = this.roleplayUsage.get(userId) || 0;
    this.roleplayUsage.set(userId, currentCount + 1);
  }

  async recordTestGeneration(userId: number): Promise<void> {
    const currentCount = this.testUsage.get(userId) || 0;
    this.testUsage.set(userId, currentCount + 1);
  }

  // Daily challenge
  async getDailyChallenge(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Find the event details from the user's eventCode
    let category = "Finance";
    if (user.eventCode) {
      const format = user.eventFormat === "roleplay" ? "roleplay" : "written";
      const event = DECA_EVENTS[format as keyof typeof DECA_EVENTS]?.find(e => e.code === user.eventCode);
      if (event) {
        category = event.category;
      }
    }
    
    // Find a matching PI category
    const piCategory = PI_CATEGORIES.find(c => c.includes(category)) || "Financial Analysis";
    
    return {
      id: `challenge-${Date.now()}`,
      title: `Master 5 ${piCategory} Performance Indicators`,
      description: "Complete today's challenge to earn 50 extra points!",
      category: piCategory,
      points: 50,
      completed: false
    };
  }

  // Session management methods
  async updateUserSession(userId: number, sessionInfo: { id: string; createdAt: Date; lastActive: Date }): Promise<boolean> {
    // First invalidate any existing sessions for this user
    this.userSessions.set(userId, sessionInfo);
    return true;
  }
  
  async validateUserSession(userId: number, sessionId: string): Promise<boolean> {
    const sessionInfo = this.userSessions.get(userId);
    if (!sessionInfo) return false;
    
    // Check if the session ID matches
    return sessionInfo.id === sessionId;
  }
  
  async invalidateOtherSessions(userId: number, currentSessionId: string): Promise<boolean> {
    const sessionInfo = this.userSessions.get(userId);
    if (!sessionInfo) return false;
    
    // If current session doesn't match, delete it
    if (sessionInfo.id !== currentSessionId) {
      this.userSessions.delete(userId);
      return true;
    }
    
    return false;
  }
  
  async getUserSession(userId: number): Promise<{ id: string; createdAt: Date; lastActive: Date } | undefined> {
    return this.userSessions.get(userId);
  }
  
  async completeDailyChallenge(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Award points
    user.points = (user.points || 0) + 50;
    this.users.set(userId, user);
    
    return {
      success: true,
      points: 50,
      totalPoints: user.points
    };
  }
}

// Implementation of DatabaseStorage using Drizzle ORM
export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    // Initialize the PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create the user with the default values
    const [user] = await db.insert(users).values({
      ...insertUser,
      email: insertUser.email || null,
      eventFormat: insertUser.eventFormat || null,
      eventCode: insertUser.eventCode || null,
      eventType: insertUser.eventType || null,
      instructionalArea: insertUser.instructionalArea || null,
      uiTheme: insertUser.uiTheme || "aquaBlue",
      colorScheme: insertUser.colorScheme || "memphis",
      subscriptionTier: "standard",
      streak: 0,
      lastLoginDate: now,
      points: 0,
      sessionId,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    }).returning();
    
    // Create default PIs for the user
    await this.createDefaultPIs(user.id);
    
    return user;
  }
  
  private async createDefaultPIs(userId: number) {
    const samplePIs = [
      { category: "Financial Analysis", indicator: "Explain the role of finance in business" },
      { category: "Financial Analysis", indicator: "Implement budget management" },
      { category: "Financial Analysis", indicator: "Analyze managerial accounting data" },
      { category: "Financial Analysis", indicator: "Manage financial risks" },
      { category: "Financial Analysis", indicator: "Explain the concept of ROI" },
      { category: "Marketing", indicator: "Describe marketing functions and related activities" },
      { category: "Marketing", indicator: "Explain the nature of marketing plans" },
      { category: "Marketing", indicator: "Explain factors that influence customer behavior" },
      { category: "Business Law", indicator: "Explain the civil results of unethical business behavior" },
      { category: "Business Law", indicator: "Describe legal issues affecting businesses" }
    ];
    
    for (const pi of samplePIs) {
      await db.insert(performanceIndicators).values({
        userId,
        indicator: pi.indicator,
        category: pi.category,
        status: "not_started",
        lastPracticed: null
      });
    }
  }

  async updateLastLogin(id: number, date: Date): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Check if we need to update the streak
    let streak = user.streak || 0;
    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last login was yesterday, increment streak
      if (lastLogin.toDateString() === yesterday.toDateString()) {
        streak += 1;
      } 
      // If last login was before yesterday, reset streak
      else if (lastLogin < yesterday) {
        streak = 1;
      }
      // Otherwise it's the same day, no streak change
    } else {
      streak = 1;
    }
    
    const [updatedUser] = await db.update(users)
      .set({ lastLoginDate: date, streak })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    uiTheme?: string,
    colorScheme?: string
  }): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updateData: any = {};
    if (settings.eventFormat) updateData.eventFormat = settings.eventFormat;
    if (settings.eventCode) updateData.eventCode = settings.eventCode;
    if (settings.eventType) updateData.eventType = settings.eventType;
    if (settings.instructionalArea) updateData.instructionalArea = settings.instructionalArea;
    if (settings.uiTheme) updateData.uiTheme = settings.uiTheme;
    if (settings.colorScheme) updateData.colorScheme = settings.colorScheme;
    
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async updateSubscription(id: number, tier: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ subscriptionTier: tier })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // Other methods would be implemented similarly using drizzle-orm
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ stripeSubscriptionId: subscriptionId })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, info: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ 
        stripeCustomerId: info.customerId,
        stripeSubscriptionId: info.subscriptionId
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));
      
    return user;
  }
  
  // Performance Indicators methods
  async getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]> {
    if (category) {
      return db.select()
        .from(performanceIndicators)
        .where(
          and(
            eq(performanceIndicators.userId, userId),
            eq(performanceIndicators.category, category)
          )
        );
    } else {
      return db.select()
        .from(performanceIndicators)
        .where(eq(performanceIndicators.userId, userId));
    }
  }
  
  async updatePIStatus(userId: number, piId: number, status: string): Promise<boolean> {
    const pi = await db.select()
      .from(performanceIndicators)
      .where(
        and(
          eq(performanceIndicators.id, piId),
          eq(performanceIndicators.userId, userId)
        )
      );
      
    if (pi.length === 0) return false;
    
    const now = new Date();
    await db.update(performanceIndicators)
      .set({ 
        status,
        lastPracticed: now
      })
      .where(eq(performanceIndicators.id, piId));
      
    // If completed, add points to the user
    if (status === "completed") {
      await db.update(users)
        .set({ 
          points: sql`${users.points} + 10`
        })
        .where(eq(users.id, userId));
    }
    
    return true;
  }
  
  // Practice sessions methods
  async recordPracticeSession(sessionData: InsertSession): Promise<PracticeSession> {
    const [session] = await db.insert(practiceSessions)
      .values({
        userId: sessionData.userId,
        type: sessionData.type,
        score: sessionData.score || null,
        completedAt: sessionData.completedAt,
        details: sessionData.details || null
      })
      .returning();
      
    // Add points to user
    if (session.score) {
      await db.update(users)
        .set({ 
          points: sql`${users.points} + ${session.score}`
        })
        .where(eq(users.id, sessionData.userId));
    }
    
    return session;
  }
  
  // We'll implement the remaining methods as needed
  // These stubs follow the same pattern
  
  // Stats and activities
  async getUserStats(userId: number): Promise<any> {
    // Count roleplays
    const roleplayCount = await db.select({ 
      count: count() 
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, "roleplay")
      )
    );
    
    // Count tests
    const testCount = await db.select({ 
      count: count() 
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, "test")
      )
    );
    
    // Count completed PIs
    const completedPICount = await db.select({ 
      count: count() 
    })
    .from(performanceIndicators)
    .where(
      and(
        eq(performanceIndicators.userId, userId),
        eq(performanceIndicators.status, "completed")
      )
    );
    
    // Count total PIs
    const totalPICount = await db.select({ 
      count: count() 
    })
    .from(performanceIndicators)
    .where(eq(performanceIndicators.userId, userId));
    
    return {
      roleplays: roleplayCount[0].count,
      tests: testCount[0].count,
      completedPIs: completedPICount[0].count,
      totalPIs: totalPICount[0].count
    };
  }
  
  async getUserActivities(userId: number): Promise<any[]> {
    // Get recent practice sessions
    const sessions = await db.select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, userId))
      .orderBy(desc(practiceSessions.completedAt))
      .limit(10);
      
    const sessionActivities = sessions.map(session => {
      let details;
      try {
        details = JSON.parse(session.details || "{}");
      } catch (e) {
        details = {};
      }
      
      let title = "";
      let description = "";
      
      if (session.type === "roleplay") {
        title = "Completed Roleplay Practice";
        description = details.title || "Roleplay scenario";
      } else if (session.type === "test") {
        title = "Practice Test Completed";
        description = details.testType || "DECA Exam";
      }
      
      return {
        id: session.id,
        type: session.type,
        title,
        description,
        score: session.score,
        date: session.completedAt
      };
    });
    
    // Get recent PI completions 
    const piCompletions = await db.select()
      .from(performanceIndicators)
      .where(
        and(
          eq(performanceIndicators.userId, userId),
          eq(performanceIndicators.status, "completed"),
          isNotNull(performanceIndicators.lastPracticed)
        )
      )
      .orderBy(desc(performanceIndicators.lastPracticed))
      .limit(5);
      
    const piActivities = piCompletions.map(pi => {
      return {
        id: `pi-${pi.id}`,
        type: "pi",
        title: "Mastered Performance Indicator",
        description: pi.indicator,
        points: 10,
        date: pi.lastPracticed
      };
    });
    
    // Combine and return
    const allActivities = [...sessionActivities, ...piActivities];
    allActivities.sort((a, b) => {
      return new Date(b.date!).getTime() - new Date(a.date!).getTime();
    });
    
    return allActivities.slice(0, 10);
  }
  
  // Placeholder implementations for the rest of the required methods
  // These would need to be completed for a full implementation
  async getLearningItems(userId: number): Promise<any[]> {
    // For demo purposes, returning similar data as MemStorage
    return [
      {
        id: "roleplay-1",
        type: "roleplay",
        title: "Advanced Hospitality Roleplay",
        description: "Customer Service Excellence - Hotel Management",
        progress: 0.6,
        category: "Hospitality & Tourism"
      },
      {
        id: "written-1",
        type: "written",
        title: "Business Plan Development",
        description: "Written event guidance with examples",
        progress: 0.15,
        category: "Entrepreneurship"
      }
    ];
  }
  
  // Session management methods (simplified)
  async updateUserSession(userId: number, sessionInfo: { id: string, createdAt: Date, lastActive: Date }): Promise<boolean> {
    await db.update(users)
      .set({ sessionId: sessionInfo.id })
      .where(eq(users.id, userId));
    return true;
  }
  
  async validateUserSession(userId: number, sessionId: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) return false;
    return user.sessionId === sessionId;
  }
  
  async invalidateOtherSessions(userId: number, currentSessionId: string): Promise<boolean> {
    // In a database context, we don't need to track "other" sessions
    // We just ensure the current one is set
    await db.update(users)
      .set({ sessionId: currentSessionId })
      .where(eq(users.id, userId));
    return true;
  }
  
  async getUserSession(userId: number): Promise<{ id: string, createdAt: Date, lastActive: Date } | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.sessionId) return undefined;
    
    // We don't have separate createdAt/lastActive fields in our schema
    // so we'll use lastLoginDate for both
    return {
      id: user.sessionId,
      createdAt: user.lastLoginDate || new Date(),
      lastActive: user.lastLoginDate || new Date()
    };
  }
  
  // These would be implemented with tables tracking usage in real DB
  async checkRoleplayAllowance(userId: number): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) return false;
    
    const tier = user.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS;
    const limit = SUBSCRIPTION_LIMITS[tier].roleplays;
    
    // Always allow for unlimited tier (pro)
    if (limit === -1) return true;
    
    // TODO: Implement proper usage tracking in DB
    // For now, we'll assume under limit
    return true;
  }
  
  async checkTestAllowance(userId: number): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) return false;
    
    const tier = user.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS;
    const limit = SUBSCRIPTION_LIMITS[tier].tests;
    
    // Always allow for unlimited tier (pro)
    if (limit === -1) return true;
    
    // TODO: Implement proper usage tracking in DB
    // For now, we'll assume under limit
    return true;
  }
  
  async recordRoleplayGeneration(userId: number): Promise<void> {
    // TODO: Implement usage tracking
  }
  
  async recordTestGeneration(userId: number): Promise<void> {
    // TODO: Implement usage tracking
  }
  
  // Daily challenge - simplified 
  async getDailyChallenge(userId: number): Promise<any> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) throw new Error("User not found");
    
    // Find the event details from the user's eventCode
    let category = "Finance";
    if (user.eventCode) {
      const format = user.eventFormat === "roleplay" ? "roleplay" : "written";
      const event = DECA_EVENTS[format as keyof typeof DECA_EVENTS]?.find(e => e.code === user.eventCode);
      if (event) {
        category = event.category;
      }
    }
    
    // Find a matching PI category
    const piCategory = PI_CATEGORIES.find(c => c.includes(category)) || "Financial Analysis";
    
    return {
      id: `challenge-${Date.now()}`,
      title: `Master 5 ${piCategory} Performance Indicators`,
      description: "Complete today's challenge to earn 50 extra points!",
      category: piCategory,
      points: 50,
      completed: false
    };
  }
  
  async completeDailyChallenge(userId: number): Promise<any> {
    // Add points
    await db.update(users)
      .set({ 
        points: sql`${users.points} + 50`
      })
      .where(eq(users.id, userId));
    
    return {
      success: true,
      message: "Challenge completed! +50 points awarded."
    };
  }
}

// Choose between MemStorage and DatabaseStorage based on environment
const useDatabase = process.env.USE_DATABASE === 'true' || true; // Default to true

export const storage = useDatabase 
  ? new DatabaseStorage() 
  : new MemStorage();
