/**
 * Learning Engine - محرك التعلم الذاتي
 * يحلل المحادثات ويستخرج الأنماط والدروس
 */

import { createHash } from "node:crypto";
import { getDb } from "../db";
import {
  patterns,
  learningLogs,
  modelPerformance,
  collectivePatternStats,
  InsertPattern,
  InsertLearningLog,
  ModelPerformance,
} from "../../drizzle/schema";
import { eq, and, desc, like, count } from "drizzle-orm";
import { AnalyzedTask } from "./taskAnalyzer";
import { ENV } from "../_core/env";

export interface DiscoveredPattern {
  id?: number;
  patternType: "question" | "preference" | "rule" | "strategy" | "error";
  pattern: string;
  description: string;
  confidence: number;
  occurrences: number;
  impact: "high" | "medium" | "low";
  metadata?: Record<string, unknown>;
}

export interface LearningMetrics {
  totalTasks: number;
  successfulTasks: number;
  successRate: number;
  averageQuality: number;
  discoveredPatterns: number;
  improvementRate: number;
}

function dec2(n: number): string {
  return n.toFixed(2);
}

/**
 * Learning Engine Class
 */
export class LearningEngine {
  private initialized = false;

  /**
   * Initialize learning engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    console.log("✅ Learning Engine initialized");
  }

  /**
   * Analyze a completed task and extract patterns
   */
  async analyzeTaskOutcome(
    userId: number,
    task: AnalyzedTask,
    result: {
      success: boolean;
      quality: number; // 0-1
      toolUsed: string;
      executionTime: number;
      feedback?: string;
    },
    tenantId?: string
  ): Promise<DiscoveredPattern[]> {
    const tid = tenantId ?? ENV.defaultTenantId;
    const discovered: DiscoveredPattern[] = [];

    // Pattern 1: Tool effectiveness
    const toolPattern: DiscoveredPattern = {
      patternType: "strategy",
      pattern: `${task.taskType}_uses_${result.toolUsed}`,
      description: `Tool ${result.toolUsed} is effective for ${task.taskType}`,
      confidence: result.quality,
      occurrences: 1,
      impact: result.quality > 0.8 ? "high" : "medium",
      metadata: {
        taskType: task.taskType,
        tool: result.toolUsed,
        quality: result.quality,
        executionTime: result.executionTime,
      },
    };
    discovered.push(toolPattern);

    // Pattern 2: User preferences
    if (result.feedback) {
      const preferencePattern: DiscoveredPattern = {
        patternType: "preference",
        pattern: `user_prefers_${this.extractPreference(result.feedback)}`,
        description: `User preference: ${result.feedback}`,
        confidence: 0.7,
        occurrences: 1,
        impact: "medium",
      };
      discovered.push(preferencePattern);
    }

    // Pattern 3: Error patterns
    if (!result.success) {
      const errorPattern: DiscoveredPattern = {
        patternType: "error",
        pattern: `error_in_${task.taskType}_with_${result.toolUsed}`,
        description: `Error occurred when using ${result.toolUsed} for ${task.taskType}`,
        confidence: 0.9,
        occurrences: 1,
        impact: "high",
      };
      discovered.push(errorPattern);
    }

    // Save patterns to database
    await this.savePatterns(userId, discovered, tid);

    // Log learning event
    await this.logLearningEvent(
      userId,
      "pattern_discovered",
      String(discovered.length),
      tid
    );

    return discovered;
  }

  /**
   * Extract preference from feedback
   */
  private extractPreference(feedback: string): string {
    // Simple extraction - can be enhanced with NLP
    if (
      feedback.toLowerCase().includes("fast") ||
      feedback.toLowerCase().includes("سريع")
    ) {
      return "fast_response";
    } else if (
      feedback.toLowerCase().includes("detailed") ||
      feedback.toLowerCase().includes("مفصل")
    ) {
      return "detailed_response";
    } else if (
      feedback.toLowerCase().includes("simple") ||
      feedback.toLowerCase().includes("بسيط")
    ) {
      return "simple_response";
    }
    return "general";
  }

