import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeBot } from "../bot";
import { createApiRateLimiter } from "./rateLimit";
import { multiSourceProvider } from "../integrations/multiSourceProvider";
import { ENV } from "./env";
import { loadLocalRuntime } from "./loadLocalRuntime";
import { installCoreHttpGuards } from "./securityMiddleware";

loadLocalRuntime();

function maybeStartTelegramBot(): void {
  if (process.env.TELEGRAM_BOT_DISABLED === "1") return;
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  void initializeBot().catch(err => console.error("[Telegram bot]", err));
}

function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(
  startPort: number = 3000,
  host: string
): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  if (ENV.isProduction && !ENV.internalBotApiSecret) {
    console.warn(
      "[Security] الإنتاج: فضّل ضبط INTERNAL_BOT_API_SECRET لحماية مسارات bot التراثية (processMessage، executeCode، …) عبر الرأس x-internal-bot-secret."
    );
  }
  if (ENV.isProduction && !ENV.cookieSecret?.trim()) {
    console.error(
      "[Security] الإنتاج: JWT_SECRET غير مضبوط — الجلسات غير آمنة أو معطّلة."
    );
  }
  if (ENV.isProduction && !ENV.trustProxy) {
    console.warn(
      "[Deploy] التطبيق في وضع الإنتاج بدون TRUST_PROXY=1. إن كان خلف nginx أو Caddy، عيّن TRUST_PROXY=1 — وإلا يُعامل كل الزوار كعنوان IP واحد فيحد المعدل (429) وقد تفشل الجلسات. انظر docs/DEPLOY_DOMAIN_AR.md"
    );
  }

  if (process.env.RUN_MIGRATIONS_ON_START === "1") {
    try {
      const { runMigrationsOnStart } = await import("./runMigrationsOnStart");
      await runMigrationsOnStart();
    } catch (e) {
      console.error("[DB] فشل الترحيل عند الإقلاع:", e);
      throw e;
    }
  }

  const app = express();
  if (ENV.trustProxy) {
    app.set("trust proxy", 1);
  }

  installCoreHttpGuards(app);

  if (ENV.isProduction && ENV.compressionEnabled) {
    const compression = (await import("compression")).default;
    app.use(compression({ threshold: 1024 }));
  }

  const corsOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (corsOrigins.length > 0) {
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin && corsOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS"
        );
        const reqHdrs = req.headers["access-control-request-headers"];
        res.setHeader(
          "Access-Control-Allow-Headers",
          typeof reqHdrs === "string" ? reqHdrs : "Content-Type, Authorization"
        );
      }
      if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
      }
      next();
    });
  }

  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  const healthJson: express.RequestHandler = async (_req, res) => {
    const { pingDb } = await import("../db");
    const database = await pingDb();
    const hasUrl = Boolean(process.env.DATABASE_URL?.trim());
    const degraded = hasUrl && database === "down";
    const requestId =
      typeof res.locals.requestId === "string"
        ? res.locals.requestId
        : undefined;
    res
      .status(degraded ? 503 : 200)
      .type("application/json")
      .json({
        status: degraded ? "degraded" : "ok",
        uptimeSec: Math.round(process.uptime()),
        database,
        timestamp: Date.now(),
        requestId,
      });
  };
  app.get("/health", healthJson);
  app.get("/api/health", healthJson);

  void multiSourceProvider.probeLocalOllama().catch(() => {});

  const apiRateLimit = createApiRateLimiter();
  // tRPC API
  app.use(
    "/api/trpc",
    apiRateLimit,
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ error, path, type, req }) {
        const rid = req.res?.locals?.requestId;
        const requestId = typeof rid === "string" ? rid : "—";
        const detail =
          error.cause instanceof Error
            ? error.cause.message
            : error.cause != null
              ? String(error.cause)
              : error.message;
        console.error(
          `[tRPC] ${type} ${path ?? "?"} code=${error.code} requestId=${requestId}`,
          detail
        );
      },
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const host = ENV.bindHost;
  const port = await findAvailablePort(preferredPort, host);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}/`);
    if (host === "0.0.0.0") {
      console.log(`  → من هذا الجهاز: http://localhost:${port}/`);
    }
    if (ENV.publicAppUrl) {
      console.log(`  → عنوانك العلني (OAuth/دومين): ${ENV.publicAppUrl}`);
    }
    maybeStartTelegramBot();
  });

  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} — إغلاق بركة قاعدة البيانات…`);
    try {
      const { closeDbPool } = await import("../db");
      await closeDbPool();
    } catch {
      /* ignore */
    }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10_000).unref();
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

startServer().catch(console.error);
