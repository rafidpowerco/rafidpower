import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/** حماية اختيارية لمسارات bot التراثية عبر INTERNAL_BOT_API_SECRET */
const internalBotApiGate = t.middleware(async ({ ctx, next }) => {
  const secret = ENV.internalBotApiSecret;
  if (!secret) return next();
  const h = ctx.req.headers["x-internal-bot-secret"];
  if (typeof h !== "string" || h !== secret) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message:
        "مسار داخلي محمي: أضف الرأس x-internal-bot-secret أو أزل INTERNAL_BOT_API_SECRET من الخادم للتطوير فقط.",
    });
  }
  return next();
});

export const botLegacyProcedure = t.procedure.use(internalBotApiGate);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
