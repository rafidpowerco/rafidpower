# حالة المشروع

**الإصدار 1.0.0 — إنهاء تقني للميزات المخططة في هذا المجلد** (واجهة، tRPC، تعلّم، RAG مع MMR، ملاحظات، صحة، إعادة محاولة LLM، وكلاء، نشر).

## قائمة تحقق قبل الإطلاق

1. **`pnpm install`** ثم **`pnpm run verify`** (تنسيق + TypeScript + اختبارات + بناء).
2. **قاعدة البيانات:** MySQL + `DATABASE_URL` + **`pnpm db:migrate`** (أو `RUN_MIGRATIONS_ON_START=1` في Docker). الترحيلات حتى **`0007_collective_pattern_stats`**.
3. **الإنتاج:** `JWT_SECRET`، `LLM_BACKEND` والمفاتيح المرتبطة، ويُنصح `INTERNAL_BOT_API_SECRET` و`TRUST_PROXY=1` خلف nginx — **`docs/DEPLOY_DOMAIN_AR.md`**.
4. **اختياري:** تليغرام، OpenRouter، OAuth — انسخ **`.env.example`** إلى `.env` وعدّل القيم.
5. **بعد فترة التجربة:** صياغة أو تحديث **سياسة الاستخدام** الرسمية (الواجهة تتضمن نصاً إرشادياً في `/terms`؛ راجع محامياً للإنتاج التجاري).

## اختبارات تتطلب أسراراً حقيقية

- `server/secrets.test.ts` ومجموعات داخل `integration.test.ts` تُتخطّى في CI إن لم تُضبط المتغيرات؛ اختبارات **الصيغ الاصطناعية** في `secrets.test.ts` تعمل دائماً.

## مرجع بنية سريع

- **`docs/ARCHITECTURE_AR.md`** — تدفق المنسّق، tRPC، RAG، الأمان.
