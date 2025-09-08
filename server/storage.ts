import {
  SUBSCRIPTION_LIMITS,
  PI_CATEGORIES,
  DECA_EVENTS
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc, count, sql, asc, and, isNull, isNotNull } from "drizzle-orm";
import { 
  users, performanceIndicators, practiceSessions,
  achievements, userAchievements, 
  dailyChallenges, userDailyChallenges,
  breakSessions, miniGameScores,
  cosmeticItems, userCosmetics, decitsTransactions,
  testHistory, questionResults, learningInsights, roleplayHistory,
  topicMastery, quizSessions, enhancedLearningInsights,
  gameSessionsDECABloc,
  insertUserSchema, insertPerformanceIndicatorSchema, insertSessionSchema,
  insertDailyChallengeSchema, insertBreakSessionSchema, insertMiniGameScoreSchema,
  insertCosmeticItemSchema, insertTestHistorySchema, insertQuestionResultSchema, 
  insertLearningInsightSchema, insertRoleplayHistorySchema,
  insertTopicMasterySchema, insertQuizSessionSchema, insertEnhancedLearningInsightSchema,
  insertGameSessionDECABlocSchema
} from "@shared/schema";
import type {
  User, TestHistory, QuestionResult, LearningInsight, PracticeSession, PerformanceIndicator,
  Achievement, UserAchievement, DailyChallenge, UserDailyChallenge,
  BreakSession, MiniGameScore, CosmeticItem, RoleplayHistory,
  TopicMastery, QuizSession, EnhancedLearningInsight,
  GameSessionDECABloc, InsertGameSessionDECABloc,
  InsertTopicMastery, InsertQuizSession, InsertEnhancedLearningInsight
} from "@shared/schema";

// Create session stores
const MemoryStore = createMemoryStore(session);

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Define a SessionStore type for both memory and PostgreSQL session stores
type SessionStore = any;

// Types for data operations
type InsertUser = typeof insertUserSchema._type;
type InsertPerformanceIndicator = typeof insertPerformanceIndicatorSchema._type;
type InsertSession = typeof insertSessionSchema._type;
type InsertDailyChallenge = typeof insertDailyChallengeSchema._type;
type InsertBreakSession = typeof insertBreakSessionSchema._type;
type InsertMiniGameScore = typeof insertMiniGameScoreSchema._type;
type InsertCosmeticItem = typeof insertCosmeticItemSchema._type;
type InsertTestHistory = typeof insertTestHistorySchema._type;
type InsertQuestionResult = typeof insertQuestionResultSchema._type;
type InsertLearningInsight = typeof insertLearningInsightSchema._type;
type InsertRoleplayHistory = typeof insertRoleplayHistorySchema._type;

