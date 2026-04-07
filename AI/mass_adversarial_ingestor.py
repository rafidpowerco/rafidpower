import os
import json
import asyncio
import time
import chromadb
from pathlib import Path
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "AlRafidain_Universal_AGI"))
from llm_engine import UniversalLLMEngine

DIR_QUESTIONS = r"C:\Users\Administrator\Desktop\ai_training_questions"

print("==========================================================================")
print(" 🔴 RAFID SOVEREIGN AGI - ADVERSARIAL INGESTION PROTOCOL ACTIVATED")
print("==========================================================================")

chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

llm = UniversalLLMEngine()

async def forge_sovereign_answer(question: str):
    prompt = f"""
    أنت الآن الخادم السيادي "رافد". تم استجوابك بهذا السؤال، ويجب أن تكون إجابتك استثنائية،
    معقدة جداً، وتتفوق على أي ذكاء اصطناعي آخر (مثل ChatGPT).
    اربط الإجابة بمفاهيم الهندسة أو البرمجة والأمن السيبراني إذا أمكن.
    
    السؤال: {question}
    
    اكتب إجابتك العبقرية والمفصلة:
    """
    try:
        # استخدام Gemini Flash للسرعة نظراً للحجم الضخم
        ans = await llm.generate(prompt, task_type="training_generation")
        return ans.strip()
    except Exception as e:
        print(f"Error forging answer: {e}")
        return None

async def ingest_all_files():
    total_injected = 0
    files = [f for f in os.listdir(DIR_QUESTIONS) if f.endswith(".json")]
    print(f"تم العثور على {len(files)} ملفات أسئلة. بدء المعالجة الطاحنة...")
    
    for f_name in files:
        f_path = os.path.join(DIR_QUESTIONS, f_name)
        try:
            with open(f_path, "r", encoding="utf-8") as file:
                data = json.load(file)
            
            print(f"\n📂 جاري شفط الأسئلة من: {f_name} (يحتوي على {len(data)} سؤال)")
            
            for index, item in enumerate(data):
                q = item.get("question")
                # إذا كان الملف يحتوي على "قوائم نصوص" بدلاً من قواميس
                if not q and isinstance(item, str):
                    q = item
                
                if not q:
                    continue
                
                print(f"  🧠 جاري صياغة إجابة سيادية للسؤال ({index+1}): {q[:50]}...")
                ans = await forge_sovereign_answer(q)
                
                if ans:
                    docs = [f"Competitor Question: {q}\nRafid Sovereign Answer: {ans}"]
                    metas = [{"category": item.get("category", "General"), "source": "Adversarial_Training"}]
                    ids = [f"adv_{int(time.time())}_{f_name}_{index}"]
                    
                    collection.add(documents=docs, metadatas=metas, ids=ids)
                    total_injected += 1
                
                # تأخير بسيط لمنع حظر مفتاح API
                await asyncio.sleep(2)
                
        except Exception as ex:
            print(f"❌ خطأ في قراءة الملف {f_name}: {ex}")
            
    print("==========================================================================")
    print(f"✅ اكتملت المهمة! تمت مصادرة {total_injected} سؤال، وتمت الإجابة عليها بحنكة رافد، وتم حفرها في الذاكرة.")
    print("==========================================================================")

if __name__ == "__main__":
    asyncio.run(ingest_all_files())
