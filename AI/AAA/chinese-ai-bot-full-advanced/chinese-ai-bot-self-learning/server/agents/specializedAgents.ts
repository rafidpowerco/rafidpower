/**
 * Specialized Agents for Different Tools
 * Agents متخصصة لكل أداة وقدرة
 */

import {
  multiSourceProvider,
  type AIRequest,
  AIResponse,
} from "../integrations/multiSourceProvider";
import {
  smartModelSelector,
  SelectionCriteria,
} from "../integrations/smartModelSelector";
import type { TaskType } from "../tools/toolManager";

export interface AgentConfig {
  name: string;
  /** نوع النموذج المرتبط (llm, code, image, ...) */
  type: AIRequest["type"];
  specialization: string;
  models: string[];
  defaultCriteria: SelectionCriteria;
  capabilities: string[];
}

export interface AgentTask {
  id: string;
  agentId: string;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

class SpecializedAgent {
  private config: AgentConfig;
  private tasks: Map<string, AgentTask> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * تنفيذ مهمة
   */
  async executeTask(prompt: string): Promise<AgentTask> {
    const taskId = `${this.config.name}-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      agentId: this.config.name,
      prompt,
      status: "pending",
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);

    try {
      task.status = "running";

      // اختيار أفضل نموذج
      const model = await smartModelSelector.selectBestModel(
        {
          type: this.config.type,
          prompt,
          capabilities: this.config.capabilities,
        },
        this.config.defaultCriteria
      );

      if (!model) {
        throw new Error("لا يوجد نموذج متاح");
      }

      // تنفيذ الطلب
      const response = await multiSourceProvider.executeRequest({
        type: this.config.type,
        prompt,
        modelId: model.id,
      });

      if (response.success) {
        task.status = "completed";
        task.result = response.data;
        task.completedAt = new Date();

        // تحديث أداء النموذج
        smartModelSelector.updateModelPerformance(
          model.id,
          true,
          response.executionTime
        );
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      task.status = "failed";
      task.error = error.message;
      task.completedAt = new Date();
    }

    return task;
  }

  /**
   * الحصول على حالة المهمة
   */
  getTaskStatus(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * الحصول على جميع المهام
   */
  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * الحصول على معلومات الـ Agent
   */
  getInfo(): AgentConfig {
    return this.config;
  }
}

/**
 * مدير الـ Agents المتخصصة
 */
class SpecializedAgentsManager {
  private agents: Map<string, SpecializedAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    // Agent للبحث والتحليل
    this.addAgent(
      new SpecializedAgent({
        name: "ResearchAgent",
        type: "llm",
        specialization: "البحث والتحليل",
        models: ["deepseek-v3.2", "qwen3.6-plus"],
        defaultCriteria: {
          priority: "quality",
          taskType: "research",
          userLanguage: "ar",
        },
        capabilities: ["reasoning", "analysis", "research"],
      })
    );

    // Agent لتوليد الأكواد
    this.addAgent(
      new SpecializedAgent({
        name: "CodeAgent",
        type: "code",
        specialization: "توليد وتحليل الأكواد",
        models: ["deepseek-coder", "mistral-7b"],
        defaultCriteria: {
          priority: "quality",
          taskType: "coding",
          userLanguage: "en",
        },
        capabilities: ["coding", "debugging", "optimization"],
      })
    );

    // Agent لتوليد الصور
    this.addAgent(
      new SpecializedAgent({
        name: "ImageAgent",
        type: "image",
        specialization: "توليد الصور من النصوص",
        models: ["stability-ai/stable-diffusion-3"],
        defaultCriteria: {
          priority: "balanced",
          taskType: "image-generation",
          userLanguage: "ar",
        },
        capabilities: ["image-generation", "image-editing"],
      })
    );

    // Agent لمعالجة الصوت
    this.addAgent(
      new SpecializedAgent({
        name: "AudioAgent",
        type: "audio",
        specialization: "معالجة الصوت والكلام",
        models: ["whisper-v3-turbo", "kokoro"],
        defaultCriteria: {
          priority: "speed",
          taskType: "audio-processing",
          userLanguage: "ar",
        },
        capabilities: ["speech-to-text", "text-to-speech"],
      })
    );

    // Agent لمعالجة الفيديو
    this.addAgent(
      new SpecializedAgent({
        name: "VideoAgent",
        type: "video",
        specialization: "توليد ومعالجة الفيديو",
        models: ["hunyuan-video", "ltx-2"],
        defaultCriteria: {
          priority: "balanced",
          taskType: "video-generation",
          userLanguage: "ar",
        },
        capabilities: ["video-generation", "video-editing"],
      })
    );

    // Agent لتحليل البيانات
    this.addAgent(
      new SpecializedAgent({
        name: "DataAgent",
        type: "data",
        specialization: "تحليل البيانات والإحصائيات",
        models: ["deepseek-v3.2", "qwen3.6-plus"],
        defaultCriteria: {
          priority: "quality",
          taskType: "data-analysis",
          userLanguage: "ar",
        },
        capabilities: ["data-analysis", "visualization", "statistics"],
      })
    );

    // Agent للترجمة
    this.addAgent(
      new SpecializedAgent({
        name: "TranslationAgent",
        type: "llm",
        specialization: "الترجمة بين اللغات",
        models: ["qwen3.6-plus", "llama-3.2"],
        defaultCriteria: {
          priority: "speed",
          taskType: "translation",
          userLanguage: "ar",
        },
        capabilities: ["translation", "multilingual"],
      })
    );

    // Agent للكتابة الإبداعية
    this.addAgent(
      new SpecializedAgent({
        name: "WritingAgent",
        type: "llm",
        specialization: "الكتابة الإبداعية والمحتوى",
        models: ["deepseek-v3.2", "qwen3.6-plus"],
        defaultCriteria: {
          priority: "quality",
          taskType: "writing",
          userLanguage: "ar",
        },
        capabilities: ["writing", "content-creation", "creativity"],
      })
    );
  }

  private addAgent(agent: SpecializedAgent) {
    this.agents.set(agent.getInfo().name, agent);
  }

  /**
   * الحصول على Agent محدد
   */
  getAgent(name: string): SpecializedAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * الحصول على جميع الـ Agents
   */
  getAllAgents(): SpecializedAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * الحصول على Agents حسب النوع
   */
  getAgentsByType(type: string): SpecializedAgent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.getInfo().type === type
    );
  }

  /**
   * اختيار وكيل مجاني مناسب لنوع المهمة (للتوجيه والعرض فقط؛ التنفيذ الفعلي عبر المنسق الموحد).
   */
  resolveAgentForTaskType(taskType: TaskType): SpecializedAgent | null {
    const map: Partial<Record<TaskType, string>> = {
      code_generation: "CodeAgent",
      code_execution: "CodeAgent",
      image_generation: "ImageAgent",
      image_analysis: "ImageAgent",
      speech_to_text: "AudioAgent",
      text_to_speech: "AudioAgent",
      video_generation: "VideoAgent",
      data_analysis: "DataAgent",
      web_scraping: "DataAgent",
      translation: "TranslationAgent",
      creative_writing: "WritingAgent",
      summarization: "WritingAgent",
      text_generation: "ResearchAgent",
      general_qa: "ResearchAgent",
    };
    const name = map[taskType] ?? "ResearchAgent";
    return this.getAgent(name) ?? this.getAgent("ResearchAgent") ?? null;
  }

  /**
   * تنفيذ مهمة على Agent محدد
   */
  async executeTask(agentName: string, prompt: string): Promise<AgentTask> {
    const agent = this.getAgent(agentName);
    if (!agent) {
      throw new Error(`Agent غير موجود: ${agentName}`);
    }
    return agent.executeTask(prompt);
  }

  /**
   * الحصول على إحصائيات الـ Agents
   */
  getStats(): {
    totalAgents: number;
    agents: Record<
      string,
      {
        specialization: string;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        runningTasks: number;
      }
    >;
  } {
    const agents: Record<
      string,
      {
        specialization: string;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        runningTasks: number;
      }
    > = {};

    this.agents.forEach((agent, name) => {
      const tasks = agent.getAllTasks();
      agents[name] = {
        specialization: agent.getInfo().specialization,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "completed").length,
        failedTasks: tasks.filter(t => t.status === "failed").length,
        runningTasks: tasks.filter(t => t.status === "running").length,
      };
    });

    return { totalAgents: this.agents.size, agents };
  }
}

export const specializedAgentsManager = new SpecializedAgentsManager();
