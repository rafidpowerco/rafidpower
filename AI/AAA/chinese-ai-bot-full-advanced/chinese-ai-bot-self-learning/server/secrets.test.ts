import { describe, expect, it } from "vitest";

const hasBotSecrets = Boolean(
  process.env.TELEGRAM_BOT_TOKEN &&
    process.env.OPENROUTER_API_KEY &&
    process.env.OWNER_TELEGRAM_ID
);

/** يعمل في CI بدون مفاتيح — يثبت أن قواعد الصيغة لا تنكسر مع التغييرات */
describe("صيغ الأسرار (قيم اصطناعية)", () => {
  it("TELEGRAM_BOT_TOKEN: صيغة bot_id:secret", () => {
    const ok = "123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi";
    const bad = "no-colon";
    expect(ok).toMatch(/^\d+:[\w-]+$/);
    expect(bad).not.toMatch(/^\d+:[\w-]+$/);
    const parts = ok.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^\d+$/);
    expect(parts[1]!.length).toBeGreaterThan(20);
  });

  it("OPENROUTER_API_KEY: بادئة وبُعد أدنى", () => {
    const ok = `sk-or-v1-${"x".repeat(52)}`;
    expect(ok.startsWith("sk-or-v1-")).toBe(true);
    expect(ok.length).toBeGreaterThan(50);
    expect("sk-other").not.toMatch(/^sk-or-v1-/);
  });

  it("OWNER_TELEGRAM_ID: أرقام فقط", () => {
    expect("987654321").toMatch(/^\d+$/);
    expect("abc").not.toMatch(/^\d+$/);
  });
});

describe.skipIf(!hasBotSecrets)("Environment Secrets Validation", () => {
  it("should have TELEGRAM_BOT_TOKEN configured", () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toBeDefined();
    expect(token).toMatch(/^\d+:[\w-]+$/);
  });

  it("should have OPENROUTER_API_KEY configured", () => {
    const key = process.env.OPENROUTER_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-or-v1-/);
  });

  it("should have OWNER_TELEGRAM_ID configured", () => {
    const id = process.env.OWNER_TELEGRAM_ID;
    expect(id).toBeDefined();
    expect(id?.length).toBeGreaterThan(0);
  });

  it("should validate Telegram Bot Token format", () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const parts = token?.split(":");
    expect(parts).toHaveLength(2);
    expect(parts?.[0]).toMatch(/^\d+$/);
    expect(parts?.[1]?.length).toBeGreaterThan(20);
  });

  it("should validate OpenRouter API Key format", () => {
    const key = process.env.OPENROUTER_API_KEY;
    expect(key?.startsWith("sk-or-v1-")).toBe(true);
    expect(key?.length).toBeGreaterThan(50);
  });
});
