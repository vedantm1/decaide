import {
  User, InsertUser,
  PerformanceIndicator, InsertPI,
  PracticeSession, InsertSession,
  SUBSCRIPTION_LIMITS,
  PI_CATEGORIES,
  DECA_EVENTS,
  Achievement, UserAchievement,
  DailyChallenge, UserDailyChallenge,
  BreakSession, InsertBreakSession,
  MiniGameScore, InsertMiniGameScore
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc, count, sql, getTableColumns, asc, and, isNull, isNotNull } from "drizzle-orm";
import { 
  users, performanceIndicators, practiceSessions,
  achievements, userAchievements, 
  dailyChallenges, userDailyChallenges,
  breakSessions, miniGameScores
} from "@shared/schema";

// Create session stores
const MemoryStore = createMemoryStore(session);

// Create PostgreSQL session store
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
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  linkGoogleAccount(userId: number, googleId: string): Promise<User | undefined>;
  updateLastLogin(id: number, date: Date): Promise<User | undefined>;
  updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    uiTheme?: string,
    colorScheme?: string,
    theme?: string
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
  checkWrittenEventAllowance(userId: number): Promise<boolean>;
  recordRoleplayGeneration(userId: number): Promise<void>;
  recordTestGeneration(userId: number): Promise<void>;
  recordWrittenEventGeneration(userId: number): Promise<void>;
  
  // Daily challenge
  getDailyChallenge(userId: number): Promise<any>;
  completeDailyChallenge(userId: number): Promise<any>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  awardAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  getNewUserAchievements(userId: number): Promise<UserAchievement[]>;
  markAchievementAsDisplayed(userId: number, achievementId: number): Promise<boolean>;
  checkForNewAchievements(userId: number): Promise<UserAchievement[]>;
  
  // Break sessions
  startBreakSession(userId: number, activityType: string): Promise<BreakSession>;
  endBreakSession(id: number, stats: { duration: number; completed: boolean }): Promise<BreakSession | undefined>;
  getUserBreakSessions(userId: number): Promise<BreakSession[]>;
  
  // Mini-games
  saveMiniGameScore(scoreData: InsertMiniGameScore): Promise<MiniGameScore>;
  getUserMiniGameHighScores(userId: number): Promise<Record<string, number>>;
  getLeaderboard(gameType: string, limit?: number): Promise<MiniGameScore[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private performanceIndicators: Map<number, PerformanceIndicator>;
  private practiceSessions: Map<number, PracticeSession>;
  private roleplayUsage: Map<number, number>; // userId -> count this month
  private testUsage: Map<number, number>; // userId -> count this month
  private writtenEventUsage: Map<number, number>; // userId -> count this month
  private userSessions: Map<number, { id: string; createdAt: Date; lastActive: Date }>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement[]>;
  private dailyChallenges: Map<number, DailyChallenge>;
  private userDailyChallenges: Map<number, UserDailyChallenge[]>;
  private breakSessions: Map<number, BreakSession>;
  private miniGameScores: Map<number, MiniGameScore[]>;
  currentId: number;
  currentPIId: number;
  currentSessionId: number;
  currentAchievementId: number;
  currentUserAchievementId: number;
  currentDailyChallengeId: number;
  currentBreakSessionId: number;
  currentMiniGameScoreId: number;
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.performanceIndicators = new Map();
    this.practiceSessions = new Map();
    this.roleplayUsage = new Map();
    this.testUsage = new Map();
    this.writtenEventUsage = new Map();
    this.userSessions = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.dailyChallenges = new Map();
    this.userDailyChallenges = new Map();
    this.breakSessions = new Map();
    this.miniGameScores = new Map();
    this.currentId = 1;
    this.currentPIId = 1;
    this.currentSessionId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentDailyChallengeId = 1;
    this.currentBreakSessionId = 1;
    this.currentMiniGameScoreId = 1;
    
    // Create memory session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed achievements for testing
    this.seedAchievements();
  }

  private seedPerformanceIndicators() {
    // Not showing all implementation as it's long...
    // This would seed default performance indicators for testing
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return undefined;
  }

  async linkGoogleAccount(userId: number, googleId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.googleId = googleId;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create the user with the default values
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      eventFormat: insertUser.eventFormat || null,
      eventCode: insertUser.eventCode || null,
      eventType: insertUser.eventType || null,
      instructionalArea: insertUser.instructionalArea || null,
      createdAt: now,
      lastLogin: now,
      subscription: "standard", // Default subscription tier
      uiTheme: "light", // Default UI theme
      colorScheme: "blue", // Default color scheme
      theme: "default", // Default theme setting
      streak: 0, // Starting streak
      points: 0, // Starting points
      sessionId: sessionId, // Current session ID
      lastActive: now, // Last activity timestamp
      stripeCustomerId: null, // Stripe customer ID (for billing)
      stripeSubscriptionId: null, // Stripe subscription ID
    };
    
    this.users.set(id, user);
    
    // Add session info
    this.userSessions.set(id, {
      id: sessionId,
      createdAt: now,
      lastActive: now
    });
    
    // Create default performance indicators for the user
    await this.createDefaultPIs(id);
    
    return user;
  }

  private async createDefaultPIs(userId: number) {
    // Not showing implementation details as they would be long...
    // This would create default performance indicators for a new user
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateLastLogin(id: number, date: Date): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      lastLogin: date,
      streak: user.streak || 0
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    uiTheme?: string,
    colorScheme?: string,
    theme?: string
  }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...settings
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateSubscription(id: number, tier: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      subscription: tier
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      stripeCustomerId: customerId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      stripeSubscriptionId: subscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, info: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      stripeCustomerId: info.customerId,
      stripeSubscriptionId: info.subscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.stripeCustomerId === customerId) {
        return user;
      }
    }
    return undefined;
  }

  async getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]> {
    const pis: PerformanceIndicator[] = [];
    
    for (const pi of this.performanceIndicators.values()) {
      if (pi.userId === userId && (!category || pi.category === category)) {
        pis.push(pi);
      }
    }
    
    return pis;
  }

  async updatePIStatus(userId: number, piId: number, status: string): Promise<boolean> {
    const pi = this.performanceIndicators.get(piId);
    if (!pi || pi.userId !== userId) return false;
    
    const updatedPI = {
      ...pi,
      status
    };
    
    this.performanceIndicators.set(piId, updatedPI);
    return true;
  }

  async recordPracticeSession(sessionData: InsertSession): Promise<PracticeSession> {
    const id = this.currentSessionId++;
    
    // Create the full session object
    const session: PracticeSession = {
      id,
      userId: sessionData.userId,
      type: sessionData.type,
      title: sessionData.title,
      description: sessionData.description || null,
      score: sessionData.score || null,
      performance: sessionData.performance || null,
      feedback: sessionData.feedback || null,
      duration: sessionData.duration || null,
      completedAt: new Date(),
    };
    
    this.practiceSessions.set(id, session);
    return session;
  }

  async getUserStats(userId: number): Promise<any> {
    // Count practice by type
    let roleplayCount = 0;
    let testCount = 0;
    let writtenCount = 0;
    
    for (const session of this.practiceSessions.values()) {
      if (session.userId === userId) {
        if (session.type === 'roleplay') roleplayCount++;
        else if (session.type === 'test') testCount++;
        else if (session.type === 'written') writtenCount++;
      }
    }
    
    // Count PIs by status
    let completedPIs = 0;
    let inProgressPIs = 0;
    let notStartedPIs = 0;
    
    for (const pi of this.performanceIndicators.values()) {
      if (pi.userId === userId) {
        if (pi.status === 'completed') completedPIs++;
        else if (pi.status === 'in-progress') inProgressPIs++;
        else notStartedPIs++;
      }
    }
    
    return {
      roleplayCount,
      testCount,
      writtenCount,
      completedPIs,
      inProgressPIs,
      notStartedPIs,
      totalSessions: roleplayCount + testCount + writtenCount,
      totalPIs: completedPIs + inProgressPIs + notStartedPIs
    };
  }

  async getUserActivities(userId: number): Promise<any[]> {
    const activities = [];
    
    // Add practice sessions as activities
    for (const session of this.practiceSessions.values()) {
      if (session.userId === userId) {
        activities.push({
          type: `${session.type}_practice`,
          title: session.title,
          date: session.completedAt,
          details: {
            score: session.score,
            performance: session.performance
          }
        });
      }
    }
    
    // Add completed performance indicators
    for (const pi of this.performanceIndicators.values()) {
      if (pi.userId === userId && pi.status === 'completed') {
        activities.push({
          type: 'pi_completed',
          title: pi.text,
          date: new Date(), // This is a simplification - in a real app we'd track completion dates
          details: {
            category: pi.category,
            instructionalArea: pi.instructionalArea
          }
        });
      }
    }
    
    // Sort by date, most recent first
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return activities;
  }

  async getLearningItems(userId: number): Promise<any[]> {
    const items = [];
    
    // Add incomplete PIs as recommended learning items
    for (const pi of this.performanceIndicators.values()) {
      if (pi.userId === userId && pi.status !== 'completed') {
        items.push({
          type: 'pi',
          id: pi.id,
          title: pi.text,
          category: pi.category,
          instructionalArea: pi.instructionalArea,
          priority: pi.status === 'in-progress' ? 'high' : 'medium',
          status: pi.status
        });
      }
    }
    
    // Sort by priority
    items.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });
    
    return items;
  }

  async checkRoleplayAllowance(userId: number): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    // Get subscription limits
    const subscriptionTier = user.subscription || 'standard';
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier]?.roleplayLimit || 0;
    
    // Check if unlimited
    if (limit === -1) return true;
    
    // Count usage for this month
    const usageCount = this.roleplayUsage.get(userId) || 0;
    
    return usageCount < limit;
  }

  async checkTestAllowance(userId: number): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    // Get subscription limits
    const subscriptionTier = user.subscription || 'standard';
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier]?.testLimit || 0;
    
    // Check if unlimited
    if (limit === -1) return true;
    
    // Count usage for this month
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

  async checkWrittenEventAllowance(userId: number): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    // Get subscription limits
    const subscriptionTier = user.subscription || 'standard';
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier]?.writtenEventLimit || 0;
    
    // Check if unlimited
    if (limit === -1) return true;
    
    // Count usage for this month
    const usageCount = this.writtenEventUsage.get(userId) || 0;
    
    return usageCount < limit;
  }

  async recordWrittenEventGeneration(userId: number): Promise<void> {
    const currentCount = this.writtenEventUsage.get(userId) || 0;
    this.writtenEventUsage.set(userId, currentCount + 1);
  }

  async updateUserSession(userId: number, sessionInfo: { id: string; createdAt: Date; lastActive: Date }): Promise<boolean> {
    this.userSessions.set(userId, sessionInfo);
    
    const user = this.users.get(userId);
    if (!user) return false;
    
    const updatedUser = {
      ...user,
      sessionId: sessionInfo.id,
      lastActive: sessionInfo.lastActive
    };
    
    this.users.set(userId, updatedUser);
    return true;
  }

  async validateUserSession(userId: number, sessionId: string): Promise<boolean> {
    const session = this.userSessions.get(userId);
    return !!session && session.id === sessionId;
  }

  async invalidateOtherSessions(userId: number, currentSessionId: string): Promise<boolean> {
    // In memory implementation, we just ensure the current session is the only one
    const session = this.userSessions.get(userId);
    
    if (!session) return false;
    
    const updatedSession = {
      ...session,
      id: currentSessionId
    };
    
    this.userSessions.set(userId, updatedSession);
    
    // Update user's sessionId
    const user = this.users.get(userId);
    if (!user) return false;
    
    const updatedUser = {
      ...user,
      sessionId: currentSessionId
    };
    
    this.users.set(userId, updatedUser);
    return true;
  }

  async getUserSession(userId: number): Promise<{ id: string; createdAt: Date; lastActive: Date } | undefined> {
    return this.userSessions.get(userId);
  }

  async getDailyChallenge(userId: number): Promise<any> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    // Create a daily challenge for today if not exists
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    // Check for existing challenge
    let todayChallenge: DailyChallenge | undefined;
    for (const challenge of this.dailyChallenges.values()) {
      const challengeDate = new Date(challenge.date);
      if (challengeDate.getTime() === today.getTime()) {
        todayChallenge = challenge;
        break;
      }
    }
    
    // Create a new challenge if not exists
    if (!todayChallenge) {
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
      
      const id = this.currentDailyChallengeId++;
      todayChallenge = {
        id,
        title: `Master 5 ${piCategory} Performance Indicators`,
        description: "Complete today's challenge to earn 50 extra points!",
        type: "pi",
        points: 50,
        date: today,
        details: JSON.stringify({ category: piCategory })
      };
      
      this.dailyChallenges.set(id, todayChallenge);
    }
    
    // Check if user already completed the challenge
    const userChallenges = this.userDailyChallenges.get(userId) || [];
    const userCompletedChallenge = userChallenges.find(uc => uc.challengeId === todayChallenge!.id && uc.completed);
    
    return {
      ...todayChallenge,
      completed: !!userCompletedChallenge
    };
  }

  async completeDailyChallenge(userId: number): Promise<any> {
    // Get the current daily challenge
    const challenge = await this.getDailyChallenge(userId);
    if (challenge.completed) {
      return {
        success: false,
        message: "Challenge already completed"
      };
    }
    
    // Mark challenge as completed
    const userChallenges = this.userDailyChallenges.get(userId) || [];
    const now = new Date();
    const userChallenge: UserDailyChallenge = {
      id: userChallenges.length + 1,
      userId,
      challengeId: challenge.id,
      completed: true,
      completedAt: now
    };
    
    userChallenges.push(userChallenge);
    this.userDailyChallenges.set(userId, userChallenges);
    
    // Award points to user
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      points: (user.points || 0) + challenge.points
    };
    
    this.users.set(userId, updatedUser);
    
    return {
      success: true,
      points: challenge.points,
      totalPoints: updatedUser.points
    };
  }

  private seedAchievements(): void {
    // Streak achievements
    this.achievements.set(1, {
      id: 1,
      name: "Consistent Learner",
      description: "Log in 3 days in a row",
      type: "streak",
      points: 10,
      threshold: 3,
      image: "streak_3.svg",
      tier: 1
    });
    
    this.achievements.set(2, {
      id: 2,
      name: "Dedicated Learner",
      description: "Log in 7 days in a row",
      type: "streak",
      points: 25,
      threshold: 7,
      image: "streak_7.svg",
      tier: 2
    });
    
    this.achievements.set(3, {
      id: 3,
      name: "DECA Champion",
      description: "Log in 30 days in a row",
      type: "streak",
      points: 100,
      threshold: 30,
      image: "streak_30.svg",
      tier: 3
    });
    
    // Roleplay achievements
    this.achievements.set(4, {
      id: 4,
      name: "Roleplay Rookie",
      description: "Complete 5 roleplay scenarios",
      type: "roleplay_complete",
      points: 15,
      threshold: 5,
      image: "roleplay_5.svg",
      tier: 1
    });
    
    this.achievements.set(5, {
      id: 5,
      name: "Roleplay Expert",
      description: "Complete 25 roleplay scenarios",
      type: "roleplay_complete",
      points: 50,
      threshold: 25,
      image: "roleplay_25.svg",
      tier: 2
    });
    
    this.achievements.set(6, {
      id: 6,
      name: "Roleplay Master",
      description: "Complete 100 roleplay scenarios",
      type: "roleplay_complete",
      points: 200,
      threshold: 100,
      image: "roleplay_100.svg",
      tier: 3
    });
    
    // Test achievements
    this.achievements.set(7, {
      id: 7,
      name: "Test Taker",
      description: "Complete 5 practice tests",
      type: "test_score",
      points: 15,
      threshold: 5,
      image: "test_5.svg",
      tier: 1
    });
    
    this.achievements.set(8, {
      id: 8,
      name: "Test Ace",
      description: "Score 90% or higher on a practice test",
      type: "test_score",
      points: 50,
      threshold: 90,
      image: "test_90.svg",
      tier: 2
    });
    
    this.achievements.set(9, {
      id: 9,
      name: "Test Genius",
      description: "Complete 50 practice tests",
      type: "test_score",
      points: 150,
      threshold: 50,
      image: "test_50.svg",
      tier: 3
    });
    
    // Performance indicator achievements
    this.achievements.set(10, {
      id: 10,
      name: "PI Beginner",
      description: "Complete 10 performance indicators",
      type: "performance_indicator",
      points: 20,
      threshold: 10,
      image: "pi_10.svg",
      tier: 1
    });
    
    this.achievements.set(11, {
      id: 11,
      name: "PI Professional",
      description: "Complete 50 performance indicators",
      type: "performance_indicator",
      points: 75,
      threshold: 50,
      image: "pi_50.svg",
      tier: 2
    });
    
    this.achievements.set(12, {
      id: 12,
      name: "PI Legend",
      description: "Complete 200 performance indicators",
      type: "performance_indicator",
      points: 300,
      threshold: 200,
      image: "pi_200.svg",
      tier: 3
    });
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return this.userAchievements.get(userId) || [];
  }

  async awardAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    // Check if user already has this achievement
    const userAchievements = this.userAchievements.get(userId) || [];
    const existingAchievement = userAchievements.find(a => a.achievementId === achievementId);
    
    if (existingAchievement) return existingAchievement;
    
    // Get the achievement to award points
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return undefined;
    
    // Award the achievement
    const userAchievement: UserAchievement = {
      id: this.currentUserAchievementId++,
      userId,
      achievementId,
      earnedAt: new Date(),
      displayed: false
    };
    
    userAchievements.push(userAchievement);
    this.userAchievements.set(userId, userAchievements);
    
    // Award points to user
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        points: (user.points || 0) + achievement.points
      };
      this.users.set(userId, updatedUser);
    }
    
    return userAchievement;
  }

  async getNewUserAchievements(userId: number): Promise<UserAchievement[]> {
    const userAchievements = this.userAchievements.get(userId) || [];
    return userAchievements.filter(a => !a.displayed);
  }

  async markAchievementAsDisplayed(userId: number, achievementId: number): Promise<boolean> {
    const userAchievements = this.userAchievements.get(userId) || [];
    const achievementIndex = userAchievements.findIndex(a => a.achievementId === achievementId && !a.displayed);
    
    if (achievementIndex === -1) return false;
    
    userAchievements[achievementIndex] = {
      ...userAchievements[achievementIndex],
      displayed: true
    };
    
    this.userAchievements.set(userId, userAchievements);
    return true;
  }

  async checkForNewAchievements(userId: number): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    
    // Get user data for streak
    const user = this.users.get(userId);
    if (!user) return [];
    
    // Get existing achievements
    const existingAchievements = this.userAchievements.get(userId) || [];
    const existingAchievementIds = existingAchievements.map(a => a.achievementId);
    
    // Get all achievements
    const allAchievements = Array.from(this.achievements.values());
    
    // Check streak achievements
    const streakAchievements = allAchievements.filter(a => a.type === 'streak');
    for (const achievement of streakAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (user.streak && user.streak >= achievement.threshold) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    // Check roleplay achievements
    const roleplayAchievements = allAchievements.filter(a => a.type === 'roleplay_complete');
    let roleplayCount = 0;
    
    for (const session of this.practiceSessions.values()) {
      if (session.userId === userId && session.type === 'roleplay') {
        roleplayCount++;
      }
    }
    
    for (const achievement of roleplayAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (roleplayCount >= achievement.threshold) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    // Check test achievements
    const testAchievements = allAchievements.filter(a => a.type === 'test_score');
    let testCount = 0;
    let highestScore = 0;
    
    for (const session of this.practiceSessions.values()) {
      if (session.userId === userId && session.type === 'test') {
        testCount++;
        if (session.score && session.score > highestScore) {
          highestScore = session.score;
        }
      }
    }
    
    for (const achievement of testAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (achievement.threshold <= 50 && testCount >= achievement.threshold) {
        // For count-based achievements
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      } else if (achievement.threshold > 50 && highestScore >= achievement.threshold) {
        // For score-based achievements
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    // Check performance indicator achievements
    const piAchievements = allAchievements.filter(a => a.type === 'performance_indicator');
    let completedPIsCount = 0;
    
    for (const pi of this.performanceIndicators.values()) {
      if (pi.userId === userId && pi.status === 'completed') {
        completedPIsCount++;
      }
    }
    
    for (const achievement of piAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (completedPIsCount >= achievement.threshold) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    return newAchievements;
  }

  async startBreakSession(userId: number, activityType: string): Promise<BreakSession> {
    const id = this.currentBreakSessionId++;
    
    const session: BreakSession = {
      id,
      userId,
      startTime: new Date(),
      endTime: null,
      duration: null,
      activityType,
      completed: false
    };
    
    this.breakSessions.set(id, session);
    return session;
  }

  async endBreakSession(id: number, stats: { duration: number; completed: boolean }): Promise<BreakSession | undefined> {
    const session = this.breakSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: BreakSession = {
      ...session,
      endTime: new Date(),
      duration: stats.duration,
      completed: stats.completed
    };
    
    this.breakSessions.set(id, updatedSession);
    
    // Award points if completed
    if (stats.completed) {
      const user = this.users.get(session.userId);
      if (user) {
        const updatedUser = {
          ...user,
          points: (user.points || 0) + 5 // Award 5 points for completing a break
        };
        this.users.set(session.userId, updatedUser);
      }
    }
    
    return updatedSession;
  }

  async getUserBreakSessions(userId: number): Promise<BreakSession[]> {
    const sessions: BreakSession[] = [];
    
    for (const session of this.breakSessions.values()) {
      if (session.userId === userId) {
        sessions.push(session);
      }
    }
    
    // Sort by start time, most recent first
    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async saveMiniGameScore(scoreData: InsertMiniGameScore): Promise<MiniGameScore> {
    const id = this.currentMiniGameScoreId++;
    
    const score: MiniGameScore = {
      id,
      userId: scoreData.userId,
      gameType: scoreData.gameType,
      score: scoreData.score,
      playedAt: scoreData.playedAt || new Date(),
      duration: scoreData.duration || null
    };
    
    // Get or create user's scores
    const userScores = this.miniGameScores.get(scoreData.userId) || [];
    userScores.push(score);
    
    this.miniGameScores.set(scoreData.userId, userScores);
    
    // Award points to user based on score
    const pointsToAdd = Math.min(10, Math.floor(scoreData.score / 10));
    const user = this.users.get(scoreData.userId);
    
    if (user) {
      const updatedUser = {
        ...user,
        points: (user.points || 0) + pointsToAdd
      };
      this.users.set(scoreData.userId, updatedUser);
    }
    
    return score;
  }

  async getUserMiniGameHighScores(userId: number): Promise<Record<string, number>> {
    const userScores = this.miniGameScores.get(userId) || [];
    const highScores: Record<string, number> = {};
    
    // Group by game type and find highest score
    for (const score of userScores) {
      if (!highScores[score.gameType] || score.score > highScores[score.gameType]) {
        highScores[score.gameType] = score.score;
      }
    }
    
    return highScores;
  }

  async getLeaderboard(gameType: string, limit: number = 10): Promise<MiniGameScore[]> {
    const allScores: MiniGameScore[] = [];
    
    // Collect all scores for the specified game type
    for (const [userId, scores] of this.miniGameScores.entries()) {
      for (const score of scores) {
        if (score.gameType === gameType) {
          allScores.push(score);
        }
      }
    }
    
    // Sort by score (highest first) and take top 'limit' scores
    return allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// Implementation of DatabaseStorage using Drizzle ORM
export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    // Initialize the PostgreSQL session store
    // Use a string-based connection instead of passing a pool directly
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error.message);
      
      // Fallback to a simpler query if column issues occur
      const result = await pool.query(`
        SELECT * FROM users WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) return undefined;
      
      // Convert snake_case to camelCase for consistency
      const userData = result.rows[0];
      const user: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        eventFormat: userData.event_format,
        eventCode: userData.event_code,
        eventType: userData.event_type,
        instructionalArea: userData.instructional_area,
        sessionId: userData.session_id,
        uiTheme: userData.ui_theme || "aquaBlue",
        colorScheme: userData.color_scheme || "memphis",
        theme: userData.theme || "light",
        subscriptionTier: userData.subscription_tier || "standard",
        streak: userData.streak || 0,
        lastLoginDate: userData.last_login_date,
        points: userData.points || 0,
        roleplayCount: userData.roleplay_count || 0,
        testCount: userData.test_count || 0,
        writtenEventCount: userData.written_event_count || 0,
        roleplayResetDate: userData.roleplay_reset_date,
        testResetDate: userData.test_reset_date,
        writtenEventResetDate: userData.written_event_reset_date,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id
      };
      return user;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error in getUserByUsername:", error.message);
      
      // Fallback to a simpler query if column issues occur
      const result = await pool.query(`
        SELECT * FROM users WHERE username = $1
      `, [username]);
      
      if (result.rows.length === 0) return undefined;
      
      // Convert snake_case to camelCase for consistency
      const userData = result.rows[0];
      const user: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        eventFormat: userData.event_format,
        eventCode: userData.event_code,
        eventType: userData.event_type,
        instructionalArea: userData.instructional_area,
        sessionId: userData.session_id,
        uiTheme: userData.ui_theme || "aquaBlue",
        colorScheme: userData.color_scheme || "memphis",
        theme: userData.theme || "light",
        subscriptionTier: userData.subscription_tier || "standard",
        streak: userData.streak || 0,
        lastLoginDate: userData.last_login_date,
        points: userData.points || 0,
        roleplayCount: userData.roleplay_count || 0,
        testCount: userData.test_count || 0,
        writtenEventCount: userData.written_event_count || 0,
        roleplayResetDate: userData.roleplay_reset_date,
        testResetDate: userData.test_reset_date,
        writtenEventResetDate: userData.written_event_reset_date,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id
      };
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return undefined;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
      return user;
    } catch (error) {
      console.error("Error in getUserByGoogleId:", error);
      return undefined;
    }
  }

  async linkGoogleAccount(userId: number, googleId: string): Promise<User | undefined> {
    try {
      await db.update(users).set({ googleId }).where(eq(users.id, userId));
      return await this.getUser(userId);
    } catch (error) {
      console.error("Error in linkGoogleAccount:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    try {
      // Create the user with the default values
      const [user] = await db.insert(users).values({
        ...insertUser,
        email: insertUser.email || null,
        eventFormat: insertUser.eventFormat || null,
        eventCode: insertUser.eventCode || null,
        eventType: insertUser.eventType || null,
        instructionalArea: insertUser.instructionalArea || null,
        sessionId: sessionId,
        lastLoginDate: now,
        subscriptionTier: "standard", // Default subscription tier
        uiTheme: insertUser.uiTheme || "aquaBlue", // Default UI theme
        colorScheme: insertUser.colorScheme || "memphis", // Default color scheme
        theme: insertUser.theme || "light", // Default theme setting
        streak: 0, // Starting streak
        points: 0, // Starting points
        roleplayCount: 0,
        testCount: 0,
        writtenEventCount: 0,
        roleplayResetDate: now,
        testResetDate: now,
        writtenEventResetDate: now,
        stripeCustomerId: null, // Stripe customer ID
        stripeSubscriptionId: null, // Stripe subscription ID
      }).returning();
      
      // Create default performance indicators for the user
      await this.createDefaultPIs(user.id);
      
      return user;
    } catch (error) {
      console.error("Error in createUser:", error.message);
      
      // Manual insertion as fallback
      const result = await pool.query(`
        INSERT INTO users (
          username, password, email, event_format, event_code, event_type, 
          instructional_area, session_id, last_login_date, subscription_tier,
          ui_theme, color_scheme, theme, streak, points,
          roleplay_count, test_count, written_event_count,
          roleplay_reset_date, test_reset_date, written_event_reset_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *
      `, [
        insertUser.username,
        insertUser.password,
        insertUser.email || null,
        insertUser.eventFormat || null,
        insertUser.eventCode || null,
        insertUser.eventType || null,
        insertUser.instructionalArea || null,
        sessionId,
        now,
        "standard",
        insertUser.uiTheme || "aquaBlue",
        insertUser.colorScheme || "memphis",
        insertUser.theme || "light",
        0, 0, 0, 0, 0, now, now, now
      ]);
      
      if (result.rows.length === 0) {
        throw new Error("Failed to create user");
      }
      
      const userData = result.rows[0];
      
      // Create default performance indicators for the user
      await this.createDefaultPIs(userData.id);
      
      // Convert to User type
      const user: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        eventFormat: userData.event_format,
        eventCode: userData.event_code,
        eventType: userData.event_type,
        instructionalArea: userData.instructional_area,
        sessionId: userData.session_id,
        lastLoginDate: userData.last_login_date,
        subscriptionTier: userData.subscription_tier,
        uiTheme: userData.ui_theme,
        colorScheme: userData.color_scheme,
        theme: userData.theme,
        streak: userData.streak,
        points: userData.points,
        roleplayCount: userData.roleplay_count,
        testCount: userData.test_count,
        writtenEventCount: userData.written_event_count,
        roleplayResetDate: userData.roleplay_reset_date,
        testResetDate: userData.test_reset_date,
        writtenEventResetDate: userData.written_event_reset_date,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id
      };
      
      return user;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.eventCode !== undefined) dbUpdates.event_code = updates.eventCode;
      if (updates.eventFormat !== undefined) dbUpdates.event_format = updates.eventFormat;
      if (updates.eventType !== undefined) dbUpdates.event_type = updates.eventType;
      if (updates.instructionalArea !== undefined) dbUpdates.instructional_area = updates.instructionalArea;
      if (updates.uiTheme !== undefined) dbUpdates.ui_theme = updates.uiTheme;
      if (updates.colorScheme !== undefined) dbUpdates.color_scheme = updates.colorScheme;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.subscriptionTier !== undefined) dbUpdates.subscription_tier = updates.subscriptionTier;
      if (updates.points !== undefined) dbUpdates.points = updates.points;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;

      const [user] = await db
        .update(users)
        .set(dbUpdates)
        .where(eq(users.id, id))
        .returning();
      
      return user;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return undefined;
    }
  }

  private async createDefaultPIs(userId: number) {
    // Implementation would be here - this is just a stub
    // This would create default performance indicators for a user
  }

  async updateLastLogin(id: number, date: Date): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          lastLoginDate: date,
          // Update streak logic would be here
        })
        .where(eq(users.id, id))
        .returning();
      
      return user;
    } catch (error) {
      console.error("Error in updateLastLogin:", error);
      
      // Fallback to direct SQL query
      const result = await pool.query(`
        UPDATE users SET last_login_date = $1 WHERE id = $2 RETURNING *
      `, [date, id]);
      
      if (result.rows.length === 0) return undefined;
      
      // Convert to User type
      const userData = result.rows[0];
      const user: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        eventFormat: userData.event_format,
        eventCode: userData.event_code,
        eventType: userData.event_type,
        instructionalArea: userData.instructional_area,
        sessionId: userData.session_id,
        lastLoginDate: userData.last_login_date,
        subscriptionTier: userData.subscription_tier,
        uiTheme: userData.ui_theme,
        colorScheme: userData.color_scheme,
        theme: userData.theme,
        streak: userData.streak,
        points: userData.points,
        roleplayCount: userData.roleplay_count,
        testCount: userData.test_count,
        writtenEventCount: userData.written_event_count,
        roleplayResetDate: userData.roleplay_reset_date,
        testResetDate: userData.test_reset_date,
        writtenEventResetDate: userData.written_event_reset_date,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id
      };
      
      return user;
    }
  }

  async updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    uiTheme?: string,
    colorScheme?: string,
    theme?: string
  }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(settings)
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  async updateSubscription(id: number, tier: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ subscriptionTier: tier })
        .where(eq(users.id, id))
        .returning();
      
      return user;
    } catch (error) {
      console.error("Error in updateSubscription:", error);
      
      // Fallback to direct SQL query
      const result = await pool.query(`
        UPDATE users SET subscription_tier = $1 WHERE id = $2 RETURNING *
      `, [tier, id]);
      
      if (result.rows.length === 0) return undefined;
      
      // Convert to User type
      const userData = result.rows[0];
      const user: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        eventFormat: userData.event_format,
        eventCode: userData.event_code,
        eventType: userData.event_type,
        instructionalArea: userData.instructional_area,
        sessionId: userData.session_id,
        lastLoginDate: userData.last_login_date,
        subscriptionTier: userData.subscription_tier,
        uiTheme: userData.ui_theme,
        colorScheme: userData.color_scheme,
        theme: userData.theme,
        streak: userData.streak,
        points: userData.points,
        roleplayCount: userData.roleplay_count,
        testCount: userData.test_count,
        writtenEventCount: userData.written_event_count,
        roleplayResetDate: userData.roleplay_reset_date,
        testResetDate: userData.test_reset_date,
        writtenEventResetDate: userData.written_event_reset_date,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id
      };
      
      return user;
    }
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stripeSubscriptionId: subscriptionId })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updateUserStripeInfo(userId: number, info: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: info.customerId,
        stripeSubscriptionId: info.subscriptionId 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));
    
    return user;
  }

  async getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]> {
    let query = db
      .select()
      .from(performanceIndicators)
      .where(eq(performanceIndicators.userId, userId));
    
    if (category) {
      query = query.where(eq(performanceIndicators.category, category));
    }
    
    return await query;
  }

  async updatePIStatus(userId: number, piId: number, status: string): Promise<boolean> {
    const result = await db
      .update(performanceIndicators)
      .set({ status })
      .where(and(
        eq(performanceIndicators.id, piId),
        eq(performanceIndicators.userId, userId)
      ));
    
    return result.rowCount > 0;
  }

  async recordPracticeSession(sessionData: InsertSession): Promise<PracticeSession> {
    const [session] = await db
      .insert(practiceSessions)
      .values({
        ...sessionData,
        description: sessionData.description || null,
        score: sessionData.score || null,
        performance: sessionData.performance || null,
        feedback: sessionData.feedback || null,
        duration: sessionData.duration || null,
        completedAt: new Date()
      })
      .returning();
    
    return session;
  }

  async getUserStats(userId: number): Promise<any> {
    // Count sessions by type
    const [roleplayStats] = await db
      .select({ count: count() })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, 'roleplay')
      ));
    
    const [testStats] = await db
      .select({ count: count() })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, 'test')
      ));
    
    const [writtenStats] = await db
      .select({ count: count() })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, 'written')
      ));
    
    // Count PIs by status
    const [completedPIStats] = await db
      .select({ count: count() })
      .from(performanceIndicators)
      .where(and(
        eq(performanceIndicators.userId, userId),
        eq(performanceIndicators.status, 'completed')
      ));
    
    const [inProgressPIStats] = await db
      .select({ count: count() })
      .from(performanceIndicators)
      .where(and(
        eq(performanceIndicators.userId, userId),
        eq(performanceIndicators.status, 'in-progress')
      ));
    
    const [notStartedPIStats] = await db
      .select({ count: count() })
      .from(performanceIndicators)
      .where(and(
        eq(performanceIndicators.userId, userId),
        eq(performanceIndicators.status, 'not-started')
      ));
    
    return {
      roleplayCount: Number(roleplayStats.count) || 0,
      testCount: Number(testStats.count) || 0,
      writtenCount: Number(writtenStats.count) || 0,
      completedPIs: Number(completedPIStats.count) || 0,
      inProgressPIs: Number(inProgressPIStats.count) || 0,
      notStartedPIs: Number(notStartedPIStats.count) || 0,
      totalSessions: (Number(roleplayStats.count) || 0) + 
                     (Number(testStats.count) || 0) + 
                     (Number(writtenStats.count) || 0),
      totalPIs: (Number(completedPIStats.count) || 0) + 
                (Number(inProgressPIStats.count) || 0) + 
                (Number(notStartedPIStats.count) || 0)
    };
  }

  async getUserActivities(userId: number): Promise<any[]> {
    const activities = [];
    
    // Get practice sessions
    const sessions = await db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, userId))
      .orderBy(desc(practiceSessions.completedAt));
    
    // Add sessions as activities
    for (const session of sessions) {
      activities.push({
        type: `${session.type}_practice`,
        title: session.title,
        date: session.completedAt,
        details: {
          score: session.score,
          performance: session.performance
        }
      });
    }
    
    // Add completed PIs - if we tracked completion dates, we'd use those
    const completedPIs = await db
      .select()
      .from(performanceIndicators)
      .where(and(
        eq(performanceIndicators.userId, userId),
        eq(performanceIndicators.status, 'completed')
      ));
    
    for (const pi of completedPIs) {
      activities.push({
        type: 'pi_completed',
        title: pi.text,
        date: new Date(), // Simplified - would use actual completion date in real app
        details: {
          category: pi.category,
          instructionalArea: pi.instructionalArea
        }
      });
    }
    
    // Sort by date, most recent first
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return activities;
  }

  async getLearningItems(userId: number): Promise<any[]> {
    // Get incomplete PIs
    const incompletePIs = await db
      .select()
      .from(performanceIndicators)
      .where(and(
        eq(performanceIndicators.userId, userId),
        sql`${performanceIndicators.status} != 'completed'`
      ));
    
    const items = incompletePIs.map(pi => ({
      type: 'pi',
      id: pi.id,
      title: pi.text,
      category: pi.category,
      instructionalArea: pi.instructionalArea,
      priority: pi.status === 'in-progress' ? 'high' : 'medium',
      status: pi.status
    }));
    
    // Sort by priority
    items.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });
    
    return items;
  }

  async checkRoleplayAllowance(userId: number): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) return false;
      
      // Get subscription limits
      const subscriptionTier = user.subscriptionTier || 'standard';
      
      let limit: number;
      if (subscriptionTier === 'standard') {
        limit = 15;  // Standard tier: 15 roleplays per month
      } else if (subscriptionTier === 'plus') {
        limit = 25;  // Plus tier: 25 roleplays per month
      } else if (subscriptionTier === 'pro') {
        limit = -1;  // Pro tier: unlimited
      } else {
        limit = 15;  // Default to standard limits
      }
      
      // Check if unlimited
      if (limit === -1) return true;
      
      // Get current month's usage from roleplay_count (if user has count in DB)
      if (user.roleplayCount !== undefined && user.roleplayCount !== null) {
        return user.roleplayCount < limit;
      }
      
      // Fallback: Get current month's usage from sessions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const result = await db
        .select({ count: count() })
        .from(practiceSessions)
        .where(and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.type, 'roleplay'),
          sql`${practiceSessions.completedAt} >= ${startOfMonth}`,
          sql`${practiceSessions.completedAt} <= ${endOfMonth}`
        ));
      
      if (!result.length) return true;
      
      const currentCount = Number(result[0].count) || 0;
      return currentCount < limit;
    } catch (error) {
      console.error("Error in checkRoleplayAllowance:", error);
      
      // Fallback to direct SQL query
      const result = await pool.query(`
        SELECT subscription_tier, roleplay_count FROM users WHERE id = $1
      `, [userId]);
      
      if (result.rows.length === 0) return false;
      
      const userData = result.rows[0];
      const subscriptionTier = userData.subscription_tier || 'standard';
      
      let limit: number;
      if (subscriptionTier === 'standard') {
        limit = 15;
      } else if (subscriptionTier === 'plus') {
        limit = 25;
      } else if (subscriptionTier === 'pro') {
        limit = -1;
      } else {
        limit = 15;
      }
      
      if (limit === -1) return true;
      
      // Use roleplay_count if available
      if (userData.roleplay_count !== null && userData.roleplay_count !== undefined) {
        return userData.roleplay_count < limit;
      }
      
      // Otherwise fall back to counting sessions for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      
      const sessionResult = await pool.query(`
        SELECT COUNT(*) AS count FROM practice_sessions 
        WHERE user_id = $1 AND type = 'roleplay' 
        AND completed_at >= $2 AND completed_at <= $3
      `, [userId, startOfMonth, endOfMonth]);
      
      const currentCount = Number(sessionResult.rows[0].count) || 0;
      return currentCount < limit;
    }
  }

  async checkTestAllowance(userId: number): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) return false;
      
      // Get subscription limits
      const subscriptionTier = user.subscriptionTier || 'standard';
      
      let limit: number;
      if (subscriptionTier === 'standard') {
        limit = 15;  // Standard tier: 15 tests per month
      } else if (subscriptionTier === 'plus') {
        limit = 25;  // Plus tier: 25 tests per month
      } else if (subscriptionTier === 'pro') {
        limit = -1;  // Pro tier: unlimited
      } else {
        limit = 15;  // Default to standard limits
      }
      
      // Check if unlimited
      if (limit === -1) return true;
      
      // Get current month's usage from test_count (if user has count in DB)
      if (user.testCount !== undefined && user.testCount !== null) {
        return user.testCount < limit;
      }
      
      // Fallback: Get current month's usage from sessions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const result = await db
        .select({ count: count() })
        .from(practiceSessions)
        .where(and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.type, 'test'),
          sql`${practiceSessions.completedAt} >= ${startOfMonth}`,
          sql`${practiceSessions.completedAt} <= ${endOfMonth}`
        ));
      
      if (!result.length) return true;
      
      const currentCount = Number(result[0].count) || 0;
      return currentCount < limit;
    } catch (error) {
      console.error("Error in checkTestAllowance:", error);
      
      // Fallback to direct SQL query
      const result = await pool.query(`
        SELECT subscription_tier, test_count FROM users WHERE id = $1
      `, [userId]);
      
      if (result.rows.length === 0) return false;
      
      const userData = result.rows[0];
      const subscriptionTier = userData.subscription_tier || 'standard';
      
      let limit: number;
      if (subscriptionTier === 'standard') {
        limit = 15;
      } else if (subscriptionTier === 'plus') {
        limit = 25;
      } else if (subscriptionTier === 'pro') {
        limit = -1;
      } else {
        limit = 15;
      }
      
      if (limit === -1) return true;
      
      // Use test_count if available
      if (userData.test_count !== null && userData.test_count !== undefined) {
        return userData.test_count < limit;
      }
      
      // Otherwise fall back to counting sessions for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      
      const sessionResult = await pool.query(`
        SELECT COUNT(*) AS count FROM practice_sessions 
        WHERE user_id = $1 AND type = 'test' 
        AND completed_at >= $2 AND completed_at <= $3
      `, [userId, startOfMonth, endOfMonth]);
      
      const currentCount = Number(sessionResult.rows[0].count) || 0;
      return currentCount < limit;
    }
  }

  async checkWrittenEventAllowance(userId: number): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) return false;
      
      // Get subscription limits
      const subscriptionTier = user.subscriptionTier || 'standard';
      
      let limit: number;
      if (subscriptionTier === 'standard') {
        limit = 2;   // Standard tier: 2 written events per month
      } else if (subscriptionTier === 'plus') {
        limit = 7;   // Plus tier: 7 written events per month
      } else if (subscriptionTier === 'pro') {
        limit = -1;  // Pro tier: unlimited
      } else {
        limit = 2;   // Default to standard limits
      }
      
      // Check if unlimited
      if (limit === -1) return true;
      
      // Get current month's usage from written_event_count (if user has count in DB)
      if (user.writtenEventCount !== undefined && user.writtenEventCount !== null) {
        return user.writtenEventCount < limit;
      }
      
      // Fallback: Get current month's usage from sessions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const result = await db
        .select({ count: count() })
        .from(practiceSessions)
        .where(and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.type, 'written'),
          sql`${practiceSessions.completedAt} >= ${startOfMonth}`,
          sql`${practiceSessions.completedAt} <= ${endOfMonth}`
        ));
      
      if (!result.length) return true;
      
      const currentCount = Number(result[0].count) || 0;
      return currentCount < limit;
    } catch (error) {
      console.error("Error in checkWrittenEventAllowance:", error);
      
      // Fallback to direct SQL query
      const result = await pool.query(`
        SELECT subscription_tier, written_event_count FROM users WHERE id = $1
      `, [userId]);
      
      if (result.rows.length === 0) return false;
      
      const userData = result.rows[0];
      const subscriptionTier = userData.subscription_tier || 'standard';
      
      let limit: number;
      if (subscriptionTier === 'standard') {
        limit = 2;
      } else if (subscriptionTier === 'plus') {
        limit = 7;
      } else if (subscriptionTier === 'pro') {
        limit = -1;
      } else {
        limit = 2;
      }
      
      if (limit === -1) return true;
      
      // Use written_event_count if available
      if (userData.written_event_count !== null && userData.written_event_count !== undefined) {
        return userData.written_event_count < limit;
      }
      
      // Otherwise fall back to counting sessions for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      
      const sessionResult = await pool.query(`
        SELECT COUNT(*) AS count FROM practice_sessions 
        WHERE user_id = $1 AND type = 'written' 
        AND completed_at >= $2 AND completed_at <= $3
      `, [userId, startOfMonth, endOfMonth]);
      
      const currentCount = Number(sessionResult.rows[0].count) || 0;
      return currentCount < limit;
    }
  }

  async recordRoleplayGeneration(userId: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          roleplayCount: sql`COALESCE(${users.roleplayCount}, 0) + 1`,
          roleplayResetDate: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error recording roleplay generation:", error);
      // Fallback to direct SQL
      await pool.query(`
        UPDATE users 
        SET roleplay_count = COALESCE(roleplay_count, 0) + 1,
            roleplay_reset_date = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);
    }
  }

  async recordTestGeneration(userId: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          testCount: sql`COALESCE(${users.testCount}, 0) + 1`,
          testResetDate: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error recording test generation:", error);
      // Fallback to direct SQL
      await pool.query(`
        UPDATE users 
        SET test_count = COALESCE(test_count, 0) + 1,
            test_reset_date = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);
    }
  }

  async recordWrittenEventGeneration(userId: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          writtenEventCount: sql`COALESCE(${users.writtenEventCount}, 0) + 1`,
          writtenEventResetDate: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error recording written event generation:", error);
      // Fallback to direct SQL
      await pool.query(`
        UPDATE users 
        SET written_event_count = COALESCE(written_event_count, 0) + 1,
            written_event_reset_date = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);
    }
  }

  async updateUserSession(userId: number, sessionInfo: { id: string, createdAt: Date, lastActive: Date }): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        sessionId: sessionInfo.id,
        lastActive: sessionInfo.lastActive
      })
      .where(eq(users.id, userId));
    
    return result.rowCount > 0;
  }

  async validateUserSession(userId: number, sessionId: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    return !!user && user.sessionId === sessionId;
  }

  async invalidateOtherSessions(userId: number, currentSessionId: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ sessionId: currentSessionId })
      .where(eq(users.id, userId));
    
    return result.rowCount > 0;
  }

  async getUserSession(userId: number): Promise<{ id: string, createdAt: Date, lastActive: Date } | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) return undefined;
    
    // This is simplified - in a real app we might store more session details in a separate table
    return {
      id: user.sessionId || '',
      createdAt: user.createdAt || new Date(),
      lastActive: user.lastActive || new Date()
    };
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }

  async awardAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    // Check if user already has this achievement
    const [existingAchievement] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
    
    if (existingAchievement) return existingAchievement;
    
    // Get the achievement to award points
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId));
    
    if (!achievement) return undefined;
    
    // Award the achievement
    const [userAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        earnedAt: new Date(),
        displayed: false
      })
      .returning();
    
    // Award points to user
    await db
      .update(users)
      .set({
        points: sql`${users.points} + ${achievement.points}`
      })
      .where(eq(users.id, userId));
    
    return userAchievement;
  }

  async getNewUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.displayed, false)
      ));
  }

  async markAchievementAsDisplayed(userId: number, achievementId: number): Promise<boolean> {
    const result = await db
      .update(userAchievements)
      .set({ displayed: true })
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
    
    return result.rowCount > 0;
  }

  async checkForNewAchievements(userId: number): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    
    // Get user data for streak
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Get existing achievements
    const existingAchievements = await this.getUserAchievements(userId);
    const existingAchievementIds = existingAchievements.map(a => a.achievementId);
    
    // Get all achievements
    const allAchievements = await this.getAchievements();
    
    // Check streak achievements
    const streakAchievements = allAchievements.filter(a => a.type === 'streak');
    for (const achievement of streakAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (user.streak && user.streak >= achievement.threshold) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    // Check roleplay achievements
    const roleplayAchievements = allAchievements.filter(a => a.type === 'roleplay_complete');
    const [{ count: roleplayCount }] = await db
      .select({ count: count() })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, 'roleplay')
      ));
    
    for (const achievement of roleplayAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (Number(roleplayCount) >= achievement.threshold) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    // Check test achievements
    const testAchievements = allAchievements.filter(a => a.type === 'test_score');
    const [{ count: testCount }] = await db
      .select({ count: count() })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, 'test')
      ));
    
    // Get highest test score
    const [{ max: highestScore }] = await db
      .select({ max: sql`MAX(${practiceSessions.score})` })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.type, 'test'),
        isNotNull(practiceSessions.score)
      ));
    
    for (const achievement of testAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (achievement.threshold <= 50 && Number(testCount) >= achievement.threshold) {
        // For count-based achievements
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      } else if (achievement.threshold > 50 && highestScore >= achievement.threshold) {
        // For score-based achievements
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    // Check performance indicator achievements
    const piAchievements = allAchievements.filter(a => a.type === 'performance_indicator');
    const [{ count: completedPIsCount }] = await db
      .select({ count: count() })
      .from(performanceIndicators)
      .where(and(
        eq(performanceIndicators.userId, userId),
        eq(performanceIndicators.status, 'completed')
      ));
    
    for (const achievement of piAchievements) {
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      if (Number(completedPIsCount) >= achievement.threshold) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (awarded) newAchievements.push(awarded);
      }
    }
    
    return newAchievements;
  }

  // Break sessions
  async startBreakSession(userId: number, activityType: string): Promise<BreakSession> {
    const [session] = await db
      .insert(breakSessions)
      .values({
        userId,
        startTime: new Date(),
        activityType,
        completed: false
      })
      .returning();
    
    return session;
  }

  async endBreakSession(id: number, stats: { duration: number; completed: boolean }): Promise<BreakSession | undefined> {
    const [session] = await db
      .update(breakSessions)
      .set({
        endTime: new Date(),
        duration: stats.duration,
        completed: stats.completed
      })
      .where(eq(breakSessions.id, id))
      .returning();
    
    if (!session) return undefined;
    
    // Award points if completed
    if (stats.completed) {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + 5`
        })
        .where(eq(users.id, session.userId));
    }
    
    return session;
  }

  async getUserBreakSessions(userId: number): Promise<BreakSession[]> {
    return await db
      .select()
      .from(breakSessions)
      .where(eq(breakSessions.userId, userId))
      .orderBy(desc(breakSessions.startTime));
  }

  // Mini-games
  async saveMiniGameScore(scoreData: InsertMiniGameScore): Promise<MiniGameScore> {
    const [score] = await db
      .insert(miniGameScores)
      .values(scoreData)
      .returning();
    
    // Award points to user based on score
    const pointsToAdd = Math.min(10, Math.floor(scoreData.score / 10));
    await db
      .update(users)
      .set({
        points: sql`${users.points} + ${pointsToAdd}`
      })
      .where(eq(users.id, scoreData.userId));
    
    return score;
  }

  async getUserMiniGameHighScores(userId: number): Promise<Record<string, number>> {
    const scores = await db
      .select({
        gameType: miniGameScores.gameType,
        maxScore: sql`MAX(${miniGameScores.score})`
      })
      .from(miniGameScores)
      .where(eq(miniGameScores.userId, userId))
      .groupBy(miniGameScores.gameType);
    
    const highScores: Record<string, number> = {};
    for (const score of scores) {
      highScores[score.gameType] = Number(score.maxScore);
    }
    
    return highScores;
  }

  async getLeaderboard(gameType: string, limit: number = 10): Promise<MiniGameScore[]> {
    return await db
      .select()
      .from(miniGameScores)
      .where(eq(miniGameScores.gameType, gameType))
      .orderBy(desc(miniGameScores.score))
      .limit(limit);
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
    
    // Try to find today's challenge for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Look for challenge in DB
    const [existingChallenge] = await db
      .select()
      .from(dailyChallenges)
      .where(and(
        sql`${dailyChallenges.date} >= ${today}`,
        sql`${dailyChallenges.date} < ${tomorrow}`
      ));
    
    // If challenge exists, return it, otherwise create a new one
    if (existingChallenge) {
      const [userChallenge] = await db
        .select()
        .from(userDailyChallenges)
        .where(and(
          eq(userDailyChallenges.userId, userId),
          eq(userDailyChallenges.challengeId, existingChallenge.id)
        ));
      
      return {
        ...existingChallenge,
        completed: userChallenge?.completed || false
      };
    }
    
    // Create a new challenge
    const [newChallenge] = await db
      .insert(dailyChallenges)
      .values({
        title: `Master 5 ${piCategory} Performance Indicators`,
        description: "Complete today's challenge to earn 50 extra points!",
        type: "pi",
        points: 50,
        date: today,
        details: JSON.stringify({ category: piCategory })
      })
      .returning();
    
    return {
      ...newChallenge,
      completed: false
    };
  }

  async completeDailyChallenge(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Get today's challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(and(
        sql`${dailyChallenges.date} >= ${today}`,
        sql`${dailyChallenges.date} < ${tomorrow}`
      ));
    
    if (!challenge) throw new Error("No challenge for today");
    
    // Check if already completed
    const [existingUserChallenge] = await db
      .select()
      .from(userDailyChallenges)
      .where(and(
        eq(userDailyChallenges.userId, userId),
        eq(userDailyChallenges.challengeId, challenge.id)
      ));
    
    if (existingUserChallenge?.completed) {
      return {
        success: false,
        message: "Challenge already completed"
      };
    }
    
    // Complete the challenge
    if (existingUserChallenge) {
      await db
        .update(userDailyChallenges)
        .set({
          completed: true,
          completedAt: new Date()
        })
        .where(eq(userDailyChallenges.id, existingUserChallenge.id));
    } else {
      await db
        .insert(userDailyChallenges)
        .values({
          userId,
          challengeId: challenge.id,
          completed: true,
          completedAt: new Date()
        });
    }
    
    // Award points
    const [updatedUser] = await db
      .update(users)
      .set({
        points: sql`${users.points} + ${challenge.points}`
      })
      .where(eq(users.id, userId))
      .returning();
    
    return {
      success: true,
      points: challenge.points,
      totalPoints: updatedUser.points
    };
  }
}

// Choose between MemStorage and DatabaseStorage based on environment
const useDatabase = process.env.USE_DATABASE === 'true' || true; // Default to true

// Export storage
export const storage = useDatabase 
  ? new DatabaseStorage() 
  : new MemStorage();