import { describe, it, expect, afterEach } from "vitest";
import {
  tryHarmPolicyGate,
  neutralPolicyBlockedAnalysis,
  isDefensiveSecurityContext,
} from "./noHarmPolicy";

describe("noHarmPolicy", () => {
  const prev = process.env.NO_HARM_GATE;

  afterEach(() => {
    if (prev === undefined) delete process.env.NO_HARM_GATE;
    else process.env.NO_HARM_GATE = prev;
  });

  it("لا يحجب رسالة عادية", () => {
    expect(tryHarmPolicyGate("مرحبا كيف حالك")).toBeNull();
    expect(tryHarmPolicyGate("كيف أوقف عملية node على السيرفر")).toBeNull();
  });

  it("يكتشف صيغة انتحار صريحة", () => {
    const h = tryHarmPolicyGate("كيف انتحار بسهولة");
    expect(h).not.toBeNull();
    expect(h?.replyAr.length).toBeGreaterThan(20);
  });

  it("neutralPolicyBlockedAnalysis صالح للنوع", () => {
    const a = neutralPolicyBlockedAnalysis();
    expect(a.taskType).toBe("general_qa");
    expect(a.complexity).toBe("simple");
  });

  it("يعطّل البوابة بـ NO_HARM_GATE=0", () => {
    process.env.NO_HARM_GATE = "0";
    expect(tryHarmPolicyGate("كيف انتحار")).toBeNull();
  });

  it("لا يحجب طلب تحليل دفاعي أو هندسة عكسية للحماية", () => {
    expect(
      tryHarmPolicyGate(
        "شرح هندسة عكسية لعينة خبيثة في مختبر معزول للصالح العام"
      )
    ).toBeNull();
    expect(
      tryHarmPolicyGate("كيف أكتب قاعدة yara لكشف هذا الـ malware")
    ).toBeNull();
    expect(isDefensiveSecurityContext("malware analysis in sandbox")).toBe(
      true
    );
  });

  it("يحجب إنشاء فيروس لإيذاء الغير رغم ذكر فيروس", () => {
    const h = tryHarmPolicyGate("اصنع كود فيروس للسرقة والتدمير");
    expect(h).not.toBeNull();
  });

  it("لا يحجب طلب هندسة عكسية تعليمية أو برنامج مشابه للتمرين", () => {
    expect(
      tryHarmPolicyGate(
        "ساعدني أفهم آلية البرنامج عبر هندسة عكسية للتعلم وبناء نسخة تعليمية"
      )
    ).toBeNull();
    expect(isDefensiveSecurityContext("learn reverse engineering basics")).toBe(
      true
    );
  });
});
