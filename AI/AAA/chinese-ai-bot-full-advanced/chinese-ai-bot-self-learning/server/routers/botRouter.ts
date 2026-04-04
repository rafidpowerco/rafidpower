/**
 * Bot Router - API endpoints للبوت الذكي
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  botLegacyProcedure,
  publicProcedure,
  protectedProcedure,
  router,
} from "../_core/trpc";
import { getDb } from "../db";
import {
  conversations,
  messages,
  patterns,
  modelPerformance,
  learningLogs,
  availableModels,
} from "../../drizzle/schema";
import { eq, and, isNull, desc, sql, gte, asc } from "drizzle-orm";
import { taskAnalyzer } from "../ai/taskAnalyzer";
import { toolManager, type TaskType } from "../tools/toolManager";
import { learningEngine } from "../ai/learningEngine";
import { codeExecutor } from "../ai/codeExecutor";
import { unifiedFreeOrchestrator } from "../ai/unifiedFreeOrchestrator";
import { resolveTenantId } from "../_core/tenantContext";

type DrizzleDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function fetchLearningDashboardSlice(
  db: DrizzleDb,
  userKey: number,
  tenantId: string
) {
  const metrics = await learningEngine.getLearningMetrics(userKey, tenantId);
  const patterns = await learningEngine.getUserPatterns(userKey, tenantId);
  const recommendations = await learningEngine.getRecommendations(
    userKey,
    tenantId
  );
  const recentLogs = await db
    .select()
    .from(learningLogs)
    .where(
      and(
        eq(learningLogs.telegramUserId, userKey),
        eq(learningLogs.tenantId, tenantId)
      )
    )
    .orderBy(learningLogs.createdAt)
    .limit(10);
  return { metrics, patterns, recommendations, recentLogs };
}

export const botRouter = router({
  // Get all available tools
  getTools: publicProcedure.query(async () => {
    return toolManager.getAllTools();
  }),

  // Get tools for a specific task type
  getToolsForTask: publicProcedure
    .input(z.object({ taskType: z.string().max(128) }))
    .query(async ({ input }) => {
      return toolManager.getToolsForTask(input.taskType as TaskType);
    }),

  // Analyze a task
  analyzeTask: publicProcedure
    .input(z.object({ message: z.string().max(50_000) }))
    .mutation(async ({ input }) => {
      const analysis = await taskAnalyzer.analyzeTask(input.message);
      const selectedTool = toolManager.selectBestTool(analysis.taskType);

      return {
        analysis,
        selectedTool,
      };
    }),

  // Get user conversations
  getConversations: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });

      const userConversations = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.telegramUserId, input.userId),
            eq(conversations.tenantId, tenantId),
            isNull(conversations.appUserId)
          )
        )
        .orderBy(conversations.createdAt);

      return userConversations;
    }),

  // Get conversation messages
  getMessages: botLegacyProcedure
    .input(
      z.object({
        conversationId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });

      const rows = await db
        .select()
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(conversations.tenantId, tenantId),
            isNull(conversations.appUserId)
          )
        )
        .orderBy(messages.createdAt);

      return rows.map(r => r.messages);
    }),

  // Get user patterns
  getUserPatterns: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      return await learningEngine.getUserPatterns(input.userId, tenantId);
    }),

  // Get learning metrics
  getLearningMetrics: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      return await learningEngine.getLearningMetrics(input.userId, tenantId);
    }),

  // Get recommendations
  getRecommendations: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      return await learningEngine.getRecommendations(input.userId, tenantId);
    }),

  // Get model performance
  getModelPerformance: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });

      const performance = await db
        .select()
        .from(modelPerformance)
        .where(
          and(
            eq(modelPerformance.telegramUserId, input.userId),
            eq(modelPerformance.tenantId, tenantId)
          )
        )
        .orderBy(modelPerformance.successRate);

      return performance;
    }),

  // Get learning logs
  getLearningLogs: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().default(50),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });

      const logs = await db
        .select()
        .from(learningLogs)
        .where(
          and(
            eq(learningLogs.telegramUserId, input.userId),
            eq(learningLogs.tenantId, tenantId)
          )
        )
        .orderBy(learningLogs.createdAt)
        .limit(input.limit);

      return logs;
    }),

  // Execute code
  executeCode: botLegacyProcedure
    .input(
      z.object({
        code: z.string().max(100_000),
        language: z.enum(["python", "javascript", "nodejs"]),
        timeout: z.number().min(1_000).max(30_000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await codeExecutor.execute({
        code: input.code,
        language: input.language,
        timeout: Math.min(input.timeout ?? 15_000, 30_000),
      });

      return result;
    }),

  // Analyze code
  analyzeCode: botLegacyProcedure
    .input(
      z.object({
        code: z.string().max(100_000),
        language: z.string().max(64),
      })
    )
    .query(({ input }) => {
      return codeExecutor.analyzeCode(input.code);
    }),

  // Generate code
  generateCode: botLegacyProcedure
    .input(
      z.object({
        description: z.string().max(20_000),
        language: z.enum(["python", "javascript"]),
      })
    )
    .mutation(async ({ input }) => {
      return await codeExecutor.generateCode(input.description, input.language);
    }),

  // Process message with AI
  processMessage: botLegacyProcedure
    .input(
      z.object({
        message: z.string().max(100_000),
        userId: z.number(),
        conversationId: z.number().optional(),
        /** اختياري — مرحلة 1 لتعدد العملاء لاحقاً */
        tenantId: z.string().max(128).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const tenantId = resolveTenantId({
          inputTenant: input.tenantId,
          sessionUser: ctx.user,
        });
        const unified = await unifiedFreeOrchestrator.execute(
          input.userId,
          input.message,
          {
            tenantId,
            knowledgePrincipal: {
              kind: "telegram",
              telegramUserId: input.userId,
            },
          }
        );

        if (!unified.success) {
          return {
            success: false,
            error: unified.error ?? "Unified orchestration failed",
            analysis: unified.analysis,
          };
        }

        const selectedTool =
          unified.tool ??
          toolManager.selectBestFreeTool(
            unified.analysis.taskType as TaskType,
            {}
          );
        const modelId = selectedTool?.id ?? "unified_free_orchestrator";

        // Save to database (محادثة يجب أن تطابق نفس المستأجر)
        const db = await getDb();
        if (db && input.conversationId) {
          const conv = await db
            .select({ id: conversations.id })
            .from(conversations)
            .where(
              and(
                eq(conversations.id, input.conversationId),
                eq(conversations.tenantId, tenantId),
                isNull(conversations.appUserId),
                eq(conversations.telegramUserId, input.userId)
              )
            )
            .limit(1);

          if (conv.length > 0) {
            await db.insert(messages).values({
              conversationId: input.conversationId,
              telegramUserId: input.userId,
              tenantId,
              role: "user",
              content: input.message,
              model: modelId,
              tokensUsed: 0,
            });

            await db.insert(messages).values({
              conversationId: input.conversationId,
              telegramUserId: input.userId,
              tenantId,
              role: "assistant",
              content: unified.message,
              model: modelId,
              tokensUsed: 0,
            });
          }
        }

        return {
          success: true,
          message: unified.message,
          analysis: unified.analysis,
          tool: selectedTool,
          agentName: unified.agentName,
          unifiedPath: unified.path,
          tenantId: unified.tenantId,
          usedKnowledgeChunks: unified.usedKnowledgeChunks ?? 0,
          usedKnowledgeTitles: unified.usedKnowledgeTitles ?? [],
        };
      } catch (error) {
        console.error("Error processing message:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get all available models from database
  getAvailableModels: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const models = await db
      .select()
      .from(availableModels)
      .where(eq(availableModels.isAvailable, true));

    return models;
  }),

  // Get tool statistics
  getToolStats: publicProcedure.query(() => {
    return toolManager.getAllToolStats();
  }),

  /** ملخص الأدوات والوكلاء المجانية تحت المنسق الموحد */
  getFreeUnifiedStack: publicProcedure.query(() => {
    return unifiedFreeOrchestrator.getOverview();
  }),

  // Get dashboard data
  getDashboardData: botLegacyProcedure
    .input(
      z.object({
        userId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });

      if (!db) {
        return {
          metrics: null,
          patterns: [],
          recommendations: [],
          recentLogs: [],
          tenantId,
        };
      }

      const slice = await fetchLearningDashboardSlice(
        db,
        input.userId,
        tenantId
      );
      return { ...slice, tenantId };
    }),

  /** محادثات المستخدم المسجّل (ويب) — معزولة عن تليجرام */
  myConversations: protectedProcedure
    .input(z.object({ tenantId: z.string().max(128).optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      return db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.tenantId, tenantId),
            eq(conversations.appUserId, ctx.user.id)
          )
        )
        .orderBy(desc(conversations.createdAt));
    }),

  myMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const rows = await db
        .select()
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(conversations.tenantId, tenantId),
            eq(conversations.appUserId, ctx.user.id)
          )
        )
        .orderBy(messages.createdAt);
      return rows.map(r => r.messages);
    }),

  myProcessMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(100_000),
        conversationId: z.number().optional(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const uid = ctx.user.id;
      try {
        const unified = await unifiedFreeOrchestrator.execute(
          uid,
          input.message,
          {
            tenantId,
            knowledgePrincipal: { kind: "web", appUserId: uid },
          }
        );

        if (!unified.success) {
          return {
            success: false as const,
            error: unified.error ?? "Unified orchestration failed",
            analysis: unified.analysis,
            conversationId: input.conversationId,
            usedKnowledgeChunks: unified.usedKnowledgeChunks,
            usedKnowledgeTitles: unified.usedKnowledgeTitles,
          };
        }

        const selectedTool =
          unified.tool ??
          toolManager.selectBestFreeTool(
            unified.analysis.taskType as TaskType,
            {}
          );
        const modelId = selectedTool?.id ?? "unified_free_orchestrator";

        const db = await getDb();
        let conversationId = input.conversationId;
        /** محادثة موجودة مسبقاً — نزيد العداد؛ الجديدة تُنشأ أصلاً بـ messageCount = 2 */
        const extendExistingConversation = input.conversationId != null;

        if (db) {
          if (conversationId == null) {
            const ins = await db.insert(conversations).values({
              telegramUserId: 0,
              appUserId: uid,
              tenantId,
              title: input.message.slice(0, 100),
              messageCount: 2,
              model: modelId,
              isActive: true,
            });
            conversationId = Number(ins[0].insertId);
          } else {
            const owned = await db
              .select({ id: conversations.id })
              .from(conversations)
              .where(
                and(
                  eq(conversations.id, conversationId),
                  eq(conversations.appUserId, uid),
                  eq(conversations.tenantId, tenantId)
                )
              )
              .limit(1);
            if (!owned.length) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "المحادثة غير موجودة أو لا تخصك",
              });
            }
          }

          await db.insert(messages).values({
            conversationId,
            telegramUserId: 0,
            appUserId: uid,
            tenantId,
            role: "user",
            content: input.message,
            model: modelId,
            tokensUsed: 0,
          });

          await db.insert(messages).values({
            conversationId,
            telegramUserId: 0,
            appUserId: uid,
            tenantId,
            role: "assistant",
            content: unified.message,
            model: modelId,
            tokensUsed: 0,
          });

          if (extendExistingConversation) {
            await db
              .update(conversations)
              .set({
                messageCount: sql`${conversations.messageCount} + 2`,
                model: modelId,
              })
              .where(
                and(
                  eq(conversations.id, conversationId),
                  eq(conversations.appUserId, uid),
                  eq(conversations.tenantId, tenantId)
                )
              );
          }
        }

        return {
          success: true as const,
          message: unified.message,
          analysis: unified.analysis,
          tool: selectedTool,
          agentName: unified.agentName,
          unifiedPath: unified.path,
          tenantId: unified.tenantId,
          conversationId,
          usedKnowledgeChunks: unified.usedKnowledgeChunks ?? 0,
          usedKnowledgeTitles: unified.usedKnowledgeTitles ?? [],
        };
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        console.error("myProcessMessage:", e);
        return {
          success: false as const,
          error: e instanceof Error ? e.message : "Unknown error",
        };
      }
    }),

  /** رسائل يومية للمستخدم (ويب) — للرسوم البيانية */
  myActivityByDay: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().max(128).optional(),
        days: z.number().min(1).max(45).default(14),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const uid = ctx.user.id;

      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      since.setUTCDate(since.getUTCDate() - (input.days - 1));

      const msgDay = sql<string>`DATE(${messages.createdAt})`;

      const agg = await db
        .select({
          day: msgDay,
          count: sql<number>`cast(count(*) as signed)`.mapWith(Number),
        })
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(conversations.tenantId, tenantId),
            eq(conversations.appUserId, uid),
            gte(messages.createdAt, since)
          )
        )
        .groupBy(msgDay)
        .orderBy(asc(msgDay));

      const byDay = new Map(
        agg.map(r => [String(r.day).slice(0, 10), r.count])
      );

      const out: { day: string; count: number }[] = [];
      for (let i = 0; i < input.days; i++) {
        const d = new Date(since);
        d.setUTCDate(since.getUTCDate() + i);
        const key = d.toISOString().slice(0, 10);
        out.push({ day: key, count: byDay.get(key) ?? 0 });
      }
      return out;
    }),

  /** لوحة البيانات للمستخدم الحالي (ويب) */
  myDashboardData: protectedProcedure
    .input(z.object({ tenantId: z.string().max(128).optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const uid = ctx.user.id;

      if (!db) {
        return {
          metrics: null,
          patterns: [],
          recommendations: [],
          recentLogs: [],
          tenantId,
        };
      }

      const slice = await fetchLearningDashboardSlice(db, uid, tenantId);
      return { ...slice, tenantId };
    }),

  /** أداء النماذج المسجّل للمستخدم الحالي (ويب) */
  myModelPerformance: protectedProcedure
    .input(z.object({ tenantId: z.string().max(128).optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      return db
        .select()
        .from(modelPerformance)
        .where(
          and(
            eq(modelPerformance.telegramUserId, ctx.user.id),
            eq(modelPerformance.tenantId, tenantId)
          )
        )
        .orderBy(modelPerformance.successRate);
    }),
});
