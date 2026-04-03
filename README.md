# rafidpower

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rafidpowerco/rafidpower)

موقع **الرافدين للموازين** — واجهة React (Vite) + خادم Express لخدمة الملفات والمسارات.

## التطوير المحلي

```bash
pnpm install
pnpm dev
```

بناء وتشغيل إنتاج محلياً:

```bash
pnpm build
pnpm start
```

## Docker

```bash
docker compose up --build
```

ثم افتح `http://localhost:3000` — فحص الصحة: `http://localhost:3000/health`

## النشر على Render

1. اضغط الزر أعلاه، أو [لوحة Render](https://dashboard.render.com) → **New** → **Blueprint** → المستودع `rafidpowerco/rafidpower` (يُقرأ `render.yaml`).
2. أو **Web Service** → نفس المستودع → **Docker** من `Dockerfile`.
3. بعد **Deploy** → **Settings** → **Custom Domains** → أضف `rafidpower.xyz` وطبّق سجلات DNS في Spaceship كما تعرضها Render.

### ربط الدومين (Spaceship)

في DNS: انسخ من Render **Custom Domains** سجلات **CNAME** / **A** كما هي. انتظر انتشار DNS.

- فحص الصحة للـ load balancer: `GET /health` → `ok`

## متغيرات البيئة (اختياري)

- انسخ `.env.example` إلى `.env` للتطوير.
- لـ **Umami**: عيّن `VITE_ANALYTICS_ENDPOINT` و`VITE_ANALYTICS_WEBSITE_ID` ثم أعد البناء.

## المستودع

https://github.com/rafidpowerco/rafidpower
