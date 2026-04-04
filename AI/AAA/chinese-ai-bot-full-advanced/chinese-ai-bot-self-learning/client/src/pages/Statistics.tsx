import { useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart3, Lightbulb, Loader2 } from "lucide-react";
import { AppToolbar } from "@/components/AppToolbar";
import { toast } from "sonner";

const TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID ?? "default";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Statistics() {
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const dashboardQuery = trpc.bot.myDashboardData.useQuery(
    { tenantId: TENANT_ID },
    { enabled: Boolean(user) }
  );
  const perfQuery = trpc.bot.myModelPerformance.useQuery(
    { tenantId: TENANT_ID },
    { enabled: Boolean(user) }
  );
  const activityByDayQuery = trpc.bot.myActivityByDay.useQuery(
    { tenantId: TENANT_ID, days: 14 },
    { enabled: Boolean(user) }
  );

  const statsErrorToastRef = useRef<string | null>(null);
  useEffect(() => {
    const err =
      dashboardQuery.error ?? perfQuery.error ?? activityByDayQuery.error;
    if (!err?.message) {
      statsErrorToastRef.current = null;
      return;
    }
    if (statsErrorToastRef.current === err.message) return;
    statsErrorToastRef.current = err.message;
    toast.error(err.message);
  }, [dashboardQuery.error, perfQuery.error, activityByDayQuery.error]);

  const metrics = dashboardQuery.data?.metrics;
  const patterns = dashboardQuery.data?.patterns ?? [];
  const recommendations = dashboardQuery.data?.recommendations ?? [];

  const patternChartData = useMemo(
    () =>
      patterns.slice(0, 10).map(p => ({
        name: p.pattern.length > 18 ? `${p.pattern.slice(0, 18)}…` : p.pattern,
        occurrences: p.occurrences ?? 1,
        confidence: Math.round((p.confidence ?? 0) * 100),
      })),
    [patterns]
  );

  const modelBarData = useMemo(
    () =>
      (perfQuery.data ?? []).map(row => ({
        name:
          row.model && row.model.length > 14
            ? `${row.model.slice(0, 14)}…`
            : row.model || "?",
        success: Math.round(Number(row.successRate ?? 0) * 100),
        requests: row.totalRequests ?? 0,
        quality: Math.round(Number(row.averageRating ?? 0) * 100),
      })),
    [perfQuery.data]
  );

  const pieData = useMemo(() => {
    const rows = perfQuery.data ?? [];
    if (!rows.length) return [];
    const total = rows.reduce((s, r) => s + (r.totalRequests ?? 0), 0) || 1;
    return rows.map(r => ({
      name: r.model?.slice(0, 20) || "model",
      value: Math.round(((r.totalRequests ?? 0) / total) * 100),
    }));
  }, [perfQuery.data]);

  const activityLineData = useMemo(() => {
    const m = metrics;
    if (!m) {
      return [{ name: "—", tasks: 0, patterns: 0 }];
    }
    return [
      {
        name: "الآن",
        tasks: m.totalTasks,
        patterns: m.discoveredPatterns,
      },
    ];
  }, [metrics]);

  const messagesByDayData = useMemo(
    () =>
      (activityByDayQuery.data ?? []).map(row => ({
        day: row.day.slice(5),
        count: row.count,
      })),
    [activityByDayQuery.data]
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (
    dashboardQuery.isLoading ||
    perfQuery.isLoading ||
    activityByDayQuery.isLoading
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  const successPct = metrics ? Math.round((metrics.successRate ?? 0) * 100) : 0;
  const qualityPct = metrics
    ? Math.round((metrics.averageQuality ?? 0) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2 flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30"
                aria-hidden
              >
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </span>
              <span>إحصائيات التشغيل</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              تعلم، نماذج، ونشاط يومي — مستأجر:{" "}
              <span className="text-slate-300 font-medium">
                {dashboardQuery.data?.tenantId ?? TENANT_ID}
              </span>
            </p>
          </div>
          <AppToolbar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">
              إجمالي المهام (تقدير)
            </div>
            <div className="text-3xl font-bold text-white">
              {metrics?.totalTasks ?? 0}
            </div>
            <div className="text-slate-500 text-sm mt-2">من أنماط التعلم</div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">نسبة النجاح</div>
            <div className="text-3xl font-bold text-white">{successPct}%</div>
            <div className="text-slate-500 text-sm mt-2">من محرك التعلم</div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">جودة مقدرة</div>
            <div className="text-3xl font-bold text-white">{qualityPct}%</div>
            <div className="text-slate-500 text-sm mt-2">متوسط الثقة</div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">أنماط مكتشفة</div>
            <div className="text-3xl font-bold text-white">
              {metrics?.discoveredPatterns ?? 0}
            </div>
            <div className="text-slate-500 text-sm mt-2">
              نماذج مسجّلة: {modelBarData.length}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              رسائلك حسب اليوم (14 يوماً)
            </h2>
            {messagesByDayData.length === 0 ? (
              <p className="text-slate-500 text-sm">
                لا رسائل مسجّلة بعد في هذه الفترة.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={messagesByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    stroke="#9ca3af"
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Bar dataKey="count" fill="#a855f7" name="رسائل" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              نشاط التعلم (ملخص)
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              لقطة من إجمالي المهام والأنماط المكتشفة في محرك التعلم.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activityLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis stroke="#9ca3af" dataKey="name" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="مهام"
                />
                <Line
                  type="monotone"
                  dataKey="patterns"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="أنماط"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              أداء النماذج (% نجاح)
            </h2>
            {modelBarData.length === 0 ? (
              <p className="text-slate-500 text-sm">
                لا توجد سجلات أداء بعد. استخدم المحادثة ليبدأ التعلم.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={modelBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Bar dataKey="success" fill="#3b82f6" name="نجاح %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              أعلى الأنماط (تكرار)
            </h2>
            {patternChartData.length === 0 ? (
              <p className="text-slate-500 text-sm">
                لا أنماط بعد — أجرِ بعض المحادثات ليبدأ الاستخراج.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={patternChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  />
                  <Bar dataKey="occurrences" fill="#f59e0b" name="تكرار" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              توزيع الطلبات حسب النموذج
            </h2>
            {pieData.length === 0 ? (
              <p className="text-slate-500 text-sm">لا بيانات كافية.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb
              className="h-5 w-5 text-amber-400 shrink-0"
              aria-hidden
            />
            توصيات النظام
          </h2>
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-slate-500 text-sm">لا توصيات بعد.</p>
            ) : (
              recommendations.map((text, i) => (
                <div
                  key={i}
                  className="bg-slate-700 p-4 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="text-slate-200 text-sm">{text}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
