import { describe, it, expect } from "vitest";
import {
  rankChunksByQuery,
  mmrRankChunks,
  tokenizeForSearch,
  normalizeForSearch,
} from "./knowledgeService";

describe("knowledgeService", () => {
  it("tokenizeForSearch يستخرج كلمات", () => {
    const t = tokenizeForSearch("hello world السلام عليكم");
    expect(t).toContain("hello");
    expect(t.some(x => x.includes("السلام"))).toBe(true);
  });

  it("rankChunksByQuery يفضّل التطابق", () => {
    const chunks = [
      { id: 1, title: "أ", content: "فواكه تفاح موز" },
      { id: 2, title: "ب", content: "سياسة اقتصاد" },
    ];
    const q = rankChunksByQuery(chunks, "تفاح فواكه");
    expect(q[0]?.id).toBe(1);
  });

  it("normalizeForSearch يزيل التشكيل ويوحّد الألف", () => {
    const n = normalizeForSearch("السَّلَامُ");
    expect(n).not.toMatch(/[\u064B-\u065F]/);
    expect(normalizeForSearch("إسلام")).toBe("اسلام");
  });

  it("التطبيع يرفع تطابق الاستعلام مع تشكيل", () => {
    const chunks = [
      { id: 1, title: "مرحبا", content: "السلام عليكم ورحمة الله" },
    ];
    const q = rankChunksByQuery(chunks, "السَّلَامُ عليكم");
    expect(q[0]?.id).toBe(1);
  });

  it("mmrRankChunks يضمّن تنويعاً عند تكرار شبه كامل للصلة", () => {
    const chunks = [
      { id: 1, title: "أ", content: "تفاح فواكه لذيذ" },
      { id: 2, title: "ب", content: "تفاح أحمر فواكه لذيذ" },
      { id: 3, title: "ج", content: "موز فواكه استوائية" },
    ];
    const r = mmrRankChunks(chunks, "تفاح موز فواكه", 2, 0.45, 24);
    expect(r.length).toBe(2);
    const joined = r.map(c => c.content).join(" ");
    expect(joined).toMatch(/موز/);
    expect(joined).toMatch(/تفاح/);
  });
});
