/**
 * تشغيل من جذر المشروع: pnpm run verify:llm
 * يتحقق من إعدادات الـ LLM ويجري ping للمسار النشط.
 */
import "dotenv/config";
import {
  getLlmRuntimeSummary,
  probeActiveLlm,
} from "../server/_core/llmDiagnostics";

async function main() {
  console.log(
    "ملخص الإعداد:\n",
    JSON.stringify(getLlmRuntimeSummary(), null, 2)
  );
  console.log("\nجارٍ اختبار الاتصال...");
  const r = await probeActiveLlm();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
