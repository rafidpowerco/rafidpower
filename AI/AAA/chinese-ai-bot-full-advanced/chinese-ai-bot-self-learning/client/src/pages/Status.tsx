import { AppToolbar } from "@/components/AppToolbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Loader2, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

export default function StatusPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const deep = trpc.system.healthDeep.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="w-14 h-14 text-amber-400" aria-hidden />
        <p className="text-slate-200 text-center max-w-md">
          صفحة الحالة التفصيلية للمسؤولين فقط.
        </p>
        <Button variant="outline" onClick={() => setLocation("/dashboard")}>
          العودة للوحة التحكم
        </Button>
      </div>
    );
  }

  const d = deep.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-400" aria-hidden />
              حالة النظام
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              فحص قاعدة البيانات وإعدادات LLM (بدون استهلاك طلب نموذج تلقائياً).
            </p>
          </div>
          <AppToolbar showBrand />
        </div>

        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-100">
              للميزانيات والمراقبة
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-600"
              disabled={deep.isFetching}
              onClick={() => void deep.refetch()}
            >
              تحديث
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-3">
            {deep.isLoading && <p className="text-slate-500">جارٍ التحميل…</p>}
            {deep.error && <p className="text-red-400">{deep.error.message}</p>}
            {d && (
              <dl className="space-y-2 font-mono text-xs sm:text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">قاعدة البيانات</dt>
                  <dd
                    className={
                      d.database === "up"
                        ? "text-emerald-400"
                        : d.database === "down"
                          ? "text-red-400"
                          : "text-slate-400"
                    }
                  >
                    {d.database}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">LLM backend</dt>
                  <dd className="text-slate-200">{d.llm.backend}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">NODE_ENV</dt>
                  <dd className="text-slate-200">{d.runtime.nodeEnv}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">TRUST_PROXY</dt>
                  <dd className="text-slate-200">
                    {d.runtime.trustProxy ? "1" : "0"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">تعلّم مجمّع</dt>
                  <dd className="text-slate-200">
                    {d.runtime.collectiveLearning ? "نعم" : "لا"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">جولات المجلس</dt>
                  <dd className="text-slate-200">
                    {d.runtime.llmCouncilRounds}
                  </dd>
                </div>
                <div className="pt-2 text-slate-500 text-xs">
                  GET <span className="text-slate-400">/health</span> أو{" "}
                  <span className="text-slate-400">/api/health</span> لمراقبة
                  خفيفة (JSON).
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
