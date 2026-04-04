import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

const JOURNAL = path.join("meta", "_journal.json");

function isDrizzleMigrationsRoot(dir: string): boolean {
  return fs.existsSync(path.join(dir, JOURNAL));
}

/**
 * يحدد مجلد ترحيلات Drizzle: متغير بيئة، ثم cwd، ثم مسارات شائعة (tsx من المصدر أو bundle في dist/).
 */
export function resolveMigrationsFolder(): string {
  const fromEnv = process.env.DRIZZLE_MIGRATIONS_FOLDER?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }

  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(process.cwd(), "drizzle"),
    path.join(thisDir, "..", "..", "drizzle"),
    path.join(thisDir, "..", "drizzle"),
  ];

  for (const dir of candidates) {
    const resolved = path.resolve(dir);
    if (isDrizzleMigrationsRoot(resolved)) {
      return resolved;
    }
  }

  return path.resolve(path.join(process.cwd(), "drizzle"));
}

/**
 * يطبّق ملفات SQL في مجلد drizzle/ (جدول __drizzle_migrations).
 * فعّل بـ RUN_MIGRATIONS_ON_START=1 (مثلاً في Docker).
 */
export async function runMigrationsOnStart(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) {
    console.warn("[DB] RUN_MIGRATIONS_ON_START: لا يوجد DATABASE_URL");
    return;
  }

  const folder = resolveMigrationsFolder();
  if (!isDrizzleMigrationsRoot(folder)) {
    throw new Error(
      `[DB] مجلد ترحيلات Drizzle غير صالح أو غير موجود: ${folder} (توقع ${JOURNAL}). عيّن DRIZZLE_MIGRATIONS_FOLDER أو شغّل من جذر المشروع.`
    );
  }

  const connection = await mysql.createConnection(url);
  const started = Date.now();
  try {
    const db = drizzle(connection);
    await migrate(db, { migrationsFolder: folder });
    console.log(
      `[DB] تم تطبيق ترحيلات Drizzle (${Math.round(Date.now() - started)} ms) من`,
      folder
    );
  } finally {
    await connection.end();
  }
}
