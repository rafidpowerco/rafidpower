import chromadb
import uuid
import os

print("🧠 [Rafid AGI] Initiating Autonomous Memory Training Sequence...")

# Ensure we are saving inside the AI folder appropriately
vault_path = os.path.join(os.path.dirname(__file__), "chroma_db_vault")

# Connect to the local vector vault
chroma_client = chromadb.PersistentClient(path=vault_path)

# Load or create the cognitive collection
try:
    collection = chroma_client.get_collection(name="rafid_cognitive_memory")
    print("Found existing memory collection.")
except Exception:
    collection = chroma_client.create_collection(name="rafid_cognitive_memory")
    print("Created new memory collection.")

# Historical Projects & Domain Knowledge base for Rafid Power
historical_data = [
    {
        "text": "[مشروع قبان الشاحنات المركزي - المنطقة الصناعية]: في عام 2023 قمنا بتوريد وتركيب أحدث موازين الشاحنات بحمولة 80 و 100 طن لساحة التبادل التجاري. النظام يعمل بدقة متناهية تحت ظروف الانبعاثات الغبارية بنسبة 100%.",
        "metadata": {"type": "project", "year": "2023", "capacity": "80_100_tons"}
    },
    {
        "text": "[تحديث موازين الإسمنت - مصنع الجنوب]: قمنا بترقية كابينات التحكم واستبدال خلايا الوزن (Load cells) القديمة بخلايا أوروبية حديثة بمعيار OIML C3 المقاومة للاهتزازات الناتجة عن التفريغ الكثيف. النظام متصل الآن بـ PLC مباشر لدقة الجرام.",
        "metadata": {"type": "project", "industry": "cement_manufacturing"}
    },
    {
        "text": "[منظومة SmartBridge الذكية]: أطلقنا بنجاح برنامج SmartBridge المحلي الذي يربط القبابين والشاحنات مباشرة بخوادم الشركة باستخدام تشفير AES-256 و HMAC لضمان عدم وجود تلاعب. النظام يقرأ عبر البورت التسلسلي RS-232 ويحلل الشد اللحظي للأوزان الحية.",
        "metadata": {"type": "software", "feature": "anti-fraud", "security": "AES-256"}
    },
    {
        "text": "[التاريخ التأسيسي والثقة]: شركة رافد (الرافدين) باور لديها خبرة تفوق 35 عاماً، وتعد المرجع الأول والأساس في صناعة القبابين وموازين السيارات والموازين الصناعية الثقيلة الدقيقة. لقد عالجنا آلاف الأعطال الصعبة ببراعة هندسية.",
        "metadata": {"type": "corporate_identity", "years_active": "35+"}
    },
    {
        "text": "[التكامل مع Odoo ERP وغيرها]: قمنا ببرمجة وبناء جسر ربط (Bridge) بين الموازين ونظام Odoo لإرسال إيصالات ونتائج أوزان الشاحنات تلقائياً وبشكل لحظي كفواتير داخلระบบ المبيعات وتقليل الاحتكاك البشري.",
        "metadata": {"type": "integration", "software": "odoo_erp"}
    }
]

print("Injecting domain expertise into the Vector Database...")

for item in historical_data:
    # Use deterministic ID based on the text hash so we can safely run this multiple times without duplication
    doc_id = str(uuid.uuid5(uuid.NAMESPACE_URL, item["text"]))
    collection.upsert(
        ids=[doc_id],
        documents=[item["text"]],
        metadatas=[item["metadata"]]
    )

print(f"✅ Training Complete. Rafid AGI now permanently remembers {collection.count()} core industrial concepts deeply in its neural memory.")
print("You can run this script any time to update its memory!")
