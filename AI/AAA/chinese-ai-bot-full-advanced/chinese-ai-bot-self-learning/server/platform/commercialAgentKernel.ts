/**
 * نواة تخطيط وكيل تجاري — نقاط توسيع فقط (لا تنفيذ «ذكاء شامل» هنا).
 * اربط لاحقاً: فوترة، تعدد مستأجرين، RAG، أدوات موقعة، امتثال.
 */

/** هوية عميل / منظمة (تعدد مستأجرين لاحقاً) */
export type TenantId = string;

/** مصدر معرفة يُفهرس بموافقة العميل */
export interface KnowledgeSource {
  id: string;
  tenantId: TenantId;
  kind: "upload" | "url" | "database" | "openapi";
  /** وصف للواجهات — التنفيذ في مرحلة لاحقة */
  uri?: string;
}

/** سياق جلسة للمساعد اللغوي التجاري */
export interface CustomerSessionContext {
  tenantId: TenantId;
  userId: string;
  locale?: string;
  /** حدود الاشتراك — تُفرض في الطبقة الخارجية */
  planTier?: "free" | "pro" | "enterprise";
}

/** إشارة تعلم آمنة (لا تُستخدم إلا بموافقة وسياسة خصوصية) */
export interface LearningSignal {
  tenantId: TenantId;
  taskType: string;
  success: boolean;
  toolId?: string;
  qualityHint?: number;
  /** معرف المستخدم داخل المستأجر (لاحقاً: ربط بجدول users) */
  userId?: string;
  createdAt: Date;
}

/** خطاف فوترة — اربط Stripe / نظامك الداخلي */
export interface BillingHook {
  recordUsage(input: {
    tenantId: TenantId;
    units: "llm_tokens" | "tool_calls" | "api_requests";
    amount: number;
    meta?: Record<string, string>;
  }): Promise<void>;
}

const noopBilling: BillingHook = {
  async recordUsage() {
    /* استبدل بتكامل تجاري */
  },
};

/**
 * واجهة «النواة التجارية» — وسّعها دون كسر المسارات الحالية (unified orchestrator).
 */
export class CommercialAgentKernel {
  constructor(private readonly billing: BillingHook = noopBilling) {}

  /**
   * ربط مصدر معرفة خارجي (رفع/رابط/قاعدة) — غير مفعّل بعد.
   * المعرفة اليدوية متاحة عبر واجهة «معرفتي» ومسار `knowledge.myAdd` (RAG خفيف).
   */
  async attachKnowledgeSource(
    _source: KnowledgeSource
  ): Promise<{ ok: boolean; message?: string }> {
    return {
      ok: false,
      message:
        "التكامل التلقائي مع مصادر المعرفة الخارجية غير مفعّل بعد. أضف النصوص المرجعية من صفحة «معرفتي» أو عبر knowledge.myAdd.",
    };
  }

  async recordLearningSignal(signal: LearningSignal): Promise<void> {
    const meta: Record<string, string> = {
      type: "learning_signal",
      taskType: signal.taskType,
      success: String(signal.success),
    };
    if (signal.toolId) meta.toolId = signal.toolId;
    if (signal.userId) meta.userId = signal.userId;
    await this.billing.recordUsage({
      tenantId: signal.tenantId,
      units: "api_requests",
      amount: 1,
      meta,
    });
  }

  assertCommercialLimits(ctx: CustomerSessionContext): void {
    if (!ctx.tenantId) {
      throw new Error("tenantId مطلوب للوضع التجاري");
    }
  }
}

export const commercialAgentKernel = new CommercialAgentKernel();
