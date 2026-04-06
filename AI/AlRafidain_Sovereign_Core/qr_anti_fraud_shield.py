import hashlib
import qrcode
import base64
from io import BytesIO

class QRAntiFraudShield:
    """
    الدرع الرقمي: يولد البصمة المشفرة للوزن مع صورة QR ليتم طباعتها في الفاتورة الخاصة بالعميل.
    استراتيجية (الصفر_تلاعب): أي تعديل يدوي في نص الفاتورة الورقية (زيادة أو نقصان طن واحد) 
    لن يتطابق مع هذا التشفير عند فحصها بالكاميرا أو الويب.
    """
    def __init__(self, secret_key="RAFIDAIN_SOVEREIGN_SECRET_2026"):
        self.secret_key = secret_key

    def generate_secure_qr(self, ticket_id: str, exact_weight: float) -> dict:
        
        # 1. التشفير الرياضي ذو الاتجاه الواحد (One-way hashing)
        payload = f"{ticket_id}_{exact_weight}_{self.secret_key}"
        secure_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        
        # 2. إنشاء المسار الذي سيقوم الزبون/المصنع بمسحه بالهاتف
        verify_url = f"https://dashboard.alrafidain.com/verify?hash={secure_hash}"
        
        # 3. توليد الصورة النقطية لرمز الكيو آر كـ Base64 لترسل إلى واجهة Delphi دون الحاجة لحفظها كملف
        qr = qrcode.QRCode(version=1, box_size=5, border=2)
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "ticket": ticket_id,
            "weight_certified": exact_weight,
            "hash": secure_hash,
            "verify_url": verify_url,
            "qr_image_base64": qr_base64
        }

if __name__ == "__main__":
    shield = QRAntiFraudShield()
    print("🛡️ تفعيل درع فحص التلاعب... ")
    demo_result = shield.generate_secure_qr("TICKET_9012", 45000.5)
    print(f"✅ التذكرة TICKET_9012 بوزن 45 طن تم تأمينها بالهاش:\n{demo_result['hash']}")
