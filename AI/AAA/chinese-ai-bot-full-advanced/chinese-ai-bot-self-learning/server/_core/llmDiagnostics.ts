import { ENV } from "./env";

export type LlmRuntimeSummary = {
  backend: string;
  custom: {
    configured: boolean;
    baseUrlHost: string | null;
    model: string | null;
  };
  openRouter: { configured: boolean };
  forge: { configured: boolean };
  ollamaCatalog: { autoProbeDisabled: boolean };
};

export function getLlmRuntimeSummary(): LlmRuntimeSummary {
  const url = ENV.customLlmBaseUrl.trim();
  let host: string | null = null;
  try {
    if (url) host = new URL(url).host;
  } catch {
    host = null;
  }
  return {
    backend: ENV.llmBackend,
    custom: {
      configured: Boolean(url && ENV.customLlmModel.trim()),
      baseUrlHost: host,
      model: ENV.customLlmModel.trim() || null,
    },
    openRouter: { configured: ENV.openRouterApiKey.trim().length > 0 },
    forge: { configured: ENV.forgeApiKey.trim().length > 0 },
    ollamaCatalog: {
      autoProbeDisabled: process.env.OLLAMA_AUTO_PROBE === "0",
    },
  };
}

export type LlmProbeResult = {
  ok: boolean;
  backend: string;
  latencyMs: number;
  error?: string;
  modelReported?: string;
};

/**
 * طلب خفيف للتحقق من اتصال مسار الـ LLM النشط (بدون تسجيل محتوى).
 */
export async function probeActiveLlm(): Promise<LlmProbeResult> {
  const started = Date.now();
  const backend = ENV.llmBackend;

  try {
    if (backend === "custom") {
      const base = ENV.customLlmBaseUrl.trim();
      const model = ENV.customLlmModel.trim();
      if (!base || !model) {
        return {
          ok: false,
          backend,
          latencyMs: 0,
          error: "CUSTOM_LLM_BASE_URL و CUSTOM_LLM_MODEL مطلوبان",
        };
      }
      let chatUrl = base;
      if (!chatUrl.includes("/chat/completions")) {
        chatUrl = `${base.replace(/\/$/, "")}/chat/completions`;
      }
      const payload = {
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 8,
      };
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      const k = ENV.customLlmApiKey.trim();
      if (k) headers.authorization = `Bearer ${k}`;

      const res = await fetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const latencyMs = Date.now() - started;
      if (!res.ok) {
        const t = await res.text();
        return {
          ok: false,
          backend,
          latencyMs,
          error: `${res.status}: ${t.slice(0, 200)}`,
        };
      }
      const data = (await res.json()) as { model?: string };
      return {
        ok: true,
        backend,
        latencyMs,
        modelReported: data.model,
      };
    }

    if (backend === "openrouter") {
      const key = ENV.openRouterApiKey.trim();
      if (!key) {
        return {
          ok: false,
          backend,
          latencyMs: 0,
          error: "OPENROUTER_API_KEY مفقود",
        };
      }
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: ENV.openRouterLlmModel.trim() || "openrouter/free",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 8,
        }),
      });
      const latencyMs = Date.now() - started;
      if (!res.ok) {
        const t = await res.text();
        return {
          ok: false,
          backend,
          latencyMs,
          error: `${res.status}: ${t.slice(0, 200)}`,
        };
      }
      const data = (await res.json()) as { model?: string };
      return {
        ok: true,
        backend,
        latencyMs,
        modelReported: data.model,
      };
    }

    const forgeKey = ENV.forgeApiKey.trim();
    if (!forgeKey) {
      return {
        ok: false,
        backend: "forge",
        latencyMs: 0,
        error: "BUILT_IN_FORGE_API_KEY مفقود",
      };
    }
    const api =
      ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
        ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
        : "https://forge.manus.im/v1/chat/completions";
    const res = await fetch(api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${forgeKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 8,
      }),
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      const t = await res.text();
      return {
        ok: false,
        backend: "forge",
        latencyMs,
        error: `${res.status}: ${t.slice(0, 200)}`,
      };
    }
    return { ok: true, backend: "forge", latencyMs };
  } catch (e) {
    return {
      ok: false,
      backend,
      latencyMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
