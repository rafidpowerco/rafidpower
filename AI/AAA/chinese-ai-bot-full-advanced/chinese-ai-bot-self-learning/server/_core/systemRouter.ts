import { z } from "zod";
import { notifyOwner } from "./notification";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./trpc";
import { getLlmRuntimeSummary, probeActiveLlm } from "./llmDiagnostics";
import { pingDb } from "../db";
import { ENV } from "./env";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative").optional(),
      })
    )
    .query(({ input }) => {
      const now = Date.now();
      return {
        ok: true as const,
        serverTime: now,
        clientSkewMs:
          input.timestamp != null ? now - input.timestamp : undefined,
      };
    }),

  /** إعدادات مسار الـ LLM (بدون مفاتيح) */
  llmSummary: publicProcedure.query(() => getLlmRuntimeSummary()),

  /** اختبار اتصال فعلي — يتطلب تسجيل دخول (يستهلك طلباً من المزود) */
  llmProbe: protectedProcedure
    .input(z.object({ run: z.literal(true) }))
    .mutation(async () => {
      const probe = await probeActiveLlm();
      return { summary: getLlmRuntimeSummary(), probe };
    }),

  /** للمسؤول: قاعدة البيانات + ملخص LLM (بدون استهلاك طلب LLM تلقائياً) */
  healthDeep: adminProcedure.query(async () => {
    const database = await pingDb();
    return {
      timestamp: Date.now(),
      database,
      llm: getLlmRuntimeSummary(),
      runtime: {
        nodeEnv: process.env.NODE_ENV ?? "development",
        trustProxy: ENV.trustProxy,
        collectiveLearning: ENV.collectiveLearningEnabled,
        llmCouncilRounds: ENV.llmCouncilRounds,
      },
    };
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
