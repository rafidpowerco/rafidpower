import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** يطابق X-Request-Id — مفيد للسجلات داخل الإجراءات */
  requestId?: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("JWT_SECRET")) {
      console.warn("[Auth] authenticateRequest:", msg);
    }
    user = null;
  }

  const requestId =
    typeof opts.res.locals.requestId === "string"
      ? opts.res.locals.requestId
      : undefined;

  return {
    req: opts.req,
    res: opts.res,
    user,
    requestId,
  };
}
