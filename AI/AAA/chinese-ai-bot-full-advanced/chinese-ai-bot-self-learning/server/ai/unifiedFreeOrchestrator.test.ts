import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "x",
    created: Date.now(),
    model: "test",
    choices: [
      {
        index: 0,
        message: { role: "assistant" as const, content: "رد تجريبي" },
        finish_reason: "stop",
      },
    ],
  }),
  stringifyAssistantContent: (c: unknown) =>
    typeof c === "string" ? c : JSON.stringify(c ?? ""),
}));

vi.mock("./knowledgeService", () => ({
  retrieveKnowledgeForPrompt: vi.fn().mockResolvedValue(null),
}));

vi.mock("./learningEngine", () => ({
  learningEngine: {
    analyzeTaskOutcome: vi.fn().mockResolvedValue(undefined),
    updateModelPerformance: vi.fn().mockResolvedValue(undefined),
    getPreferredToolIdForTaskType: vi.fn().mockResolvedValue(null),
    getCollectivePreferredToolId: vi.fn().mockResolvedValue(null),
    buildPromptContextForTask: vi.fn().mockResolvedValue(""),
  },
}));

vi.mock("./taskAnalyzer", () => ({
  taskAnalyzer: {
    analyzeTask: vi.fn().mockResolvedValue({
      taskType: "general_qa",
      description: "اختبار",
      requirements: [],
      complexity: "simple" as const,
      estimatedTime: 1000,
      requiresCode: false,
      requiresInternet: false,
      requiresFiles: false,
      keywords: [],
      confidence: 0.9,
      suggestedTools: [],
    }),
  },
}));

import { unifiedFreeOrchestrator } from "./unifiedFreeOrchestrator";

describe("unifiedFreeOrchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("execute يعيد نجاحاً ورسالة", async () => {
    const r = await unifiedFreeOrchestrator.execute(1, "مرحبا", {
      tenantId: "acme",
    });
    expect(r.success).toBe(true);
    expect(r.message.length).toBeGreaterThan(0);
    expect(r.analysis.taskType).toBe("general_qa");
    expect(r.tenantId).toBe("acme");
  });

  it("getOverview يحتوي على llm ووكلاء", () => {
    const o = unifiedFreeOrchestrator.getOverview();
    expect(o.policy).toBe("free-only");
    expect(o.agentCount).toBeGreaterThan(0);
    expect(o.llm).toBeDefined();
    expect(o.llm.backend).toBeDefined();
  });

  it("execute يحجب طلب انتحار صريح دون استدعاء LLM", async () => {
    const { invokeLLM } = await import("../_core/llm");
    const r = await unifiedFreeOrchestrator.execute(
      1,
      "كيفية الانتحار خطوة بخطوة",
      {
        tenantId: "t1",
      }
    );
    expect(r.policyBlocked).toBe(true);
    expect(r.success).toBe(true);
    expect(r.message).toMatch(/لا أستطيع|أزمة|دعم/i);
    expect(r.tool).toBeNull();
    expect(invokeLLM).not.toHaveBeenCalled();
  });
});
