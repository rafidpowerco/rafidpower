import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-slate-950 text-slate-100">
          <div className="flex flex-col items-center w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <AlertTriangle
              size={44}
              className="text-amber-500 mb-5 flex-shrink-0"
              aria-hidden
            />

            <h2 className="text-lg font-semibold mb-2 text-center">
              حدث خطأ غير متوقع في الواجهة
            </h2>
            <p className="text-sm text-slate-400 text-center mb-6">
              يمكنك إعادة تحميل الصفحة. إذا تكرر الخطأ، راجع سجل المتصفح أو خادم
              التطوير.
            </p>

            <div
              className="p-4 w-full rounded-lg bg-slate-950 border border-slate-800 overflow-auto mb-6 text-right"
              dir="ltr"
            >
              <pre className="text-xs text-slate-500 whitespace-pre-wrap break-all font-mono">
                {this.state.error?.stack ?? this.state.error?.message}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                "bg-blue-600 text-white",
                "hover:bg-blue-500 cursor-pointer transition-colors"
              )}
            >
              <RotateCcw size={16} />
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
