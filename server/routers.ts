import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  awardBadge,
  awardXP,
  clearChatHistory,
  createPracticeSession,
  getAllBadges,
  getChatHistory,
  getLeaderboard,
  getLearningPathBySlug,
  getLearningPaths,
  getLessonBySlug,
  getLessonsByPath,
  getPracticeStats,
  getUserAllProgress,
  getUserBadges,
  getUserGamification,
  getUserLessonProgress,
  getUserProfile,
  getUserPracticeSessions,
  getUserSubscription,
  isPremiumUser,
  saveChatMessage,
  updateStreak,
  updateUserProfile,
  upsertLessonProgress,
} from "./db";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Profile Router ───────────────────────────────────────────────────────────
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getUserProfile(ctx.user.id);
    return profile;
  }),

  update: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(500).optional(),
        skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        preferredTuning: z.string().max(32).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── Gamification Router ──────────────────────────────────────────────────────
const gamificationRouter = router({
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const gamification = await getUserGamification(ctx.user.id);
    if (!gamification) return { xp: 0, level: 1, currentStreak: 0, longestStreak: 0, totalSessions: 0 };
    return gamification;
  }),

  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    return getUserBadges(ctx.user.id);
  }),

  getAllBadges: publicProcedure.query(async () => {
    return getAllBadges();
  }),

  getLeaderboard: publicProcedure.query(async () => {
    return getLeaderboard(20);
  }),

  recordActivity: protectedProcedure
    .input(
      z.object({
        sessionType: z.enum(["lesson", "fretboard", "pitch_training", "free_play"]),
        durationSeconds: z.number().min(0),
        accuracyScore: z.number().min(0).max(100).optional(),
        notesAttempted: z.number().min(0).optional(),
        notesCorrect: z.number().min(0).optional(),
        xpAmount: z.number().min(0).default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { newXp, newLevel, leveledUp } = await awardXP(ctx.user.id, input.xpAmount);
      const { currentStreak } = await updateStreak(ctx.user.id);

      await createPracticeSession({
        userId: ctx.user.id,
        sessionType: input.sessionType,
        durationSeconds: input.durationSeconds,
        accuracyScore: input.accuracyScore,
        notesAttempted: input.notesAttempted ?? 0,
        notesCorrect: input.notesCorrect ?? 0,
        xpEarned: input.xpAmount,
      });

      // Check badge conditions
      const gamification = await getUserGamification(ctx.user.id);
      if (gamification) {
        if (gamification.currentStreak >= 3) await awardBadge(ctx.user.id, "streak-3");
        if (gamification.currentStreak >= 7) await awardBadge(ctx.user.id, "streak-7");
        if (gamification.currentStreak >= 30) await awardBadge(ctx.user.id, "streak-30");
        if (newLevel >= 5) await awardBadge(ctx.user.id, "level-5");
        if (newLevel >= 10) await awardBadge(ctx.user.id, "level-10");
        if (newLevel >= 25) await awardBadge(ctx.user.id, "level-25");
        if (input.accuracyScore === 100) await awardBadge(ctx.user.id, "perfect-score");
      }

      return { newXp, newLevel, leveledUp, currentStreak };
    }),
});

// ─── Learning Router ──────────────────────────────────────────────────────────
const learningRouter = router({
  getPaths: publicProcedure.query(async () => {
    return getLearningPaths();
  }),

  getPathWithLessons: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const path = await getLearningPathBySlug(input.slug);
      if (!path) throw new TRPCError({ code: "NOT_FOUND", message: "Learning path not found" });
      const lessons = await getLessonsByPath(path.id);
      return { path, lessons };
    }),

  getLesson: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const lesson = await getLessonBySlug(input.slug);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      // Gate premium content
      if (lesson.isPremium && ctx.user) {
        const premium = await isPremiumUser(ctx.user.id);
        if (!premium) {
          return { ...lesson, content: null, locked: true };
        }
      } else if (lesson.isPremium && !ctx.user) {
        return { ...lesson, content: null, locked: true };
      }

      return { ...lesson, locked: false };
    }),

  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    return getUserAllProgress(ctx.user.id);
  }),

  completeLesson: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        score: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertLessonProgress(ctx.user.id, input.lessonId, "completed", input.score);

      // Award XP for lesson completion
      const lessonData = await (async () => {
        const { getDb } = await import("./db");
        const { lessons } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(lessons).where(eq(lessons.id, input.lessonId)).limit(1);
        return result[0] ?? null;
      })();

      const xpReward = lessonData?.xpReward ?? 20;
      const { newXp, newLevel, leveledUp } = await awardXP(ctx.user.id, xpReward);
      await updateStreak(ctx.user.id);
      await awardBadge(ctx.user.id, "first-lesson");

      return { success: true, xpEarned: xpReward, newXp, newLevel, leveledUp };
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertLessonProgress(ctx.user.id, input.lessonId, input.status);
      return { success: true };
    }),
});

