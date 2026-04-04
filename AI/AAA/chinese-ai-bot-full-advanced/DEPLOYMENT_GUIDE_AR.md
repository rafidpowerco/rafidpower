# 🚀 دليل نشر بوت الذكاء الاصطناعي على دومين خاص

## 📋 المتطلبات

قبل البدء، تأكد من أن لديك:

1. **دومين خاص** (مثل: yourdomain.com)
2. **خادم ويب** (VPS أو Hosting)
3. **Node.js** (الإصدار 18+)
4. **npm أو pnpm**
5. **قاعدة بيانات MySQL** (أو TiDB)
6. **مفاتيح API**:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENROUTER_API_KEY`
   - `OWNER_TELEGRAM_ID`

---

## 🔧 خطوات النشر

### الخطوة 1: تحضير الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت pnpm
npm install -g pnpm

# تثبيت Git
sudo apt install -y git
```

### الخطوة 2: استنساخ المشروع

```bash
# انتقل إلى مجلد التطبيقات
cd /var/www

# استنساخ المشروع
git clone https://github.com/yourusername/chinese-ai-bot.git
cd chinese-ai-bot

# أو إذا كان لديك ملف ZIP
unzip chinese-ai-bot-complete.zip
cd chinese-ai-bot-self-learning
```

### الخطوة 3: تثبيت المكتبات

```bash
# تثبيت جميع المكتبات
pnpm install

# أو باستخدام npm
npm install
```

### الخطوة 4: إعداد متغيرات البيئة

```bash
# إنشاء ملف .env
cp .env.example .env

# تحرير الملف وإضافة المفاتيح
nano .env
```

**أضف المتغيرات التالية:**

```env
# قاعدة البيانات
DATABASE_URL="mysql://user:password@localhost:3306/chinese_ai_bot"

# Telegram
TELEGRAM_BOT_TOKEN="your_bot_token_here"
OWNER_TELEGRAM_ID="your_telegram_id"

# OpenRouter
OPENROUTER_API_KEY="your_openrouter_key_here"

# OAuth (من Manus)
VITE_APP_ID="your_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
JWT_SECRET="your_secret_key"

# الدومين
VITE_FRONTEND_URL="https://yourdomain.com"
VITE_API_URL="https://yourdomain.com/api"

# البيئة
NODE_ENV="production"
```

### الخطوة 5: إعداد قاعدة البيانات

```bash
# تطبيق الهجرات
pnpm run db:push

# أو يدويًا
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### الخطوة 6: بناء التطبيق

```bash
# بناء للإنتاج
pnpm build

# التحقق من البناء
ls -la dist/
```

### الخطوة 7: تشغيل التطبيق

#### الخيار 1: استخدام PM2 (موصى به)

```bash
# تثبيت PM2 عالميًا
npm install -g pm2

# بدء التطبيق
pm2 start dist/index.js --name "ai-bot"

# حفظ العملية
pm2 save

# تشغيل على البدء
pm2 startup
```

#### الخيار 2: استخدام systemd

```bash
# إنشاء ملف الخدمة
sudo nano /etc/systemd/system/ai-bot.service
```

**أضف المحتوى التالي:**

```ini
[Unit]
Description=Chinese AI Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/chinese-ai-bot-self-learning
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# تفعيل الخدمة
sudo systemctl enable ai-bot
sudo systemctl start ai-bot

# التحقق من الحالة
sudo systemctl status ai-bot
```

### الخطوة 8: إعداد Nginx (عكس الوكيل)

```bash
# تثبيت Nginx
sudo apt install -y nginx

# إنشاء ملف الإعدادات
sudo nano /etc/nginx/sites-available/ai-bot
```

**أضف المحتوى التالي:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # إعادة التوجيه إلى HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # شهادات SSL (استخدم Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # إعدادات SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # الحد من حجم الطلب
    client_max_body_size 100M;

    # عكس الوكيل
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ضغط الملفات
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/ai-bot /etc/nginx/sites-enabled/

# اختبار الإعدادات
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

### الخطوة 9: إعداد SSL (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# تجديد تلقائي
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### الخطوة 10: اختبار التطبيق

```bash
# التحقق من أن الخادم يعمل
curl https://yourdomain.com

# التحقق من السجلات
pm2 logs ai-bot

# أو
sudo journalctl -u ai-bot -f
```

---

## 🔄 التحديثات والصيانة

### تحديث الكود

```bash
cd /var/www/chinese-ai-bot-self-learning

# سحب التحديثات
git pull origin main

# إعادة تثبيت المكتبات
pnpm install

# بناء جديد
pnpm build

# إعادة تشغيل
pm2 restart ai-bot
```

### النسخ الاحتياطية

```bash
# نسخ احتياطية من قاعدة البيانات
mysqldump -u user -p database_name > backup_$(date +%Y%m%d).sql

# نسخ احتياطية من الملفات
tar -czf backup_$(date +%Y%m%d).tar.gz /var/www/chinese-ai-bot-self-learning

# نقل إلى خادم آمن
scp backup_*.sql user@backup-server:/backups/
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الخادم لا يستجيب

```bash
# التحقق من الخدمة
pm2 status

# إعادة التشغيل
pm2 restart ai-bot

# عرض السجلات
pm2 logs ai-bot
```

### المشكلة: قاعدة البيانات غير متصلة

```bash
# التحقق من الاتصال
mysql -u user -p -h localhost

# التحقق من متغير DATABASE_URL
cat .env | grep DATABASE_URL
```

### المشكلة: مشاكل SSL

```bash
# تجديد الشهادات يدويًا
sudo certbot renew --force-renewal

# التحقق من الشهادات
sudo certbot certificates
```

---

## 📊 المراقبة والسجلات

### استخدام PM2 Plus (اختياري)

```bash
# الاشتراك في PM2 Plus
pm2 plus

# عرض لوحة التحكم
pm2 web
```

### مراقبة الموارد

```bash
# استخدام الذاكرة والمعالج
pm2 monit

# استخدام top
top -p $(pgrep -f "node dist/index.js")
```

---

## 🔐 الأمان

### تحسينات الأمان

1. **تحديث النظام بانتظام**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **جدار الحماية**
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. **حماية المفاتيح**
- لا تضع المفاتيح في Git
- استخدم ملف `.env` محلي
- استخدم متغيرات البيئة على الخادم

4. **نسخ احتياطية منتظمة**
- نسخ احتياطية يومية من قاعدة البيانات
- نسخ احتياطية أسبوعية من الملفات

---

## 📞 الدعم

إذا واجهت مشاكل:

1. تحقق من السجلات: `pm2 logs ai-bot`
2. تحقق من الاتصالات: `curl https://yourdomain.com`
3. اتصل بفريق الدعم

---

**تم إعداد هذا الدليل بـ ❤️**

**آخر تحديث: 2026-04-03**
