import fs from "node:fs";
import path from "node:path";

/**
 * يقرأ `local.runtime.json` أو `runtime.local.json` من جذر المشروع (مُستبعد من Git).
 * يملأ process.env فقط للمفاتيح الفارغة — `.env` له الأولوية.
 * مناسب لتجارب تليجرام/الدومين دون رفع قيم إلى GitHub.
 */
export function loadLocalRuntime(): void {
  const root = process.cwd();
  const candidates = [
    path.join(root, "local.runtime.json"),
    path.join(root, "runtime.local.json"),
  ];

  const file = candidates.find(p => fs.existsSync(p));
  if (!file) return;

  try {
    const raw = fs.readFileSync(file, "utf-8");
    const obj = JSON.parse(raw) as Record<string, unknown>;
    let n = 0;
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("_")) continue;
      const cur = process.env[k];
      if (cur !== undefined && cur !== "") continue;
      if (typeof v === "string") {
        process.env[k] = v;
        n += 1;
      } else if (typeof v === "number" || typeof v === "boolean") {
        process.env[k] = String(v);
        n += 1;
      }
    }
    if (n > 0) {
      console.log(
        `[Config] تُحمّل ${n} قيمة من ${path.basename(file)} (لا تُرفع إلى Git)`
      );
    }
  } catch (e) {
    console.warn(`[Config] تعذّر قراءة ${path.basename(file)}:`, e);
  }
}