// ─── Analytics Router ─────────────────────────────────────────────────────────
const analyticsRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [stats, sessions, gamification] = await Promise.all([
      getPracticeStats(ctx.user.id),
      getUserPracticeSessions(ctx.user.id, 30),
      getUserGamification(ctx.user.id),
    ]);
    return { stats, sessions, gamification };
  }),

  getRecentSessions: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ ctx, input }) => {
      return getUserPracticeSessions(ctx.user.id, input.limit);
    }),
});

// ─── AI Assistant Router ──────────────────────────────────────────────────────
const aiRouter = router({
  getChatHistory: protectedProcedure.query(async ({ ctx }) => {
    const premium = await isPremiumUser(ctx.user.id);
    if (!premium) {
      throw new TRPCError({ code: "FORBIDDEN", message: "AI Assistant requires a Premium subscription" });
    }
    return getChatHistory(ctx.user.id, 50);
  }),

  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await clearChatHistory(ctx.user.id);
    return { success: true };
  }),

  sendMessage: protectedProcedure
    .input(z.object({ message: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const premium = await isPremiumUser(ctx.user.id);
      if (!premium) {
        throw new TRPCError({ code: "FORBIDDEN", message: "AI Assistant requires a Premium subscription" });
      }

      // Save user message
      await saveChatMessage(ctx.user.id, "user", input.message);

      // Get chat history for context
      const history = await getChatHistory(ctx.user.id, 20);

      const messages = [
        {
          role: "system" as const,
          content: `You are FretMaster AI, an expert guitar teacher and music theory assistant. You help guitarists of all levels understand music theory, improve their technique, and develop effective practice routines.

Your expertise includes:
- Music theory (scales, chords, intervals, harmony, modes)
- Guitar technique (picking, fretting, bends, vibrato, legato)
- Learning paths and practice planning
- Genre-specific advice (rock, blues, jazz, classical, country)
- Fretboard navigation and visualization

When asked for a practice plan, provide a structured daily/weekly plan with specific exercises, time allocations, and goals. Format responses with clear headings and bullet points when appropriate. Keep responses concise but thorough.`,
        },
        ...history.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages });
      const rawContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof rawContent === "string" ? rawContent : "I couldn't generate a response. Please try again.";

      // Save assistant response
      await saveChatMessage(ctx.user.id, "assistant", assistantMessage);

      // Award XP for using AI assistant
      await awardXP(ctx.user.id, 5);

      // Check theory buff badge
      const chatCount = history.filter((m) => m.role === "user").length + 1;
      if (chatCount >= 10) await awardBadge(ctx.user.id, "theory-buff");

      return { message: assistantMessage };
    }),

  generatePracticePlan: protectedProcedure
    .input(
      z.object({
        skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
        goals: z.string().max(500),
        availableMinutes: z.number().min(5).max(240),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const premium = await isPremiumUser(ctx.user.id);
      if (!premium) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Practice plan generation requires a Premium subscription" });
      }

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are FretMaster AI, an expert guitar teacher. Generate structured, actionable practice plans.",
          },
          {
            role: "user",
            content: `Generate a daily practice plan for a ${input.skillLevel} guitarist with ${input.availableMinutes} minutes available per day. Their goals: ${input.goals}

Format the plan with:
1. Warm-up (5-10 min)
2. Technical exercises (specific to their level)
3. Theory/fretboard work
4. Song/repertoire practice
5. Cool-down/ear training

Include specific exercises, tempos, and tips for each section.`,
          },
        ],
      });

      const rawPlan = response.choices[0]?.message?.content;
      const plan = typeof rawPlan === "string" ? rawPlan : "Unable to generate plan.";
      await saveChatMessage(ctx.user.id, "user", `Generate a ${input.availableMinutes}-min practice plan for ${input.skillLevel} level. Goals: ${input.goals}`);
      await saveChatMessage(ctx.user.id, "assistant", plan);

      return { plan };
    }),
});

// ─── Subscription Router ──────────────────────────────────────────────────────
const subscriptionRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getUserSubscription(ctx.user.id);
    return {
      status: sub?.status ?? "free",
      isPremium: sub?.status === "active" || sub?.status === "trialing",
      currentPeriodEnd: sub?.currentPeriodEnd,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd,
    };
  }),
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const [profile, gamification, stats, recentSessions, progress, subscription] = await Promise.all([
      getUserProfile(ctx.user.id),
      getUserGamification(ctx.user.id),
      getPracticeStats(ctx.user.id),
      getUserPracticeSessions(ctx.user.id, 5),
      getUserAllProgress(ctx.user.id),
      getUserSubscription(ctx.user.id),
    ]);

    const completedLessons = progress.filter((p) => p.status === "completed").length;

    return {
      user: ctx.user,
      profile,
      gamification,
      stats,
      recentSessions,
      completedLessons,
      isPremium: subscription?.status === "active" || subscription?.status === "trialing",
    };
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  profile: profileRouter,
  gamification: gamificationRouter,
  learning: learningRouter,
  analytics: analyticsRouter,
  ai: aiRouter,
  subscription: subscriptionRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
