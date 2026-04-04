/**
 * Chat Page - صفحة المحادثة (مربوطة بالمستخدم المسجّل وليس userId وهمي)
 */

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppToolbar } from "@/components/AppToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Zap, Plus } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

/** يطابق DEFAULT_TENANT_ID في الخادم؛ للواجهات متعددة العملاء لاحقاً */
const TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID ?? "default";

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  model?: string;
  /** مسار المنسق: وكيل، نوع مهمة، إلخ */
  routingLine?: string;
  /** عناوين مقتطفات المعرفة المستخدمة */
  knowledgeHint?: string;
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const utils = trpc.useUtils();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendGenerationRef = useRef(0);
  const didAutoSelectConversation = useRef(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const convsQuery = trpc.bot.myConversations.useQuery(
    { tenantId: TENANT_ID },
    { enabled: Boolean(user) }
  );

  useEffect(() => {
    if (
      didAutoSelectConversation.current ||
      !convsQuery.data?.length ||
      conversationId != null
    ) {
      return;
    }
    setConversationId(convsQuery.data[0].id);
    didAutoSelectConversation.current = true;
  }, [convsQuery.data, conversationId]);

  const messagesQuery = trpc.bot.myMessages.useQuery(
    {
      conversationId: conversationId ?? 0,
      tenantId: TENANT_ID,
    },
    {
      enabled: Boolean(user) && conversationId != null && conversationId > 0,
    }
  );

  const chatLoadErrorRef = useRef<string | null>(null);
  useEffect(() => {
    const err = convsQuery.error ?? messagesQuery.error;
    if (!err?.message) {
      chatLoadErrorRef.current = null;
      return;
    }
    if (chatLoadErrorRef.current === err.message) return;
    chatLoadErrorRef.current = err.message;
    toast.error(err.message);
  }, [convsQuery.error, messagesQuery.error]);

  const processMessageMutation = trpc.bot.myProcessMessage.useMutation();
  const llmSummary = trpc.system.llmSummary.useQuery();

  const llmSummaryErrRef = useRef<string | null>(null);
  useEffect(() => {
    const err = llmSummary.error;
    if (!err?.message) {
      llmSummaryErrRef.current = null;
      return;
    }
    if (llmSummaryErrRef.current === err.message) return;
    llmSummaryErrRef.current = err.message;
    toast.error(err.message);
  }, [llmSummary.error]);

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(
        messagesQuery.data.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
          model: msg.model || undefined,
        }))
      );
    }
  }, [messagesQuery.data]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const textToSend = input.trim();
    if (!textToSend) return;

    const gen = ++sendGenerationRef.current;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: textToSend,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const knowledgeMetaLine = (
      count: number,
      titles?: string[]
    ): string | undefined => {
      if (count <= 0) return undefined;
      if (titles?.length) {
        const head = titles.slice(0, 3).join("، ");
        const tail = titles.length > 3 ? ` (+${titles.length - 3})` : "";
        return `معرفة (${count}): ${head}${tail}`;
      }
      return `معرفة: ${count}`;
    };

    const knowledgeHintOnly = (titles?: string[]): string | undefined => {
      if (!titles?.length) return undefined;
      const head = titles.slice(0, 4).join("، ");
      const tail = titles.length > 4 ? ` …+${titles.length - 4}` : "";
      return `${head}${tail}`;
    };

    try {
      const result = await processMessageMutation.mutateAsync({
        message: textToSend,
        conversationId: conversationId ?? undefined,
        tenantId: TENANT_ID,
      });

      if (gen !== sendGenerationRef.current) return;

      if (result.success !== true) {
        if ("error" in result && result.error) {
          const kc =
            "usedKnowledgeChunks" in result
              ? result.usedKnowledgeChunks
              : undefined;
          const kt =
            "usedKnowledgeTitles" in result
              ? result.usedKnowledgeTitles
              : undefined;
          const rag =
            kc != null && kc > 0 ? ` · ${knowledgeMetaLine(kc, kt)}` : "";
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              role: "assistant",
              content: `❌ ${result.error}${rag}`,
              createdAt: new Date(),
            },
          ]);
        }
      } else {
        const ok = result;
        const text =
          typeof ok.message === "string"
            ? ok.message
            : Array.isArray(ok.message)
              ? JSON.stringify(ok.message)
              : String(ok.message ?? "");
        const kCount = ok.usedKnowledgeChunks ?? 0;
        const kTitles = ok.usedKnowledgeTitles;
        const parts = [
          ok.agentName,
          ok.unifiedPath,
          ok.analysis?.taskType,
        ].filter(Boolean);
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: text,
          createdAt: new Date(),
          model: ok.tool?.name,
          routingLine: parts.length ? parts.join(" · ") : undefined,
          knowledgeHint:
            knowledgeHintOnly(kTitles) ??
            (kCount > 0 ? `${kCount} مقتطف مرجعي` : undefined),
        };

        setMessages(prev => [...prev, assistantMessage]);
        if (ok.conversationId != null) {
          setConversationId(ok.conversationId);
        }
        void utils.bot.myConversations.invalidate();
        void utils.bot.myMessages.invalidate();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (gen !== sendGenerationRef.current) return;
      const msg =
        error instanceof Error ? error.message : "تعذّر إرسال الرسالة";
      toast.error(msg);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "❌ حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة لاحقاً.",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (gen === sendGenerationRef.current) {
        setIsLoading(false);
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                مساعد المحادثة
              </span>
              <AppToolbar
                trailing={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-200"
                    onClick={() => {
                      didAutoSelectConversation.current = true;
                      setConversationId(null);
                      setMessages([]);
                    }}
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    محادثة جديدة
                  </Button>
                }
              />
            </CardTitle>
            {convsQuery.data && convsQuery.data.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">المحادثة:</span>
                <Select
                  value={
                    conversationId != null ? String(conversationId) : "__new__"
                  }
                  onValueChange={v => {
                    didAutoSelectConversation.current = true;
                    if (v === "__new__") {
                      setConversationId(null);
                      setMessages([]);
                      return;
                    }
                    setConversationId(Number(v));
                  }}
                >
                  <SelectTrigger className="h-8 w-[min(100%,280px)] bg-slate-700 border-slate-600 text-slate-100 text-xs">
                    <SelectValue placeholder="اختر محادثة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__new__">محادثة جديدة</SelectItem>
                    {convsQuery.data.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {(c.title || `محادثة #${c.id}`).slice(0, 48)}
                        {(c.title?.length ?? 0) > 48 ? "…" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {llmSummary.data && (
              <p className="text-xs text-slate-400 mt-2">
                مسار LLM:{" "}
                <span className="text-slate-300">
                  {llmSummary.data.backend}
                </span>
                {llmSummary.data.custom.configured && (
                  <>
                    {" · "}
                    <span className="text-emerald-400/90">
                      نموذج مخصص: {llmSummary.data.custom.model}
                    </span>
                    {llmSummary.data.custom.baseUrlHost
                      ? ` @ ${llmSummary.data.custom.baseUrlHost}`
                      : ""}
                  </>
                )}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto px-4">
                <h2 className="text-xl font-semibold text-white mb-2">
                  بداية محادثة جديدة
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  اكتب طلبك بالأسفل. تُسترجع مقتطفات «معرفتي» تلقائياً عند
                  الصلة، وتظهر مراجع مختصرة مع الرد.
                </p>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Streamdown>{message.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  {message.routingLine && (
                    <p className="text-xs mt-1 text-slate-400">
                      {message.routingLine}
                    </p>
                  )}
                  {message.knowledgeHint && (
                    <p className="text-xs mt-1 text-amber-400/90">
                      مصادر: {message.knowledgeHint}
                    </p>
                  )}
                  {message.model && (
                    <p className="text-xs mt-1 opacity-70">
                      أداة: {message.model}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">جاري المعالجة...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب رسالتك هنا..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
