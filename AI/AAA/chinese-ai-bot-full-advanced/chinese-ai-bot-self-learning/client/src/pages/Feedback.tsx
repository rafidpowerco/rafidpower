import { AppToolbar } from "@/components/AppToolbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID ?? "default";

const CATEGORY_LABELS: Record<string, string> = {
  general: "عام",
  bug: "خلل",
  idea: "اقتراح",
  ux: "تجربة الاستخدام",
};

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [category, setCategory] = useState<"general" | "bug" | "idea" | "ux">(
    "general"
  );
  const [message, setMessage] = useState("");

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setMessage("");
      toast.success("شكراً — تم استلام ملاحظتك.");
    },
    onError: err => {
      toast.error(err.message || "تعذّر الإرسال");
    },
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  const canSend = message.trim().length >= 3 && !submitMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/25"
                aria-hidden
              >
                <MessageCircle
                  className="w-5 h-5 text-violet-400"
                  strokeWidth={1.75}
                />
              </span>
              <span>رأيك يهمنا</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              ملاحظاتك على الإصدار التجريبي تساعدنا على تحسين المنتج. لا تُنشر
              علناً؛ تُخزَّن مع حسابك للمراجعة الداخلية.
            </p>
          </div>
          <AppToolbar showBrand />
        </div>

        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">
              أرسل ملاحظة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">النوع</Label>
              <Select
                value={category}
                onValueChange={v =>
                  setCategory(v as "general" | "bug" | "idea" | "ux")
                }
              >
                <SelectTrigger className="w-full max-w-xs border-slate-600 bg-slate-900/50 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(CATEGORY_LABELS) as Array<
                      keyof typeof CATEGORY_LABELS
                    >
                  ).map(k => (
                    <SelectItem key={k} value={k}>
                      {CATEGORY_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-msg" className="text-slate-300">
                النص
              </Label>
              <Textarea
                id="fb-msg"
                dir="rtl"
                rows={6}
                maxLength={8000}
                placeholder="صف ما لاحظته أو ما تودّ رؤيته…"
                className="border-slate-600 bg-slate-900/50 text-slate-100 placeholder:text-slate-500"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <p className="text-xs text-slate-500">{message.length} / 8000</p>
            </div>
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-500 text-white"
              disabled={!canSend}
              onClick={() =>
                submitMutation.mutate({
                  tenantId: TENANT_ID,
                  category,
                  message: message.trim(),
                })
              }
            >
              {submitMutation.isPending ? "جارٍ الإرسال…" : "إرسال"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
