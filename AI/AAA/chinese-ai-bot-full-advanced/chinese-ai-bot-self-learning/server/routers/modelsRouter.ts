/**
 * Models Router
 * API endpoints لإدارة واختيار النماذج
 */

import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../_core/trpc";
import { multiSourceProvider } from "../integrations/multiSourceProvider";
import {
  smartModelSelector,
  SelectionCriteria,
} from "../integrations/smartModelSelector";
import { specializedAgentsManager } from "../agents/specializedAgents";
import { z } from "zod";

export const modelsRouter = router({
  /**
   * الحصول على جميع النماذج المتاحة
   */
  getAllModels: publicProcedure
    .input(z.object({ type: z.string().max(64).optional() }).optional())
    .query(({ input }) => {
      const models = multiSourceProvider.getAllModels(input?.type);
      return {
        total: models.length,
        models: models.map(m => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          type: m.type,
          performance: m.performance,
          speed: m.speed,
          languages: m.languages,
          capabilities: m.capabilities,
          isFree: m.isFree,
          isOpenSource: m.isOpenSource,
          localSupport: m.localSupport,
        })),
      };
    }),

  /**
   * الحصول على أفضل نموذج
   */
  getBestModel: publicProcedure
    .input(
      z.object({
        type: z.enum(["llm", "image", "audio", "video", "code", "data"]),
        priority: z.enum(["speed", "quality", "balanced", "cost"]).optional(),
        language: z.string().max(32).optional(),
        capabilities: z.array(z.string().max(128)).max(48).optional(),
      })
    )
    .query(async ({ input }) => {
      const criteria: SelectionCriteria = {
        priority: input.priority || "balanced",
        taskType: input.type,
        userLanguage: input.language || "ar",
      };

      const model = await smartModelSelector.selectBestModel(
        {
          type: input.type,
          prompt: "",
          capabilities: input.capabilities,
        },
        criteria
      );

      if (!model) {
        return { success: false, error: "لا يوجد نموذج متاح" };
      }

      return {
        success: true,
        model: {
          id: model.id,
          name: model.name,
          provider: model.provider,
          performance: model.performance,
          speed: model.speed,
          languages: model.languages,
          capabilities: model.capabilities,
          isFree: model.isFree,
          isOpenSource: model.isOpenSource,
          localSupport: model.localSupport,
        },
      };
    }),

  /**
   * الحصول على توصيات النماذج
   */
  getRecommendations: publicProcedure
    .input(
      z.object({
        type: z.enum(["llm", "image", "audio", "video", "code", "data"]),
        priority: z.enum(["speed", "quality", "balanced", "cost"]).optional(),
        language: z.string().max(32).optional(),
        capabilities: z.array(z.string().max(128)).max(48).optional(),
        count: z.number().min(1).max(10).optional(),
      })
    )
    .query(async ({ input }) => {
      const criteria: SelectionCriteria = {
        priority: input.priority || "balanced",
        taskType: input.type,
        userLanguage: input.language || "ar",
      };

      const recommendations = await smartModelSelector.getRecommendations(
        {
          type: input.type,
          prompt: "",
          capabilities: input.capabilities,
        },
        criteria,
        input.count || 3
      );

      return {
        success: true,
        recommendations: recommendations.map(r => ({
          model: {
            id: r.model.id,
            name: r.model.name,
            provider: r.model.provider,
            performance: r.model.performance,
            speed: r.model.speed,
            languages: r.model.languages,
            capabilities: r.model.capabilities,
          },
          score: r.score,
          reasons: r.reasons,
        })),
      };
    }),

  /**
   * مقارنة النماذج
   */
  compareModels: publicProcedure
    .input(
      z.object({
        modelIds: z.array(z.string().max(256)).min(2).max(5),
      })
    )
    .query(({ input }) => {
      const comparison = smartModelSelector.compareModels(input.modelIds);
      return {
        success: true,
        comparison,
      };
    }),

  /**
   * الحصول على إحصائيات الأداء
   */
  getPerformanceStats: publicProcedure.query(() => {
    const stats = smartModelSelector.getPerformanceStats();
    return {
      success: true,
      stats,
    };
  }),

  /**
   * الحصول على جميع المزودين النشطين
   */
  getActiveProviders: publicProcedure.query(() => {
    const providers = multiSourceProvider.getActiveProviders();
    return {
      success: true,
      providers: providers.map(p => ({
        name: p.name,
        type: p.type,
        isActive: p.isActive,
        priority: p.priority,
        modelCount: p.models.length,
      })),
    };
  }),

  /**
   * تفعيل/تعطيل مزود
   */
  setProviderActive: adminProcedure
    .input(
      z.object({
        providerName: z.string(),
        active: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      multiSourceProvider.setProviderActive(input.providerName, input.active);
      return {
        success: true,
        message: `تم ${input.active ? "تفعيل" : "تعطيل"} ${input.providerName}`,
      };
    }),

  /**
   * الحصول على جميع الـ Agents المتخصصة
   */
  getAllAgents: publicProcedure.query(() => {
    const agents = specializedAgentsManager.getAllAgents();
    return {
      success: true,
      agents: agents.map(a => {
        const info = a.getInfo();
        return {
          name: info.name,
          specialization: info.specialization,
          type: info.type,
          capabilities: info.capabilities,
          models: info.models,
        };
      }),
    };
  }),

  /**
   * الحصول على إحصائيات الـ Agents
   */
  getAgentsStats: publicProcedure.query(() => {
    const stats = specializedAgentsManager.getStats();
    return {
      success: true,
      stats,
    };
  }),

  /**
   * تنفيذ مهمة على Agent محدد
   */
  executeAgentTask: protectedProcedure
    .input(
      z.object({
        agentName: z.string(),
        prompt: z.string().max(50_000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const task = await specializedAgentsManager.executeTask(
          input.agentName,
          input.prompt
        );
        return {
          success: true,
          task: {
            id: task.id,
            status: task.status,
            result: task.result,
            error: task.error,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  /**
   * الحصول على حالة المهمة
   */
  getTaskStatus: protectedProcedure
    .input(z.object({ agentName: z.string(), taskId: z.string() }))
    .query(({ input }) => {
      const agent = specializedAgentsManager.getAgent(input.agentName);
      if (!agent) {
        return { success: false, error: "Agent غير موجود" };
      }

      const task = agent.getTaskStatus(input.taskId);
      if (!task) {
        return { success: false, error: "المهمة غير موجودة" };
      }

      return {
        success: true,
        task: {
          id: task.id,
          status: task.status,
          result: task.result,
          error: task.error,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
        },
      };
    }),
});
