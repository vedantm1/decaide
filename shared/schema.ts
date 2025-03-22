import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  eventType: text("event_type"),
  instructionalArea: text("instructional_area"),
  subscriptionTier: text("subscription_tier").default("standard"),
  streak: integer("streak").default(0),
  lastLoginDate: timestamp("last_login_date"),
  points: integer("points").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  eventType: true,
  instructionalArea: true,
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
    roleplays: 5,
    tests: 5,
    piExplanations: 10,
    stars: 2,
    price: 12.99
  },
  plus: {
    roleplays: 15,
    tests: 15,
    piExplanations: 30,
    stars: 3,
    price: 19.99
  },
  pro: {
    roleplays: -1, // unlimited
    tests: -1, // unlimited
    piExplanations: -1, // unlimited
    stars: 5,
    price: 39.99
  }
};

// DECA event types
export const EVENT_TYPES = [
  "Business Management & Administration",
  "Marketing",
  "Finance",
  "Hospitality & Tourism",
  "Entrepreneurship"
];

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
