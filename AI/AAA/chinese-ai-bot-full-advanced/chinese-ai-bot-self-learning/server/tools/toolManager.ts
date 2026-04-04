/**
 * Tool Manager - إدارة الأدوات والنماذج المتاحة
 * يدير جميع الأدوات والنماذج المتاحة ويختار الأداة المناسبة لكل مهمة
 */

import { TRPCError } from "@trpc/server";

// تعريف أنواع الأدوات
export type ToolType =
  | "llm"
  | "image_generation"
  | "image_analysis"
  | "video_generation"
  | "audio_processing"
  | "code_execution"
  | "data_analysis"
  | "web_scraping"
  | "file_processing";

// تعريف أنواع المهام
export type TaskType =
  | "text_generation"
  | "code_generation"
  | "image_generation"
  | "image_analysis"
  | "video_generation"
  | "speech_to_text"
  | "text_to_speech"
  | "data_analysis"
  | "web_scraping"
  | "code_execution"
  | "general_qa"
  | "creative_writing"
  | "translation"
  | "summarization";

// تعريف الأداة
export interface Tool {
  id: string;
  name: string;
  type: ToolType;
  provider: string;
  description: string;
  capabilities: string[];
  isAvailable: boolean;
  isLocal: boolean;
  apiKey?: string;
  baseUrl?: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  costPerRequest: number;
  averageResponseTime: number;
  successRate: number;
  lastUsed?: Date;
  metadata?: Record<string, any>;
}

// مصفوفة قدرات الأدوات
const TOOL_CAPABILITY_MATRIX: Record<TaskType, string[]> = {
  text_generation: [
    "openrouter_qwen",
    "openrouter_llama",
    "google_gemini",
    "mistral_api",
    "ollama_local",
  ],
  code_generation: [
    "openrouter_qwen_coder",
    "openrouter_llama_code",
    "google_gemini",
    "ollama_local",
  ],
  image_generation: [
    "stable_diffusion",
    "dall_e_api",
    "flux_api",
    "leonardo_ai",
  ],
  image_analysis: ["google_gemini_vision", "openrouter_llava", "clip_model"],
  video_generation: ["ovi_model", "stable_video", "modelscope_video"],
  speech_to_text: ["whisper_openai", "whisper_local"],
  text_to_speech: ["bark_model", "coqui_tts", "fastSpeech"],
  data_analysis: ["pandas_python", "numpy_python", "scikit_learn"],
  web_scraping: ["beautifulsoup_python", "selenium_python"],
  code_execution: ["e2b_sandbox", "local_python", "local_nodejs"],
  general_qa: [
    "openrouter_qwen",
    "google_gemini",
    "mistral_api",
    "ollama_local",
  ],
  creative_writing: ["openrouter_qwen", "openrouter_llama", "google_gemini"],
  translation: ["openrouter_qwen", "google_gemini", "mistral_api"],
  summarization: ["openrouter_qwen", "google_gemini", "openrouter_llama"],
};

