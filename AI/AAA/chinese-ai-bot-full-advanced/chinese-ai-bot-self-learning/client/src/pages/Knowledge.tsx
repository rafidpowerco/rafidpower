import { useEffect, useRef, useState } from "react";
import { AppToolbar } from "@/components/AppToolbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

const TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID ?? "default";

export default function KnowledgePage() {
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [listOffset, setListOffset] = useState(0);

  const listQuery = trpc.knowledge.myList.useQuery(
    { tenantId: TENANT_ID, offset: listOffset },
    { enabled: Boolean(user) }
  );
  const chunkStatsQuery = trpc.knowledge.myChunkStats.useQuery(
    { tenantId: TENANT_ID },
    { enabled: Boolean(user) }
  );
  const addMutation = trpc.knowledge.myAdd.useMutation({
    onSuccess: () => {
      setTitle("");
      setContent("");
      setListOffset(0);
      void listQuery.refetch();
      void chunkStatsQuery.refetch();
    },
    onError: err => {
      toast.error(err.message || "فشل الحفظ");
    },
  });
  const deleteMutation = trpc.knowledge.myDelete.useMutation({
    onSuccess: () => {
      void listQuery.refetch();
      void chunkStatsQuery.refetch();
    },
    onError: err => {
      toast.error(err.message || "فشل الحذف");
    },
  });

  const knowledgeLoadErrRef = useRef<string | null>(null);
  useEffect(() => {
    const err = listQuery.error ?? chunkStatsQuery.error;
    if (!err?.message) {
      knowledgeLoadErrRef.current = null;
      return;
    }
    if (knowledgeLoadErrRef.current === err.message) return;
    knowledgeLoadErrRef.current = err.message;
    toast.error(err.message);
  }, [listQuery.error, chunkStatsQuery.error]);

  const nearChunkLimit =
    chunkStatsQuery.data != null &&
    chunkStatsQuery.data.count >= chunkStatsQuery.data.limit - 20;

  const chunkCount = chunkStatsQuery.data?.count ?? 0;
  const canLoadOlder =
    listQuery.data?.length === 100 && listOffset + 100 < chunkCount;
  const canBackToNewest = listOffset > 0;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/25"
                aria-hidden
              >
                <BookOpen
                  className="w-5 h-5 text-amber-400"
                  strokeWidth={1.75}
                />
              </span>
              <span>المعرفة المرجعية</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
              مقتطفات نصية تديرها أنت؛ تُسترجع عند المحادثة وتُعرض كمراجع في
              الواجهة (RAG خفيف بالتطابق النصي).
            </p>
            {nearChunkLimit && chunkStatsQuery.data && (
              <p className="text-amber-400/95 text-sm mt-2 rounded-md border border-amber-700/50 bg-amber-950/30 px-3 py-2">
                لديك {chunkStatsQuery.data.count} / {chunkStatsQuery.data.limit}{" "}
                مقتطفاً. احذف القديم أو ادمج النصوص لتفادي رفض الحفظ.
              </p>
            )}
          </div>
          <AppToolbar />
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">إضافة مقتطف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="عنوان اختياري"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white"
            />
            <Textarea
              placeholder="النص المرجعي (سياسة، منتج، تعليمات…)"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="bg-slate-900 border-slate-600 text-white"
            />
            <Button
              type="button"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!content.trim() || addMutation.isPending}
              onClick={() =>
                addMutation.mutate({
                  title: title.trim() || undefined,
                  content: content.trim(),
                  tenantId: TENANT_ID,
                })
              }
            >
              {addMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "حفظ"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">المقتطفات المحفوظة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(canBackToNewest || canLoadOlder) && (
              <div className="flex flex-wrap gap-2">
                {canBackToNewest && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-200"
                    onClick={() => setListOffset(0)}
                  >
                    الأحدث أولاً
                  </Button>
                )}
                {canLoadOlder && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-200"
                    onClick={() => setListOffset(o => o + 100)}
                  >
                    تحميل أقدم
                  </Button>
                )}
              </div>
            )}
            {listQuery.isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : !listQuery.data?.length ? (
              <p className="text-slate-500 text-sm">لا توجد مقتطفات بعد.</p>
            ) : (
              listQuery.data.map(row => (
                <div
                  key={row.id}
                  className="rounded-lg border border-slate-600 p-4 bg-slate-900/50"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-white font-medium">
                        {row.title || "بدون عنوان"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(row.createdAt).toLocaleString("ar")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-400 shrink-0"
                      disabled={deleteMutation.isPending}
                      onClick={() =>
                        deleteMutation.mutate({
                          id: row.id,
                          tenantId: TENANT_ID,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-slate-400 text-sm mt-2 whitespace-pre-wrap">
                    {row.preview}
                    {(row.preview?.length ?? 0) >= 320 ? "…" : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
