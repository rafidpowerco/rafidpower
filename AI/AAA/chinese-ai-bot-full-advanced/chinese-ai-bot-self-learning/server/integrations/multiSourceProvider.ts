/**
 * Multi-Source AI Provider Integration
 * يدمج جميع مصادر النماذج المجانية في نظام موحد
 */

import axios from "axios";

export interface AIProvider {
  name: string;
  type: "llm" | "image" | "audio" | "video" | "code" | "data";
  models: AIModel[];
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  priority: number; // 1-10 (أعلى = أولوية أعلى)
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "llm" | "image" | "audio" | "video" | "code" | "data";
  performance: number; // 0-100
  speed: number; // 0-100 (أعلى = أسرع)
  cost: number; // 0 = مجاني
  languages: string[];
  capabilities: string[];
  maxTokens?: number;
  contextWindow?: number;
  isFree: boolean;
  isOpenSource: boolean;
  requiresAuth: boolean;
  localSupport: boolean; // يمكن تشغيله محلياً
  lastUpdated: Date;
}

export interface AIRequest {
  type: "llm" | "image" | "audio" | "video" | "code" | "data";
  prompt: string;
  modelId?: string; // إذا كان محدداً
  parameters?: Record<string, any>;
  preferredProvider?: string;
  languages?: string[];
  capabilities?: string[];
}

export interface AIResponse {
  success: boolean;
  data?: any;
  modelUsed: string;
  providerUsed: string;
  executionTime: number;
  error?: string;
}

