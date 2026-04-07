import os
import chromadb
from google import genai
from pydantic import BaseModel
import time
from dotenv import load_dotenv
import json

load_dotenv()

print("=========================================================")
print("  Rafid Sovereign AGI - Evolution & Self-Learning Core   ")
print("  (Self-Reflection & Automation Rule Generation)         ")
print("=========================================================")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("❌ خطأ: لم يتم العثور على مفتاح GEMINI_API_KEY حقيقي.")
    exit(1)

client = genai.Client(api_key=api_key)
MODEL_ID = "gemini-1.5-pro"

# الاتصال بصندوق الذاكرة (ChromaDB)
chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

class AutomationCommand(BaseModel):
    learned_rule: str
    plc_command_action: str

def self_reflection_and_evolution(daily_logs_text: str):
    """
    هذه الوظيفة تمثل مستوى التطور الذاتي. 
    تقوم بقراءة محادثات اليوم السابق، نقد الإجابات، واستخراج قوانين أتمتة جديدة.
    """
    print("🧠 [1] بدء دورة النقد الذاتي (Self-Reflection) والتطور...")
    
    prompt = f"""
    أنت محرك التطور الذاتي (Evolution Engine) لمنظومة "رافد".
    مهمتك مراجعة التعاملات والمواقف التالية التي حدثت اليوم في المصنع والمبيعات:
    
    سجلات اليوم:
    {daily_logs_text}
    
    المطلوب منك (كمحرك أتمتة وتطوير):
    1. استخرج "قاعدة ذهبية ثابتة" (Learned Rule) لمنع تكرار أي خطأ حدث، أو تحسين سرعة الاستجابة.
    2. استخرج قرار "أتمتة" (PLC Command) يمكن إرساله كإشارة لبرنامج SmartBridge للتحكم بالموازين برمجياً.
    
    يجب أن يكون الناتج بصيغة JSON حصراً بهذا الشكل:
    {{"learned_rule": "القاعدة التي تعلمتها المنظومة هنا", "plc_command_action": "SET_CALIBRATION_ZERO" أو "NONE"}}
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        output = json.loads(response.text.strip())
        rule = output.get("learned_rule", "")
        action = output.get("plc_command_action", "")
        
        if rule:
            # زرع القاعدة في الذاكرة الدائمة ليتصرف بها مستقبلاً
            doc_id = f"lesson_learned_{int(time.time())}"
            collection.add(
                documents=[f"[تم التعلم ذاتياً]: {rule} - أتمتة التوجيه: {action}"],
                metadatas=[{"category": "Self_Evolution", "timestamp": str(time.time())}],
                ids=[doc_id]
            )
            print(f"✅ تم استخراج القاعدة وزرعها بنجاح في عمق الذاكرة السيادية (ID: {doc_id}).")
            print(f"📌 القاعدة المستخلصة: {rule}")
            print(f"⚙️ إجراء الأتمتة المربوط: {action}")
        
    except Exception as e:
        print(f"⚠️ خطأ في دورة التطور الذاتي: {e}")

if __name__ == "__main__":
    # محاكاة لبيانات اليوم أو سجلات حقيقية من قاعدة بياناتك لاحقاً
    mock_daily_log = "نظام الميزان لاحظ اليوم تذبذب في قراءات الخلية رقم 2 بقيمة 5 كيلوغرام كل فترة ظهر بسبب ارتفاع درجات الحرارة في العراق."
    self_reflection_and_evolution(mock_daily_log)
