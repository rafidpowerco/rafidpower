import os
import json
import chromadb
from google import genai
from dotenv import load_dotenv

load_dotenv()

print("==================================================")
print("     Sovereign AGI - Autonomous Training Engine   ")
print("==================================================")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("❌ خطأ: مفتاح GEMINI_API_KEY مفقود. المدرب الذكي يحتاج إلى المفتاح الحقيقي للبدء.")
    exit(1)

# تهيئة Gemini
client = genai.Client(api_key=api_key)
MODEL_ID = "gemini-1.5-pro"

# تهيئة ذاكرة المنظومة (Vector Database)
chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

def train_on_data(data_text: str, category: str):
    print(f"\n🧠 جاري إرسال البيانات إلى Gemini لفهمها واستخراج القواعد المعرفية ({category})...")
    
    prompt = f"""
    أنت المعلم والمدرب للذكاء الاصطناعي الخاص بـ "رافد".
    مهمتك تحليل البيانات التالية واستخراج 3 قوانين/قواعد ذهبية منها (سواء كانت للأسهم، العملات، أو الموازين).
    البيانات:
    {data_text}
    
    استخرج القواعد فقط في نص واضح لكي أحفظها في ذاكرة رافد الدائمة:
    """
    
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt
    )
    
    learned_knowledge = response.text.strip()
    print(f"✅ تم التعلم! القواعد المستخرجة:\n{learned_knowledge}\n")
    
    # تحويل المعرفة إلى ذاكرة دائمة (Vector Embedding)
    doc_id = f"memory_{category}_{os.urandom(4).hex()}"
    collection.add(
        documents=[learned_knowledge],
        metadatas=[{"category": category}],
        ids=[doc_id]
    )
    print(f"💾 تم حفظ المعرفة في قاعدة بيانات ChromaDB (المعرف: {doc_id})")

if __name__ == "__main__":
    # مثال 1: تدريب على حركة أسواق مالية (أسهم/عملات)
    stock_data = "شهدت أسواق الذهب (XAU) والفوركس تذبذباً حاداً بعد صدور بيانات الفائدة. عندما يرتفع التضخم، تتجه رؤوس الأموال للأصول الآمنة ويرتفع الذهب وينخفض الجنيه."
    train_on_data(stock_data, "Finance_Forex")
    
    # مثال 2: تدريب على الأوزان الصناعية
    scale_data = "إذا لاحظت تأرجحاً في خلايا الوزن بمقدار 5 كيلوغرام فجأة في الميزان رقم 4، فهذا يعني وجود تداخل كهرومغناطيسي (EMI) من المولدات القريبة، وليس تلاعباً."
    train_on_data(scale_data, "Industrial_Scales")

    print("\n🏆 اكتملت جلسة التدريب! (رافد الآن أذكى ويمتلك هذه المعلومات في عقله العميق).")
