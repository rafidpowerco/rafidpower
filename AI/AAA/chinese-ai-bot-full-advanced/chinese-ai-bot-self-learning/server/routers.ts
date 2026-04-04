import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { botRouter } from "./routers/botRouter";
import { agentRouter } from "./routers/agentRouter";
import { modelsRouter } from "./routers/modelsRouter";
import { knowledgeRouter } from "./routers/knowledgeRouter";
import { feedbackRouter } from "./routers/feedbackRouter";

export const appRouter = router({
  system: systemRouter,
  bot: botRouter,
  agent: agentRouter,
  models: modelsRouter,
  knowledge: knowledgeRouter,
  feedback: feedbackRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