// قائمة الأدوات المتاحة
const AVAILABLE_TOOLS: Record<string, Tool> = {
  // LLM Tools
  openrouter_qwen: {
    id: "openrouter_qwen",
    name: "Qwen3.6 Plus",
    type: "llm",
    provider: "OpenRouter",
    description: "نموذج Qwen المتقدم مع 1M context window",
    capabilities: [
      "text_generation",
      "code_generation",
      "reasoning",
      "multimodal",
    ],
    isAvailable: true,
    isLocal: false,
    baseUrl: "https://openrouter.ai/api/v1",
    rateLimit: { requestsPerMinute: 20, requestsPerDay: 200 },
    costPerRequest: 0,
    averageResponseTime: 2000,
    successRate: 0.95,
  },

  openrouter_llama: {
    id: "openrouter_llama",
    name: "Llama 3.3 70B",
    type: "llm",
    provider: "OpenRouter",
    description: "Meta's Llama 3.3 70B model",
    capabilities: ["text_generation", "code_generation", "reasoning"],
    isAvailable: true,
    isLocal: false,
    baseUrl: "https://openrouter.ai/api/v1",
    rateLimit: { requestsPerMinute: 20, requestsPerDay: 200 },
    costPerRequest: 0,
    averageResponseTime: 2500,
    successRate: 0.93,
  },

  google_gemini: {
    id: "google_gemini",
    name: "Gemini 2.0 Flash",
    type: "llm",
    provider: "Google",
    description: "Google's Gemini 2.0 Flash model",
    capabilities: [
      "text_generation",
      "image_analysis",
      "multimodal",
      "reasoning",
    ],
    isAvailable: true,
    isLocal: false,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    rateLimit: { requestsPerMinute: 1000, requestsPerDay: 1500 },
    costPerRequest: 0,
    averageResponseTime: 1500,
    successRate: 0.96,
  },

  mistral_api: {
    id: "mistral_api",
    name: "Mistral Large",
    type: "llm",
    provider: "Mistral",
    description: "Mistral's large model",
    capabilities: ["text_generation", "code_generation"],
    isAvailable: true,
    isLocal: false,
    baseUrl: "https://api.mistral.ai/v1",
    rateLimit: { requestsPerMinute: 60, requestsPerDay: 500000 },
    costPerRequest: 0,
    averageResponseTime: 2000,
    successRate: 0.94,
  },

  ollama_local: {
    id: "ollama_local",
    name: "Ollama Local Models",
    type: "llm",
    provider: "Ollama",
    description: "Local models running on Ollama",
    capabilities: ["text_generation", "code_generation"],
    isAvailable: true,
    isLocal: true,
    baseUrl: "http://localhost:11434",
    rateLimit: { requestsPerMinute: 1000, requestsPerDay: 999999 },
    costPerRequest: 0,
    averageResponseTime: 3000,
    successRate: 0.92,
  },

  // Image Generation
  stable_diffusion: {
    id: "stable_diffusion",
    name: "Stable Diffusion",
    type: "image_generation",
    provider: "Stability AI",
    description: "Stable Diffusion for image generation",
    capabilities: ["image_generation"],
    isAvailable: true,
    isLocal: true,
    rateLimit: { requestsPerMinute: 10, requestsPerDay: 100 },
    costPerRequest: 0,
    averageResponseTime: 5000,
    successRate: 0.9,
  },

  // Image Analysis
  google_gemini_vision: {
    id: "google_gemini_vision",
    name: "Gemini Vision",
    type: "image_analysis",
    provider: "Google",
    description: "Gemini's vision capabilities",
    capabilities: ["image_analysis"],
    isAvailable: true,
    isLocal: false,
    rateLimit: { requestsPerMinute: 1000, requestsPerDay: 1500 },
    costPerRequest: 0,
    averageResponseTime: 2000,
    successRate: 0.95,
  },

  // Video Generation
  ovi_model: {
    id: "ovi_model",
    name: "Ovi",
    type: "video_generation",
    provider: "Open Source",
    description: "Open source video and audio generation",
    capabilities: ["video_generation"],
    isAvailable: true,
    isLocal: true,
    rateLimit: { requestsPerMinute: 1, requestsPerDay: 10 },
    costPerRequest: 0,
    averageResponseTime: 30000,
    successRate: 0.85,
  },

  // Audio Processing
  whisper_openai: {
    id: "whisper_openai",
    name: "Whisper",
    type: "audio_processing",
    provider: "OpenAI",
    description: "Speech to text using Whisper",
    capabilities: ["speech_to_text"],
    isAvailable: true,
    isLocal: false,
    rateLimit: { requestsPerMinute: 100, requestsPerDay: 1000 },
    costPerRequest: 0,
    averageResponseTime: 3000,
    successRate: 0.92,
  },

  // Code Execution
  e2b_sandbox: {
    id: "e2b_sandbox",
    name: "E2B Sandbox",
    type: "code_execution",
    provider: "E2B",
    description: "Secure code execution environment",
    capabilities: ["code_execution"],
    isAvailable: true,
    isLocal: false,
    rateLimit: { requestsPerMinute: 10, requestsPerDay: 100 },
    costPerRequest: 0,
    averageResponseTime: 5000,
    successRate: 0.98,
  },

  local_python: {
    id: "local_python",
    name: "Local Python",
    type: "code_execution",
    provider: "Local",
    description: "Local Python execution",
    capabilities: ["code_execution"],
    isAvailable: true,
    isLocal: true,
    rateLimit: { requestsPerMinute: 1000, requestsPerDay: 999999 },
    costPerRequest: 0,
    averageResponseTime: 2000,
    successRate: 0.95,
  },
};

/**
 * Tool Manager Class
 */
export class ToolManager {
  private tools: Map<string, Tool>;
  private toolUsageStats: Map<string, { uses: number; successes: number }>;
  private initialized = false;

  constructor() {
    this.tools = new Map(Object.entries(AVAILABLE_TOOLS));
    this.toolUsageStats = new Map();

    // Initialize usage stats
    this.tools.forEach(tool => {
      this.toolUsageStats.set(tool.id, { uses: 0, successes: 0 });
    });
  }

  /**
   * Initialize tool manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    console.log(`✅ Tool Manager initialized with ${this.tools.size} tools`);
  }

  /**
   * Get all available tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values()).filter(tool => tool.isAvailable);
  }

  /**
   * Get tools count
   */
  getToolsCount(): number {
    return this.getAllTools().length;
  }

  /**
   * Get tools for a specific task type
   */
  getToolsForTask(taskType: TaskType): Tool[] {
    const toolIds = TOOL_CAPABILITY_MATRIX[taskType] || [];
    return toolIds
      .map(id => this.tools.get(id))
      .filter((tool): tool is Tool => tool !== undefined && tool.isAvailable);
  }