// Interface for storage methods
export interface IStorage {
  // Session store for authentication
  sessionStore: SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAuthId(authId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateLastLogin(id: number, date: Date): Promise<User | undefined>;
  updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    theme?: string,
    selectedEvent?: string,
    selectedCluster?: string,
    onboardingCompleted?: boolean,
    showTutorial?: boolean
  }): Promise<User | undefined>;
  updateSubscription(id: number, tier: string): Promise<User | undefined>;
  
  // Performance Indicators methods
  getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]>;
  updatePIStatus(userId: number, piId: number, status: string): Promise<boolean>;
  
  // Practice session methods
  createSession(session: InsertSession): Promise<PracticeSession>;
  getUserSessions(userId: number, type?: string): Promise<PracticeSession[]>;
  getSessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<PracticeSession[]>;
  recordPracticeSession(session: InsertSession): Promise<PracticeSession>;
  recordRoleplayGeneration(userId: number): Promise<void>;
  
  // User analytics and progress tracking
  getUserProgress(userId: number): Promise<{
    totalStudyTime: number;
    testsCompleted: number;
    roleplaysCompleted: number;
    averageTestScore: number;
    averageRoleplayScore: number;
    currentStreak: number;
    level: number;
    experience: number;
    decits: number;
    strongestAreas: string[];
    improvementAreas: string[];
    monthlyProgress: { month: string; sessions: number; avgScore: number }[];
    recentAchievements: Achievement[];
  }>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getNewUserAchievements(userId: number): Promise<UserAchievement[]>;
  awardAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  updateAchievementDisplay(userId: number, achievementId: number, displayed: boolean): Promise<boolean>;
  checkForNewAchievements(userId: number): Promise<Achievement[]>;
  markAchievementAsDisplayed(userId: number, achievementId: number): Promise<boolean>;
  
  // Daily challenges
  getDailyChallenges(): Promise<DailyChallenge[]>;
  getTodayChallenge(): Promise<DailyChallenge | undefined>;
  getUserDailyChallenges(userId: number): Promise<UserDailyChallenge[]>;
  completeChallenge(userId: number, challengeId: number, progress: number): Promise<UserDailyChallenge>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  
  // Break sessions and mini-games
  createBreakSession(session: InsertBreakSession): Promise<BreakSession>;
  getUserBreakSessions(userId: number): Promise<BreakSession[]>;
  createMiniGameScore(score: InsertMiniGameScore): Promise<MiniGameScore>;
  getUserMiniGameScores(userId: number, gameType?: string): Promise<MiniGameScore[]>;
  
  // Points and currency
  addDecits(userId: number, amount: number): Promise<User | undefined>;
  spendDecits(userId: number, amount: number): Promise<User | undefined>;
  addExperience(userId: number, amount: number): Promise<User | undefined>;
  updateStreak(userId: number, streak: number): Promise<User | undefined>;
  

  
  // Test Results and Learning Analytics
  saveTestHistory(result: InsertTestHistory): Promise<TestHistory>;
  getUserTestHistory(userId: number, testType?: string): Promise<TestHistory[]>;
  saveQuestionResult(result: InsertQuestionResult): Promise<QuestionResult>;
  getUserQuestionResults(userId: number, testHistoryId?: number): Promise<QuestionResult[]>;
  generateLearningInsights(userId: number): Promise<LearningInsight[]>;
  getUserLearningInsights(userId: number): Promise<LearningInsight[]>;
  getPersonalizedTopics(userId: number): Promise<{ weak: string[], strong: string[] }>;
  generatePersonalizedTest(userId: number, topic: string, questionCount: number): Promise<any>;
  
  // Roleplay history methods
  createRoleplaySession(session: InsertRoleplayHistory): Promise<RoleplayHistory>;
  getRoleplayHistory(userId: number): Promise<RoleplayHistory[]>;
  
  // Enhanced personalized learning methods
  getTopicMastery(userId: number): Promise<TopicMastery[]>;
  updateTopicMastery(userId: number, topic: string, cluster: string, performance: {
    questionsAnswered: number;
    questionsCorrect: number;
    timeSpent: number;
  }): Promise<TopicMastery>;
  saveQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  getQuizSessions(userId: number): Promise<QuizSession[]>;
  generateEnhancedInsights(userId: number): Promise<EnhancedLearningInsight[]>;
  getAdaptiveDifficulty(userId: number, topic: string): Promise<string>;
  calculateSpacedRepetition(userId: number, topic: string): Promise<Date>;
  getPersonalizedRecommendations(userId: number): Promise<any[]>;

  // DECA Bloc Game Session methods
  createGameSessionDECABloc(session: InsertGameSessionDECABloc): Promise<GameSessionDECABloc>;
  getUserGameSessionsDECABloc(userId: number): Promise<GameSessionDECABloc[]>;
  updateUserStats(userId: number, updates: { points?: number; experience?: number }): Promise<void>;

  // Leaderboard removed (personalization-first)
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool as any,
      tableName: 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.authId, authId));
      return user;
    } catch (error) {
      console.error('Error getting user by auth ID:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }



  async updateLastLogin(id: number, date: Date): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ lastLogin: date })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating last login:', error);
      return undefined;
    }
  }

  async updateUserSettings(id: number, settings: { 
    eventFormat?: string, 
    eventCode?: string,
    eventType?: string,
    instructionalArea?: string,
    theme?: string,
    selectedEvent?: string,
    selectedCluster?: string,
    onboardingCompleted?: boolean,
    showTutorial?: boolean
  }): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set(settings)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return undefined;
    }
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
      console.error('Error updating subscription:', error);
      return undefined;
    }
  }

  async recordTestCompletion(userId: number, testData: any): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      // Update user's test completion count and points
      const newTestCount = (user.testsCompleted || 0) + 1;
      const pointsEarned = Math.floor((testData.score || 0) * 0.5);
      const newPoints = (user.points || 0) + pointsEarned;
      const newDecits = (user.decits || 0) + Math.floor(pointsEarned * 0.1); // 10% of points as DECITS

      await db
        .update(users)
        .set({ 
          testsCompleted: newTestCount,
          points: newPoints,
          decits: newDecits
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error recording test completion:', error);
      return false;
    }
  }

  async recordRoleplayCompletion(userId: number, roleplayData: any): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      // Update user's roleplay completion count and points
      const newRoleplayCount = (user.roleplaysCompleted || 0) + 1;
      const pointsEarned = Math.floor((roleplayData.score || 70) * 0.4); // Default score of 70 if none provided
      const newPoints = (user.points || 0) + pointsEarned;
      const newDecits = (user.decits || 0) + Math.floor(pointsEarned * 0.15); // 15% of points as DECITS

      await db
        .update(users)
        .set({ 
          roleplaysCompleted: newRoleplayCount,
          points: newPoints,
          decits: newDecits
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error recording roleplay completion:', error);
      return false;
    }
  }

  async recordRoleplayGeneration(userId: number): Promise<void> {
    try {
      // This could record the generation event for analytics
      // For now, just log it
      console.log(`Roleplay generation recorded for user ${userId}`);
    } catch (error) {
      console.error('Error recording roleplay generation:', error);
    }
  }

  async recordTestGeneration(userId: number): Promise<boolean> {
    try {
      // This could record the test generation event for analytics
      // For now, just return true
      return true;
    } catch (error) {
      console.error('Error recording test generation:', error);
      return false;
    }
  }

  async updateUserSession(userId: number, sessionData: any): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          lastLogin: new Date(),
          ...sessionData
        })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user session:', error);
      return undefined;
    }
  }

  async getUserPIs(userId: number, category?: string): Promise<PerformanceIndicator[]> {
    try {
      if (category) {
        return await db
          .select()
          .from(performanceIndicators)
          .where(and(eq(performanceIndicators.userId, userId), eq(performanceIndicators.category, category)));
      }
      
      return await db
        .select()
        .from(performanceIndicators)
        .where(eq(performanceIndicators.userId, userId));
    } catch (error) {
      console.error('Error getting user PIs:', error);
      return [];
    }
  }

  async updatePIStatus(userId: number, piId: number, status: string): Promise<boolean> {
    try {
      await db
        .update(performanceIndicators)
        .set({ status, lastPracticed: new Date() })
        .where(and(eq(performanceIndicators.id, piId), eq(performanceIndicators.userId, userId)));
      return true;
    } catch (error) {
      console.error('Error updating PI status:', error);
      return false;
    }
  }

  async createSession(insertSession: InsertSession): Promise<PracticeSession> {
    const [session] = await db
      .insert(practiceSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getUserSessions(userId: number, type?: string): Promise<PracticeSession[]> {
    try {
      if (type) {
        return await db
          .select()
          .from(practiceSessions)
          .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.type, type)))
          .orderBy(desc(practiceSessions.completedAt));
      }
      
      return await db
        .select()
        .from(practiceSessions)
        .where(eq(practiceSessions.userId, userId))
        .orderBy(desc(practiceSessions.completedAt));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async getSessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<PracticeSession[]> {
    try {
      return await db
        .select()
        .from(practiceSessions)
        .where(
          and(
            eq(practiceSessions.userId, userId),
            sql`${practiceSessions.completedAt} >= ${startDate}`,
            sql`${practiceSessions.completedAt} <= ${endDate}`
          )
        )
        .orderBy(desc(practiceSessions.completedAt));
    } catch (error) {
      console.error('Error getting sessions by date range:', error);
      return [];
    }
  }

  async recordPracticeSession(insertSession: InsertSession): Promise<PracticeSession> {
    const [session] = await db
      .insert(practiceSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getUserProgress(userId: number): Promise<{
    totalStudyTime: number;
    testsCompleted: number;
    roleplaysCompleted: number;
    averageTestScore: number;
    averageRoleplayScore: number;
    currentStreak: number;
    level: number;
    experience: number;
    decits: number;
    strongestAreas: string[];
    improvementAreas: string[];
    monthlyProgress: { month: string; sessions: number; avgScore: number }[];
    recentAchievements: Achievement[];
  }> {
    try {
      // Get user data
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      // Get sessions data for analysis
      const sessions = await this.getUserSessions(userId);
      const pis = await this.getUserPIs(userId);

      // Calculate monthly progress
      const monthlyProgress = this.calculateMonthlyProgress(sessions);

      // Determine strongest and improvement areas
      const { strongestAreas, improvementAreas } = this.analyzePerformanceAreas(pis, sessions);

      // Get recent achievements
      const userAchievements = await this.getUserAchievements(userId);
      const allAchievements = await this.getAchievements();
      const recentAchievements = userAchievements
        .sort((a, b) => (b.earnedAt?.getTime() ?? 0) - (a.earnedAt?.getTime() ?? 0))
        .slice(0, 5)
        .map(ua => allAchievements.find(a => a.id === ua.achievementId))
        .filter(Boolean) as Achievement[];

      return {
        totalStudyTime: user.totalStudyTime || 0,
        testsCompleted: user.testsCompleted || 0,
        roleplaysCompleted: user.roleplaysCompleted || 0,
        averageTestScore: user.averageTestScore || 0,
        averageRoleplayScore: user.averageRoleplayScore || 0,
        currentStreak: user.streak || 0,
        level: user.level || 1,
        experience: user.experience || 0,
        decits: user.decits || 0,
        strongestAreas,
        improvementAreas,
        monthlyProgress,
        recentAchievements
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  private calculateMonthlyProgress(sessions: PracticeSession[]): { month: string; sessions: number; avgScore: number }[] {
    const monthlyData: { [key: string]: { sessions: number; totalScore: number; count: number } } = {};
    
    sessions.forEach(session => {
      const month = session.completedAt.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = { sessions: 0, totalScore: 0, count: 0 };
      }
      monthlyData[month].sessions++;
      if (session.score !== null) {
        monthlyData[month].totalScore += session.score;
        monthlyData[month].count++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        sessions: data.sessions,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  }

  private analyzePerformanceAreas(pis: PerformanceIndicator[], sessions: PracticeSession[]): { 
    strongestAreas: string[]; 
    improvementAreas: string[] 
  } {
    // Analyze PI status distribution
    const categoryStats: { [key: string]: { mastered: number; total: number } } = {};
    
    pis.forEach(pi => {
      if (!categoryStats[pi.category]) {
        categoryStats[pi.category] = { mastered: 0, total: 0 };
      }
      categoryStats[pi.category].total++;
      if (pi.status === 'mastered') {
        categoryStats[pi.category].mastered++;
      }
    });

    const areas = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        masteryRate: stats.total > 0 ? stats.mastered / stats.total : 0
      }))
      .sort((a, b) => b.masteryRate - a.masteryRate);

    const strongestAreas = areas.slice(0, 3).map(a => a.category);
    const improvementAreas = areas.slice(-3).map(a => a.category);

    return { strongestAreas, improvementAreas };
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      return await db.select().from(achievements).orderBy(asc(achievements.tier), asc(achievements.points));
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      return await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.earnedAt));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async awardAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        earnedAt: new Date(),
        progress: 100,
        isDisplayed: true,
        seasonEarned: this.getCurrentSeason()
      })
      .returning();
    return userAchievement;
  }

  async updateAchievementDisplay(userId: number, achievementId: number, displayed: boolean): Promise<boolean> {
    try {
      await db
        .update(userAchievements)
        .set({ isDisplayed: displayed })
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
      return true;
    } catch (error) {
      console.error('Error updating achievement display:', error);
      return false;
    }
  }

  private getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 8 && month <= 11) return `Fall ${year}`;
    if (month >= 0 && month <= 2) return `Winter ${year}`;
    if (month >= 3 && month <= 5) return `Spring ${year}`;
    return `Summer ${year}`;
  }

  async getDailyChallenges(): Promise<DailyChallenge[]> {
    try {
      return await db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.isActive, true))
        .orderBy(desc(dailyChallenges.date));
    } catch (error) {
      console.error('Error getting daily challenges:', error);
      return [];
    }
  }

  async getTodayChallenge(): Promise<DailyChallenge | undefined> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [challenge] = await db
        .select()
        .from(dailyChallenges)
        .where(
          and(
            eq(dailyChallenges.isActive, true),
            sql`date(${dailyChallenges.date}) = date(${today})`
          )
        );
      return challenge;
    } catch (error) {
      console.error('Error getting today\'s challenge:', error);
      return undefined;
    }
  }

  async getUserDailyChallenges(userId: number): Promise<UserDailyChallenge[]> {
    try {
      return await db
        .select()
        .from(userDailyChallenges)
        .where(eq(userDailyChallenges.userId, userId))
        .orderBy(desc(userDailyChallenges.attemptDate));
    } catch (error) {
      console.error('Error getting user daily challenges:', error);
      return [];
    }
  }

  async createDailyChallenge(insertChallenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [challenge] = await db
      .insert(dailyChallenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  async createBreakSession(insertSession: InsertBreakSession): Promise<BreakSession> {
    const [session] = await db
      .insert(breakSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getUserBreakSessions(userId: number): Promise<BreakSession[]> {
    try {
      return await db
        .select()
        .from(breakSessions)
        .where(eq(breakSessions.userId, userId))
        .orderBy(desc(breakSessions.startTime));
    } catch (error) {
      console.error('Error getting user break sessions:', error);
      return [];
    }
  }

  async createMiniGameScore(insertScore: InsertMiniGameScore): Promise<MiniGameScore> {
    const [score] = await db
      .insert(miniGameScores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getUserMiniGameScores(userId: number, gameType?: string): Promise<MiniGameScore[]> {
    try {
      if (gameType) {
        return await db
          .select()
          .from(miniGameScores)
          .where(and(eq(miniGameScores.userId, userId), eq(miniGameScores.gameType, gameType)))
          .orderBy(desc(miniGameScores.playedAt));
      }
      
      return await db
        .select()
        .from(miniGameScores)
        .where(eq(miniGameScores.userId, userId))
        .orderBy(desc(miniGameScores.playedAt));
    } catch (error) {
      console.error('Error getting user mini game scores:', error);
      return [];
    }
  }

  async addDecits(userId: number, amount: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ decits: sql`${users.decits} + ${amount}` })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error adding decits:', error);
      return undefined;
    }
  }

  async spendDecits(userId: number, amount: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ decits: sql`${users.decits} - ${amount}` })
        .where(and(eq(users.id, userId), sql`${users.decits} >= ${amount}`))
        .returning();
      return user;
    } catch (error) {
      console.error('Error spending decits:', error);
      return undefined;
    }
  }

  async addExperience(userId: number, amount: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          experience: sql`${users.experience} + ${amount}`,
          level: sql`CASE WHEN (${users.experience} + ${amount}) >= (${users.level} * 1000) THEN ${users.level} + 1 ELSE ${users.level} END`
        })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error adding experience:', error);
      return undefined;
    }
  }

  async updateStreak(userId: number, streak: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          streak,
          streakStartDate: streak === 1 ? new Date() : undefined
        })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating streak:', error);
      return undefined;
    }
  }



  // Removed leaderboard to prioritize personalization features

  async getNewUserAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      const newOnes = await db
        .select()
        .from(userAchievements)
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.isDisplayed, false)))
        .orderBy(desc(userAchievements.earnedAt));
      return newOnes;
    } catch (error) {
      console.error('Error getting new user achievements:', error);
      return [];
    }
  }

  async checkForNewAchievements(userId: number): Promise<Achievement[]> {
    try {
      // Get user's current stats
      const userProgress = await this.getUserProgress(userId);
      const userSessions = await this.getUserSessions(userId);
      const testHistory = await this.getUserTestHistory(userId);
      const roleplayHistory = await this.getRoleplayHistory(userId);
      const userAchievements = await this.getUserAchievements(userId);
      
      // Get all available achievements
      const allAchievements = await this.getAchievements();
      
      // Filter out achievements user already has
      const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);
      const availableAchievements = allAchievements.filter(a => !earnedAchievementIds.includes(a.id));
      
      const newAchievements: Achievement[] = [];
      
      for (const achievement of availableAchievements) {
        let shouldAward = false;
        
        switch (achievement.type) {
          case 'study_time':
            // Check total study time
            const totalStudyHours = userProgress.totalStudyTime / 3600; // Convert seconds to hours
            shouldAward = totalStudyHours >= achievement.threshold;
            break;
            
          case 'perfect_score':
            // Check for perfect scores (100%)
            const perfectScores = testHistory.filter(t => t.score === 100).length;
            shouldAward = perfectScores >= achievement.threshold;
            break;
            
          case 'improvement':
            // Check for score improvements over time
            if (testHistory.length >= 2) {
              const recentScores = testHistory.slice(-5).map(t => t.score);
              const olderScores = testHistory.slice(-10, -5).map(t => t.score);
              if (olderScores.length > 0) {
                const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
                const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
                const improvement = recentAvg - olderAvg;
                shouldAward = improvement >= achievement.threshold;
              }
            }
            break;
            
          case 'consistency':
            // Check for consistent study streaks
            shouldAward = userProgress.currentStreak >= achievement.threshold;
            break;
            
          case 'exploration':
            // Check for trying different types of activities
            const uniqueActivities = new Set([
              ...userSessions.map(s => s.type),
              ...testHistory.map(t => t.cluster), // Use cluster instead of testType
              ...roleplayHistory.map(r => r.cluster) // Use cluster instead of category
            ]).size;
            shouldAward = uniqueActivities >= achievement.threshold;
            break;
            
          case 'mastery':
            // Check for mastering specific categories
            if (achievement.category) {
              const categoryTests = testHistory.filter(t => t.cluster === achievement.category);
              const avgCategoryScore = categoryTests.length > 0 
                ? categoryTests.reduce((sum, t) => sum + t.score, 0) / categoryTests.length
                : 0;
              shouldAward = avgCategoryScore >= achievement.threshold;
            }
            break;
            
          case 'streak':
            // Check for specific streak lengths
            shouldAward = userProgress.currentStreak >= achievement.threshold;
            break;
            
          case 'level':
            // Check for reaching specific levels
            shouldAward = userProgress.level >= achievement.threshold;
            break;
            
          case 'points':
            // Check for earning specific point amounts
            shouldAward = userProgress.decits >= achievement.threshold;
            break;
        }
        
        if (shouldAward) {
          // Award the achievement
          await this.awardAchievement(userId, achievement.id);
          newAchievements.push(achievement);
        }
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Error checking for new achievements:', error);
      return [];
    }
  }

  // Test History and Learning Analytics Implementation

  async saveQuestionResults(testHistoryId: number, userId: number, questions: any[], userAnswers: Record<number, string>): Promise<QuestionResult[]> {
    try {
      const results = [];
      
      for (const question of questions) {
        const userAnswerLetter = userAnswers[question.id] || '';
        const isCorrect = userAnswerLetter === question.answer;
        
        // Get full text for user's answer and correct answer
        const userAnswerText = question.options && question.options[userAnswerLetter] ? 
          `${userAnswerLetter}) ${question.options[userAnswerLetter]}` : userAnswerLetter;
        const correctAnswerText = question.options && question.options[question.answer] ? 
          `${question.answer}) ${question.options[question.answer]}` : question.answer;
        
        // Use instructional_area from question metadata, fallback to category, then General
        const topic = question.instructional_area || question.category || question.topic || 'General';
        
        const questionResult = {
          testHistoryId,
          userId,
          questionText: question.stem,
          correctAnswer: correctAnswerText,
          userAnswer: userAnswerText,
          isCorrect,
          topic: topic,
          explanation: question.explanation || '',
          answeredAt: new Date()
        };
        
        results.push(questionResult);
      }

      const savedResults = await db
        .insert(questionResults)
        .values(results)
        .returning();
        
      return savedResults;
    } catch (error) {
      console.error('Error saving question results:', error);
      throw error;
    }
  }



  async getTestQuestionResults(testHistoryId: number): Promise<QuestionResult[]> {
    try {
      return await db
        .select()
        .from(questionResults)
        .where(eq(questionResults.testHistoryId, testHistoryId))
        .orderBy(questionResults.id);
    } catch (error) {
      console.error('Error getting test question results:', error);
      return [];
    }
  }

  async getUserWeakTopics(userId: number): Promise<{ topic: string, wrongCount: number, totalCount: number }[]> {
    try {
      const results = await db
        .select({
          topic: questionResults.topic,
          wrongCount: sql<number>`COUNT(CASE WHEN ${questionResults.isCorrect} = false THEN 1 END)`,
          totalCount: sql<number>`COUNT(*)`
        })
        .from(questionResults)
        .where(eq(questionResults.userId, userId))
        .groupBy(questionResults.topic)
        .having(sql`COUNT(CASE WHEN ${questionResults.isCorrect} = false THEN 1 END) > 0`)
        .orderBy(sql`COUNT(CASE WHEN ${questionResults.isCorrect} = false THEN 1 END) DESC`);

      // Filter out "General" topic and only include topics with specific names
      return results.filter(result => 
        result.topic && 
        result.topic !== null &&
        result.wrongCount > 0 && 
        result.topic !== 'General' &&
        result.topic.trim().length > 0
      ).map(result => ({
        topic: result.topic!,
        wrongCount: result.wrongCount,
        totalCount: result.totalCount
      }));
    } catch (error) {
      console.error('Error getting user weak topics:', error);
      return [];
    }
  }

  async generateLearningInsights(userId: number): Promise<LearningInsight[]> {
    try {
      const recentTests = await this.getUserTestHistory(userId);
      
      if (recentTests.length === 0) {
        return [];
      }

      const insights: InsertLearningInsight[] = [];
      const topicPerformance = this.analyzeTopicPerformance(recentTests);
      
      // Generate insights for weak areas (below 70%)
      for (const [topic, performance] of Object.entries(topicPerformance)) {
        if (performance.averageScore < 0.7) {
          insights.push({
            userId,
            insightType: 'weak_topic',
            topic,
            currentScore: performance.averageScore,
            targetScore: 0.85, // Target 85% mastery
            priority: this.calculatePriority(performance.averageScore, performance.testCount),
            recommendedActions: JSON.stringify([
              `Take focused practice tests on ${topic}`,
              `Review ${topic} fundamentals`,
              `Complete short learning quizzes on ${topic}`
            ])
          });
        }
      }

      // Clear old insights and insert new ones
      await db
        .update(learningInsights)
        .set({ isActive: false })
        .where(eq(learningInsights.userId, userId));

      if (insights.length > 0) {
        const createdInsights = await db
          .insert(learningInsights)
          .values(insights)
          .returning();
        return createdInsights;
      }

      return [];
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return [];
    }
  }

  // Save test history
  async saveTestHistory(result: InsertTestHistory): Promise<TestHistory> {
    try {
      const [testResult] = await db
        .insert(testHistory)
        .values(result)
        .returning();
      return testResult;
    } catch (error) {
      console.error('Error saving test history:', error);
      throw error;
    }
  }

  // Get user test history
  async getUserTestHistory(userId: number, testType?: string): Promise<TestHistory[]> {
    try {
      let query = db
        .select()
        .from(testHistory)
        .where(eq(testHistory.userId, userId))
        .orderBy(desc(testHistory.completedAt));



      return await query;
    } catch (error) {
      console.error('Error getting user test history:', error);
      return [];
    }
  }

  // Save question result
  async saveQuestionResult(result: InsertQuestionResult): Promise<QuestionResult> {
    try {
      const [questionResult] = await db
        .insert(questionResults)
        .values(result)
        .returning();
      return questionResult;
    } catch (error) {
      console.error('Error saving question result:', error);
      throw error;
    }
  }

  // Get user question results
  async getUserQuestionResults(userId: number, testHistoryId?: number): Promise<QuestionResult[]> {
    try {
      let query = db
        .select()
        .from(questionResults)
        .where(eq(questionResults.userId, userId))
        .orderBy(desc(questionResults.answeredAt));



      return await query;
    } catch (error) {
      console.error('Error getting user question results:', error);
      return [];
    }
  }

  async getUserLearningInsights(userId: number): Promise<LearningInsight[]> {
    try {
      return await db
        .select()
        .from(learningInsights)
        .where(and(eq(learningInsights.userId, userId), eq(learningInsights.isActive, true)))
        .orderBy(desc(learningInsights.priority));
    } catch (error) {
      console.error('Error getting user learning insights:', error);
      return [];
    }
  }

  async getPersonalizedTopics(userId: number): Promise<{ weak: string[], strong: string[] }> {
    try {
      const recentTests = await this.getUserTestHistory(userId);
      const topicPerformance = this.analyzeTopicPerformance(recentTests);
      
      const weak: string[] = [];
      const strong: string[] = [];
      
      for (const [topic, performance] of Object.entries(topicPerformance)) {
        if (performance.averageScore < 0.7) {
          weak.push(topic);
        } else if (performance.averageScore >= 0.85) {
          strong.push(topic);
        }
      }
      
      return { weak, strong };
    } catch (error) {
      console.error('Error getting personalized topics:', error);
      return { weak: [], strong: [] };
    }
  }

  async generatePersonalizedTest(userId: number, topic: string, questionCount: number): Promise<any> {
    try {
      return {
        userId,
        topic,
        questionCount,
        testType: 'learning_quiz'
      };
    } catch (error) {
      console.error('Error generating personalized test:', error);
      throw error;
    }
  }

  private analyzeTopicPerformance(testResults: any[]): Record<string, { averageScore: number, testCount: number }> {
    const topicData: Record<string, { totalScore: number, testCount: number }> = {};
    
    testResults.forEach(result => {
      if (result.topicPerformance) {
        try {
          const performance = JSON.parse(result.topicPerformance);
          for (const [topic, score] of Object.entries(performance)) {
            if (typeof score === 'number') {
              if (!topicData[topic]) {
                topicData[topic] = { totalScore: 0, testCount: 0 };
              }
              topicData[topic].totalScore += score;
              topicData[topic].testCount += 1;
            }
          }
        } catch (error) {
          console.error('Error parsing topic performance:', error);
        }
      }
    });

    const averages: Record<string, { averageScore: number, testCount: number }> = {};
    for (const [topic, data] of Object.entries(topicData)) {
      averages[topic] = {
        averageScore: data.totalScore / data.testCount,
        testCount: data.testCount
      };
    }

    return averages;
  }

  private calculatePriority(score: number, testCount: number): number {
    const scorePriority = (1 - score) * 3; 
    const frequencyPriority = Math.min(testCount * 0.5, 2); 
    return Math.min(Math.round(scorePriority + frequencyPriority), 5);
  }

  async markAchievementAsDisplayed(userId: number, achievementId: number): Promise<boolean> {
    try {
      await db
        .update(userAchievements)
        .set({ isDisplayed: true })
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        ));
      return true;
    } catch (error) {
      console.error('Error marking achievement as displayed:', error);
      return false;
    }
  }

  async checkTestAllowance(userId: number): Promise<{ allowed: boolean, remaining: number, message?: string }> {
    try {
      const user = await this.getUser(userId);
      if (!user) return { allowed: false, remaining: 0, message: 'User not found' };

      // For now, always allow tests (can implement subscription limits later)
      return { allowed: true, remaining: 999 };
    } catch (error) {
      console.error('Error checking test allowance:', error);
      return { allowed: false, remaining: 0, message: 'Error checking allowance' };
    }
  }

  async checkRoleplayAllowance(userId: number): Promise<{ allowed: boolean, remaining: number, message?: string }> {
    try {
      const user = await this.getUser(userId);
      if (!user) return { allowed: false, remaining: 0, message: 'User not found' };

      // For now, always allow roleplays (can implement subscription limits later)
      return { allowed: true, remaining: 999 };
    } catch (error) {
      console.error('Error checking roleplay allowance:', error);
      return { allowed: false, remaining: 0, message: 'Error checking allowance' };
    }
  }

  async getUserStats(userId: number) {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      return {
        roleplayCount: user.roleplaysCompleted || 0,
        testCount: user.testsCompleted || 0,
        completedPIs: 0,
        totalPIs: 100,
        writtenCount: 0,
        piCount: 0,
        streak: user.streak || 0,
        totalPoints: user.points || 0,
        weeklyProgress: [],
        monthlyProgress: [],
        recentAchievements: []
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async getUserActivities(userId: number) {
    try {
      // Return sample activities based on user data
      const user = await this.getUser(userId);
      if (!user) return [];

      // Generate sample activities based on completed counts
      const activities = [];
      
      for (let i = 0; i < (user.testsCompleted || 0); i++) {
        activities.push({
          id: `test-${i + 1}`,
          type: 'test',
          title: 'Practice Test',
          description: `Scored ${80 + Math.floor(Math.random() * 20)}% on practice test`,
          score: 80 + Math.floor(Math.random() * 20),
          points: Math.floor((80 + Math.random() * 20) * 0.5),
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        });
      }

      for (let i = 0; i < (user.roleplaysCompleted || 0); i++) {
        activities.push({
          id: `roleplay-${i + 1}`,
          type: 'roleplay',
          title: 'Roleplay Scenario',
          description: 'Completed business roleplay scenario',
          score: 75 + Math.floor(Math.random() * 25),
          points: Math.floor((75 + Math.random() * 25) * 0.4),
          date: new Date(Date.now() - i * 18 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - i * 18 * 60 * 60 * 1000)
        });
      }

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }

  async getLearningItems(userId: number) {
    try {
      // Return sample learning items for now
      // In a real implementation, this would track user progress on PIs, etc.
      return [
        {
          id: 'pi-marketing-1',
          type: 'pi',
          title: 'Marketing Research',
          description: 'Master marketing research techniques',
          progress: 75,
          category: 'Marketing'
        },
        {
          id: 'roleplay-sales-1',
          type: 'roleplay',
          title: 'Sales Negotiation',
          description: 'Practice sales negotiation skills',
          progress: 60,
          category: 'Sales'
        },
        {
          id: 'test-finance-1',
          type: 'test',
          title: 'Financial Analysis',
          description: 'Complete financial analysis assessments',
          progress: 90,
          category: 'Finance'
        }
      ];
    } catch (error) {
      console.error('Error getting learning items:', error);
      throw error;
    }
  }

  async getDailyChallenge(userId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get today's challenge
      const todayChallenge = await this.getTodayChallenge();
      
      if (!todayChallenge) {
        // Generate a new daily challenge if none exists for today
        const challengeTypes = [
          { type: 'test_score', title: 'Score Master', description: 'Achieve a score of 85% or higher on any test', target: 85, category: 'testing' },
          { type: 'roleplay_count', title: 'Roleplay Practice', description: 'Complete 2 roleplay sessions', target: 2, category: 'roleplay' },
          { type: 'study_time', title: 'Study Session', description: 'Study for at least 30 minutes today', target: 1800, category: 'study' },
          { type: 'perfect_streak', title: 'Perfect Streak', description: 'Get 3 perfect scores in a row', target: 3, category: 'performance' },
          { type: 'category_mastery', title: 'Category Master', description: 'Complete 5 tests in the same category', target: 5, category: 'mastery' }
        ];
        
        const randomChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
        
        const newChallenge = await this.createDailyChallenge({
          date: today,
          title: randomChallenge.title,
          description: randomChallenge.description,
          type: randomChallenge.type,
          target: randomChallenge.target,
          points: 50,
          decitsReward: 25,
          difficulty: 'medium',
          category: randomChallenge.category,
          isActive: true
        });
        
        return newChallenge;
      }
      
      // Get user's progress on today's challenge
      const userProgress = await this.getUserDailyChallenges(userId);
      const todayProgress = userProgress.find(p => p.challengeId === todayChallenge.id);
      
      return {
        ...todayChallenge,
        userProgress: todayProgress || { progress: 0, isCompleted: false },
        progress: todayProgress?.progress || 0,
        isCompleted: todayProgress?.isCompleted || false
      };
    } catch (error) {
      console.error('Error getting daily challenge:', error);
      return null;
    }
  }

  async completeChallenge(userId: number, challengeId: number, progress: number): Promise<UserDailyChallenge> {
    try {
      // Get the challenge details
      const [challenge] = await db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.id, challengeId));
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      // Check if user already has progress for this challenge
      const existingProgress = await db
        .select()
        .from(userDailyChallenges)
        .where(and(
          eq(userDailyChallenges.userId, userId),
          eq(userDailyChallenges.challengeId, challengeId)
        ));
      
      const isCompleted = progress >= challenge.target;
      
      if (existingProgress.length > 0) {
        // Update existing progress
        const [updatedProgress] = await db
          .update(userDailyChallenges)
          .set({
            progress: Math.max((existingProgress[0].progress ?? 0), progress),
            isCompleted: isCompleted || existingProgress[0].isCompleted,
            completedAt: isCompleted && !existingProgress[0].isCompleted ? new Date() : existingProgress[0].completedAt
          })
          .where(eq(userDailyChallenges.id, existingProgress[0].id))
          .returning();
        
        // Award points and DECITS if newly completed
        if (isCompleted && !existingProgress[0].isCompleted) {
          await this.addExperience(userId, challenge.points);
          await this.addDecits(userId, challenge.decitsReward);
          
          // Check for new achievements
          await this.checkForNewAchievements(userId);
        }
        
        return updatedProgress;
      } else {
        // Create new progress record
        const [newProgress] = await db
          .insert(userDailyChallenges)
          .values({
            userId,
            challengeId,
            progress,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
            attemptDate: new Date()
          })
          .returning();
        
        // Award points and DECITS if completed
        if (isCompleted) {
          await this.addExperience(userId, challenge.points);
          await this.addDecits(userId, challenge.decitsReward);
          
          // Check for new achievements
          await this.checkForNewAchievements(userId);
        }
        
        return newProgress;
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    }
  }

  // Roleplay History Implementation
  async createRoleplaySession(session: InsertRoleplayHistory): Promise<RoleplayHistory> {
    try {
      const [savedRoleplay] = await db
        .insert(roleplayHistory)
        .values({
          userId: session.userId,
          scenario: session.scenario,
          cluster: session.cluster,
          role: session.role,
          score: session.score,
          aiGradingFeedback: session.aiGradingFeedback,
          transcriptUrl: session.transcriptUrl,
          duration: session.duration,
          completedAt: session.completedAt || new Date()
        })
        .returning();
      return savedRoleplay;
    } catch (error) {
      console.error('Error creating roleplay session:', error);
      throw error;
    }
  }

  async getRoleplayHistory(userId: number): Promise<RoleplayHistory[]> {
    try {
      return await db
        .select()
        .from(roleplayHistory)
        .where(eq(roleplayHistory.userId, userId))
        .orderBy(desc(roleplayHistory.completedAt));
    } catch (error) {
      console.error('Error getting roleplay history:', error);
      return [];
    }
  }

  // Comprehensive Analytics Functions
  async getUserComprehensiveStats(userId: number, timeRange: string): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate date range based on timeRange parameter
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7); // Default to week
      }
      
      // Get all relevant data
      const sessions = await this.getSessionsByDateRange(userId, startDate, endDate);
      const testHistory = await this.getUserTestHistory(userId);
      const roleplayHistory = await this.getRoleplayHistory(userId);
      const userProgress = await this.getUserProgress(userId);
      
      // Calculate comprehensive statistics
      // PracticeSession does not have explicit duration; estimate 30 minutes per session
      const totalStudyTime = sessions.length * 1800;
      const averageSessionLength = sessions.length > 0 ? totalStudyTime / sessions.length : 0;
      const totalTests = testHistory.length;
      const totalRoleplays = roleplayHistory.length;
      const averageTestScore = testHistory.length > 0 
        ? testHistory.reduce((sum, t) => sum + t.score, 0) / testHistory.length 
        : 0;
      const averageRoleplayScore = roleplayHistory.length > 0
        ? roleplayHistory.reduce((sum, r) => sum + (r.score || 0), 0) / roleplayHistory.length
        : 0;
      
      // Calculate improvement trends
      const recentTests = testHistory.slice(-10);
      const olderTests = testHistory.slice(-20, -10);
      const recentAvg = recentTests.length > 0 
        ? recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length 
        : 0;
      const olderAvg = olderTests.length > 0
        ? olderTests.reduce((sum, t) => sum + t.score, 0) / olderTests.length
        : 0;
      const improvement = recentAvg - olderAvg;
      
      // Calculate consistency score
      const dailyActivity = this.calculateDailyActivity(sessions, startDate, endDate);
      const consistencyScore = this.calculateConsistencyScore(dailyActivity);
      
      // Calculate mastery levels
      const categoryScores = this.calculateCategoryScores(testHistory);
      const masteryLevel = this.calculateMasteryLevel(categoryScores);
      
      // Calculate learning velocity
      const learningVelocity = this.calculateLearningVelocity(testHistory, timeRange);
      
      // Generate insights
      const insights = this.generateInsightsFromStats({
        totalStudyTime,
        averageSessionLength,
        totalTests,
        totalRoleplays,
        averageTestScore,
        averageRoleplayScore,
        improvement,
        consistencyScore,
        masteryLevel,
        learningVelocity,
        categoryScores
      });
      
      return {
        overview: {
          totalStudyTime,
          averageSessionLength,
          totalTests,
          totalRoleplays,
          averageTestScore,
          averageRoleplayScore,
          improvement,
          consistencyScore,
          masteryLevel,
          learningVelocity
        },
        trends: {
          dailyActivity,
          scoreTrends: this.calculateScoreTrends(testHistory, timeRange),
          categoryProgress: categoryScores,
          studyPatterns: this.analyzeStudyPatterns(sessions)
        },
        insights,
        recommendations: this.generateRecommendations({
          weakCategories: this.identifyWeakCategories(categoryScores),
          studyPatterns: this.analyzeStudyPatterns(sessions),
          userProgress
        })
      };
    } catch (error) {
      console.error('Error getting comprehensive stats:', error);
      return null;
    }
  }

  private calculateDailyActivity(sessions: PracticeSession[], startDate: Date, endDate: Date): any[] {
    const dailyActivity = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate.toDateString() === currentDate.toDateString();
      });
      
      dailyActivity.push({
        date: currentDate.toISOString().split('T')[0],
        // PracticeSession lacks duration; estimate 30 min per session
        studyTime: daySessions.length * 1800,
        sessions: daySessions.length,
        tests: daySessions.filter(s => s.type === 'test').length,
        roleplays: daySessions.filter(s => s.type === 'roleplay').length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dailyActivity;
  }

  private calculateConsistencyScore(dailyActivity: any[]): number {
    const activeDays = dailyActivity.filter(day => day.studyTime > 0).length;
    const totalDays = dailyActivity.length;
    return totalDays > 0 ? (activeDays / totalDays) * 100 : 0;
  }

  private calculateCategoryScores(testHistory: TestHistory[]): any[] {
    const categoryMap = new Map<string, { total: number, count: number }>();
    
    testHistory.forEach(test => {
      if (test.cluster) {
        const existing = categoryMap.get(test.cluster) || { total: 0, count: 0 };
        existing.total += test.score;
        existing.count += 1;
        categoryMap.set(test.cluster, existing);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      averageScore: data.count > 0 ? data.total / data.count : 0,
      testCount: data.count
    }));
  }

  // Removed duplicate; use the TestHistory-based version below

  private calculateLearningVelocity(testHistory: TestHistory[], timeRange: string): number {
    if (testHistory.length < 2) return 0;
    
    const recentTests = testHistory.slice(-5);
    const olderTests = testHistory.slice(-10, -5);
    
    if (olderTests.length === 0) return 0;
    
    const recentAvg = recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length;
    const olderAvg = olderTests.reduce((sum, t) => sum + t.score, 0) / olderTests.length;
    
    return recentAvg - olderAvg;
  }

  private generateInsightsFromStats(stats: any): any[] {
    const insights = [];
    
    if (stats.improvement > 5) {
      insights.push({
        type: 'positive',
        title: 'Improving Performance',
        message: `Your scores have improved by ${stats.improvement.toFixed(1)}% recently. Keep up the great work!`
      });
    }
    
    if (stats.consistencyScore >= 80) {
      insights.push({
        type: 'positive',
        title: 'Consistent Learner',
        message: 'You\'re maintaining excellent study consistency. This will lead to better retention!'
      });
    }
    
    if (stats.averageSessionLength < 900) { // Less than 15 minutes
      insights.push({
        type: 'suggestion',
        title: 'Consider Longer Sessions',
        message: 'Try extending your study sessions to 20-30 minutes for better learning retention.'
      });
    }
    
    if (stats.totalRoleplays < stats.totalTests * 0.3) {
      insights.push({
        type: 'suggestion',
        title: 'Balance Your Practice',
        message: 'Consider adding more roleplay practice to complement your test preparation.'
      });
    }
    
    return insights;
  }

  private identifyWeakCategories(categoryScores: any[]): string[] {
    return categoryScores
      .filter(cat => cat.averageScore < 70)
      .map(cat => cat.category);
  }

  private analyzeStudyPatterns(sessions: PracticeSession[]): any {
    // Since practice sessions don't have duration, we'll use a default estimate
    const averageLength = sessions.length > 0 ? 1800 : 0; // Default 30 minutes
    
    const preferredTimes = sessions.map(s => {
      const date = new Date(s.completedAt);
      return date.getHours();
    });
    
    const timeDistribution = preferredTimes.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const peakHour = Object.entries(timeDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
    
    return {
      averageSessionLength: averageLength,
      totalSessions: sessions.length,
      peakStudyHour: parseInt(peakHour),
      timeDistribution
    };
  }

  private generateRecommendations(data: any): any[] {
    const recommendations = [];
    
    if (data.weakCategories.length > 0) {
      recommendations.push({
        type: 'focus',
        title: 'Focus on Weak Areas',
        message: `Consider spending more time on: ${data.weakCategories.join(', ')}`,
        priority: 'high'
      });
    }
    
    if (data.studyPatterns.averageSessionLength < 900) {
      recommendations.push({
        type: 'session',
        title: 'Extend Study Sessions',
        message: 'Try studying for 20-30 minutes at a time for better retention.',
        priority: 'medium'
      });
    }
    
    if (data.userProgress.currentStreak < 3) {
      recommendations.push({
        type: 'consistency',
        title: 'Build Study Streak',
        message: 'Try to study daily to build momentum and improve retention.',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  async getUserPerformanceAnalytics(userId: number, timeRange: string): Promise<any> {
    try {
      const testHistory = await this.getUserTestHistory(userId);
      
      // Get performance trends over time
      const performanceData = testHistory.map(test => ({
        date: test.completedAt,
        score: test.score,
        cluster: test.cluster,
        timeSpent: test.timeSpent
      }));

      return {
        weeklyPerformance: this.groupByWeek(testHistory),
        learningVelocity: this.calculateLearningTrend(testHistory),
        categoryTrends: this.getCategoryTrends(testHistory)
      };
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return {};
    }
  }

  async getUserStudyPatterns(userId: number, timeRange: string): Promise<any> {
    try {
      const testHistory = await this.getUserTestHistory(userId);
      const roleplayHistory = await this.getRoleplayHistory(userId);
      
      // Analyze study habits and patterns
      const patterns = {
        averageSessionLength: this.calculateAverageSessionLength(testHistory),
        peakPerformanceWindow: this.findPeakPerformanceWindow(testHistory),
        studyFrequency: this.calculateStudyFrequency(testHistory),
        preferredDifficulty: this.getPreferredDifficulty(testHistory),
        retentionRate: this.calculateRetentionRate(userId)
      };

      return patterns;
    } catch (error) {
      console.error('Error getting study patterns:', error);
      return {};
    }
  }

  async getUserCategoryBreakdown(userId: number): Promise<any> {
    try {
      const testHistory = await this.getUserTestHistory(userId);
      
      // Group by category and calculate performance
      const categoryMap = new Map();
      
      testHistory.forEach(test => {
        if (!categoryMap.has(test.cluster)) {
          categoryMap.set(test.cluster, {
            category: test.cluster,
            scores: [],
            totalTests: 0,
            averageScore: 0
          });
        }
        
        const category = categoryMap.get(test.cluster);
        category.scores.push(test.score);
        category.totalTests++;
      });

      const breakdown = Array.from(categoryMap.values()).map(category => ({
        ...category,
        averageScore: category.scores.reduce((sum: number, score: number) => sum + score, 0) / category.scores.length
      }));

      return breakdown;
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      return [];
    }
  }



  // Removed older getPersonalizedRecommendations signature in favor of unified array-based version below

  // Helper functions for analytics calculations
  private calculateScoreTrends(testHistory: TestHistory[], timeRange: string): any[] {
    if (testHistory.length === 0) return [];
    
    // Group tests by week for trend analysis
    const weeklyGroups = this.groupByWeek(testHistory);
    
    return weeklyGroups.map(week => ({
      week: week.week,
      averageScore: week.averageScore,
      testCount: week.testCount,
      improvement: week.improvement
    }));
  }

  private groupByWeek(testHistory: TestHistory[]): any[] {
    const weeklyData = new Map<string, { scores: number[], count: number }>();
    
    testHistory.forEach(test => {
      const testDate = new Date(test.completedAt as any);
      const weekStart = new Date(testDate);
      weekStart.setDate(testDate.getDate() - testDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyData.get(weekKey) || { scores: [], count: 0 };
      existing.scores.push(test.score);
      existing.count += 1;
      weeklyData.set(weekKey, existing);
    });
    
    const weeks = Array.from(weeklyData.entries()).map(([week, data]) => ({
      week,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      testCount: data.count,
      improvement: 0 // Will be calculated in the next step
    }));
    
    // Calculate improvement between weeks
    for (let i = 1; i < weeks.length; i++) {
      weeks[i].improvement = weeks[i].averageScore - weeks[i-1].averageScore;
    }
    
    return weeks.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  }

  // Removed old placeholder duplicate calculateConsistency in favor of calculateConsistencyScore

  private calculateMasteryLevel(testHistory: TestHistory[]): string {
    if (testHistory.length === 0) return 'Novice';
    
    const averageScore = testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length;
    
    if (averageScore >= 90) return 'Expert';
    if (averageScore >= 80) return 'Advanced';
    if (averageScore >= 70) return 'Intermediate';
    if (averageScore >= 60) return 'Beginner';
    return 'Novice';
  }

  private calculateFocusTime(userId: number): string {
    // This is a placeholder - would implement actual focus time calculation
    return '20-30 minutes';
  }

  private calculateAverageSessionLength(testHistory: Array<{ timeSpent: number | null }>): number {
    const totalTime = testHistory.reduce((sum, test) => sum + (test.timeSpent ?? 0), 0);
    return testHistory.length > 0 ? totalTime / testHistory.length : 0;
  }

  private findPeakPerformanceWindow(testHistory: any[]): string {
    // Analyze when user performs best
    return "6:00 - 8:00 PM";
  }

  private calculateStudyFrequency(testHistory: any[]): any {
    return {
      dailyAverage: testHistory.length / 30, // Approximate
      mostActiveDay: "Saturday"
    };
  }

  private getPreferredDifficulty(testHistory: any[]): string {
    return "Progressive";
  }

  private calculateRetentionRate(userId: number): number {
    return 94; // Mock retention rate
  }

  private identifyStrengths(testHistory: any[]): string[] {
    // Identify areas where user performs well
    const categoryScores = new Map();
    
    testHistory.forEach(test => {
      if (!categoryScores.has(test.cluster)) {
        categoryScores.set(test.cluster, []);
      }
      categoryScores.get(test.cluster).push(test.score);
    });

    const strengths: string[] = [];
    categoryScores.forEach((scores, category) => {
      const avg = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      if (avg >= 85) {
        strengths.push(category);
      }
    });

    return strengths;
  }

  private generateStudyRecommendations(testHistory: any[], weakTopics: any[]): string[] {
    return [
      "Focus on finance calculations for 15 minutes daily",
      "Review marketing case studies 2-3 times per week",
      "Take operations mock tests weekly"
    ];
  }

  private predictProgress(testHistory: any[]): any {
    return {
      expectedImprovement: "+15% in next month",
      targetAchievement: "90% average score by end of quarter"
    };
  }

  private recommendNextSession(testHistory: any[], weakTopics: any[]): any {
    return {
      duration: "45 minutes",
      focus: weakTopics[0]?.topic || "General review",
      difficulty: "Medium"
    };
  }

  private generateStudyPlan(testHistory: any[], weakTopics: any[]): any[] {
    return [
      { day: "Monday", focus: "Finance calculations", duration: "30 min" },
      { day: "Wednesday", focus: "Marketing review", duration: "45 min" },
      { day: "Friday", focus: "Operations practice", duration: "60 min" }
    ];
  }

  private recommendPracticeQuestions(weakTopics: any[]): any[] {
    return weakTopics.map(topic => ({
      topic: topic.topic,
      questionCount: 5,
      difficulty: "Medium"
    }));
  }

  // Enhanced personalized learning methods
  async getTopicMastery(userId: number): Promise<TopicMastery[]> {
    try {
      const mastery = await db
        .select()
        .from(topicMastery)
        .where(eq(topicMastery.userId, userId))
        .orderBy(desc(topicMastery.masteryLevel));
      
      return mastery;
    } catch (error) {
      console.error('Error getting topic mastery:', error);
      return [];
    }
  }

  async updateTopicMastery(userId: number, topic: string, cluster: string, performance: {
    questionsAnswered: number;
    questionsCorrect: number;
    timeSpent: number;
  }): Promise<TopicMastery> {
    try {
      // Check if mastery record exists
      const [existing] = await db
        .select()
        .from(topicMastery)
        .where(and(
          eq(topicMastery.userId, userId),
          eq(topicMastery.topic, topic),
          eq(topicMastery.cluster, cluster)
        ));

      const newMasteryLevel = Math.min(100, (performance.questionsCorrect / performance.questionsAnswered) * 100);
      const avgTimePerQuestion = performance.timeSpent / performance.questionsAnswered;
      
      if (existing) {
        // Update existing record
        const totalQuestions = (existing.questionsAnswered ?? 0) + performance.questionsAnswered;
        const totalCorrect = (existing.questionsCorrect ?? 0) + performance.questionsCorrect;
        const overallMastery = (totalCorrect / totalQuestions) * 100;
        
        // Calculate trend
        const baseMastery = existing.masteryLevel ?? 0;
        const trend = newMasteryLevel > baseMastery ? 'improving' : 
                     newMasteryLevel < baseMastery ? 'declining' : 'stable';
        
        // Calculate learning velocity (improvement rate)
        const lastPracticed = existing.lastPracticed ? new Date(existing.lastPracticed) : new Date(Date.now() - 24*60*60*1000);
        const timeDiff = Date.now() - lastPracticed.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        const masteryChange = newMasteryLevel - baseMastery;
        const learningVelocity = daysDiff > 0 ? masteryChange / daysDiff : 0;
        
        // Calculate next recommended practice using spaced repetition
        const baseInterval = baseMastery >= 80 ? 7 : baseMastery >= 60 ? 3 : 1;
        const nextPractice = new Date(Date.now() + baseInterval * 24 * 60 * 60 * 1000);
        
        const [updated] = await db
          .update(topicMastery)
          .set({
            masteryLevel: overallMastery,
            questionsAnswered: totalQuestions,
            questionsCorrect: totalCorrect,
            lastPracticed: new Date(),
            avgTimePerQuestion,
            masteryTrend: trend,
            learningVelocity,
            nextRecommendedPractice: nextPractice,
            timesRetried: (existing.timesRetried ?? 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(topicMastery.id, existing.id))
          .returning();
        
        return updated;
      } else {
        // Create new record
        const nextPractice = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day for new topics
        
        const [created] = await db
          .insert(topicMastery)
          .values({
            userId,
            topic,
            cluster,
            masteryLevel: newMasteryLevel,
            questionsAnswered: performance.questionsAnswered,
            questionsCorrect: performance.questionsCorrect,
            avgTimePerQuestion,
            nextRecommendedPractice: nextPractice,
            masteryTrend: 'stable',
            learningVelocity: 0
          })
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Error updating topic mastery:', error);
      throw error;
    }
  }

  async saveQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    try {
      // Calculate improvement from last session
      const lastSessions = await db
        .select()
        .from(quizSessions)
        .where(and(
          eq(quizSessions.userId, session.userId),
          eq(quizSessions.topicFocused, session.topicFocused || '')
        ))
        .orderBy(desc(quizSessions.completedAt))
        .limit(1);
      
      const improvement = lastSessions.length > 0 
        ? session.scorePercentage - lastSessions[0].scorePercentage
        : 0;
      
      // Calculate mastery gain estimate based on performance
      const masteryGain = Math.min(20, session.scorePercentage >= 80 ? 15 : 
                                      session.scorePercentage >= 60 ? 10 : 5);
      
      // Calculate next recommended session using spaced repetition
      const baseInterval = session.scorePercentage >= 80 ? 7 : 
                          session.scorePercentage >= 60 ? 3 : 1;
      const nextSession = new Date(Date.now() + baseInterval * 24 * 60 * 60 * 1000);
      
      const [created] = await db
        .insert(quizSessions)
        .values({
          ...session,
          improvementFromLastSession: improvement,
          masteryGainEstimate: masteryGain,
          nextRecommendedSession: nextSession
        })
        .returning();
      
      return created;
    } catch (error) {
      console.error('Error saving quiz session:', error);
      throw error;
    }
  }

  async getQuizSessions(userId: number): Promise<QuizSession[]> {
    try {
      const sessions = await db
        .select()
        .from(quizSessions)
        .where(eq(quizSessions.userId, userId))
        .orderBy(desc(quizSessions.completedAt));
      
      return sessions;
    } catch (error) {
      console.error('Error getting quiz sessions:', error);
      return [];
    }
  }

  async generateEnhancedInsights(userId: number): Promise<EnhancedLearningInsight[]> {
    try {
      // Get user's topic mastery and quiz sessions
      const masteryData = await this.getTopicMastery(userId);
      const quizData = await this.getQuizSessions(userId);
      
      const insights: InsertEnhancedLearningInsight[] = [];
      
      // Weakness pattern insights
      const weakTopics = masteryData.filter(t => (t.masteryLevel ?? 0) < 60);
      for (const topic of weakTopics) {
        if ((topic.timesRetried ?? 0) >= 3) {
          insights.push({
            userId,
            insightType: 'weakness_pattern',
            topic: topic.topic,
             insight: `You've practiced ${topic.topic} ${(topic.timesRetried ?? 0)} times but mastery is still at ${Math.round(topic.masteryLevel ?? 0)}%. Consider breaking this topic into smaller concepts.`,
            actionRecommendation: `Focus on specific subtopics within ${topic.topic}. Try reviewing examples before attempting more questions.`,
            confidenceScore: 0.85,
            priority: 'high',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            timesSeen: 0,
            timesActedUpon: 0,
            effectivenessScore: 0
          });
        }
      }
      
      // Strength area insights
      const strongTopics = masteryData.filter(t => (t.masteryLevel ?? 0) >= 80);
      for (const topic of strongTopics) {
        if ((topic.streakCount ?? 0) >= 3) {
          insights.push({
            userId,
            insightType: 'strength_area',
            topic: topic.topic,
             insight: `Excellent work! You've mastered ${topic.topic} with ${Math.round(topic.masteryLevel ?? 0)}% proficiency and a ${(topic.streakCount ?? 0)}-session streak.`,
            actionRecommendation: `Consider teaching this topic to others or challenging yourself with advanced scenarios.`,
            confidenceScore: 0.95,
            priority: 'low',
            validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            timesSeen: 0,
            timesActedUpon: 0,
            effectivenessScore: 0
          });
        }
      }
      
      // Study timing optimization
      const recentQuizzes = quizData.slice(0, 10);
      if (recentQuizzes.length >= 5) {
        const avgImprovement = recentQuizzes.reduce((sum, q) => sum + (q.improvementFromLastSession || 0), 0) / recentQuizzes.length;
        
        if (avgImprovement < 0) {
          insights.push({
            userId,
            insightType: 'timing_optimization',
            insight: `Your performance has declined by ${Math.abs(avgImprovement).toFixed(1)}% over recent sessions. You might be practicing too frequently.`,
            actionRecommendation: `Take longer breaks between study sessions. Spaced repetition works better than cramming.`,
            confidenceScore: 0.78,
            priority: 'medium',
            validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
            timesSeen: 0,
            timesActedUpon: 0,
            effectivenessScore: 0
          });
        }
      }
      
      // Save insights to database
      const savedInsights: EnhancedLearningInsight[] = [];
      for (const insight of insights) {
        const [saved] = await db
          .insert(enhancedLearningInsights)
          .values(insight)
          .returning();
        savedInsights.push(saved);
      }
      
      return savedInsights;
    } catch (error) {
      console.error('Error generating enhanced insights:', error);
      return [];
    }
  }

  async getAdaptiveDifficulty(userId: number, topic: string): Promise<string> {
    try {
      const [mastery] = await db
        .select()
        .from(topicMastery)
        .where(and(
          eq(topicMastery.userId, userId),
          eq(topicMastery.topic, topic)
        ));
      
      if (!mastery) return 'medium';
      
      const m = mastery.masteryLevel ?? 0;
      if (m >= 80) return 'hard';
      if (m >= 60) return 'medium';
      return 'easy';
    } catch (error) {
      console.error('Error getting adaptive difficulty:', error);
      return 'medium';
    }
  }

  async calculateSpacedRepetition(userId: number, topic: string): Promise<Date> {
    try {
      const [mastery] = await db
        .select()
        .from(topicMastery)
        .where(and(
          eq(topicMastery.userId, userId),
          eq(topicMastery.topic, topic)
        ));
      
      if (!mastery) {
        return new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day for new topics
      }
      
      // Spaced repetition algorithm based on mastery level
      let intervalDays = 1;
      const m = mastery.masteryLevel ?? 0;
      if (m >= 90) intervalDays = 14;
      else if (m >= 80) intervalDays = 7;
      else if (m >= 70) intervalDays = 3;
      else if (m >= 60) intervalDays = 2;
      
      // Adjust based on streak
      const s = mastery.streakCount ?? 0;
      if (s >= 5) intervalDays = Math.round(intervalDays * 1.5);
      
      return new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Error calculating spaced repetition:', error);
      return new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    }
  }

  async getPersonalizedRecommendations(userId: number): Promise<any[]> {
    try {
      const masteryData = await this.getTopicMastery(userId);
      const insights = await this.generateEnhancedInsights(userId);
      
      const recommendations = [];
      
      // Recommend topics that need attention
      const needsAttention = masteryData
        .filter(t => (t.masteryLevel ?? 0) < 70 && (t.nextRecommendedPractice ? new Date(t.nextRecommendedPractice) : new Date(0)) <= new Date())
        .sort((a, b) => (a.masteryLevel ?? 0) - (b.masteryLevel ?? 0))
        .slice(0, 3);
      
      for (const topic of needsAttention) {
        recommendations.push({
          type: 'practice_weak_topic',
          topic: topic.topic,
          cluster: topic.cluster,
           priority: (topic.masteryLevel ?? 0) < 50 ? 'high' : 'medium',
           reason: `Master ${topic.topic} (${Math.round(topic.masteryLevel ?? 0)}% proficiency)`,
          actionText: 'Practice Now',
          difficulty: await this.getAdaptiveDifficulty(userId, topic.topic)
        });
      }
      
      // Recommend review for topics due for spaced repetition
      const dueForReview = masteryData
        .filter(t => (t.masteryLevel ?? 0) >= 70 && (t.nextRecommendedPractice ? new Date(t.nextRecommendedPractice) : new Date(0)) <= new Date())
        .slice(0, 2);
      
      for (const topic of dueForReview) {
        recommendations.push({
          type: 'spaced_repetition_review',
          topic: topic.topic,
          cluster: topic.cluster,
          priority: 'low',
           reason: `Maintain ${topic.topic} mastery (${Math.round(topic.masteryLevel ?? 0)}%)`,
          actionText: 'Quick Review',
          difficulty: 'medium'
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Fix missing method
  calculateLearningTrend(testHistory: any[]): string {
    if (testHistory.length < 2) return 'insufficient_data';
    
    const recent = testHistory.slice(0, 5);
    const older = testHistory.slice(5, 10);
    
    if (recent.length === 0 || older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((sum, test) => sum + test.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, test) => sum + test.score, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  // Fix missing method
  getCategoryTrends(testHistory: any[]): any[] {
    const categoryStats: { [key: string]: { scores: number[], count: number } } = {};
    
    testHistory.forEach(test => {
      if (!categoryStats[test.cluster]) {
        categoryStats[test.cluster] = { scores: [], count: 0 };
      }
      categoryStats[test.cluster].scores.push(test.score);
      categoryStats[test.cluster].count++;
    });
    
    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      averageScore: stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length,
      totalAttempts: stats.count,
      trend: this.calculateLearningTrend(stats.scores.map(score => ({ score })))
    }));
  }

  // DECA Bloc Game Session methods
  async createGameSessionDECABloc(session: InsertGameSessionDECABloc): Promise<GameSessionDECABloc> {
    try {
      const [gameSession] = await db
        .insert(gameSessionsDECABloc)
        .values(session)
        .returning();
      return gameSession;
    } catch (error) {
      console.error('Error creating DECA Bloc game session:', error);
      throw error;
    }
  }

  async getUserGameSessionsDECABloc(userId: number): Promise<GameSessionDECABloc[]> {
    try {
      return await db
        .select()
        .from(gameSessionsDECABloc)
        .where(eq(gameSessionsDECABloc.userId, userId))
        .orderBy(desc(gameSessionsDECABloc.completedAt));
    } catch (error) {
      console.error('Error getting user DECA Bloc game sessions:', error);
      return [];
    }
  }

  async updateUserStats(userId: number, updates: { points?: number; experience?: number }): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.points !== undefined) {
        updateData.points = sql`${users.points} + ${updates.points}`;
      }
      
      if (updates.experience !== undefined) {
        updateData.experience = sql`${users.experience} + ${updates.experience}`;
      }

      if (Object.keys(updateData).length > 0) {
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId));
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();