  /**
   * Save patterns to database
   */
  async savePatterns(
    userId: number,
    discoveredPatterns: DiscoveredPattern[],
    tenantId?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;
    const tid = tenantId ?? ENV.defaultTenantId;

    for (const pattern of discoveredPatterns) {
      // Check if pattern already exists
      const existing = await db
        .select()
        .from(patterns)
        .where(
          and(
            eq(patterns.telegramUserId, userId),
            eq(patterns.pattern, pattern.pattern),
            eq(patterns.tenantId, tid)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        const existingPattern = existing[0];
        const prevOcc = existingPattern.occurrences ?? 0;
        const prevConf = Number(existingPattern.confidence ?? 0);
        const newOcc = prevOcc + 1;
        const newConfidence =
          (prevConf * prevOcc + pattern.confidence) / newOcc;
        await db
          .update(patterns)
          .set({
            occurrences: newOcc,
            confidence: dec2(Math.min(1, newConfidence)),
            updatedAt: new Date(),
          })
          .where(eq(patterns.id, existingPattern.id));
      } else {
        // Insert new pattern
        const insertData: InsertPattern = {
          telegramUserId: userId,
          tenantId: tid,
          patternType: pattern.patternType,
          pattern: pattern.pattern,
          description: pattern.description,
          confidence: dec2(pattern.confidence),
          occurrences: pattern.occurrences,
          isActive: true,
        };
        await db.insert(patterns).values(insertData);
      }

      await this.bumpCollectiveStats(tid, pattern, pattern.confidence);
    }
  }

  /** تجميع عبر كل العملاء لنفس المستأجر (معرّف النمط فقط، بلا نصوص خاصة بالمستخدم) */
  private async bumpCollectiveStats(
    tenantId: string,
    pattern: DiscoveredPattern,
    quality: number
  ): Promise<void> {
    if (!ENV.collectiveLearningEnabled) return;
    const db = await getDb();
    if (!db) return;

    try {
      const preview = pattern.pattern.slice(0, 400);
      const hash = createHash("sha256")
        .update(`${pattern.patternType}:${preview}`)
        .digest("hex");
      const q = Math.max(0, Math.min(1, quality));

      const existing = await db
        .select()
        .from(collectivePatternStats)
        .where(
          and(
            eq(collectivePatternStats.tenantId, tenantId),
            eq(collectivePatternStats.patternHash, hash)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        const row = existing[0];
        const n = (row.totalOccurrences ?? 0) + 1;
        const sum = Number(row.qualitySum ?? 0) + q;
        await db
          .update(collectivePatternStats)
          .set({
            totalOccurrences: n,
            qualitySum: sum.toFixed(4),
            patternPreview: preview,
            patternType: pattern.patternType,
          })
          .where(eq(collectivePatternStats.id, row.id));
      } else {
        await db.insert(collectivePatternStats).values({
          tenantId,
          patternHash: hash,
          patternType: pattern.patternType,
          patternPreview: preview,
          totalOccurrences: 1,
          qualitySum: q.toFixed(4),
        });
      }
    } catch (e) {
      console.warn(
        "[Learning] تعذّر تحديث collective_pattern_stats — نفّذ db:migrate (0007):",
        e
      );
    }
  }

  /**
   * أداة فضّلها الجمهور مجمّعاً لنوع المهمة (نفس مستأجرك).
   */
  async getCollectivePreferredToolId(
    tenantId: string,
    taskType: string
  ): Promise<string | null> {
    if (!ENV.collectiveLearningEnabled) return null;
    const db = await getDb();
    if (!db) return null;
    try {
      const prefix = `${taskType}_uses_`;
      const rows = await db
        .select()
        .from(collectivePatternStats)
        .where(
          and(
            eq(collectivePatternStats.tenantId, tenantId),
            like(collectivePatternStats.patternPreview, `${prefix}%`)
          )
        )
        .orderBy(desc(collectivePatternStats.totalOccurrences))
        .limit(1);
      if (rows.length === 0) return null;
      const prev = rows[0].patternPreview;
      if (!prev.startsWith(prefix)) return null;
      const id = prev.slice(prefix.length).trim();
      return id.length > 0 ? id : null;
    } catch {
      return null;
    }
  }

  private async getCollectivePromptLines(
    tenantId: string,
    taskType: string,
    limit: number
  ): Promise<string[]> {
    if (!ENV.collectiveLearningEnabled) return [];
    const db = await getDb();
    if (!db) return [];

    try {
      const scoped = await db
        .select()
        .from(collectivePatternStats)
        .where(
          and(
            eq(collectivePatternStats.tenantId, tenantId),
            like(collectivePatternStats.patternPreview, `%${taskType}%`)
          )
        )
        .orderBy(desc(collectivePatternStats.totalOccurrences))
        .limit(limit);

      let rows = scoped;
      if (rows.length < Math.min(3, limit)) {
        rows = await db
          .select()
          .from(collectivePatternStats)
          .where(eq(collectivePatternStats.tenantId, tenantId))
          .orderBy(desc(collectivePatternStats.totalOccurrences))
          .limit(limit);
      }

      const lines: string[] = [];
      for (const r of rows) {
        const n = r.totalOccurrences ?? 0;
        const avgQ = n > 0 ? (Number(r.qualitySum ?? 0) / n).toFixed(2) : "?";
        const tag =
          r.patternType === "error"
            ? "تنبيه جماعي"
            : r.patternType === "preference"
              ? "تفضيل شائع"
              : "اتجاه شائع";
        lines.push(
          `• [${tag}] ${r.patternPreview.slice(0, 180)} (×${n}، جودة متوسطة ~${avgQ})`
        );
      }
      return lines;
    } catch {
      return [];
    }
  }

  /**
   * Get patterns for a user
   */
  async getUserPatterns(
    userId: number,
    tenantId?: string
  ): Promise<DiscoveredPattern[]> {
    const db = await getDb();
    if (!db) return [];
    const tid = tenantId ?? ENV.defaultTenantId;

    const userPatterns = await db
      .select()
      .from(patterns)
      .where(
        and(
          eq(patterns.telegramUserId, userId),
          eq(patterns.isActive, true),
          eq(patterns.tenantId, tid)
        )
      )
      .orderBy(
        desc(patterns.confidence),
        desc(patterns.occurrences),
        desc(patterns.updatedAt)
      );

    return userPatterns.map(p => ({
      id: p.id,
      patternType: p.patternType as DiscoveredPattern["patternType"],
      pattern: p.pattern,
      description: p.description || "",
      confidence: Number(p.confidence || 0),
      occurrences: p.occurrences || 1,
      impact: this.calculateImpact(p.confidence),
    }));
  }

  /**
   * Calculate impact based on confidence
   */
  private calculateImpact(
    confidence: string | null
  ): "high" | "medium" | "low" {
    const conf = Number(confidence || 0);
    if (conf >= 0.8) return "high";
    if (conf >= 0.5) return "medium";
    return "low";
  }

  /**
   * Log learning event
   */
  async logLearningEvent(
    userId: number,
    logType: string,
    description?: string,
    tenantId?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;
    const tid = tenantId ?? ENV.defaultTenantId;

    const insertData: InsertLearningLog = {
      telegramUserId: userId,
      tenantId: tid,
      logType,
      description: description || "",
      impact: "medium",
    };

    await db.insert(learningLogs).values(insertData);
  }

  /**
   * Get learning metrics for a user
   */
  async getLearningMetrics(
    userId: number,
    tenantId?: string
  ): Promise<LearningMetrics> {
    const db = await getDb();
    if (!db) {
      return {
        totalTasks: 0,
        successfulTasks: 0,
        successRate: 0,
        averageQuality: 0,
        discoveredPatterns: 0,
        improvementRate: 0,
      };
    }
    const tid = tenantId ?? ENV.defaultTenantId;

    // Get user patterns
    const userPatterns = await db
      .select()
      .from(patterns)
      .where(
        and(eq(patterns.telegramUserId, userId), eq(patterns.tenantId, tid))
      );

    const totalTasks = userPatterns.reduce(
      (sum, p) => sum + (p.occurrences || 0),
      0
    );
    const discoveredPatterns = userPatterns.length;
    const averageConfidence =
      userPatterns.length > 0
        ? userPatterns.reduce((sum, p) => sum + Number(p.confidence || 0), 0) /
          userPatterns.length
        : 0;

    const stratWeight = userPatterns
      .filter(p => p.patternType === "strategy")
      .reduce((s, p) => s + (p.occurrences || 0), 0);
    const errWeight = userPatterns
      .filter(p => p.patternType === "error")
      .reduce((s, p) => s + (p.occurrences || 0), 0);
    const denom = stratWeight + errWeight;
    const successRate =
      denom > 0
        ? Math.min(1, Math.max(0, stratWeight / denom))
        : averageConfidence > 0
          ? Math.min(1, averageConfidence)
          : 0.75;

    return {
      totalTasks,
      successfulTasks: Math.round(totalTasks * successRate),
      successRate,
      averageQuality: averageConfidence,
      discoveredPatterns,
      improvementRate:
        discoveredPatterns > 0 ? Math.min(0.25, discoveredPatterns / 200) : 0,
    };
  }

  /**
   * مقتطف عربي للـ system prompt: يوجّه النموذج بما ثبت فعاليته أو تجنّب الأخطاء لهذا المستخدم.
   */
  async buildPromptContextForTask(
    userId: number,
    task: AnalyzedTask,
    tenantId?: string,
    opts?: { maxBullets?: number }
  ): Promise<string> {
    const maxB = Math.min(16, Math.max(4, opts?.maxBullets ?? 10));
    const tid = tenantId ?? ENV.defaultTenantId;
    const taskType = task.taskType;

    const all = await this.getUserPatterns(userId, tenantId);

    const score = (p: DiscoveredPattern) =>
      p.confidence * Math.log1p(p.occurrences);

    const pick = (list: DiscoveredPattern[]) =>
      [...list].sort((a, b) => score(b) - score(a)).slice(0, maxB);

    const relevant = all.filter(
      p =>
        p.pattern.includes(taskType) ||
        p.patternType === "preference" ||
        p.patternType === "error"
    );
    const scored = pick(relevant.length > 0 ? relevant : all);

    const collectiveLines = await this.getCollectivePromptLines(
      tid,
      taskType,
      Math.min(6, maxB)
    );

    if (scored.length === 0 && collectiveLines.length === 0) return "";

    const sections: string[] = [];

    if (scored.length > 0) {
      sections.push("---");
      sections.push(
        "سياق تعلّم متراكم من تفاعلاتك السابقة (أولوية إرشادية؛ حافظ على الصحة والمنطق):"
      );
      for (const p of scored) {
        const tag =
          p.patternType === "error"
            ? "تجنّب"
            : p.patternType === "preference"
              ? "تفضيل"
              : "استراتيجية";
        const text = (p.description || p.pattern).slice(0, 220);
        sections.push(
          `• [${tag}] ${text} (ثقة تقريبية ${Math.round(p.confidence * 100)}٪، مرات ${p.occurrences})`
        );
      }
    }

    if (collectiveLines.length > 0) {
      sections.push("---");
      sections.push(
        "اتجاهات مُجمّعة عبر مستخدمي نفس البيئة (بدون معلومات تعريف شخصية؛ دعم قرارك فقط):"
      );
      sections.push(...collectiveLines);
    }

    return sections.join("\n");
  }

  /**
   * أداة مجانية فضّلها سابقاً لهذا النوع من المهام (من أنماط strategy *_uses_*).
   */
  async getPreferredToolIdForTaskType(
    userId: number,
    taskType: string,
    tenantId?: string
  ): Promise<string | null> {
    const list = await this.getUserPatterns(userId, tenantId);
    const prefix = `${taskType}_uses_`;
    const candidates = list.filter(
      p => p.patternType === "strategy" && p.pattern.startsWith(prefix)
    );
    if (candidates.length === 0) return null;
    candidates.sort(
      (a, b) =>
        b.confidence * Math.log1p(b.occurrences) -
        a.confidence * Math.log1p(a.occurrences)
    );
    const id = candidates[0].pattern.slice(prefix.length).trim();
    return id.length > 0 ? id : null;
  }

  /**
   * Get recommendations based on patterns
   */
  async getRecommendations(
    userId: number,
    tenantId?: string
  ): Promise<string[]> {
    const userPatterns = await this.getUserPatterns(userId, tenantId);
    const recommendations: string[] = [];

    // Analyze patterns and generate recommendations
    const highConfidencePatterns = userPatterns.filter(p => p.confidence > 0.8);

    if (highConfidencePatterns.length > 0) {
      recommendations.push(
        `لديك ${highConfidencePatterns.length} أنماط عالية الثقة — استفد منها لتسريع النتائج وتقليل التجربة والخطأ.`
      );
    }

    const errorPatterns = userPatterns.filter(p => p.patternType === "error");
    if (errorPatterns.length > 0) {
      recommendations.push(
        `رُصد ${errorPatterns.length} نمط فشل متكرر — جرّب أداة أو صياغة مختلفة عند المهام المشابهة.`
      );
    }

    const preferencePatterns = userPatterns.filter(
      p => p.patternType === "preference"
    );
    if (preferencePatterns.length > 0) {
      recommendations.push(
        "تفضيلاتك محفوظة — يمكن ضبط أسلوب الردود (مختصر/مفصل) بما يتماشى معها."
      );
    }

    if (ENV.collectiveLearningEnabled) {
      const db = await getDb();
      if (db) {
        try {
          const tid = tenantId ?? ENV.defaultTenantId;
          const [agg] = await db
            .select({ c: count() })
            .from(collectivePatternStats)
            .where(eq(collectivePatternStats.tenantId, tid));
          const n = Number(agg?.c ?? 0);
          if (n >= 4) {
            recommendations.push(
              "التعلّم المجمّع مفعّل لبيئتك — الردود تستفيد تدريجياً من أنماط شائعة عبر المستخدمين (بلا مشاركة هويات)."
            );
          }
        } catch {
          /* جدول غير مُرحَّل بعد */
        }
      }
    }

    return recommendations;
  }

  /**
   * Update model performance based on task outcome
   */
  async updateModelPerformance(
    userId: number,
    model: string,
    result: {
      success: boolean;
      quality: number;
      executionTime: number;
    },
    tenantId?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;
    const tid = tenantId ?? ENV.defaultTenantId;

    // Get existing performance record
    const existing = await db
      .select()
      .from(modelPerformance)
      .where(
        and(
          eq(modelPerformance.telegramUserId, userId),
          eq(modelPerformance.model, model),
          eq(modelPerformance.tenantId, tid)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const perf = existing[0];
      const prevN = perf.totalRequests || 0;
      const newTotalRequests = prevN + 1;
      const newAverageRating =
        (Number(perf.averageRating || 0) * prevN + result.quality) /
        newTotalRequests;
      const newAverageResponseTime =
        (Number(perf.averageResponseTime || 0) * prevN + result.executionTime) /
        newTotalRequests;
      const prevSuccessRate = Number(perf.successRate ?? 0);
      const newSuccessRate =
        (prevSuccessRate * prevN + (result.success ? 1 : 0)) / newTotalRequests;

      await db
        .update(modelPerformance)
        .set({
          totalRequests: newTotalRequests,
          averageRating: dec2(newAverageRating),
          averageResponseTime: dec2(newAverageResponseTime),
          successRate: dec2(Math.min(1, Math.max(0, newSuccessRate))),
          lastUsed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(modelPerformance.id, perf.id));
    } else {
      await db.insert(modelPerformance).values({
        telegramUserId: userId,
        tenantId: tid,
        model,
        totalRequests: 1,
        averageRating: dec2(result.quality),
        averageResponseTime: dec2(result.executionTime),
        successRate: dec2(result.success ? 1 : 0),
        lastUsed: new Date(),
      });
    }
  }

  /**
   * Get best performing models
   */
  async getBestPerformingModels(
    userId: number,
    tenantId?: string
  ): Promise<ModelPerformance[]> {
    const db = await getDb();
    if (!db) return [];
    const tid = tenantId ?? ENV.defaultTenantId;

    const rows = await db
      .select()
      .from(modelPerformance)
      .where(
        and(
          eq(modelPerformance.telegramUserId, userId),
          eq(modelPerformance.tenantId, tid)
        )
      )
      .orderBy(
        desc(modelPerformance.successRate),
        desc(modelPerformance.totalRequests)
      );

    return rows.slice(0, 5);
  }

  /**
   * Suggest next action based on learning
   */
  async suggestNextAction(
    userId: number,
    currentTask: AnalyzedTask,
    tenantId?: string
  ): Promise<string> {
    const userPatterns = await this.getUserPatterns(userId, tenantId);
    const metrics = await this.getLearningMetrics(userId, tenantId);

    // If success rate is low, suggest trying different approach
    if (metrics.successRate < 0.55) {
      return "معدل النجاح لديك منخفض نسبياً — جرّب تغيير الأداة أو تقسيم الطلب إلى خطوات أصغر.";
    }

    if (metrics.discoveredPatterns > 12) {
      return "لديك مخزون جيد من الأنماط؛ النظام يوجّه الردود تلقائياً بناءً على تاريخك.";
    }

    const relevantPatterns = userPatterns.filter(p =>
      p.pattern.includes(currentTask.taskType)
    );
    if (relevantPatterns.length > 0) {
      const bestPattern = relevantPatterns.reduce((a, b) =>
        a.confidence * Math.log1p(a.occurrences) >
        b.confidence * Math.log1p(b.occurrences)
          ? a
          : b
      );
      const hint = (bestPattern.description || bestPattern.pattern).slice(
        0,
        160
      );
      return `من سجلّك: «${hint}» — يبدو مفيداً لهذا النوع من المهام.`;
    }

    return "واصل كما تشاء؛ النظام يتعلّم من كل تفاعل ويحسّن الاختيارات تدريجياً.";
  }
}

// Export singleton instance
export const learningEngine = new LearningEngine();
