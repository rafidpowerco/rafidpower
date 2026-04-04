import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SITE_NAME_SHORT } from "@/lib/brand";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export type AppToolbarLink = {
  path: string;
  label: string;
};

export const APP_TOOLBAR_LINKS: AppToolbarLink[] = [
  { path: "/", label: "الرئيسية" },
  { path: "/dashboard", label: "لوحة التحكم" },
  { path: "/chat", label: "المحادثة" },
  { path: "/statistics", label: "الإحصائيات" },
  { path: "/models", label: "النماذج" },
  { path: "/agents", label: "الوكلاء" },
  { path: "/knowledge", label: "المعرفة" },
  { path: "/feedback", label: "رأيك" },
  { path: "/status", label: "الحالة" },
];

function pathIsActive(path: string, loc: string): boolean {
  const normalized = loc || "/";
  if (path === "/") return normalized === "/";
  return normalized === path;
}

function toolbarButtonClass(active: boolean): string {
  return active
    ? "border-blue-500/50 bg-blue-950/50 text-white shadow-sm"
    : "border-slate-600 text-slate-200 hover:bg-slate-800/90";
}

export type AppToolbarProps = {
  /** يظهر قبل روابط التنقل القياسية */
  leading?: ReactNode;
  /** يظهر بعد روابط التنقل القياسية */
  trailing?: ReactNode;
  /** مسارات تُستثنى من القائمة (نادرة) */
  exclude?: string[];
  /** زر يعيد للرئيسية مع الاسم المختصر */
  showBrand?: boolean;
  className?: string;
};

/**
 * شريط تنقل موحّد لصفحات التطبيق بعد تسجيل الدخول.
 */
export function AppToolbar({
  leading,
  trailing,
  exclude = [],
  showBrand = false,
  className = "",
}: AppToolbarProps) {
  const [loc, setLocation] = useLocation();
  const links = APP_TOOLBAR_LINKS.filter(l => !exclude.includes(l.path));

  return (
    <nav
      className={`flex flex-wrap items-center justify-end gap-2 ${className}`}
      aria-label="تنقل التطبيق"
    >
      {showBrand && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white -ml-1"
          onClick={() => setLocation("/")}
        >
          <Sparkles
            className="h-4 w-4 text-blue-400 shrink-0 ml-1.5"
            aria-hidden
          />
          <span className="font-medium">{SITE_NAME_SHORT}</span>
        </Button>
      )}
      {leading}
      {links.map(({ path, label }) => {
        const active = pathIsActive(path, loc);
        return (
          <Button
            key={path}
            type="button"
            variant="outline"
            size="sm"
            className={toolbarButtonClass(active)}
            aria-current={active ? "page" : undefined}
            onClick={() => setLocation(path)}
          >
            {label}
          </Button>
        );
      })}
      {trailing}
    </nav>
  );
}
