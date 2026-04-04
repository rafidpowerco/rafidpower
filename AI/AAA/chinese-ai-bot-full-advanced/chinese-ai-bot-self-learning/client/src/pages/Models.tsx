import React, { useEffect, useMemo, useState } from "react";
import { AppToolbar } from "@/components/AppToolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Star, Globe, Cpu } from "lucide-react";

export default function ModelsPage() {
  const [selectedType, setSelectedType] = useState<
    "llm" | "image" | "audio" | "video" | "code" | "data"
  >("llm");
  const [priority, setPriority] = useState<
    "speed" | "quality" | "balanced" | "cost"
  >("balanced");
  const [language, setLanguage] = useState("ar");
  /** قدرات مطلوبة مفصولة بفاصلة — تُمرَّر لـ getBestModel و getRecommendations */
  const [capabilitiesRaw, setCapabilitiesRaw] = useState("");
  const [compareModelIds, setCompareModelIds] = useState<string[]>([]);

  const capabilitiesFilter = useMemo(() => {
    const parts = capabilitiesRaw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.slice(0, 128))
      .slice(0, 48);
    return parts.length ? parts : undefined;
  }, [capabilitiesRaw]);

  useEffect(() => {
    setCompareModelIds([]);
  }, [selectedType]);

  // Queries
  const { data: allModels, isLoading: loadingModels } =
    trpc.models.getAllModels.useQuery({ type: selectedType });
  const { data: bestModel, isLoading: loadingBest } =
    trpc.models.getBestModel.useQuery({
      type: selectedType,
      priority,
      language,
      capabilities: capabilitiesFilter,
    });
  const { data: recommendations, isLoading: loadingRecs } =
    trpc.models.getRecommendations.useQuery({
      type: selectedType,
      priority,
      language,
      capabilities: capabilitiesFilter,
      count: 3,
    });
  const { data: stats } = trpc.models.getPerformanceStats.useQuery();
  const { data: providers } = trpc.models.getActiveProviders.useQuery();
  const canCompare = compareModelIds.length >= 2 && compareModelIds.length <= 5;
  const {
    data: comparisonData,
    isLoading: loadingCompare,
    error: compareQueryError,
  } = trpc.models.compareModels.useQuery(
    { modelIds: compareModelIds },
    { enabled: canCompare }
  );

  function toggleCompareModel(id: string) {
    setCompareModelIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2 flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30"
                aria-hidden
              >
                <Cpu className="h-5 w-5 text-blue-400" />
              </span>
              <span>إدارة النماذج</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              اختيار وتوصية ومقارنة حسب النوع والأولوية والقدرات
            </p>
          </div>
          <AppToolbar />
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                نوع النموذج
              </label>
              <Select
                value={selectedType}
                onValueChange={value =>
                  setSelectedType(value as typeof selectedType)
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llm">نماذج لغوية</SelectItem>
                  <SelectItem value="image">توليد الصور</SelectItem>
                  <SelectItem value="audio">الصوت والكلام</SelectItem>
                  <SelectItem value="video">الفيديو</SelectItem>
                  <SelectItem value="code">البرمجة</SelectItem>
                  <SelectItem value="data">تحليل البيانات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                الأولوية
              </label>
              <Select
                value={priority}
                onValueChange={value => setPriority(value as typeof priority)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">جودة عالية</SelectItem>
                  <SelectItem value="speed">سرعة عالية</SelectItem>
                  <SelectItem value="balanced">متوازن</SelectItem>
                  <SelectItem value="cost">مجاني</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                اللغة
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">الإنجليزية</SelectItem>
                  <SelectItem value="zh">الصينية</SelectItem>
                  <SelectItem value="fr">الفرنسية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <p className="w-full text-xs text-slate-500 leading-relaxed pb-1">
                تُحدَّث النتائج تلقائياً عند تغيير الفلاتر.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              قدرات مطلوبة (اختياري)
            </label>
            <Input
              value={capabilitiesRaw}
              onChange={e => setCapabilitiesRaw(e.target.value)}
              placeholder="مثال: chat, reasoning, code"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 max-w-2xl"
              maxLength={2000}
            />
            <p className="text-xs text-slate-500 mt-1">
              افصل بين القيم بفاصلة؛ تُستخدم في ترتيب «أفضل نموذج» و«التوصيات».
            </p>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="best" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="best">أفضل نموذج</TabsTrigger>
            <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
            <TabsTrigger value="all">جميع النماذج</TabsTrigger>
            <TabsTrigger value="compare">المقارنة</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* Best Model */}
          <TabsContent value="best">
            {loadingBest ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : bestModel?.success && bestModel.model ? (
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 p-8 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {bestModel.model.name}
                    </h2>
                    <p className="text-blue-100 mb-4">
                      من {bestModel.model.provider}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-100">الأداء</p>
                        <p className="text-2xl font-bold">
                          {bestModel.model.performance}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">السرعة</p>
                        <p className="text-2xl font-bold">
                          {bestModel.model.speed}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-blue-100/95">
                      {bestModel.model.isFree && (
                        <span className="rounded bg-white/15 px-2 py-0.5">
                          مجاني
                        </span>
                      )}
                      {bestModel.model.isOpenSource && (
                        <span className="rounded bg-white/15 px-2 py-0.5">
                          مفتوح المصدر
                        </span>
                      )}
                      {bestModel.model.localSupport && (
                        <span className="rounded bg-white/15 px-2 py-0.5">
                          محلي
                        </span>
                      )}
                    </div>
                    {bestModel.model.languages &&
                      bestModel.model.languages.length > 0 && (
                        <p className="mt-3 flex items-start gap-2 text-sm text-blue-100">
                          <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{bestModel.model.languages.join("، ")}</span>
                        </p>
                      )}
                    {bestModel.model.capabilities &&
                      bestModel.model.capabilities.length > 0 && (
                        <p className="mt-2 text-xs text-blue-200/90 leading-relaxed">
                          {bestModel.model.capabilities.slice(0, 8).join(" · ")}
                          {bestModel.model.capabilities.length > 8 ? "…" : ""}
                        </p>
                      )}
                  </div>
                  <Star className="w-12 h-12" />
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center text-slate-400">
                لا يوجد نموذج متاح
              </Card>
            )}
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations">
            {loadingRecs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : recommendations?.success ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.recommendations.map((rec, idx) => (
                  <Card
                    key={idx}
                    className="bg-slate-800 border-slate-700 p-6 hover:border-blue-500 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {rec.model.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {rec.model.provider}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-500">
                        {rec.score.toFixed(0)}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-300">
                        الأداء: {rec.model.performance}%
                      </p>
                      <p className="text-sm text-slate-300">
                        السرعة: {rec.model.speed}%
                      </p>
                      {rec.model.languages &&
                        rec.model.languages.length > 0 && (
                          <p className="text-xs text-slate-500">
                            {rec.model.languages.join("، ")}
                          </p>
                        )}
                      {rec.model.capabilities &&
                        rec.model.capabilities.length > 0 && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {rec.model.capabilities.slice(0, 5).join(" · ")}
                            {rec.model.capabilities.length > 5 ? "…" : ""}
                          </p>
                        )}
                    </div>
                    <div className="space-y-1">
                      {rec.reasons.map((reason, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          ✓ {reason}
                        </p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center text-slate-400">
                لا توجد توصيات متاحة
              </Card>
            )}
          </TabsContent>

          {/* All Models */}
          <TabsContent value="all">
            {loadingModels ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : allModels && allModels.models.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allModels.models.map(model => (
                  <Card
                    key={model.id}
                    className="bg-slate-800 border-slate-700 p-4"
                  >
                    <h3 className="font-bold text-white mb-2">{model.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      {model.provider}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300">
                        أداء:{" "}
                        <span className="text-blue-400">
                          {model.performance}%
                        </span>
                      </p>
                      <p className="text-slate-300">
                        سرعة:{" "}
                        <span className="text-green-400">{model.speed}%</span>
                      </p>
                      <p className="text-slate-300">
                        {model.isFree ? (
                          <span className="text-yellow-400">✓ مجاني</span>
                        ) : (
                          <span className="text-red-400">مدفوع</span>
                        )}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center text-slate-400">
                لا توجد نماذج متاحة
              </Card>
            )}
          </TabsContent>

          {/* Compare */}
          <TabsContent value="compare" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    مقارنة النماذج
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    اختر من 2 إلى 5 نماذج من النوع الحالي ({selectedType}).
                    المقارنة تعرض الحقول المتاحة من المزود.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-200"
                  disabled={compareModelIds.length === 0}
                  onClick={() => setCompareModelIds([])}
                >
                  مسح الاختيار
                </Button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                المحدد: {compareModelIds.length} / 5
                {!canCompare && compareModelIds.length > 0 && (
                  <span className="text-amber-400/90 mr-2">
                    — اختر نموذجاً ثانياً على الأقل
                  </span>
                )}
              </p>
              {loadingModels ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : allModels && allModels.models.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {allModels.models.map(m => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-900/40 px-3 py-2"
                    >
                      <Checkbox
                        id={`cmp-${m.id}`}
                        checked={compareModelIds.includes(m.id)}
                        onCheckedChange={() => toggleCompareModel(m.id)}
                        disabled={
                          !compareModelIds.includes(m.id) &&
                          compareModelIds.length >= 5
                        }
                      />
                      <label
                        htmlFor={`cmp-${m.id}`}
                        className="flex-1 cursor-pointer text-sm text-slate-200"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-slate-500 mr-2">
                          {" "}
                          — {m.provider}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">
                  لا توجد نماذج لهذا النوع.
                </p>
              )}
            </Card>

            {compareQueryError && (
              <Card className="bg-red-950/40 border-red-800 p-4 text-red-200 text-sm">
                {compareQueryError.message}
              </Card>
            )}

            {loadingCompare && canCompare && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {comparisonData?.success &&
              comparisonData.comparison.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonData.comparison.map(row => (
                    <Card
                      key={row.id}
                      className="bg-slate-800 border-slate-700 p-5"
                    >
                      <h4 className="font-bold text-white mb-1">{row.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">
                        {row.provider}
                      </p>
                      <dl className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">الأداء</dt>
                          <dd>{row.performance}%</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">السرعة</dt>
                          <dd>{row.speed}%</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">مجاني</dt>
                          <dd>{row.isFree ? "نعم" : "لا"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">مفتوح المصدر</dt>
                          <dd>{row.isOpenSource ? "نعم" : "لا"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">محلي</dt>
                          <dd>{row.localSupport ? "نعم" : "لا"}</dd>
                        </div>
                      </dl>
                      {row.languages && row.languages.length > 0 && (
                        <p className="mt-3 text-xs text-slate-500 border-t border-slate-600 pt-3">
                          {row.languages.join("، ")}
                        </p>
                      )}
                      {row.capabilities && row.capabilities.length > 0 && (
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                          {row.capabilities.slice(0, 6).join(" · ")}
                          {row.capabilities.length > 6 ? "…" : ""}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats">
            {stats?.success ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700 p-6">
                  <p className="text-slate-400 text-sm mb-2">إجمالي النماذج</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.stats.totalModels}
                  </p>
                </Card>
                <Card className="bg-slate-800 border-slate-700 p-6">
                  <p className="text-slate-400 text-sm mb-2">
                    النماذج المجانية
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {stats.stats.freeModels}
                  </p>
                </Card>
                <Card className="bg-slate-800 border-slate-700 p-6">
                  <p className="text-slate-400 text-sm mb-2">مفتوحة المصدر</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.stats.openSourceModels}
                  </p>
                </Card>
                <Card className="bg-slate-800 border-slate-700 p-6">
                  <p className="text-slate-400 text-sm mb-2">متوسط الأداء</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {stats.stats.averagePerformance.toFixed(0)}%
                  </p>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>

        {/* Providers */}
        {providers?.success && (
          <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">
              المزودون النشطون
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.providers.map(provider => (
                <div
                  key={provider.name}
                  className="bg-slate-700 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{provider.name}</h3>
                    <Globe className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-sm text-slate-400">
                    النماذج: {provider.modelCount}
                  </p>
                  <p className="text-sm text-slate-400">
                    الأولوية: {provider.priority}/10
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
