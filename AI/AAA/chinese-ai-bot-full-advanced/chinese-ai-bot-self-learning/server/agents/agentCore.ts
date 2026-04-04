import { invokeLLM, stringifyAssistantContent } from "../_core/llm";
import { storagePut, storageGet } from "../storage";
import { getDb } from "../db";
import { agentMemory, agentTasks } from "../../drizzle/schema";
import type {
  InsertAgentMemoryItem,
  InsertAgentTask,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * نظام Agents المتقدم مع الذاكرة الطويلة الأمد
 * كل Agent له:
 * - شخصية وأسلوب عمل فريد
 * - ذاكرة طويلة الأمد تحفظ التعلم
 * - قدرة على التعاون مع Agents أخرى
 * - نظام تقييم الأداء
 */

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  role: "researcher" | "executor" | "processor" | "analyst" | "learner";
  personality: string;
  capabilities: string[];
  tools: string[];
  maxMemoryItems: number;
  autonomyLevel: "low" | "medium" | "high";
}

export interface AgentMemoryItem {
  id: string;
  agentId: string;
  type: "learning" | "experience" | "insight" | "pattern";
  content: string;
  importance: number;
  timestamp: Date;
  relatedTasks: string[];
}

export interface AgentTask {
  id: string;
  agentId: string;
  taskDescription: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
  performanceScore?: number;
}

/**
 * فئة Agent الأساسية
 */
export class Agent {
  private config: AgentConfig;
  private memory: AgentMemoryItem[] = [];
  private taskHistory: AgentTask[] = [];
  private performanceMetrics = {
    tasksCompleted: 0,
    tasksSuccessRate: 0,
    averageExecutionTime: 0,
    learningProgress: 0,
  };

  constructor(config: AgentConfig) {
    this.config = config;
  }

  getConfig(): Readonly<AgentConfig> {
    return this.config;
  }

  /**
   * تحميل ذاكرة Agent من قاعدة البيانات
   */
  async loadMemory(): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      const memoryItems = await db
        .select()
        .from(agentMemory)
        .where(eq(agentMemory.agentId, this.config.id))
        .orderBy(desc(agentMemory.importance))
        .limit(this.config.maxMemoryItems);