  /** أدوات مجانية بالكامل (تكلفة الطلب = 0) */
  getFreeToolsForTask(taskType: TaskType): Tool[] {
    return this.getToolsForTask(taskType).filter(t => t.costPerRequest === 0);
  }

  /**
   * Select the best tool for a task
   */
  selectBestTool(
    taskType: TaskType,
    preferences?: {
      preferLocal?: boolean;
      preferFast?: boolean;
      preferredToolId?: string | null;
    }
  ): Tool | null {
    const availableTools = this.getToolsForTask(taskType);

    if (availableTools.length === 0) {
      return null;
    }

    const preferred = preferences?.preferredToolId?.trim();

    const scoredTools = availableTools.map(tool => {
      let score = 0;

      score += tool.successRate * 40;

      const avgTime = 5000;
      score += ((avgTime - tool.averageResponseTime) / avgTime) * 30;

      score += (1 - tool.costPerRequest / 0.1) * 20;

      if (preferences?.preferLocal && tool.isLocal) {
        score += 10;
      }

      if (preferences?.preferFast && tool.averageResponseTime < 2000) {
        score += 10;
      }

      if (preferred && tool.id === preferred) {
        score += 48;
      }

      return { tool, score };
    });

    // Sort by score and return the best
    scoredTools.sort((a, b) => b.score - a.score);
    return scoredTools[0].tool;
  }

  /**
   * أفضل أداة مجانية فقط لميزانية صفر (يفضّل المحلي عند الطلب).
   */
  selectBestFreeTool(
    taskType: TaskType,
    preferences?: {
      preferLocal?: boolean;
      preferFast?: boolean;
      /** معرّف أداة فضّلها التعلم المتراكم لهذا النوع من المهام */
      preferredToolId?: string | null;
    }
  ): Tool | null {
    const availableTools = this.getFreeToolsForTask(taskType);
    if (availableTools.length === 0) {
      return this.selectBestTool(taskType, preferences);
    }

    const preferred = preferences?.preferredToolId?.trim();
    const scoredTools = availableTools.map(tool => {
      let score = 0;
      score += tool.successRate * 40;
      const avgTime = 5000;
      score += ((avgTime - tool.averageResponseTime) / avgTime) * 30;
      score += (1 - tool.costPerRequest / 0.1) * 20;
      if (preferences?.preferLocal && tool.isLocal) score += 10;
      if (preferences?.preferFast && tool.averageResponseTime < 2000)
        score += 10;
      if (preferred && tool.id === preferred) score += 48;
      return { tool, score };
    });

    scoredTools.sort((a, b) => b.score - a.score);
    return scoredTools[0].tool;
  }

  /**
   * Get fallback tools for a task
   */
  getFallbackTools(taskType: TaskType, excludeToolId: string): Tool[] {
    return this.getToolsForTask(taskType)
      .filter(tool => tool.id !== excludeToolId)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);
  }

  /**
   * Record tool usage
   */
  recordToolUsage(toolId: string, success: boolean): void {
    const stats = this.toolUsageStats.get(toolId);
    if (stats) {
      stats.uses++;
      if (success) {
        stats.successes++;
      }

      // Update tool success rate
      const tool = this.tools.get(toolId);
      if (tool) {
        tool.successRate = stats.successes / stats.uses;
        tool.lastUsed = new Date();
      }
    }
  }

  /**
   * Get tool statistics
   */
  getToolStats(toolId: string) {
    const stats = this.toolUsageStats.get(toolId);
    const tool = this.tools.get(toolId);

    if (!stats || !tool) {
      return null;
    }

    return {
      toolId,
      toolName: tool.name,
      totalUses: stats.uses,
      successCount: stats.successes,
      successRate: stats.successes / stats.uses,
      failureCount: stats.uses - stats.successes,
      lastUsed: tool.lastUsed,
    };
  }

  /**
   * Get all tool statistics
   */
  getAllToolStats() {
    return Array.from(this.toolUsageStats.keys()).map(toolId =>
      this.getToolStats(toolId)
    );
  }

  /**
   * Add a new tool
   */
  addTool(tool: Tool): void {
    this.tools.set(tool.id, tool);
    this.toolUsageStats.set(tool.id, { uses: 0, successes: 0 });
  }

  /**
   * Update tool availability
   */
  updateToolAvailability(toolId: string, isAvailable: boolean): void {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.isAvailable = isAvailable;
    }
  }

  /**
   * Check if tool is available
   */
  isToolAvailable(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    return tool ? tool.isAvailable : false;
  }

  /**
   * Get tool by ID
   */
  getTool(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }
}

// Export singleton instance
export const toolManager = new ToolManager();

// Auto-initialize on import
toolManager.initialize().catch(console.error);
