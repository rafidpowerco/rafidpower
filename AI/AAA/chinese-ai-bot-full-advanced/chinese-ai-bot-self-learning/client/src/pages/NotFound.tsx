import { AppToolbar } from "@/components/AppToolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Home,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-white/10 bg-slate-950/70 backdrop-blur-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-end">
          <AppToolbar />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-slate-700 bg-slate-800/90 backdrop-blur-sm shadow-xl mx-auto">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                <AlertCircle className="relative h-16 w-16 text-red-400" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">404</h1>

            <h2 className="text-xl font-semibold text-slate-200 mb-4">
              الصفحة غير موجودة
            </h2>

            <p className="text-slate-400 mb-8 leading-relaxed text-sm">
              الرابط غير صحيح أو أُزيلت الصفحة.
              <br />
              ارجع للرئيسية أو افتح المحادثة.
            </p>

            <div
              id="not-found-button-group"
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                onClick={() => setLocation("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                الرئيسية
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/chat")}
                className="border-slate-600 text-slate-100 hover:bg-slate-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                المحادثة
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="border-slate-600 text-slate-100 hover:bg-slate-700"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
