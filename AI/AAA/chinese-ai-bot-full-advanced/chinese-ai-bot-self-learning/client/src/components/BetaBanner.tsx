import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "beta_banner_dismissed_v1";

/**
 * شريط إصدار تجريبي — يُفعَّل بـ VITE_SHOW_BETA_BANNER=1 عند البناء أو التطوير.
 */
export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-[100] border-b border-amber-500/35 bg-amber-950/90 backdrop-blur-md text-amber-50"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="leading-relaxed text-center sm:text-right flex-1 min-w-[12rem]">
          <span className="font-semibold text-amber-200">
            إصدار تجريبي داخلي.
          </span>{" "}
          يُرجى عدم نشر الرابط علناً، وإبلاغ المشغّل بأي خلل أو بطء. البيانات قد
          تُستخدم لتحسين الاستقرار.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-amber-200 hover:text-white hover:bg-amber-900/50 h-8 px-2"
          onClick={dismiss}
          aria-label="إخفاء التنبيه"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
