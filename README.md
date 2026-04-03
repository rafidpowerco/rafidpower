# rafidpower

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rafidpowerco/rafidpower)

## النشر (Render)

1. اضغط الزر أعلاه، أو من [لوحة Render](https://dashboard.render.com): **New** → **Blueprint** → اختر المستودع `rafidpowerco/rafidpower` (يُقرأ `render.yaml`).
2. أو **Web Service** → نفس المستودع → **Docker** من `Dockerfile`.
3. بعد **Deploy** → **Settings** → **Custom Domains** → أضف `rafidpower.xyz` وطبّق سجلات DNS في Spaceship كما تعرضها Render.

### ربط الدومين (Spaceship)

في DNS للدومين: انسخ من Render **Custom Domains** سجلات **CNAME** / **A** كما هي، ثم انتظر التفعيل (قد يستغرق وقتاً).

فحص الصحة: `GET /health` يعيد `ok` (يستخدمه Render في `render.yaml`).
