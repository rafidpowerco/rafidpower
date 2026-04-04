import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  Brain,
  Zap,
  MessageSquare,
  BarChart3,
  Code,
  Sparkles,
  BookOpen,
  Shield,
  Gauge,
  Server,
  type LucideIcon,
} from "lucide-react";
import { SITE_NAME_FULL, SITE_NAME_SHORT, SITE_TAGLINE } from "@/lib/brand";

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("oauth_error")) {
      toast.error(
        "تعذّر إكمال تسجيل الدخول عبر OAuth. راجع إعدادات المزوّد والعنوان العلني للتطبيق."
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const features: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: Brain,
      title: "تعلم تشغيلي خفيف",
      description:
        "تسجيل نتائج المهام وتحسين اختيار الأدوات والنماذج مع الاستخدام — دون ادّعاء «ذكاء بشري».",
    },
    {
      icon: Zap,
      title: "مسار نماذج موحّد",
      description:
        "اختيار نماذج لغوية ومسارات تنفيذ وفق إعدادات الخادم (مخصص، OpenRouter، Ollama…).",
    },
    {
      icon: MessageSquare,
      title: "محادثات مرتبطة بالحساب",
      description:
        "جلسات محفوظة، حدود طول، وربط اختياري بمعرفة شخصية تُحقن في السياق.",
    },
    {
      icon: BarChart3,
      title: "إحصائيات وتدقيق",
      description:
        "لوحة تحكم ورسوم بيانية لنشاطك ومزودي النماذج ضمن المستأجر المحدد.",
    },
    {
      icon: Code,
      title: "تنفيذ كود محكوم",
      description:
        "مسار مهام برمجية مع صندوق تنفيذ محدود الزمن — للتجارب والمساعدة وليس لإنتاج غير مراقب.",
    },
    {
      icon: Sparkles,
      title: "توليد نصوص ومساعدة إنتاجية",
      description:
        "إجابات، صياغة، وملخصات ضمن سياسة التكلفة والنموذج النشط لديك.",
    },
    {
      icon: BookOpen,
      title: "معرفة مؤسّسة (RAG خفيف)",
      description:
        "مقتطفات نصية تضيفها أنت؛ تُسترجع بالتطابق الدلالي الخفيف وتُعرض كمرجع في الواجهة.",
    },
  ];

  const highlights: { value: string; label: string; icon: LucideIcon }[] = [
    { value: "20+", label: "نماذج ضمن الكتالوج (حسب التفعيل)", icon: Server },
    { value: "محدود", label: "حد معدل للطلبات على واجهة الـ API", icon: Gauge },
    { value: "جلسة", label: "مصادقة آمنة عبر OAuth / JWT", icon: Shield },
    { value: "مستأجر", label: "عزل بيانات حسب tenantId", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <nav
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md"
        aria-label="التنقل الرئيسي"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30"
              aria-hidden
            >
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0 text-right">
              <p className="text-sm font-semibold text-white truncate">
                {SITE_NAME_SHORT}
              </p>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                منصة تشغيل للفرق
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                  onClick={() => setLocation("/dashboard")}
                >
                  لوحة التحكم
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                  onClick={() => setLocation("/chat")}
                >
                  المحادثة
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                  onClick={() => setLocation("/statistics")}
                >
                  الإحصائيات
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                  onClick={() => setLocation("/agents")}
                >
                  الوكلاء
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                  onClick={() => setLocation("/models")}
                >
                  النماذج
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                  onClick={() => setLocation("/knowledge")}
                >
                  المعرفة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/40 text-red-200 hover:bg-red-950/50"
                  onClick={() => logout()}
                >
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-medium text-blue-400/90 mb-3">
              {SITE_NAME_FULL}
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-5 leading-tight">
              مساعد لغوي وتشغيل معرفة
              <span className="block text-slate-400 text-2xl sm:text-3xl font-normal mt-3">
                لفرق الدعم والمنتج والتشغيل
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-10">
              {SITE_TAGLINE}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 shadow-md shadow-blue-900/20"
                onClick={() => setLocation("/chat")}
              >
                فتح المحادثة
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-100 hover:bg-slate-800"
                onClick={() => setLocation("/knowledge")}
              >
                إدارة المعرفة
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-100 hover:bg-slate-800"
                onClick={() => setLocation("/statistics")}
              >
                الإحصائيات
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {features.map(feature => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="bg-slate-900/60 border-slate-700/80 hover:border-slate-600 transition-colors shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 mb-3">
                      <Icon
                        className="h-5 w-5 text-blue-400"
                        strokeWidth={1.75}
                      />
                    </div>
                    <CardTitle className="text-lg font-semibold text-white leading-snug">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            {highlights.map(h => {
              const Hi = h.icon;
              return (
                <Card
                  key={h.label}
                  className="bg-slate-900/40 border-slate-800 text-center"
                >
                  <CardContent className="pt-6 pb-5 px-3">
                    <Hi
                      className="h-5 w-5 text-slate-500 mx-auto mb-2"
                      strokeWidth={1.5}
                    />
                    <p className="text-xl font-semibold text-white mb-1">
                      {h.value}
                    </p>
                    <p className="text-xs text-slate-500 leading-snug">
                      {h.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-slate-900/80 p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
              جاهز للتجربة على بيئتك؟
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
              اضبط المتغيرات والمزودين على الخادم، ثم استخدم المحادثة والمعرفة
              ضمن حدود الاشتراك والامتثال لديك.
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => setLocation("/chat")}
            >
              البدء
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} {SITE_NAME_FULL}. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
