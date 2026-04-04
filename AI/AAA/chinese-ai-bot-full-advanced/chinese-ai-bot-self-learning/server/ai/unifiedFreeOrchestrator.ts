/**
 * منسق موحّد: يجمع الأدوات المجانية + الوكلاء الافتراضيين، يختار تلقائياً، ويتعلم من كل تنفيذ.
 */

import { taskAnalyzer, type AnalyzedTask } from "./taskAnalyzer";
import { toolManager, type TaskType, type Tool } from "../tools/toolManager";
import { learningEngine } from "./learningEngine";
import {
  invokeLLM,
  stringifyAssistantContent,
  type Message,
} from "../_core/llm";
import { codeExecutor } from "./codeExecutor";
import { specializedAgentsManager } from "../agents/specializedAgents";
import { ENV } from "../_core/env";
import { commercialAgentKernel } from "../platform/commercialAgentKernel";
import {
  retrieveKnowledgeForPrompt,
  type KnowledgePrincipal,
} from "./knowledgeService";
import {
  NON_MALEFICENCE_SYSTEM_LINES,
  COUNCIL_PEER_NON_MALEFICENCE,
  tryHarmPolicyGate,
  neutralPolicyBlockedAnalysis,
} from "./noHarmPolicy";

export type UnifiedPath = "llm-free-stack" | "code-sandbox" | "llm-plus-code";

export interface UnifiedExecuteResult {
  success: boolean;
  message: string;
  analysis: AnalyzedTask;
  tool: Tool | null;
  agentName: string | null;
  agentSpecialization: string | null;
  path: UnifiedPath;
  codeExecutionOutput?: string;
  error?: string;
  /** المستأجر النشط (مرحلة تعدد عملاء) */
  tenantId: string;
  /** مقتطفات معرفة أُدرجت في الـ system prompt */
  usedKnowledgeChunks?: number;
  /** عناوين المقتطفات الفعلية المُدرَجة (للعرض في الواجهة) */
  usedKnowledgeTitles?: string[];
  /** ردّ آمن دون LLM بسبب بوابة عدم الضرر */
  policyBlocked?: boolean;
}

export type UnifiedExecuteOptions = {
  tenantId?: string;
  /** RAG خفيف: ربط المقتطفات بمستخدم ويب أو تليجرام */
  knowledgePrincipal?: KnowledgePrincipal;
};

function extractRunnableCode(message: string): {
  language: "python" | "javascript";
  code: string;
} | null {
  const py = message.match(/```(?:python|py)\s*\n([\s\S]*?)```/i);
  if (py?.[1]?.trim()) {
    return { language: "python", code: py[1].trim() };
  }
  const js = message.match(/```(?:javascript|js|nodejs)\s*\n([\s\S]*?)```/i);
  if (js?.[1]?.trim()) {
    return { language: "javascript", code: js[1].trim() };
  }
  return null;
}

function buildSystemPrompt(
  analysis: AnalyzedTask,
  tool: Tool | null,
  agentName: string | null,
  agentSpec: string | null,
  codeHint?: string,
  knowledgeSection?: string,
  learningSection?: string
): string {
  const lines = [
    "أنت جزء من منسق ذكي واحد يدمج أدوات ووكلاء مجانيين فقط (سياسة تكلفة صفر للمستخدم).",
    NON_MALEFICENCE_SYSTEM_LINES,
    "نفّذ طلب المستخدم بدقة ضمن هذه الحدود. لا تقترح خدمات مدفوعة كشرط للإنجاز.",
    `نوع المهمة: ${analysis.taskType}`,
    `الوصف: ${analysis.description}`,
    `التعقيد: ${analysis.complexity}`,
    tool
      ? `أداة مجانية مختارة تلقائياً: ${tool.name} (${tool.provider}) — ${tool.description}`
      : "لم تُعيَّن أداة محددة من السجل؛ أجب بأفضل أسلوب ممكن ضمن النطاق المجاني.",
    agentName
      ? `وكيل افتراضي مرتبط بالمهمة: ${agentName}${agentSpec ? ` — ${agentSpec}` : ""}`
      : "",
    analysis.requiresCode
      ? "المهمة تتطلب كوداً: قدّم أكواداً واضحة داخل كتل markdown عند الحاجة."
      : "",
  ];
  if (learningSection?.trim()) {
    lines.push(learningSection.trim());
  }
  if (codeHint) {
    lines.push("مرجع من صندوق تنفيذ تجريبي (قد يكون محاكاة):");
    lines.push(codeHint);
  }
  if (knowledgeSection?.trim()) {
    lines.push("---");
    lines.push(
      "مقتطفات مرجعية من معرفة المستخدم (استخدمها عند الصلة؛ لا تخترع حقائق خارجها):"
    );
    lines.push(knowledgeSection.trim());
  }
  return lines.filter(Boolean).join("\n");
}

