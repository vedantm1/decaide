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

const MemoryStore = createMemoryStore(session);

// Interface for storage methods
export interface IStorage {
  // Session store for authentication
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateLastLogin(id: number, date: Date): Promise<User | undefined>;
  updateUserSettings(id: number, settings: { eventFormat?: string, eventCode?: string }): Promise<User | undefined>;
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
  sessionStore: session.SessionStore;

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
    
    const user: User = { 
      ...insertUser, 
      id,
      subscriptionTier: "standard",
      streak: 0,
      lastLoginDate: now,
      points: 0,
      sessionId,
      eventType: insertUser.eventType || null,
      instructionalArea: insertUser.instructionalArea || null,
      uiTheme: insertUser.uiTheme || "aquaBlue",
      colorScheme: insertUser.colorScheme || "memphis",
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
        user.streak += 1;
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
        user.points += 10;
        this.users.set(userId, user);
      }
    }
    
    return true;
  }

  // Practice sessions methods
  async recordPracticeSession(sessionData: InsertSession): Promise<PracticeSession> {
    const id = this.currentSessionId++;
    const session: PracticeSession = { ...sessionData, id };
    this.practiceSessions.set(id, session);
    
    // Add points to user
    const user = await this.getUser(sessionData.userId);
    if (user) {
      user.points += sessionData.score || 0;
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
    user.points += 50;
    this.users.set(userId, user);
    
    return {
      success: true,
      points: 50,
      totalPoints: user.points
    };
  }
}

export const storage = new MemStorage();
