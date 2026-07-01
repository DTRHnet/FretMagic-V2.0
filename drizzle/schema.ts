import {
  boolean,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Profiles ────────────────────────────────────────────────────────────
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  skillLevel: mysqlEnum("skillLevel", ["beginner", "intermediate", "advanced"]).default("beginner"),
  preferredTuning: varchar("preferredTuning", { length: 32 }).default("standard"),
  totalPracticeMinutes: int("totalPracticeMinutes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;

// ─── Gamification ─────────────────────────────────────────────────────────────
export const userGamification = mysqlTable("user_gamification", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  totalSessions: int("totalSessions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserGamification = typeof userGamification.$inferSelect;

// ─── Badges ───────────────────────────────────────────────────────────────────
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }).notNull(),
  xpReward: int("xpReward").default(0).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;

export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;

// ─── Learning Paths ───────────────────────────────────────────────────────────
export const learningPaths = mysqlTable("learning_paths", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  estimatedHours: int("estimatedHours").default(0),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningPath = typeof learningPaths.$inferSelect;

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  pathId: int("pathId").notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  content: text("content").notNull(), // Markdown content
  lessonType: mysqlEnum("lessonType", ["theory", "technique", "exercise", "song"]).default("theory").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  xpReward: int("xpReward").default(10).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  durationMinutes: int("durationMinutes").default(10),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;

// ─── User Lesson Progress ─────────────────────────────────────────────────────
export const userLessonProgress = mysqlTable("user_lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  completedAt: timestamp("completedAt"),
  score: int("score"), // 0-100 accuracy score
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserLessonProgress = typeof userLessonProgress.$inferSelect;

// ─── Practice Sessions ────────────────────────────────────────────────────────
export const practiceSessions = mysqlTable("practice_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: mysqlEnum("sessionType", ["lesson", "fretboard", "pitch_training", "free_play"]).notNull(),
  durationSeconds: int("durationSeconds").default(0).notNull(),
  accuracyScore: float("accuracyScore"), // 0-100
  notesAttempted: int("notesAttempted").default(0),
  notesCorrect: int("notesCorrect").default(0),
  xpEarned: int("xpEarned").default(0).notNull(),
  metadata: json("metadata"), // flexible extra data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PracticeSession = typeof practiceSessions.$inferSelect;

// ─── Chat History ─────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "free"]).default("free").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
