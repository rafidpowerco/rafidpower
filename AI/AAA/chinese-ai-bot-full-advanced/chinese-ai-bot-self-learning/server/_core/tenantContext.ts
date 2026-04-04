import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

/**
 * يحدد المستأجر النشط: جلسة المستخدم المسجّل أولاً، ثم المدخل، ثم الافتراضي من البيئة.
 */
export function resolveTenantId(params: {
  inputTenant?: string | null | undefined;
  sessionUser?: User | null;
}): string {
  const fromSession = params.sessionUser?.tenantId?.trim();
  if (fromSession) return fromSession;
  const fromInput = params.inputTenant?.trim();
  if (fromInput) return fromInput;
  return ENV.defaultTenantId;
}
