import type { Request, Response, NextFunction } from "express";
import { ENV } from "./env";

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

let lastBucketPrune = 0;
const PRUNE_INTERVAL_MS = 120_000;
/** يمنع نمو الذاكرة عند ضربات عشوائية كثيرة لعناوين مختلفة */
const MAX_BUCKETS = 50_000;

function pruneStaleBuckets(now: number, windowMs: number) {
  if (now - lastBucketPrune < PRUNE_INTERVAL_MS) return;
  lastBucketPrune = now;
  const ttl = windowMs * 2;
  for (const [k, b] of buckets) {
    if (now - b.windowStart > ttl) buckets.delete(k);
  }
}

function enforceBucketCap() {
  if (buckets.size <= MAX_BUCKETS) return;
  const overflow = buckets.size - MAX_BUCKETS + 2_000;
  let removed = 0;
  for (const k of buckets.keys()) {
    buckets.delete(k);
    removed += 1;
    if (removed >= overflow) break;
  }
}

function clientKey(req: Request): string {
  if (ENV.trustProxy) {
    const xf = req.headers["x-forwarded-for"];
    const fromHeader =
      typeof xf === "string" ? xf.split(",")[0]?.trim() : undefined;
    if (fromHeader) return fromHeader;
  }
  return (
    req.socket.remoteAddress ||
    (req as Request & { ip?: string }).ip ||
    "unknown"
  );
}

/**
 * حد بسيط لطلبات API (نافذة زمنية ثابتة). عطّل بـ API_RATE_LIMIT_PER_MINUTE=0
 */
export function createApiRateLimiter() {
  const max = Math.max(
    0,
    parseInt(process.env.API_RATE_LIMIT_PER_MINUTE ?? "120", 10) || 0
  );
  const windowMs = 60_000;

  return (req: Request, res: Response, next: NextFunction) => {
    if (max <= 0) {
      next();
      return;
    }
    const key = clientKey(req);
    const now = Date.now();
    pruneStaleBuckets(now, windowMs);
    let b = buckets.get(key);
    if (!b || now - b.windowStart >= windowMs) {
      const isNewKey = !buckets.has(key);
      b = { count: 0, windowStart: now };
      buckets.set(key, b);
      if (isNewKey) enforceBucketCap();
    }
    b.count += 1;
    if (b.count > max) {
      res.status(429).json({
        error: "Too many requests",
        message: "تجاوزت الحد المسموح من الطلبات. حاول لاحقاً.",
      });
      return;
    }
    next();
  };
}