      this.memory = memoryItems.map(row => ({
        id: row.id,
        agentId: row.agentId,
        type: row.type,
        content: row.content,
        importance: Number(row.importance ?? 0),
        timestamp: row.createdAt,
        relatedTasks: Array.isArray(row.relatedTasks)
          ? (row.relatedTasks as string[])
          : [],
      }));
    } catch (error) {
      console.error("[Agent] فشل تحميل الذاكرة:", error);
    }
  }

  /**
   * حفظ عنصر جديد في الذاكرة
   */
  async saveMemory(
    type: AgentMemoryItem["type"],
    content: string,
    importance: number,
    relatedTasks: string[] = []
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      const memoryItem: AgentMemoryItem = {
        id: `mem_${Date.now()}`,
        agentId: this.config.id,
        type,
        content,
        importance,
        timestamp: new Date(),
        relatedTasks,
      };

      const insertRow: InsertAgentMemoryItem = {
        id: memoryItem.id,
        agentId: memoryItem.agentId,
        type: memoryItem.type,
        content: memoryItem.content,
        importance: importance.toFixed(2),
        relatedTasks,
      };

      await db.insert(agentMemory).values(insertRow);

      // إضافة إلى الذاكرة المحلية
      this.memory.push(memoryItem);

      // الحفاظ على حد أقصى للذاكرة
      if (this.memory.length > this.config.maxMemoryItems) {
        this.memory = this.memory
          .sort((a, b) => b.importance - a.importance)
          .slice(0, this.config.maxMemoryItems);
      }
    } catch (error) {
      console.error("[Agent] فشل حفظ الذاكرة:", error);
    }
  }

  /**
   * تنفيذ مهمة
   */
  async executeTask(taskDescription: string): Promise<AgentTask> {
    const db = await getDb();
    const taskId = `task_${Date.now()}`;
    const startTime = new Date();

    const task: AgentTask = {
      id: taskId,
      agentId: this.config.id,
      taskDescription,
      status: "in_progress",
      startTime,
    };

    try {
      // حفظ المهمة في قاعدة البيانات
      if (db) {
        const insertTask: InsertAgentTask = {
          id: taskId,
          agentId: this.config.id,
          taskDescription,
          status: "in_progress",
          startTime,
        };
        await db.insert(agentTasks).values(insertTask);
      }

      // بناء السياق من الذاكرة
      const context = this.buildContext();

      // استدعاء LLM مع السياق
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(context),
          },
          {
            role: "user",
            content: taskDescription,
          },
        ],
      });

      const raw = response.choices[0]?.message.content;
      const result = stringifyAssistantContent(raw);

      // تحديث المهمة
      task.status = "completed";
      task.result = result;
      task.endTime = new Date();
      task.performanceScore = this.calculatePerformanceScore(task);

      // حفظ النتيجة
      if (db) {
        await db
          .update(agentTasks)
          .set({
            status: task.status,
            result: task.result,
            endTime: task.endTime,
            performanceScore:
              task.performanceScore !== undefined
                ? task.performanceScore.toFixed(2)
                : null,
          })
          .where(eq(agentTasks.id, taskId));
      }

      // حفظ التعلم من المهمة
      await this.saveMemory(
        "experience",
        `تم تنفيذ المهمة: ${taskDescription.substring(0, 100)}... بنجاح`,
        0.7,
        [taskId]
      );

      // تحديث الإحصائيات
      this.updateMetrics(task);

      return task;
    } catch (error) {
      task.status = "failed";
      task.error = String(error);
      task.endTime = new Date();

      // حفظ الخطأ
      if (db) {
        await db
          .update(agentTasks)
          .set({
            status: task.status,
            error: task.error,
            endTime: task.endTime,
          })
          .where(eq(agentTasks.id, taskId));
      }

      // حفظ التعلم من الفشل
      await this.saveMemory(
        "learning",
        `فشل تنفيذ المهمة: ${taskDescription.substring(0, 100)}... الخطأ: ${String(error).substring(0, 100)}`,
        0.5,
        [taskId]
      );

      return task;
    }
  }

  /**
   * بناء السياق من الذاكرة
   */
  private buildContext(): string {
    const topMemories = this.memory
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);

    return topMemories.map(m => `[${m.type}] ${m.content}`).join("\n");
  }

  /**
   * بناء نص النظام (System Prompt)
   */
  private buildSystemPrompt(context: string): string {
    return `أنت ${this.config.name} - ${this.config.description}

الشخصية والأسلوب:
${this.config.personality}

الدور: ${this.config.role}
مستوى الاستقلالية: ${this.config.autonomyLevel}

الإمكانيات:
${this.config.capabilities.join("\n")}

الذاكرة والتعلم السابق:
${context || "لا توجد ذاكرة سابقة"}

الأدوات المتاحة:
${this.config.tools.join("\n")}

تعليمات:
1. استخدم الذاكرة السابقة لتحسين الأداء
2. تعلم من كل مهمة
3. اعمل بشكل مستقل ومسؤول
4. قدم نتائج دقيقة وموثوقة`;
  }

  /**
   * حساب درجة الأداء
   */
  private calculatePerformanceScore(task: AgentTask): number {
    if (!task.endTime) return 0;

    const executionTime = task.endTime.getTime() - task.startTime.getTime();
    const timeScore = Math.max(0, 100 - executionTime / 100); // أسرع = أفضل
    const resultScore = task.result ? 100 : 0; // وجود نتيجة = 100
    const errorScore = task.error ? 0 : 100; // بدون أخطاء = 100

    return (timeScore + resultScore + errorScore) / 3;
  }

  /**
   * تحديث الإحصائيات
   */
  private updateMetrics(task: AgentTask): void {
    this.performanceMetrics.tasksCompleted++;

    if (task.status === "completed") {
      const successRate =
        (this.performanceMetrics.tasksCompleted - 1) /
        this.performanceMetrics.tasksCompleted;
      this.performanceMetrics.tasksSuccessRate = successRate;
    }

    if (task.performanceScore) {
      this.performanceMetrics.averageExecutionTime =
        (this.performanceMetrics.averageExecutionTime +
          (task.endTime!.getTime() - task.startTime.getTime())) /
        2;
    }
  }

  /**
   * الحصول على معلومات Agent
   */
  getInfo() {
    return {
      config: this.config,
      memory: this.memory,
      metrics: this.performanceMetrics,
      taskCount: this.taskHistory.length,
    };
  }

  /**
   * التعاون مع Agent آخر
   */
  async collaborateWith(otherAgent: Agent, task: string): Promise<string> {
    // تنفيذ المهمة بشكل تعاوني
    const myResult = await this.executeTask(task);
    const otherResult = await otherAgent.executeTask(
      `بناءً على النتيجة السابقة: ${myResult.result}, قم بـ: ${task}`
    );

    // دمج النتائج
    return `${this.config.name}: ${myResult.result}\n${otherAgent.config.name}: ${otherResult.result}`;
  }
}

/**
 * مدير Agents
 */
export class AgentManager {
  private agents: Map<string, Agent> = new Map();

  /**
   * إضافة Agent جديد
   */
  addAgent(config: AgentConfig): Agent {
    const agent = new Agent(config);
    this.agents.set(config.id, agent);
    return agent;
  }

  /** تسجيل نفس كائن Agent (مثلاً من فريق Factory) دون إنشاء نسخة جديدة */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.getConfig().id, agent);
  }

  /**
   * الحصول على Agent
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * الحصول على جميع Agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * تنفيذ مهمة من قبل أفضل Agent
   */
  async executeTaskWithBestAgent(taskDescription: string): Promise<AgentTask> {
    // اختيار أفضل Agent للمهمة
    const bestAgent = this.selectBestAgent(taskDescription);

    if (!bestAgent) {
      throw new Error("لا توجد Agents متاحة");
    }

    return bestAgent.executeTask(taskDescription);
  }

  /**
   * اختيار أفضل Agent للمهمة
   */
  private selectBestAgent(taskDescription: string): Agent | undefined {
    // منطق اختيار Agent بناءً على المهمة والإمكانيات
    return Array.from(this.agents.values())[0];
  }

  /**
   * تحميل ذاكرة جميع Agents
   */
  async loadAllMemories(): Promise<void> {
    await Promise.all(
      Array.from(this.agents.values()).map(agent => agent.loadMemory())
    );
  }
}

// إنشاء مدير Agents العام
export const agentManager = new AgentManager();
