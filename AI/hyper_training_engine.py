import time
import os
import json
import asyncio
import chromadb
from datetime import datetime

# Adjust paths if files are in AlRafidain_Universal_AGI or root.
# Since we didn't run the refactor script, llm_engine is in AlRafidain_Universal_AGI
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "AlRafidain_Universal_AGI"))
from llm_engine import UniversalLLMEngine
from dotenv import load_dotenv

load_dotenv()

# ====================================================================
# Rafid Sovereign AGI - HYPER-LEARNING PIPELINE
# Generates 200 synthetic complex queries/answers every hour.
# ====================================================================

class HyperTrainer:
    def __init__(self):
        self.llm = UniversalLLMEngine()
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
        self.collection = self.chroma_client.get_or_create_collection(name="rafid_cognitive_memory")
        
        # Domains to ensure rich, varied intelligence
        self.domains = [
            "Zemic Load Cells Calibration and Modbus failures in extreme heat",
            "Delphi 10.4 memory leaks when communicating with COM Ports",
            "Global Supply Chain and Financial impact on electronic components",
            "Advanced PLC Programming (Siemens/Omron) for industrial scales",
            "Fraud detection algorithms in weighing systems (Mathematics and Physics)"
        ]

    async def generate_batch(self, domain_topic: str) -> list:
        """يطلب 10 أسئلة وأجوبة معقدة لكل دفعة لتقليل طلبات الـ API"""
        print(f"🔄 جاري استخراج شحنة وعي صناعي (10 سيناريوهات) لمجال: {domain_topic[:40]}...")
        
        prompt = f"""
        أنت المعلم والمدرب الخبير للمنظومة الصناعية والبرمجية لشركة 'رافد للموازين'.
        قم بابتكار 10 مواقف/أسئلة فنية وهندسية (نادرة جداً ومعقدة للغاية) تخص هذا المجال: '{domain_topic}'.
        ثم أجب عن كل سؤال بإجابة تحليلية وهندسية وحاسمة.
        
        أريد الناتج بصيغة مصفوفة JSON فقط كالتالي (بدون أي نصوص إضافية، فقط JSON Array):
        [
          {{
            "q": "السؤال المعقد هنا...",
            "a": "الإجابة الهندسية الدقيقة هنا..."
          }}
        ]
        """
        response_text = await self.llm.generate(prompt, task_type="training_generation")
        
        # التنظيف السريع لاحتمالية احتواء الرد على Markdown
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        try:
            qa_array = json.loads(clean_text)
            return qa_array
        except json.JSONDecodeError as e:
            print(f"⚠️ فشل استخراج الدفعة (JSON Parse Error): {e}")
            return []

    async def run_hourly_training_cycle(self):
        print(f"\n=======================================================")
        print(f"🚀 بدء دورة التدريب المكثفة (Hyper-Training Cycle) - {datetime.now().strftime('%H:%M:%S')}")
        print(f"=======================================================")
        
        total_memorized = 0
        batches = 20  # 20 دفعات * 10 أسئلة = 200 سؤال
        
        for i in range(batches):
            domain = self.domains[i % len(self.domains)]
            batch_qa = await self.generate_batch(domain)
            
            if batch_qa and isinstance(batch_qa, list):
                docs = []
                ids = []
                metadatas = []
                
                for idx, qa in enumerate(batch_qa):
                    question = qa.get("q", "")
                    answer = qa.get("a", "")
                    if question and answer:
                        doc = f"Q: {question}\nTarget Engineered Answer: {answer}"
                        docs.append(doc)
                        ids.append(f"hyper_memory_{int(time.time())}_{i}_{idx}")
                        metadatas.append({"category": "Hyper_Synthetic_Intel", "domain_hint": domain[:20]})
                
                if docs:
                    self.collection.add(documents=docs, metadatas=metadatas, ids=ids)
                    total_memorized += len(docs)
                    print(f"💾 تم دمج {len(docs)} عصبة معرفية جديدة في ChromaDB.")
                    
            # توقف مؤقت لحماية السيرفر من الحظر (Rate Limits)
            await asyncio.sleep(3)

        print(f"\n🏆 اكتمل التدريب المكثف! رافد اكتسب {total_memorized} خبرة معقدة جديدة في هذه الساعة.")

def start_hyper_trainer_loop():
    trainer = HyperTrainer()
    while True:
        try:
            asyncio.run(trainer.run_hourly_training_cycle())
            print("\n💤 انتهت دورة الحفظ. الذكاء الاصطناعي يستريح لساعة كاملة لترتيب أفكاره...")
            time.sleep(3600)  # Sleep exactly one hour
        except Exception as e:
            print(f"❌ خطأ غير متوقع في محرك التدريب المكثف: {e}")
            time.sleep(60)

if __name__ == "__main__":
    start_hyper_trainer_loop()