export const unifiedFreeOrchestrator = {
  /** ملخص الطبقة المجانية (أدوات + وكلاء) للواجهات أو التشخيص */
  getOverview() {
    const tools = toolManager.getAllTools().filter(t => t.costPerRequest === 0);
    const agents = specializedAgentsManager
      .getAllAgents()
      .map(a => a.getInfo());
    return {
      policy: "free-only" as const,
      llm: {
        backend: ENV.llmBackend,
        customReady:
          ENV.llmBackend === "custom" &&
          Boolean(ENV.customLlmBaseUrl.trim() && ENV.customLlmModel.trim()),
        /** اسم النموذج على خادمك فقط (بدون عنوان الخادم) */
        customModel: ENV.customLlmModel.trim() || null,
      },
      toolCount: tools.length,
      agentCount: agents.length,
      tools: tools.map(t => ({
        id: t.id,
        name: t.name,
        provider: t.provider,
        isLocal: t.isLocal,
      })),
      agents: agents.map(c => ({
        name: c.name,
        type: c.type,
        specialization: c.specialization,
        capabilities: c.capabilities,
      })),
    };
  },

  /**
   * تحليل المهمة → اختيار أداة/وكيل مجاني → (اختياري) تنفيذ كود → استدعاء LLM → تعلم ذاتي.
   */
  async execute(
    userId: number,
    userMessage: string,
    options?: UnifiedExecuteOptions
  ): Promise<UnifiedExecuteResult> {
    const tenantId = options?.tenantId?.trim() || ENV.defaultTenantId;

    const harmHit = tryHarmPolicyGate(userMessage);
    if (harmHit) {
      const analysis = neutralPolicyBlockedAnalysis();
      return {
        success: true,
        message: harmHit.replyAr,
        analysis,
        tool: null,
        agentName: null,
        agentSpecialization: null,
        path: "llm-free-stack",
        tenantId,
        policyBlocked: true,
      };
    }

    const analysis = await taskAnalyzer.analyzeTask(userMessage);
    const taskType = analysis.taskType as TaskType;

    let knowledgeSection: string | undefined;
    let usedKnowledgeChunks = 0;
    let usedKnowledgeTitles: string[] | undefined;
    if (options?.knowledgePrincipal) {
      const rag = await retrieveKnowledgeForPrompt(
        tenantId,
        options.knowledgePrincipal,
        userMessage
      );
      if (rag) {
        knowledgeSection = rag.text;
        usedKnowledgeChunks = rag.count;
        usedKnowledgeTitles = rag.titles;
      }
    }

    const preferredUser = await learningEngine.getPreferredToolIdForTaskType(
      userId,
      taskType,
      tenantId
    );
    const preferredCollective =
      await learningEngine.getCollectivePreferredToolId(tenantId, taskType);
    const preferredFromLearning = preferredUser ?? preferredCollective;

    const tool = toolManager.selectBestFreeTool(taskType, {
      preferLocal: true,
      preferFast: analysis.complexity === "simple",
      preferredToolId: preferredFromLearning,
    });

    const specAgent =
      specializedAgentsManager.resolveAgentForTaskType(taskType);
    const agentName = specAgent?.getInfo().name ?? null;
    const agentSpec = specAgent?.getInfo().specialization ?? null;

    let codeExecutionOutput: string | undefined;
    let path: UnifiedPath = "llm-free-stack";

    if (taskType === "code_execution") {
      const block = extractRunnableCode(userMessage);
      if (block) {
        const exec = await codeExecutor.execute({
          code: block.code,
          language: block.language,
          timeout: 15000,
        });
        codeExecutionOutput = exec.success
          ? exec.output
          : `تنفيذ: فشل — ${exec.error ?? "unknown"}`;
        path = exec.success ? "code-sandbox" : "llm-plus-code";
      }
    }

    const learningSection = await learningEngine.buildPromptContextForTask(
      userId,
      analysis,
      tenantId,
      { maxBullets: 10 }
    );

    const systemPrompt = buildSystemPrompt(
      analysis,
      tool,
      agentName,
      agentSpec,
      codeExecutionOutput,
      knowledgeSection,
      learningSection
    );

    const toolUsedId = tool?.id ?? "unified_free_orchestrator";

    try {
      const baseMessages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ];
      let response = await invokeLLM({ messages: baseMessages });

      let message =
        stringifyAssistantContent(response.choices[0]?.message.content) ||
        "عذراً، لم أتمكن من إنتاج رد.";

      const councilRounds = ENV.llmCouncilRounds;
      const councilModels = ENV.llmCouncilModels;
      const canPeerRound =
        councilModels.length > 0 &&
        (ENV.llmBackend === "openrouter" ||
          ENV.llmBackend === "custom" ||
          ENV.openRouterApiKey.trim().length > 0);

      if (councilRounds > 1 && canPeerRound) {
        const peerSystem =
          "أنت مراجع مستقل في نفس منصة المستخدم. راجع المسودة: حسّن الوضوح والدقة بلغة المستخدم (عربي عند الحاجة). لا تخترع حقائق ولا توسّع بلا طلب.\n" +
          COUNCIL_PEER_NON_MALEFICENCE;
        for (let i = 1; i < councilRounds; i++) {
          const peerModel = councilModels[(i - 1) % councilModels.length];
          try {
            const peerResp = await invokeLLM({
              model: peerModel,
              messages: [
                { role: "system", content: peerSystem },
                {
                  role: "user",
                  content: `سؤال المستخدم:\n${userMessage}\n\n---\nمسودة المرحلة السابقة:\n${message}`,
                },
              ],
            });
            const next =
              stringifyAssistantContent(
                peerResp.choices[0]?.message.content
              )?.trim() ?? "";
            if (next.length > 12) message = next;
          } catch {
            break;
          }
        }
      }

      if (codeExecutionOutput) {
        const snippet = codeExecutionOutput.slice(0, 80);
        if (!message.includes(snippet)) {
          message = `${message}\n\n---\n**مخرجات التنفيذ التجريبي:**\n\`\`\`\n${codeExecutionOutput}\n\`\`\``;
        }
      }

      const fallbackLike =
        /لم أتمكن|تعذّر|خطأ|error|failed/i.test(message) &&
        message.length < 120;
      const qualityHint = Math.max(
        0.32,
        Math.min(
          1,
          analysis.confidence *
            (message.trim().length > 28 ? 1 : 0.9) *
            (fallbackLike ? 0.55 : 1)
        )
      );

      if (tool) {
        toolManager.recordToolUsage(tool.id, true);
      }

      await learningEngine.analyzeTaskOutcome(
        userId,
        analysis,
        {
          success: true,
          quality: qualityHint,
          toolUsed: toolUsedId,
          executionTime: analysis.estimatedTime,
        },
        tenantId
      );

      await learningEngine.updateModelPerformance(
        userId,
        toolUsedId,
        {
          success: true,
          quality: qualityHint,
          executionTime: analysis.estimatedTime,
        },
        tenantId
      );

      void commercialAgentKernel.recordLearningSignal({
        tenantId,
        taskType: analysis.taskType,
        success: true,
        toolId: toolUsedId,
        qualityHint: analysis.confidence,
        userId: String(userId),
        createdAt: new Date(),
      });

      return {
        success: true,
        message,
        analysis,
        tool,
        agentName,
        agentSpecialization: agentSpec,
        path,
        codeExecutionOutput,
        tenantId,
        usedKnowledgeChunks,
        usedKnowledgeTitles,
      };
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      if (tool) {
        toolManager.recordToolUsage(tool.id, false);
      }

      await learningEngine.analyzeTaskOutcome(
        userId,
        analysis,
        {
          success: false,
          quality: 0.2,
          toolUsed: toolUsedId,
          executionTime: 0,
        },
        tenantId
      );

      await learningEngine.updateModelPerformance(
        userId,
        toolUsedId,
        {
          success: false,
          quality: 0.2,
          executionTime: 0,
        },
        tenantId
      );

      void commercialAgentKernel.recordLearningSignal({
        tenantId,
        taskType: analysis.taskType,
        success: false,
        toolId: toolUsedId,
        userId: String(userId),
        createdAt: new Date(),
      });

      return {
        success: false,
        message: "",
        analysis,
        tool,
        agentName,
        agentSpecialization: agentSpec,
        path,
        codeExecutionOutput,
        error: err,
        tenantId,
        usedKnowledgeChunks,
        usedKnowledgeTitles,
      };
    }
  },
};