class MultiSourceProvider {
  private providers: Map<string, AIProvider> = new Map();
  private models: Map<string, AIModel> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // OpenRouter - أفضل مصدر موحد
    this.addProvider({
      name: "OpenRouter",
      type: "llm",
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      isActive: true,
      priority: 10,
      models: [
        {
          id: "deepseek-v3.2",
          name: "DeepSeek V3.2",
          provider: "OpenRouter",
          type: "llm",
          performance: 90,
          speed: 85,
          cost: 0,
          languages: ["en", "zh", "ar"],
          capabilities: ["coding", "reasoning", "analysis"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
        {
          id: "qwen3.6-plus",
          name: "Qwen 3.6 Plus",
          provider: "OpenRouter",
          type: "llm",
          performance: 89,
          speed: 80,
          cost: 0,
          languages: ["en", "zh", "ar"],
          capabilities: ["coding", "reasoning", "analysis"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
        {
          id: "mistral-7b",
          name: "Mistral 7B",
          provider: "OpenRouter",
          type: "llm",
          performance: 75,
          speed: 90,
          cost: 0,
          languages: ["en", "fr"],
          capabilities: ["coding", "reasoning"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
        // موجه يختار تلقائياً من مجموعة النماذج المجانية (أوزان مفتوحة غالباً) — راجع https://openrouter.ai/models?pricing=free
        {
          id: "openrouter/free",
          name: "OpenRouter Free Router",
          provider: "OpenRouter",
          type: "llm",
          performance: 82,
          speed: 75,
          cost: 0,
          languages: ["en", "ar", "zh", "fr"],
          capabilities: ["coding", "reasoning", "analysis"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: false,
          lastUpdated: new Date(),
        },
        {
          id: "meta-llama/llama-3.3-70b-instruct:free",
          name: "Llama 3.3 70B (free)",
          provider: "OpenRouter",
          type: "llm",
          performance: 88,
          speed: 72,
          cost: 0,
          languages: ["en", "ar"],
          capabilities: ["coding", "reasoning", "analysis"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
        {
          id: "google/gemma-3-4b-it:free",
          name: "Gemma 3 4B IT (free)",
          provider: "OpenRouter",
          type: "llm",
          performance: 70,
          speed: 88,
          cost: 0,
          languages: ["en"],
          capabilities: ["reasoning"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
      ],
    });

    // Hugging Face - مستودع النماذج
    this.addProvider({
      name: "Hugging Face",
      type: "llm",
      baseUrl: "https://api-inference.huggingface.co",
      apiKey: process.env.HUGGING_FACE_API_KEY,
      isActive: true,
      priority: 9,
      models: [
        {
          id: "meta-llama/Llama-3.2",
          name: "Llama 3.2",
          provider: "Hugging Face",
          type: "llm",
          performance: 85,
          speed: 80,
          cost: 0,
          languages: ["en", "ar"],
          capabilities: ["coding", "reasoning"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
      ],
    });

    // Ollama - للتشغيل المحلي
    this.addProvider({
      name: "Ollama",
      type: "llm",
      baseUrl: "http://localhost:11434",
      isActive: false, // تفعيل عند التثبيت
      priority: 8,
      models: [
        {
          id: "deepseek-coder",
          name: "DeepSeek Coder",
          provider: "Ollama",
          type: "code",
          performance: 90,
          speed: 75,
          cost: 0,
          languages: ["en"],
          capabilities: ["coding"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: false,
          localSupport: true,
          lastUpdated: new Date(),
        },
      ],
    });

    // Replicate - لنماذج متقدمة
    this.addProvider({
      name: "Replicate",
      type: "image",
      baseUrl: "https://api.replicate.com/v1",
      apiKey: process.env.REPLICATE_API_KEY,
      isActive: false,
      priority: 7,
      models: [
        {
          id: "stability-ai/stable-diffusion-3",
          name: "Stable Diffusion 3",
          provider: "Replicate",
          type: "image",
          performance: 90,
          speed: 70,
          cost: 0,
          languages: ["en"],
          capabilities: ["image-generation"],
          isFree: true,
          isOpenSource: true,
          requiresAuth: true,
          localSupport: true,
          lastUpdated: new Date(),
        },
      ],
    });

    // Together AI - نماذج متعددة
    this.addProvider({
      name: "Together AI",
      type: "llm",
      baseUrl: "https://api.together.xyz",
      apiKey: process.env.TOGETHER_API_KEY,
      isActive: false,
      priority: 6,
      models: [],
    });

    // Groq - نماذج سريعة جداً
    this.addProvider({
      name: "Groq",
      type: "llm",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      isActive: false,
      priority: 5,
      models: [],
    });
  }

  private addProvider(provider: AIProvider) {
    this.providers.set(provider.name, provider);
    provider.models.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  /**
   * الحصول على أفضل نموذج متاح
   */
  async getBestModel(request: AIRequest): Promise<AIModel | null> {
    const candidates = Array.from(this.models.values()).filter(model => {
      // تصفية حسب النوع
      if (model.type !== request.type) return false;

      // تصفية حسب اللغات المطلوبة
      if (
        request.languages &&
        !request.languages.some(lang => model.languages.includes(lang))
      ) {
        return false;
      }

      // تصفية حسب القدرات المطلوبة
      if (
        request.capabilities &&
        !request.capabilities.some(cap => model.capabilities.includes(cap))
      ) {
        return false;
      }

      // التأكد من أن المزود نشط
      const provider = this.providers.get(model.provider);
      if (!provider || !provider.isActive) return false;

      return true;
    });

    if (candidates.length === 0) return null;

    // ترتيب حسب الأداء والسرعة
    candidates.sort((a, b) => {
      const providerA = this.providers.get(a.provider)!;
      const providerB = this.providers.get(b.provider)!;

      // الأولوية أولاً
      if (providerA.priority !== providerB.priority) {
        return providerB.priority - providerA.priority;
      }

      // ثم الأداء
      if (a.performance !== b.performance) {
        return b.performance - a.performance;
      }

      // ثم السرعة
      return b.speed - a.speed;
    });

    return candidates[0];
  }

  /**
   * تنفيذ طلب على نموذج
   */
  async executeRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const model = request.modelId
        ? this.models.get(request.modelId)
        : await this.getBestModel(request);

      if (!model) {
        return {
          success: false,
          modelUsed: "unknown",
          providerUsed: "unknown",
          executionTime: Date.now() - startTime,
          error: "لا يوجد نموذج متاح",
        };
      }

      const provider = this.providers.get(model.provider);
      if (!provider) {
        return {
          success: false,
          modelUsed: model.id,
          providerUsed: model.provider,
          executionTime: Date.now() - startTime,
          error: "المزود غير متاح",
        };
      }

      // تنفيذ الطلب حسب نوع المزود
      let response;
      if (model.provider === "OpenRouter") {
        response = await this.executeOpenRouterRequest(model, request);
      } else if (model.provider === "Ollama") {
        response = await this.executeOllamaRequest(model, request);
      } else if (model.provider === "Hugging Face") {
        response = await this.executeHuggingFaceRequest(model, request);
      } else {
        throw new Error(`مزود غير مدعوم: ${model.provider}`);
      }

      return {
        success: true,
        data: response,
        modelUsed: model.id,
        providerUsed: model.provider,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        modelUsed: "unknown",
        providerUsed: "unknown",
        executionTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private async executeOpenRouterRequest(
    model: AIModel,
    request: AIRequest
  ): Promise<any> {
    const provider = this.providers.get("OpenRouter")!;
    const response = await axios.post(
      `${provider.baseUrl}/chat/completions`,
      {
        model: model.id,
        messages: [{ role: "user", content: request.prompt }],
        ...request.parameters,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  private async executeOllamaRequest(
    model: AIModel,
    request: AIRequest
  ): Promise<any> {
    const provider = this.providers.get("Ollama")!;
    const response = await axios.post(`${provider.baseUrl}/api/generate`, {
      model: model.id,
      prompt: request.prompt,
      stream: false,
      ...request.parameters,
    });
    return response.data;
  }

  private async executeHuggingFaceRequest(
    model: AIModel,
    request: AIRequest
  ): Promise<any> {
    const provider = this.providers.get("Hugging Face")!;
    const response = await axios.post(
      `${provider.baseUrl}/models/${model.id}`,
      { inputs: request.prompt },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
        },
      }
    );
    return response.data;
  }

  /**
   * الحصول على قائمة جميع النماذج المتاحة
   */
  getAllModels(type?: string): AIModel[] {
    return Array.from(this.models.values()).filter(model => {
      if (type && model.type !== type) return false;
      const provider = this.providers.get(model.provider);
      return provider && provider.isActive;
    });
  }

  /**
   * الحصول على قائمة المزودين النشطين
   */
  getActiveProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  /**
   * تفعيل/تعطيل مزود
   */
  setProviderActive(providerName: string, active: boolean) {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.isActive = active;
    }
  }

  /**
   * اختبار وجود Ollama على الجهاز وتفعيل المزود تلقائياً (عطّل بـ OLLAMA_AUTO_PROBE=0).
   */
  async probeLocalOllama(): Promise<boolean> {
    if (process.env.OLLAMA_AUTO_PROBE === "0") return false;
    const base =
      process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ??
      "http://127.0.0.1:11434";
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 2000);
      const res = await fetch(`${base}/api/tags`, { signal: ac.signal });
      clearTimeout(t);
      if (!res.ok) return false;
      const ollama = this.providers.get("Ollama");
      if (ollama) {
        ollama.baseUrl = base;
        ollama.isActive = true;
      }
      console.log("[Ollama] متاح محلياً — تم تفعيل مزود Ollama في الكتالوج");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * إضافة نموذج مخصص
   */
  addCustomModel(model: AIModel) {
    this.models.set(model.id, model);
  }
}

export const multiSourceProvider = new MultiSourceProvider();
