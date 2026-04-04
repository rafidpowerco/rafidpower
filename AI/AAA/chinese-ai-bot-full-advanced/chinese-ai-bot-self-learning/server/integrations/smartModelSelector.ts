/**
 * Smart Model Selector
 * نظام ذكي لاختيار أفضل نموذج بناءً على السياق والأداء
 */

import { multiSourceProvider, AIModel, AIRequest } from "./multiSourceProvider";

export interface SelectionCriteria {
  priority: "speed" | "quality" | "balanced" | "cost";
  taskType: string;
  userLanguage: string;
  contextLength?: number;
  budget?: number;
  preferredProviders?: string[];
  excludeProviders?: string[];
}

export interface ModelScore {
  model: AIModel;
  score: number;
  reasons: string[];
}

class SmartModelSelector {
  private modelPerformanceCache: Map<
    string,
    { score: number; lastUsed: Date }
  > = new Map();
  private userPreferences: Map<string, SelectionCriteria> = new Map();

  /**
   * اختيار أفضل نموذج بناءً على المعايير
   */
  async selectBestModel(
    request: AIRequest,
    criteria: SelectionCriteria
  ): Promise<AIModel | null> {
    const candidates = multiSourceProvider.getAllModels(request.type);

    if (candidates.length === 0) {
      return null;
    }

    // تسجيل النماذج المرشحة
    const scores = candidates.map(model =>
      this.scoreModel(model, request, criteria)
    );

    // ترتيب حسب الدرجة
    scores.sort((a, b) => b.score - a.score);

    return scores.length > 0 ? scores[0].model : null;
  }

  /**
   * تسجيل نموذج بناءً على المعايير
   */
  private scoreModel(
    model: AIModel,
    request: AIRequest,
    criteria: SelectionCriteria
  ): ModelScore {
    let score = 0;
    const reasons: string[] = [];

    // 1. معايير المزود
    if (criteria.preferredProviders?.includes(model.provider)) {
      score += 20;
      reasons.push("مزود مفضل");
    }

    if (criteria.excludeProviders?.includes(model.provider)) {
      score -= 100;
      reasons.push("مزود مستبعد");
      return { model, score, reasons };
    }

    // 2. معايير الأداء
    if (criteria.priority === "quality") {
      score += model.performance * 0.8;
      reasons.push(`أداء عالية: ${model.performance}%`);
    } else if (criteria.priority === "speed") {
      score += model.speed * 0.8;
      reasons.push(`سرعة عالية: ${model.speed}%`);
    } else if (criteria.priority === "balanced") {
      score += ((model.performance + model.speed) / 2) * 0.6;
      reasons.push(`متوازن: أداء ${model.performance}%, سرعة ${model.speed}%`);
    }

    // 3. معايير التكلفة
    if (criteria.priority === "cost" || criteria.budget === 0) {
      if (model.isFree) {
        score += 30;
        reasons.push("مجاني تماماً");
      } else {
        score -= 50;
        reasons.push("غير مجاني");
      }
    }

    // 4. معايير اللغة
    if (model.languages.includes(criteria.userLanguage)) {
      score += 15;
      reasons.push(`يدعم اللغة: ${criteria.userLanguage}`);
    }

    // 5. معايير السياق
    if (
      criteria.contextLength &&
      model.contextWindow &&
      model.contextWindow >= criteria.contextLength
    ) {
      score += 10;
      reasons.push(`يدعم السياق المطلوب: ${model.contextWindow}`);
    }

    // 6. معايير القدرات
    if (request.capabilities) {
      const matchingCapabilities = request.capabilities.filter(cap =>
        model.capabilities.includes(cap)
      ).length;
      score += matchingCapabilities * 10;
      if (matchingCapabilities > 0) {
        reasons.push(`يدعم ${matchingCapabilities} قدرات مطلوبة`);
      }
    }

    // 7. الأداء التاريخي
    const cachedPerformance = this.modelPerformanceCache.get(model.id);
    if (cachedPerformance) {
      score += cachedPerformance.score * 0.3;
      reasons.push(`أداء تاريخي: ${cachedPerformance.score.toFixed(2)}`);
    }

    // 8. معايير المصدر المفتوح
    if (model.isOpenSource) {
      score += 10;
      reasons.push("مصدر مفتوح");
    }

    // 9. معايير التشغيل المحلي
    if (model.localSupport) {
      score += 5;
      reasons.push("يمكن تشغيله محلياً");
    }

    return { model, score, reasons };
  }

  /**
   * تحديث أداء النموذج بناءً على النتائج الفعلية
   */
  updateModelPerformance(
    modelId: string,
    success: boolean,
    executionTime: number
  ) {
    const current = this.modelPerformanceCache.get(modelId) || {
      score: 50,
      lastUsed: new Date(),
    };

    // حساب الدرجة الجديدة
    const timeScore = Math.max(0, 100 - executionTime / 100); // أسرع = درجة أعلى
    const successBonus = success ? 10 : -20;
    const newScore = current.score * 0.7 + (timeScore + successBonus) * 0.3;

    this.modelPerformanceCache.set(modelId, {
      score: Math.max(0, Math.min(100, newScore)),
      lastUsed: new Date(),
    });
  }

  /**
   * حفظ تفضيلات المستخدم
   */
  saveUserPreferences(userId: string, criteria: SelectionCriteria) {
    this.userPreferences.set(userId, criteria);
  }

  /**
   * الحصول على تفضيلات المستخدم
   */
  getUserPreferences(userId: string): SelectionCriteria | undefined {
    return this.userPreferences.get(userId);
  }

  /**
   * الحصول على توصيات النماذج
   */
  async getRecommendations(
    request: AIRequest,
    criteria: SelectionCriteria,
    count: number = 3
  ): Promise<ModelScore[]> {
    const candidates = multiSourceProvider.getAllModels(request.type);

    if (candidates.length === 0) {
      return [];
    }

    const scores = candidates.map(model =>
      this.scoreModel(model, request, criteria)
    );
    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, count);
  }

  /**
   * مقارنة النماذج
   */
  compareModels(modelIds: string[]): any[] {
    return modelIds
      .map(id => multiSourceProvider.getAllModels().find(m => m.id === id))
      .filter((m): m is AIModel => m !== undefined)
      .map(model => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
        type: model.type,
        performance: model.performance,
        speed: model.speed,
        languages: model.languages,
        capabilities: model.capabilities,
        isFree: model.isFree,
        isOpenSource: model.isOpenSource,
        localSupport: model.localSupport,
      }));
  }

  /**
   * الحصول على إحصائيات الأداء
   */
  getPerformanceStats(): any {
    const stats = {
      totalModels: multiSourceProvider.getAllModels().length,
      averagePerformance: 0,
      averageSpeed: 0,
      freeModels: 0,
      openSourceModels: 0,
      cachedModels: this.modelPerformanceCache.size,
    };

    const models = multiSourceProvider.getAllModels();
    let totalPerformance = 0;
    let totalSpeed = 0;

    models.forEach(model => {
      totalPerformance += model.performance;
      totalSpeed += model.speed;
      if (model.isFree) stats.freeModels++;
      if (model.isOpenSource) stats.openSourceModels++;
    });

    if (models.length > 0) {
      stats.averagePerformance = totalPerformance / models.length;
      stats.averageSpeed = totalSpeed / models.length;
    }

    return stats;
  }
}

export const smartModelSelector = new SmartModelSelector();
