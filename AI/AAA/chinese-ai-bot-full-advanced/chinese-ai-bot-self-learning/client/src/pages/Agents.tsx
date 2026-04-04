import { useState } from "react";
import { AppToolbar } from "@/components/AppToolbar";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, RefreshCw, Zap, Users } from "lucide-react";
import { toast } from "sonner";

/**
 * صفحة إدارة Agents
 */
export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // استدعاء API للحصول على جميع Agents
  const getAllAgents = trpc.agent.getAllAgents.useQuery();
  const getAgent = trpc.agent.getAgent.useQuery(
    { agentId: selectedAgent || "" },
    { enabled: !!selectedAgent }
  );
  const getTeamStats = trpc.agent.getTeamStats.useQuery();

  // Mutations
  const executeTask = trpc.agent.executeTask.useMutation();
  const executeComplex = trpc.agent.executeComplexTask.useMutation();
  const loadMemories = trpc.agent.loadAllMemories.useMutation();

  const handleExecuteTask = async () => {
    if (!selectedAgent || !taskInput) return;

    setIsExecuting(true);
    try {
      await executeTask.mutateAsync({
        agentId: selectedAgent,
        taskDescription: taskInput,
      });
      setTaskInput("");
      await getTeamStats.refetch();
      toast.success("تم تنفيذ المهمة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل تنفيذ المهمة");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteComplex = async () => {
    if (!taskInput) return;

    setIsExecuting(true);
    try {
      await executeComplex.mutateAsync({
        taskDescription: taskInput,
      });
      setTaskInput("");
      await getTeamStats.refetch();
      toast.success("تم تنفيذ المهمة المعقدة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل التنفيذ المعقد");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLoadMemories = async () => {
    try {
      await loadMemories.mutateAsync();
      toast.success("تم تحميل الذاكرة");
    } catch (error) {
      console.error("فشل تحميل الذاكرة:", error);
      toast.error(error instanceof Error ? error.message : "فشل تحميل الذاكرة");
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      researcher: "bg-blue-100 text-blue-800",
      executor: "bg-green-100 text-green-800",
      processor: "bg-purple-100 text-purple-800",
      analyst: "bg-orange-100 text-orange-800",
      learner: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2 flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30"
                aria-hidden
              >
                <Users className="h-5 w-5 text-blue-400" />
              </span>
              <span>الوكلاء المتخصصون</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              تشغيل مهام منفردة أو معقدة ضمن فريق الوكلاء المعرّف على الخادم
            </p>
          </div>
          <AppToolbar />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="agents">الـ Agents</TabsTrigger>
            <TabsTrigger value="execute">تنفيذ المهام</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* Tab: Agents */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAllAgents.data?.agents?.map(agent => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all ${
                    selectedAgent === agent.id
                      ? "ring-2 ring-blue-500 bg-slate-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white">
                          {agent.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {agent.description}
                        </CardDescription>
                      </div>
                      <Badge className={getRoleColor(agent.role)}>
                        {agent.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-300">
                          الإمكانيات:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.capabilities
                            ?.slice(0, 3)
                            .map((cap: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {cap}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Agent Details */}
            {selectedAgent && getAgent.data && (
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">معلومات Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        عدد المهام المكتملة
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {getAgent.data.agent?.metrics?.tasksCompleted || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">معدل النجاح</p>
                      <p className="text-2xl font-bold text-green-400">
                        {Math.round(
                          (getAgent.data.agent?.metrics?.tasksSuccessRate ||
                            0) * 100
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Execute Tasks */}
          <TabsContent value="execute" className="space-y-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">تنفيذ المهام</CardTitle>
                <CardDescription className="text-slate-400">
                  أدخل وصف المهمة واختر Agent أو اترك البوت يختار الأفضل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    وصف المهمة
                  </label>
                  <textarea
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    placeholder="أدخل وصف المهمة التي تريد تنفيذها..."
                    className="w-full h-32 bg-slate-600 text-white rounded-lg p-3 border border-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleExecuteTask}
                    disabled={!selectedAgent || !taskInput || isExecuting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري التنفيذ...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        تنفيذ بـ {selectedAgent}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleExecuteComplex}
                    disabled={!taskInput || isExecuting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري التنفيذ...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        تنفيذ معقد
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleLoadMemories}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تحميل ذاكرة جميع Agents
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Statistics */}
          <TabsContent value="stats" className="space-y-6">
            {getTeamStats.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">
                      إحصائيات الفريق
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400">عدد Agents</p>
                      <p className="text-3xl font-bold text-white">
                        {getTeamStats.data.stats?.totalAgents}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">الوقت الحالي</p>
                      <p className="text-sm text-slate-300">
                        {new Date(
                          getTeamStats.data.stats?.timestamp
                        ).toLocaleString("ar-SA")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">معلومات إضافية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      فريق متكامل من {getTeamStats.data.stats?.totalAgents}{" "}
                      Agents متخصصة
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
