export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  /**
   * forge | openrouter | custom
   * custom = خادمك (Ollama ‎/v1، vLLM، LM Studio، أي OpenAI-compatible بعد ضبط النموذج)
   */
  llmBackend: (process.env.LLM_BACKEND ?? "forge").toLowerCase(),
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  /** مثال: openrouter/free أو meta-llama/llama-3.3-70b-instruct:free */
  openRouterLlmModel: process.env.OPENROUTER_LLM_MODEL ?? "openrouter/free",
  /** قاعدة URL: مثال http://127.0.0.1:11434/v1 أو عنوان خادمك */
  customLlmBaseUrl: process.env.CUSTOM_LLM_BASE_URL ?? "",
  customLlmApiKey: process.env.CUSTOM_LLM_API_KEY ?? "",
  /** اسم النموذج كما يراه الخادم: مثال mistral:latest أو مسار نموذجك */
  customLlmModel: process.env.CUSTOM_LLM_MODEL ?? "",
  customLlmMaxTokens: parseInt(process.env.CUSTOM_LLM_MAX_TOKENS ?? "8192", 10),
  /** مرحلة 1 — تعدد عملاء لاحقاً: المعرّف الافتراضي للمستأجر */
  defaultTenantId: process.env.DEFAULT_TENANT_ID ?? "default",
  /**
   * عنوان الاستماع: 0.0.0.0 للوصول من الشبكة المحلية أو عبر الدومين خلف nginx.
   * للتشغيل المحلي المعزول فقط: HOST=127.0.0.1
   */
  bindHost: (process.env.HOST ?? "0.0.0.0").trim() || "0.0.0.0",
  /** عنوانك العلني (اختياري) — للتذكير في السجلات؛ OAuth يستخدم origin المتصفح تلقائياً */
  publicAppUrl: (process.env.PUBLIC_APP_URL ?? "").trim(),
  /** خلف nginx/caddy مع X-Forwarded-For — ضع 1 ليثق Express بالوكيل */
  trustProxy:
    process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true",
  /** حقن مقتطفات المعرفة في المنسق (عطّل بـ KNOWLEDGE_RAG=0) */
  knowledgeRagEnabled:
    process.env.KNOWLEDGE_RAG !== "0" && process.env.KNOWLEDGE_RAG !== "false",
  /**
   * إن وُجد، تتطلب مسارات bot التراثية (processMessage، executeCode، …) الرأس:
   * `x-internal-bot-secret: <نفس القيمة>`
   */
  internalBotApiSecret: (process.env.INTERNAL_BOT_API_SECRET ?? "").trim(),

  /**
   * تعلّم جماعي مجمّع لكل مستأجر (جدول collective_pattern_stats).
   * عطّل بـ COLLECTIVE_LEARNING=0 إن لم تُرِد تخزين إحصاءات عبر العملاء.
   */
  collectiveLearningEnabled:
    process.env.COLLECTIVE_LEARNING !== "0" &&
    process.env.COLLECTIVE_LEARNING !== "false",

  /**
   * عدد مرات استدعاء LLM بالتسلسل (1 = المعتاد فقط). يتطلب نماذج في LLM_COUNCIL_MODELS.
   * مثال: 3 مع نموذجين = مسودة + مراجعان. يزيد التكلفة والزمن.
   */
  llmCouncilRounds: Math.min(
    5,
    Math.max(1, parseInt(process.env.LLM_COUNCIL_ROUNDS ?? "1", 10) || 1)
  ),
  /** معرفات OpenRouter أو أسماء نماذج على خادمك (مفصولة بفواصل) لمراحل المجلس */
  llmCouncilModels: (process.env.LLM_COUNCIL_MODELS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),

  /** ضغط gzip لاستجابات Express في الإنتاج — عطّل بـ COMPRESSION=0 */
  compressionEnabled:
    process.env.COMPRESSION !== "0" && process.env.COMPRESSION !== "false",

  /**
   * إعادة محاولة fetch لـ LLM عند 429 / 502 / 503 / 504 أو فشل شبكة (0 = بدون إعادة).
   */
  llmFetchMaxRetries: (() => {
    const raw = process.env.LLM_FETCH_MAX_RETRIES;
    if (raw === undefined || raw === "") return 2;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return 2;
    return Math.min(8, Math.max(0, n));
  })(),
  llmFetchRetryBaseMs: (() => {
    const raw = process.env.LLM_FETCH_RETRY_BASE_MS;
    if (raw === undefined || raw === "") return 750;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return 750;
    return Math.min(20_000, Math.max(50, n));
  })(),
};
