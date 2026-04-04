import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { teamManager } from "../agents/teamManager";
import { TRPCError } from "@trpc/server";

/**
 * API endpoints لإدارة Agents
 */
export const agentRouter = router({
  /**
   * الحصول على جميع Agents
   */
  getAllAgents: publicProcedure.query(() => {
    try {
      const agents = teamManager.getAllAgents();
      return {
        success: true,
        agents: agents.map(agent => {
          const c = agent.getConfig();
          return {
            id: c.id,
            name: c.name,
            description: c.description,
            role: c.role,
            capabilities: c.capabilities,
          };
        }),
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `فشل الحصول على Agents: ${String(error)}`,
      });
    }
  }),

  /**
   * الحصول على معلومات Agent محددة
   */
  getAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(({ input }) => {
      try {
        const agent = teamManager.getAgent(input.agentId);
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Agent غير موجود: ${input.agentId}`,
          });
        }

        return {
          success: true,
          agent: agent.getInfo(),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل الحصول على معلومات Agent: ${String(error)}`,
        });
      }
    }),

  /**
   * تنفيذ مهمة من قبل Agent محددة
   */
  executeTask: protectedProcedure
    .input(
      z.object({
        agentId: z.string().max(200),
        taskDescription: z.string().max(50_000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = teamManager.getAgent(input.agentId);
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Agent غير موجود: ${input.agentId}`,
          });
        }

        const result = await agent.executeTask(input.taskDescription);

        return {
          success: true,
          task: result,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل تنفيذ المهمة: ${String(error)}`,
        });
      }
    }),

  /**
   * تنفيذ مهمة معقدة بتعاون عدة Agents
   */
  executeComplexTask: protectedProcedure
    .input(
      z.object({
        taskDescription: z.string().max(50_000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = await teamManager.executeComplexTask(
          input.taskDescription
        );

        return {
          success: true,
          results,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل تنفيذ المهمة المعقدة: ${String(error)}`,
        });
      }
    }),

  /**
   * إضافة مهمة إلى قائمة الانتظار
   */
  queueTask: protectedProcedure
    .input(
      z.object({
        taskDescription: z.string().max(50_000),
        priority: z.number().optional(),
        agentId: z.string().max(200).optional(),
      })
    )
    .mutation(({ input }) => {
      try {
        const taskId = teamManager.queueTask(
          input.taskDescription,
          input.priority || 1,
          input.agentId
        );

        return {
          success: true,
          taskId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل إضافة المهمة إلى قائمة الانتظار: ${String(error)}`,
        });
      }
    }),

  /**
   * معالجة قائمة الانتظار
   */
  processQueue: protectedProcedure.mutation(async () => {
    try {
      const results = await teamManager.processQueue();

      return {
        success: true,
        processedTasks: results.length,
        results,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `فشل معالجة قائمة الانتظار: ${String(error)}`,
      });
    }
  }),

  /**
   * الحصول على إحصائيات الفريق
   */
  getTeamStats: publicProcedure.query(() => {
    try {
      const stats = teamManager.getTeamStats();

      return {
        success: true,
        stats,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `فشل الحصول على إحصائيات الفريق: ${String(error)}`,
      });
    }
  }),

  /**
   * تحميل ذاكرة جميع Agents
   */
  loadAllMemories: protectedProcedure.mutation(async () => {
    try {
      await teamManager.loadAllMemories();

      return {
        success: true,
        message: "تم تحميل ذاكرة جميع Agents بنجاح",
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `فشل تحميل الذاكرة: ${String(error)}`,
      });
    }
  }),

  /**
   * إعادة تعيين الفريق
   */
  resetTeam: protectedProcedure.mutation(() => {
    try {
      teamManager.resetTeam();

      return {
        success: true,
        message: "تم إعادة تعيين الفريق بنجاح",
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `فشل إعادة تعيين الفريق: ${String(error)}`,
      });
    }
  }),
});
