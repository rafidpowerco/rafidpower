# إشعارات الطرف الثالث / Third-party notices

## هذا المشروع (كود التطبيق)

- **الرخصة:** انظر ملف [`LICENSE`](./LICENSE) في جذر المستودع (MIT).
- **ملاحظة:** استبدل سطر حقوق النشر في `LICENSE` باسم الكيان القانوني الذي يملك المشروع إن وُجد (شركة، مؤسسة، إلخ).

## مكتبات مفتوحة المصدر (اعتماديات npm)

يستند التشغيل إلى حزم تُنشر كل منها تحت رخصتها الخاصة. **النص الكامل لكل رخصة** يوجد عادةً داخل:

`node_modules/<اسم-الحزمة>/LICENSE`  
أو `node_modules/<اسم-الحزمة>/LICENSE.md`

### قائمة الاعتماديات المباشرة (ملخص SPDX)

الجدول التالي يخص الحزم المذكورة في `package.json` → `dependencies` فقط (ملخص وليس بديلاً عن ملفات الرخص الأصلية). الرخص مأخوذة من بيانات الحزم الشائعة؛ عند التعارض **يسود** ما في `node_modules`.

| الحزمة                                            | رخصة شائعة (SPDX) |
| ------------------------------------------------- | ----------------- |
| @aws-sdk/client-s3, @aws-sdk/s3-request-presigner | Apache-2.0        |
| @hookform/resolvers                               | MIT               |
| @radix-ui/\*                                      | MIT               |
| @tanstack/react-query                             | MIT               |
| @trpc/client, @trpc/react-query, @trpc/server     | MIT               |
| axios                                             | MIT               |
| class-variance-authority                          | Apache-2.0        |
| clsx                                              | MIT               |
| cmdk                                              | MIT               |
| cookie                                            | MIT               |
| date-fns                                          | MIT               |
| dotenv                                            | BSD-2-Clause      |
| drizzle-orm                                       | Apache-2.0        |
| embla-carousel-react                              | MIT               |
| express                                           | MIT               |
| framer-motion                                     | MIT               |
| input-otp                                         | MIT               |
| jose                                              | MIT               |
| lucide-react                                      | ISC               |
| mysql2                                            | MIT               |
| nanoid                                            | MIT               |
| next-themes                                       | MIT               |
| node-telegram-bot-api                             | MIT               |
| react, react-dom                                  | MIT               |
| react-day-picker                                  | MIT               |
| react-hook-form                                   | MIT               |
| react-resizable-panels                            | MIT               |
| recharts                                          | MIT               |
| sonner                                            | MIT               |
| streamdown                                        | Apache-2.0        |
| superjson                                         | MIT               |
| tailwind-merge                                    | MIT               |
| tailwindcss-animate                               | MIT               |
| vaul                                              | MIT               |
| wouter                                            | ISC               |
| zod                                               | MIT               |

### أدوات التطوير (devDependencies)

تُستخدم عند البناء والاختبار فقط؛ لا تُدمج عادةً في الحزمة النهائية للواجهة كما هو، لكن يبقى الامتثال لرخصها عند توزيع أدوات مشتقة. لاستخراج القائمة الكاملة:

```bash
pnpm licenses list
pnpm licenses list --prod
```

## إرشادات الاستخدام القانوني والمهني

1. **لا تحذف** ملفات `LICENSE` أو إشعارات حقوق النشر من الحزم عند إعادة التوزيع إن طلبت الرخصة ذلك (مثل Apache-2.0 و `NOTICE`).
2. عند **نسخ كود** من مستودع خارجي (وليس فقط تثبيتاً عبر npm)، احتفظ بإسناد وفق رخصة ذلك المستودع.
3. رخص **GPL/AGPL** تفرض شروطاً أقوى؛ راجع توافقها مع مشروعك قبل الدمج.

## تحديث هذه الوثيقة

عند إضافة اعتماديات جديدة، أعد تشغيل `pnpm licenses list --prod` وراجع أي حزمة ذات رخصة غير MIT/BSD/Apache-2.0 يدوياً.
