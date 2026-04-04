import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function parsePoolSize(raw: string | undefined, fallback: number): number {
  const n = parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : fallback;
}

/**
 * بركة اتصالات MySQL (أفضل من اتصال واحد تحت ضغط tRPC متزامن).
 * جلسة UTC على كل اتصال لتطابق DATE()/الرسوم مع `toISOString().slice(0,10)`.
 */
export async function getDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!_pool) {
    try {
      const connectionLimit = parsePoolSize(process.env.DB_POOL_SIZE, 12);
      const maxIdle = parsePoolSize(process.env.DB_POOL_MAX_IDLE, 6);

      _pool = createPool({
        uri: url,
        waitForConnections: true,
        connectionLimit,
        maxIdle,
        idleTimeout: 60_000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      _pool.on("connection", conn => {
        conn.query("SET time_zone = '+00:00'", err => {
          if (err) {
            console.warn("[Database] SET time_zone failed:", err.message);
          }
        });
      });

      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to create pool:", error);
      _pool = null;
      _db = null;
    }
  }
  return _db;
}

/** فحص سريع لقاعدة البيانات (للميزانيات والمراقبة) */
export async function pingDb(): Promise<"up" | "down" | "skipped"> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return "skipped";
  const db = await getDb();
  if (!db) return "down";
  try {
    await db.execute(sql`SELECT 1 AS _ping`);
    return "up";
  } catch {
    return "down";
  }
}

/** إغلاق البركة عند إيقاف العملية (Docker / SIGTERM) */
export async function closeDbPool(): Promise<void> {
  if (_pool) {
    const p = _pool;
    _pool = null;
    _db = null;
    await new Promise<void>((resolve, reject) => {
      p.end(err => (err ? reject(err) : resolve()));
    });
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    values.tenantId = user.tenantId ?? ENV.defaultTenantId;
    if (user.tenantId !== undefined) {
      updateSet.tenantId = user.tenantId;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (e) {
    console.error("[Database] getUserByOpenId:", e);
    return undefined;
  }
}
