/**
 * Dashboard - لوحة التحكم الرئيسية للبوت الذكي
 */

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
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
import {
  Loader2,
  TrendingUp,
  Zap,
  Brain,
  Target,
  Server,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppToolbar } from "@/components/AppToolbar";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID ?? "default";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const dashboardQuery = trpc.bot.myDashboardData.useQuery(
    { tenantId: TENANT_ID },
    { enabled: Boolean(user) }
  );
  const toolStatsQuery = trpc.bot.getToolStats.useQuery();
  const modelsQuery = trpc.bot.getAvailableModels.useQuery();
  const stackQuery = trpc.bot.getFreeUnifiedStack.useQuery();
  const llmSummaryQuery = trpc.system.llmSummary.useQuery();
  const feedbackRecentQuery = trpc.feedback.listRecent.useQuery(
    { tenantId: TENANT_ID, limit: 20 },
    { enabled: user?.role === "admin" }
  );

  const llmProbeMutation = trpc.system.llmProbe.useMutation({
    onSuccess: data => {
      const p = data?.probe;
      if (!p) return;
      if (p.ok) {
        toast.success(`اتصال LLM ناجح (${p.latencyMs} ms)`);
      } else {
        toast.error(p.error ?? "فشل اختبار الاتصال بالنموذج");
      }
    },
    onError: err => {
      toast.error(err.message || "فشل اختبار الاتصال بالنموذج");
    },
  });

  const dashboardErrorToastRef = useRef<string | null>(null);
  useEffect(() => {
    const err =
      dashboardQuery.error ??
      toolStatsQuery.error ??
      modelsQuery.error ??
      stackQuery.error ??
      llmSummaryQuery.error;
    if (!err?.message) {
      dashboardErrorToastRef.current = null;
      return;
    }
    if (dashboardErrorToastRef.current === err.message) return;
    dashboardErrorToastRef.current = err.message;
    toast.error(err.message);
  }, [
    dashboardQuery.error,
    toolStatsQuery.error,
    modelsQuery.error,
    stackQuery.error,
    llmSummaryQuery.error,
  ]);

  if (
    authLoading ||
    !user ||
    dashboardQuery.isLoading ||
    toolStatsQuery.isLoading
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { metrics, patterns, recommendations, recentLogs } =
    dashboardQuery.data || {};
  const toolStats = toolStatsQuery.data || [];
  const models = modelsQuery.data || [];

  // Prepare data for charts
  const performanceData = [
    {
      name: "نسبة النجاح",
      value: metrics?.successRate ? metrics.successRate * 100 : 0,
    },
    {
      name: "الجودة",
      value: metrics?.averageQuality ? metrics.averageQuality * 100 : 0,
    },
  ];

  const patternsData =
    patterns?.map(p => ({
      name: p.pattern.substring(0, 20),
      confidence: Number(p.confidence) * 100,
      occurrences: p.occurrences,
    })) || [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2 flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30"
                aria-hidden
              >
                <Target className="h-5 w-5 text-blue-400" />
              </span>
              <span>لوحة التحكم</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              مؤشرات التعلم، الأدوات، ومسار النموذج النشط
            </p>
          </div>
          <AppToolbar showBrand />
        </div>

        {(llmSummaryQuery.data || stackQuery.data) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700 border-emerald-900/40">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Server className="h-5 w-5 text-emerald-400" />
                  مسار النموذج (LLM)
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200"
                  disabled={llmProbeMutation.isPending}
                  onClick={() => llmProbeMutation.mutate({ run: true })}
                >
                  {llmProbeMutation.isPending ? "…" : "اختبار ping"}
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                {llmSummaryQuery.data && (
                  <>
                    <p>
                      الوضع:{" "}
                      <span className="text-white font-medium">
                        {llmSummaryQuery.data.backend}
                      </span>
                    </p>
                    {llmSummaryQuery.data.custom.configured && (
                      <p>
                        نموذج مخصص:{" "}
                        <span className="text-emerald-300">
                          {llmSummaryQuery.data.custom.model}
                        </span>
                        {llmSummaryQuery.data.custom.baseUrlHost
                          ? ` (${llmSummaryQuery.data.custom.baseUrlHost})`
                          : ""}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Forge:{" "}
                      {llmSummaryQuery.data.forge.configured ? "نعم" : "لا"} ·
                      OpenRouter:{" "}
                      {llmSummaryQuery.data.openRouter.configured
                        ? "نعم"
                        : "لا"}
                    </p>
                  </>
                )}
                {llmProbeMutation.data?.probe && (
                  <p
                    className={
                      llmProbeMutation.data.probe.ok
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {llmProbeMutation.data.probe.ok
                      ? `اتصال ناجح (${llmProbeMutation.data.probe.latencyMs} ms)`
                      : (llmProbeMutation.data.probe.error ?? "فشل")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">المنسق الموحد</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-1">
                {stackQuery.data && (
                  <>
                    <p>
                      أدوات مجانية:{" "}
                      <span className="text-white">
                        {stackQuery.data.toolCount}
                      </span>{" "}
                      · وكلاء:{" "}
                      <span className="text-white">
                        {stackQuery.data.agentCount}
                      </span>
                    </p>
                    {stackQuery.data.llm && (
                      <p className="text-xs text-slate-500">
                        LLM في المكدس: {stackQuery.data.llm.backend}
                        {stackQuery.data.llm.customModel
                          ? ` · ${stackQuery.data.llm.customModel}`
                          : ""}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {user.role === "admin" && (
          <Card className="bg-slate-800 border-slate-700 border-violet-900/30 mb-8">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-400" />
                آراء المستخدمين (التجربة)
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200"
                  onClick={() => setLocation("/feedback")}
                >
                  صفحة الإرسال
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200"
                  onClick={() => setLocation("/status")}
                >
                  حالة النظام
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-3">
              {feedbackRecentQuery.isLoading && (
                <p className="text-slate-500">جارٍ التحميل…</p>
              )}
              {feedbackRecentQuery.error && (
                <p className="text-red-400">
                  {feedbackRecentQuery.error.message}
                </p>
              )}
              {feedbackRecentQuery.data &&
                feedbackRecentQuery.data.length === 0 && (
                  <p className="text-slate-500">لا توجد ملاحظات بعد.</p>
                )}
              {feedbackRecentQuery.data &&
                feedbackRecentQuery.data.length > 0 && (
                  <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {feedbackRecentQuery.data.map(row => (
                      <li
                        key={row.id}
                        className="rounded-md border border-slate-700/80 bg-slate-900/40 p-3"
                      >
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-1">
                          <span className="text-violet-300">
                            {row.category}
                          </span>
                          <span>·</span>
                          <span>
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleString("ar")
                              : ""}
                          </span>
                          {(row.submitterName || row.submitterEmail) && (
                            <>
                              <span>·</span>
                              <span>
                                {[row.submitterName, row.submitterEmail]
                                  .filter(Boolean)
                                  .join(" — ")}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-200 whitespace-pre-wrap break-words">
                          {row.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                إجمالي المهام
              </CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.totalTasks || 0}
              </div>
              <p className="text-xs text-slate-400">
                {metrics?.successRate
                  ? (metrics.successRate * 100).toFixed(1)
                  : 0}
                % نجاح
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                أنماط مكتشفة
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.discoveredPatterns || 0}
              </div>
              <p className="text-xs text-slate-400">التعلم مستمر</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                متوسط الجودة
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.averageQuality
                  ? (metrics.averageQuality * 100).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-slate-400">جودة الاستجابة</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                معدل التحسين
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics?.improvementRate
                  ? (metrics.improvementRate * 100).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-slate-400">أسبوعي (تقدير)</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="patterns">الأنماط</TabsTrigger>
            <TabsTrigger value="tools">الأدوات</TabsTrigger>
            <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Performance Chart */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">مؤشرات الأداء</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ${value.toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">النشاط الأخير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLogs?.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {log.logType}
                          </p>
                          <p className="text-xs text-slate-400">
                            {log.description}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الأنماط المكتشفة</CardTitle>
              </CardHeader>
              <CardContent>
                {patternsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={patternsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="confidence" fill="#3b82f6" />
                      <Bar dataKey="occurrences" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400">لا توجد أنماط مكتشفة بعد</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الأدوات والنماذج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {toolStats?.map((stat: any) => (
                    <div
                      key={stat?.toolId}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {stat?.toolName}
                        </p>
                        <p className="text-sm text-slate-400">
                          نسبة النجاح: {(stat?.successRate * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400">
                          {stat?.totalUses} استخداماً
                        </p>
                        <p className="text-sm text-slate-400">
                          {stat?.successCount} نجاحاً
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">توصيات التعلم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-700/50"
                    >
                      <p className="text-white">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Available Models */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">
              النماذج المتاحة (قاعدة البيانات)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models?.map(model => (
                <div
                  key={model.modelId}
                  className="p-4 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <h3 className="font-bold text-white mb-2">
                    {model.modelName}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    المزود: {model.provider}
                  </p>
                  <p className="text-sm text-slate-400">
                    السياق: {model.contextWindow?.toLocaleString() ?? "—"}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    {model.isFree && (
                      <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded">
                        مجاني
                      </span>
                    )}
                    {model.isAvailable && (
                      <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                        متاح
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
