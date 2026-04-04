import { AgentFactory } from "./agentTypes";
import { agentManager, Agent, AgentTask } from "./agentCore";

/**
 * مدير فريق Agents المتقدم
 */
export class TeamManager {
  private team: Record<string, Agent> = {};
  private taskQueue: Array<{
    id: string;
    description: string;
    priority: number;
    assignedAgent?: string;
  }> = [];

  constructor() {
    this.initializeTeam();
  }

  /**
   * تهيئة فريق Agents
   */
  private initializeTeam(): void {
    const fullTeam = AgentFactory.createFullTeam();
    this.team = fullTeam;

    Object.values(this.team).forEach(agent => {
      agentManager.registerAgent(agent);
    });
  }

  /**
   * الحصول على Agent بـ ID
   */
  getAgent(agentId: string): Agent | undefined {
    for (const agent of Object.values(this.team)) {
      if (agent.getConfig().id === agentId) return agent;
    }
    const legacy = agentId as keyof typeof this.team;
    if (legacy in this.team) return this.team[legacy];
    return undefined;
  }

  /**
   * الحصول على جميع Agents
   */
  getAllAgents(): Agent[] {
    return Object.values(this.team);
  }

  /**
   * إضافة مهمة إلى قائمة الانتظار
   */
  queueTask(
    description: string,
    priority: number = 1,
    assignedAgent?: string
  ): string {
    const taskId = `queue_${Date.now()}`;
    this.taskQueue.push({
      id: taskId,
      description,
      priority,
      assignedAgent,
    });

    // ترتيب قائمة الانتظار حسب الأولوية
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    return taskId;
  }

  /**
   * معالجة قائمة الانتظار
   */
  async processQueue(): Promise<AgentTask[]> {
    const results: AgentTask[] = [];

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) break;

      try {
        let agent: Agent | undefined;

        if (task.assignedAgent) {
          agent = this.getAgent(task.assignedAgent);
        } else {
          // اختيار أفضل Agent للمهمة
          agent = this.selectBestAgent(task.description);
        }

        if (agent) {
          const result = await agent.executeTask(task.description);
          results.push(result);
        }
      } catch (error) {
        console.error("[TeamManager] خطأ في معالجة المهمة:", error);
      }
    }

    return results;
  }

  /**
   * اختيار أفضل Agent للمهمة
   */
  private selectBestAgent(taskDescription: string): Agent | undefined {
    const lowerDesc = taskDescription.toLowerCase();

    // منطق اختيار Agent بناءً على نوع المهمة
    if (
      lowerDesc.includes("بحث") ||
      lowerDesc.includes("تحليل") ||
      lowerDesc.includes("دراسة")
    ) {
      return this.team.researcher;
    }

    if (
      lowerDesc.includes("كود") ||
      lowerDesc.includes("برنامج") ||
      lowerDesc.includes("تنفيذ")
    ) {
      return this.team.executor;
    }

    if (
      lowerDesc.includes("ملف") ||
      lowerDesc.includes("صورة") ||
      lowerDesc.includes("معالجة")
    ) {
      return this.team.processor;
    }

    if (
      lowerDesc.includes("إحصائيات") ||
      lowerDesc.includes("تقرير") ||
      lowerDesc.includes("رسم بياني")
    ) {
      return this.team.analyst;
    }

    if (lowerDesc.includes("أمان") || lowerDesc.includes("حماية")) {
      return this.team.security;
    }

    if (
      lowerDesc.includes("تعلم") ||
      lowerDesc.includes("تطور") ||
      lowerDesc.includes("تحسن")
    ) {
      return this.team.learner;
    }

    // الخيار الافتراضي
    return this.team.coordinator;
  }

  /**
   * تنفيذ مهمة معقدة بتعاون عدة Agents
   */
  async executeComplexTask(
    taskDescription: string
  ): Promise<Record<string, AgentTask>> {
    const results: Record<string, AgentTask> = {};

    // تحديد Agents المطلوبة للمهمة
    const requiredAgents = this.identifyRequiredAgents(taskDescription);

    // تنفيذ المهمة بشكل تعاوني
    for (const agentId of requiredAgents) {
      const agent = this.getAgent(agentId);
      if (agent) {
        const result = await agent.executeTask(taskDescription);
        results[agentId] = result;
      }
    }

    return results;
  }

  /**
   * تحديد Agents المطلوبة للمهمة
   */
  private identifyRequiredAgents(taskDescription: string): string[] {
    const agents: string[] = [];
    const lowerDesc = taskDescription.toLowerCase();

    if (
      lowerDesc.includes("بحث") ||
      lowerDesc.includes("تحليل") ||
      lowerDesc.includes("دراسة")
    ) {
      agents.push("agent_researcher");
    }

    if (
      lowerDesc.includes("كود") ||
      lowerDesc.includes("برنامج") ||
      lowerDesc.includes("تنفيذ")
    ) {
      agents.push("agent_executor");
    }

    if (
      lowerDesc.includes("ملف") ||
      lowerDesc.includes("صورة") ||
      lowerDesc.includes("معالجة")
    ) {
      agents.push("agent_processor");
    }

    if (
      lowerDesc.includes("إحصائيات") ||
      lowerDesc.includes("تقرير") ||
      lowerDesc.includes("رسم بياني")
    ) {
      agents.push("agent_analyst");
    }

    if (lowerDesc.includes("أمان") || lowerDesc.includes("حماية")) {
      agents.push("agent_security");
    }

    if (
      lowerDesc.includes("تعلم") ||
      lowerDesc.includes("تطور") ||
      lowerDesc.includes("تحسن")
    ) {
      agents.push("agent_learner");
    }

    // إضافة منسق الفريق دائماً للمهام المعقدة
    if (agents.length > 1) {
      agents.push("agent_coordinator");
    }

    return agents.length > 0 ? agents : ["agent_coordinator"];
  }

  /**
   * الحصول على إحصائيات الفريق
   */
  getTeamStats() {
    return {
      totalAgents: Object.keys(this.team).length,
      agents: Object.entries(this.team).map(([id, agent]) => ({
        id,
        info: agent.getInfo(),
      })),
      queueLength: this.taskQueue.length,
      timestamp: new Date(),
    };
  }

  /**
   * تحميل ذاكرة جميع Agents
   */
  async loadAllMemories(): Promise<void> {
    await Promise.all(
      Object.values(this.team).map(agent => agent.loadMemory())
    );
  }

  /**
   * إعادة تعيين الفريق
   */
  resetTeam(): void {
    this.team = {};
    this.taskQueue = [];
    this.initializeTeam();
  }
}

// إنشاء مدير الفريق العام
export const teamManager = new TeamManager();
