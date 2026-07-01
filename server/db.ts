import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  badges,
  chatMessages,
  learningPaths,
  lessons,
  practiceSessions,
  subscriptions,
  userBadges,
  userGamification,
  userLessonProgress,
  userProfiles,
  users,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }

  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;

  if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });

  // Ensure profile, gamification, and subscription rows exist
  const dbUser = await getUserByOpenId(user.openId);
  if (dbUser) {
    await ensureUserProfile(dbUser.id);
    await ensureUserGamification(dbUser.id);
    await ensureUserSubscription(dbUser.id);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ─── Profiles ─────────────────────────────────────────────────────────────────
export async function ensureUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userProfiles).values({ userId }).onDuplicateKeyUpdate({ set: { userId } });
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, data: Partial<typeof userProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
}

// ─── Gamification ─────────────────────────────────────────────────────────────
export async function ensureUserGamification(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userGamification).values({ userId }).onDuplicateKeyUpdate({ set: { userId } });
}

export async function getUserGamification(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
  return result[0];
}

export function xpToLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function levelToXp(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export async function awardXP(userId: number, amount: number): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  const db = await getDb();
  if (!db) return { newXp: 0, newLevel: 1, leveledUp: false };

  const current = await getUserGamification(userId);
  if (!current) return { newXp: 0, newLevel: 1, leveledUp: false };

  const newXp = current.xp + amount;
  const oldLevel = current.level;
  const newLevel = xpToLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  await db
    .update(userGamification)
    .set({ xp: newXp, level: newLevel, updatedAt: new Date() })
    .where(eq(userGamification.userId, userId));

  return { newXp, newLevel, leveledUp };
}

export async function updateStreak(userId: number): Promise<{ currentStreak: number; streakBroken: boolean }> {
  const db = await getDb();
  if (!db) return { currentStreak: 0, streakBroken: false };

  const current = await getUserGamification(userId);
  if (!current) return { currentStreak: 0, streakBroken: false };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = current.lastActivityDate
    ? new Date(current.lastActivityDate.getFullYear(), current.lastActivityDate.getMonth(), current.lastActivityDate.getDate())
    : null;

  let newStreak = current.currentStreak;
  let streakBroken = false;

  if (!lastActivity) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      newStreak = current.currentStreak + 1;
    } else {
      newStreak = 1;
      streakBroken = true;
    }
  }

  const longestStreak = Math.max(current.longestStreak, newStreak);

  await db
    .update(userGamification)
    .set({
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: now,
      totalSessions: current.totalSessions + 1,
    })
    .where(eq(userGamification.userId, userId));

  return { currentStreak: newStreak, streakBroken };
}

// ─── Badges ───────────────────────────────────────────────────────────────────
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ badge: badges, earnedAt: userBadges.earnedAt })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
}

export async function awardBadge(userId: number, badgeSlug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const badge = await db.select().from(badges).where(eq(badges.slug, badgeSlug)).limit(1);
  if (!badge[0]) return false;

  // Check if already awarded
  const existing = await db
    .select()
    .from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge[0].id)))
    .limit(1);
  if (existing[0]) return false;

  await db.insert(userBadges).values({ userId, badgeId: badge[0].id });
  if (badge[0].xpReward > 0) {
    await awardXP(userId, badge[0].xpReward);
  }
  return true;
}

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      userId: userGamification.userId,
      xp: userGamification.xp,
      level: userGamification.level,
      currentStreak: userGamification.currentStreak,
      name: users.name,
    })
    .from(userGamification)
    .innerJoin(users, eq(userGamification.userId, users.id))
    .orderBy(desc(userGamification.xp))
    .limit(limit);
}

// ─── Learning Paths & Lessons ─────────────────────────────────────────────────
export async function getLearningPaths() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learningPaths).orderBy(learningPaths.sortOrder);
}

export async function getLearningPathBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(learningPaths).where(eq(learningPaths.slug, slug)).limit(1);
  return result[0];
}

export async function getLessonsByPath(pathId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.pathId, pathId)).orderBy(lessons.sortOrder);
}

export async function getLessonBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
  return result[0];
}

// ─── User Lesson Progress ─────────────────────────────────────────────────────
export async function getUserLessonProgress(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userLessonProgress)
    .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId)))
    .limit(1);
  return result[0];
}

export async function getUserAllProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, userId));
}

export async function upsertLessonProgress(
  userId: number,
  lessonId: number,
  status: "not_started" | "in_progress" | "completed",
  score?: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserLessonProgress(userId, lessonId);
  if (existing) {
    await db
      .update(userLessonProgress)
      .set({
        status,
        score: score ?? existing.score,
        completedAt: status === "completed" ? new Date() : existing.completedAt,
        attempts: existing.attempts + 1,
      })
      .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId)));
  } else {
    await db.insert(userLessonProgress).values({
      userId,
      lessonId,
      status,
      score,
      completedAt: status === "completed" ? new Date() : undefined,
      attempts: 1,
    });
  }
}

// ─── Practice Sessions ────────────────────────────────────────────────────────
export async function createPracticeSession(data: typeof practiceSessions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(practiceSessions).values(data);
}

export async function getUserPracticeSessions(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(desc(practiceSessions.createdAt))
    .limit(limit);
}

export async function getPracticeStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalMinutes: 0, totalSessions: 0, avgAccuracy: 0 };

  const result = await db
    .select({
      totalSeconds: sql<number>`SUM(${practiceSessions.durationSeconds})`,
      totalSessions: sql<number>`COUNT(*)`,
      avgAccuracy: sql<number>`AVG(${practiceSessions.accuracyScore})`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId));

  const row = result[0];
  return {
    totalMinutes: Math.floor((row?.totalSeconds ?? 0) / 60),
    totalSessions: row?.totalSessions ?? 0,
    avgAccuracy: Math.round(row?.avgAccuracy ?? 0),
  };
}

// ─── Chat Messages ────────────────────────────────────────────────────────────
export async function getChatHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}

export async function saveChatMessage(userId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values({ userId, role, content });
}

export async function clearChatHistory(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function ensureUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values({ userId, status: "free" }).onDuplicateKeyUpdate({ set: { userId } });
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function updateSubscription(userId: number, data: Partial<typeof subscriptions.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0];
}

export async function isPremiumUser(userId: number): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  return sub?.status === "active" || sub?.status === "trialing";
}
