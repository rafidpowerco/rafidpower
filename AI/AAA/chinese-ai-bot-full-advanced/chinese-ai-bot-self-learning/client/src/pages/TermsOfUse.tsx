import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME_FULL } from "@/lib/brand";
import { ArrowRight, FileText } from "lucide-react";
import { useLocation } from "wouter";

/**
 * شروط استخدام المنصة — نص إرشادي؛ راجع محامياً للإنتاج التجاري الكامل.
 */
export default function TermsOfUse() {
  const [, setLocation] = useLocation();
  const updated = "2026-04-04";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <FileText className="h-5 w-5 text-blue-400 shrink-0" aria-hidden />
            <span className="text-sm font-medium">شروط الاستخدام</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-200"
            onClick={() => setLocation("/")}
          >
            <ArrowRight className="h-4 w-4 ml-1.5" />
            الرئيسية
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-white leading-relaxed">
              شروط استخدام {SITE_NAME_FULL}
            </CardTitle>
            <p className="text-sm text-slate-500">آخر تحديث للنص: {updated}</p>
          </CardHeader>
          <CardContent className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                1. المقدمة والقبول
              </h2>
              <p>
                باستخدامك لهذه المنصة فإنك تقر بأنك قرأت هذه الشروط ووافقت
                عليها. إن كنت لا توافق، فتوقف عن استخدام الخدمة. قد تُعرَّف
                المنصة كنسخة تجريبية أو مبكرة؛ قد تتغير الميزات أو تُعلَّق دون
                إشعار مسبق. بعد فترة تشغيل وتجربة، يجوز للمشغّل استبدال أو تكملة
                هذا النص بسياسة استخدام رسمية مع إشعار معقول على المنصة أو
                بالبريد حسب الإمكان.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                2. وصف الخدمة
              </h2>
              <p>
                توفّر المنصة واجهة ويب للمحادثة مع نماذج لغوية، وإدارة مقتطفات
                معرفة اختيارية، ولوحات إحصائية وتشغيلية ضمن إعدادات المشغّل.
                الجودة والتوفر يعتمدان على البنية التحتية، مزودي النماذج،
                وإعدادات الخادم — دون ضمان نتيجة معيّنة أو انقطاع صفري.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                3. الحساب والوصول
              </h2>
              <p>
                قد يُطلب منك تسجيل الدخول عبر مزوّد هوية (OAuth) أو آلية يحددها
                المشغّل. أنت مسؤول عن سرية جلسة جهازك. لا تستخدم حساباً لشخص آخر
                دون إذنه. يحق للمشغّل تقييد أو إنهاء الوصول عند مخالفة هذه
                الشروط أو لأسباب أمنية أو تشغيلية.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                4. الاستخدام المسموح
              </h2>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mr-2">
                <li>
                  الاستخدام الشخصي أو المهني المشروع ضمن نطاق التجربة أو التشغيل
                  المصرّح به.
                </li>
                <li>
                  الامتثال للقوانين المعمول بها في بلدك وبلد استضافة الخدمة.
                </li>
                <li>
                  عدم إدخال بيانات تنتهك خصوصية الغير أو أسراراً تجارية دون حق.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                5. الاستخدام المحظور
              </h2>
              <p>يُحظر بشكل خاص — دون حصر:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mr-2">
                <li>
                  محاولة اختراق الأنظمة أو التحايل على المصادقة أو حدود
                  الاستخدام.
                </li>
                <li>نشر أو طلب محتوى غير قانوني أو مضايق أو كراهي.</li>
                <li>
                  إعادة بيع الوصول أو إساءة استخدام واجهات البرمجة بما يخالف
                  شروط المزودين.
                </li>
                <li>
                  استخدام المنصة لإلحاق ضرر بالمشغّل أو بالمستخدمين الآخرين.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                6. المحتوى والنماذج اللغوية
              </h2>
              <p>
                مخرجات الذكاء الاصطناعي قد تكون غير دقيقة أو غير مكتملة. لا
                تعتمد عليها وحدها في قرارات طبية أو قانونية أو مالية حرجة.
                المحتوى الذي تُدخله أو تولّده قد يُخزَّن وفق إعدادات المشغّل
                وقاعدة البيانات — راجع المشغّل إن كنت بحاجة لتفاصيل الاحتفاظ
                والحذف.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                7. الملكية الفكرية
              </h2>
              <p>
                البرنامج والتصميم وعلامات المنصة تخضع لحقوق المشغّل أو المرخّصين
                له وفق ملفات الرخصة في المستودع. لا يمنحك استخدام الخدمة حق نسخ
                أو توزيع الكود المصدري للمنصة إلا بما تسمح به الرخصة المعنية.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                8. إخلاء المسؤولية
              </h2>
              <p>
                تُقدَّم الخدمة «كما هي» و«حسب التوفر»، دون ضمانات صريحة أو ضمنية
                بما في ذلك الملاءمة لغرض معيّن. إلى أقصى حد يسمح به القانون، لا
                يتحمل المشغّل المسؤولية عن أي أضرار غير مباشرة أو تبعية ناشئة عن
                الاستخدام أو عدم القدرة على الاستخدام.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                9. التعديل على الشروط
              </h2>
              <p>
                قد يُحدَّث هذا النص. تاريخ «آخر تحديث» يظهر أعلاه. الاستمرار في
                الاستخدام بعد التحديث يُفهم كقبول للنص المعدّل ما لم يُعلَن غير
                ذلك.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                10. القانون الواجب التطبيق
              </h2>
              <p>
                يُحدَّد القانون المطبق والاختصاص القضائي وفق ما يقرره المشغّل
                قانونياً ويُبلَّغ به عند الحاجة. هذا القسم إطار عام — يُنصح
                بمراجعته مع محامٍ عند الإطلاق التجاري الرسمي.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">11. التواصل</h2>
              <p>
                لاستفسارات تتعلق بهذه الشروط، تواصل مع مشغّل الخدمة عبر القناة
                التي يعلنها (بريد، فريق داخلي، إلخ).
              </p>
            </section>

            <p className="text-xs text-slate-500 pt-4 border-t border-slate-700">
              هذا النص إرشادي ولا يغني عن استشارة قانونية مناسبة لاختصاصك ونشاطك
              التجاري.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
