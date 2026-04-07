# استخدام نسخة بايثون خفيفة مخصصة للسيرفرات (Debian/Slim)
FROM python:3.10-slim

# منع بايثون من كتابة ملفات المؤقتة (.pyc) والظهور بدون تأخير (Buffering)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# تعيين مسار العمل داخل الحاوية
WORKDIR /app

# نسخ ملف متطلبات النظام وتثبيتها مسبقاً لاستغلال كاش الدوكر (Docker Cache)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# نسخ باقي ملفات المشروع والأكواد المشفرة (أو العادية) إلى الحاوية
COPY . /app/

# كشف المنفذ الافتراضي للأنظمة السحابية
EXPOSE 8080

# تشغيل "الدايمون المراقب" كونه المسؤول عن النظامين (المراقب والرد) في نفس الوقت
# السكربت مصمم لالتقاط منفذ $PORT من بيئة الاستضافة
CMD ["python", "daemon_runner.py"]
