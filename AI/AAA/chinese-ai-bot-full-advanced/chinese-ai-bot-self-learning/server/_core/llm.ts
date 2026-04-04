import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?:
      | "audio/mpeg"
      | "audio/wav"
      | "application/pdf"
      | "audio/mp4"
      | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  /** تخطي النموذج الافتراضي (OpenRouter / خادمك / جلسات المجلس متعددة النماذج) */
  model?: string;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/** Normalize LLM assistant message content to a single string for DB/UI. */
export function stringifyAssistantContent(
  content:
    | string
    | Array<TextContent | ImageContent | FileContent>
    | undefined
    | null
): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  return content
    .map(part => {
      if (typeof part === "string") return part;
      if (part.type === "text") return part.text;
      return JSON.stringify(part);
    })
    .join("\n");
}

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

function isRetriableHttpStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

/** إعادة محاولة عند أخطاء عابرة من البوابة أو الشبكة */
async function fetchWithTransientRetry(
  url: string,
  init: RequestInit,
  maxRetries: number,
  baseDelayMs: number
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;
      const canRetry =
        isRetriableHttpStatus(response.status) && attempt < maxRetries;
      if (!canRetry) return response;
    } catch (e) {
      lastError = e;
      if (attempt >= maxRetries) throw e;
    }
    const delay = baseDelayMs * Math.pow(2, attempt);
    await new Promise(r => setTimeout(r, delay));
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

const canUseOpenRouter = () => ENV.openRouterApiKey.trim().length > 0;

const allowOpenRouterFallback = () =>
  process.env.LLM_FALLBACK_OPENROUTER !== "0" && canUseOpenRouter();

type BuiltInvokeParts = {
  messages: Message[];
  tools?: Tool[];
  normalizedToolChoice: ReturnType<typeof normalizeToolChoice>;
  normalizedResponseFormat: ReturnType<typeof normalizeResponseFormat>;
  modelOverride?: string;
};

function resolveCustomChatCompletionsUrl(): string {
  const raw = ENV.customLlmBaseUrl.trim();
  if (!raw) {
    throw new Error("CUSTOM_LLM_BASE_URL مطلوب عند LLM_BACKEND=custom");
  }
  if (raw.includes("/chat/completions")) {
    return raw;
  }
  return `${raw.replace(/\/$/, "")}/chat/completions`;
}

/**
 * خادمك الخاص (Ollama OpenAI API، vLLM، LiteLLM، خادم بعد fine-tune بنشر OpenAI-compatible).
 */
async function invokeCustomOpenAICompatible(
  parts: BuiltInvokeParts
): Promise<InvokeResult> {
  const model = parts.modelOverride?.trim() || ENV.customLlmModel.trim();
  if (!model) {
    throw new Error("CUSTOM_LLM_MODEL مطلوب عند LLM_BACKEND=custom");
  }

  const { messages, tools, normalizedToolChoice, normalizedResponseFormat } =
    parts;

  const url = resolveCustomChatCompletionsUrl();
  const maxTok = Number.isFinite(ENV.customLlmMaxTokens)
    ? Math.min(Math.max(ENV.customLlmMaxTokens, 256), 128000)
    : 8192;

  const payload: Record<string, unknown> = {
    model,
    messages: messages.map(normalizeMessage),
    max_tokens: maxTok,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const key = ENV.customLlmApiKey.trim();
  if (key) {
    headers.authorization = `Bearer ${key}`;
  }

  const response = await fetchWithTransientRetry(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    ENV.llmFetchMaxRetries,
    ENV.llmFetchRetryBaseMs
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed (custom): ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

async function invokeOpenRouter(
  parts: BuiltInvokeParts
): Promise<InvokeResult> {
  const key = ENV.openRouterApiKey.trim();
  if (!key) {
    throw new Error("OPENROUTER_API_KEY غير مضبوط");
  }

  const { messages, tools, normalizedToolChoice, normalizedResponseFormat } =
    parts;

  const payload: Record<string, unknown> = {
    model:
      parts.modelOverride?.trim() ||
      ENV.openRouterLlmModel.trim() ||
      "openrouter/free",
    messages: messages.map(normalizeMessage),
    max_tokens: 8192,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetchWithTransientRetry(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "",
        "X-Title":
          process.env.OPENROUTER_APP_TITLE ?? "chinese-ai-bot-self-learning",
      },
      body: JSON.stringify(payload),
    },
    ENV.llmFetchMaxRetries,
    ENV.llmFetchRetryBaseMs
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed (OpenRouter): ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
  } = params;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );

  const modelOverride = model?.trim() || undefined;

  const parts: BuiltInvokeParts = {
    messages,
    tools,
    normalizedToolChoice,
    normalizedResponseFormat,
    modelOverride,
  };

  if (modelOverride && ENV.llmBackend === "forge" && canUseOpenRouter()) {
    return invokeOpenRouter(parts);
  }

  if (modelOverride && ENV.llmBackend === "forge" && !canUseOpenRouter()) {
    console.warn(
      "[LLM] model= مُتجاهل: أضف OPENROUTER_API_KEY لاستخدام نماذج مختلفة مع Forge"
    );
  }

  if (ENV.llmBackend === "custom") {
    try {
      return await invokeCustomOpenAICompatible(parts);
    } catch (err) {
      if (!allowOpenRouterFallback()) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[LLM] فشل الخادم المخصص — التحويل إلى OpenRouter:", msg);
      return invokeOpenRouter(parts);
    }
  }

  if (ENV.llmBackend === "openrouter") {
    return invokeOpenRouter(parts);
  }

  const forgeKey = ENV.forgeApiKey?.trim();
  if (!forgeKey) {
    if (canUseOpenRouter()) {
      console.warn(
        "[LLM] BUILT_IN_FORGE_API_KEY غير مضبوط — استخدام OpenRouter"
      );
      return invokeOpenRouter(parts);
    }
    throw new Error(
      "ضبط BUILT_IN_FORGE_API_KEY أو OPENROUTER_API_KEY (أو LLM_BACKEND=openrouter)"
    );
  }

  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage),
    max_tokens: 32768,
    thinking: { budget_tokens: 128 },
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const tryForge = async (): Promise<InvokeResult> => {
    const response = await fetchWithTransientRetry(
      resolveApiUrl(),
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${forgeKey}`,
        },
        body: JSON.stringify(payload),
      },
      ENV.llmFetchMaxRetries,
      ENV.llmFetchRetryBaseMs
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `LLM invoke failed (Forge): ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    return (await response.json()) as InvokeResult;
  };

  try {
    return await tryForge();
  } catch (err) {
    if (!allowOpenRouterFallback()) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[LLM] فشل Forge — التحويل إلى OpenRouter:", msg);
    return invokeOpenRouter(parts);
  }
}
