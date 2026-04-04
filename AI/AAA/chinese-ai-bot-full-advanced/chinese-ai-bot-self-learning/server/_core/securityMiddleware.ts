import type { Express, RequestHandler } from "express";
import { nanoid } from "nanoid";

/** يمرّر العميل أو يُولَّد — مفيد للسجلات والمراقبة */
export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  const raw =
    typeof incoming === "string"
      ? incoming.trim().slice(0, 128)
      : Array.isArray(incoming)
        ? incoming[0]?.trim().slice(0, 128)
        : "";
  const id = raw.length > 0 ? raw : nanoid(12);
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};

/** رؤوس أمان أساسية بدون تعطيل Vite/HMR */
export const securityHeadersMiddleware: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  next();
};

export function installCoreHttpGuards(app: Express): void {
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
}
