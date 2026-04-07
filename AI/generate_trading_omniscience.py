import asyncio
import time
import json
import chromadb
import os
import sys

# ربط المحركات ببيئة العمل
sys.path.append(os.path.join(os.path.dirname(__file__), "AlRafidain_Universal_AGI"))
from llm_engine import UniversalLLMEngine
from dotenv import load_dotenv

load_dotenv()

print("==========================================================================")
print(" 💹 RAFID SOVEREIGN AGI - TRADING OMNISCIENCE ACTIVATED (200 PRO/ULTRA INJECTIONS)")
print("==========================================================================")

chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

llm = UniversalLLMEngine()

# 20 مجال مالي وتداولي معقد جداً لاستخراج 200 مفهوم/سؤال (10 لكل مجال)
TRADING_DOMAINS = [
    "خوارزميات التداول عالي التردد (HFT) وبرمجة تدفق الأوامر (Order Flow) في الميكروثانية",
    "تطبيق ميكانيكا الكم والتفاضل والتكامل العشوائي (Stochastic Calculus) في تسعير خيارات الفوركس",
    "تحليل بيانات البلوكشين (On-chain Analytics) ونماذج الـ UTXO لتعقب حيتان الكريبتو والتصفية",
    "تكامل مفاهيم الأموال الذكية (SMC) وبلوكات الأوامر المؤسسية مع الشبكات العصبية العميقة المتوقعة",
    "البنية الدقيقة لأسواق الفوركس وتأثير مزودي السيولة من الفئة الأولى (Tier-1 Liquidity Providers)",
    "المراجحة الإحصائية الاستكشافية (Statistical Arbitrage) وتداول الأزواج (Pairs Trading) باستخدام التمويل الكمي",
    "الذكاء الاصطناعي معالجة اللغات الطبيعية (NLP) في قياس معنويات الأخبار الجيوسياسية الحية",
    "نماذج GARCH المتقدمة في التنبؤ بتقلبات الأسواق الخفية وإدارة المخاطر المعقدة",
    "اكتشاف التلاعب بالأسواق المفتوحة (Spoofing & Layering) باستخدام تعلّم الآلة في دفتر الأوامر (Level 2)",
    "إستراتيجيات تنفيذ الأوامر الخوارزمية المؤسساتية (TWAP, VWAP, Implementation Shortfall)",
    "التنبؤ بالسلاسل الزمنية المالية باستخدام الهندسة المعمارية (Transformers) و (LSTM)",
    "بروتوكولات (Zero-Knowledge Proofs) في البورصات اللامركزية (DeFi) والاقتراض السريع (Flash Loans)",
    "تحوط المحافظ المالية (Portfolio Hedging) المعقدة باستخدام المشتقات ومقايضة العوائد (Swaps)",
    "التعلم المعزز العميق (Deep Reinforcement Learning) في تدريب روبوتات التداول المستقلة تماماً",
    "ديناميكيات دورات اقتصاد الماكرو وتأثير قرارات البنوك المركزية (كمي مقابل نوعي) على الكريبتو",
    "تحليل موجات إليوت (Elliott Wave) ونسب فيبوناتشي المعقدة ودمجها مع النماذج الكسورية (Fractal Geometry)",
    "قواعد اجتياز وتدقيق حسابات شركات التمويل (Prop Firms) وبناء أنظمة صرامة إدارة المخاطر الخوارزمية",
    "تأثير السيولة المجزأة للتبادلات المشفرة (CEX vs DEX Arbitrage) وخوارزميات توجيه الأوامر الذكية (SOR)",
    "تحليلات محاكاة مونت كارلو (Monte Carlo Simulation) لحساب القيمة المعرضة للخطر (VaR) في المحافظ",
    "الهندسة العكسية لمنصات التداول الآلي وابتكار مقابس واجهة تطبيقات (FIX Protocol APIs) ذات كمون منخفض جداً"
]

async def unleash_trading_batch(domain: str, batch_num: int):
    print(f"💰 [دفعة {batch_num}/20] جاري تخليق 10 خوارزميات وتحليلات متطرفة في: {domain}")
    
    prompt = f"""
    أنت الآن تعمل بوضعية (TRADING OMNISCIENCE MODE) باستخدام أقوى كفاءاتك التحليلية (Ultra/Pro).
    استخدم أقصى وأعنف درجات التعقيد الرياضي، الاقتصادي، والبرمجي في أسواق المال.
    قم بتأليف 10 سيناريوهات/خوارزميات/مواقف عالية التعقيد (مستحيلة الحل للمبتدئين) في مجال '{domain}'.
    ثم أجب على كل مسألة بإجابة تحليلية، برمجية، إحصائية دقيقة جداً ومفصلة.
    
    أريد فقط مصفوفة JSON كما يلي:
    [
      {{
        "q": "السؤال أو السيناريو التداولي المعقد...",
        "a": "الإجابة العلمية، الاستراتيجية، أو البرمجية المباشرة..."
      }}
    ]
    """
    
    # توجيه الطلبات للمحرك الأذكى (Gemini Pro) للتحليلات العميقة
    engine_task = "deep_financial_analysis" 
    
    try:
        response_text = await llm.generate(prompt, task_type=engine_task)
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        
        # محاولة البحث عن مصفوفة JSON 
        start_idx = clean_text.find('[')
        end_idx = clean_text.rfind(']') + 1
        
        if start_idx != -1 and end_idx != -1:
            qa_array = json.loads(clean_text[start_idx:end_idx])
            return qa_array
        else:
            print(f"⚠️ فشل تحليل JSON من المحرك للدفعة {batch_num}")
            return []
    except Exception as e:
        print(f"⚠️ ارتباك عابر في محرك {engine_task}: {e}")
        return []

async def execute_knowledge_injection():
    total_injected = 0
    for i, domain in enumerate(TRADING_DOMAINS):
        qa_batch = await unleash_trading_batch(domain, i+1)
        
        if qa_batch:
            docs = []
            metadatas = []
            ids = []
            
            for idx, qa in enumerate(qa_batch):
                q = qa.get("q", "")
                a = qa.get("a", "")
                if q and a:
                    docs.append(f"Financial Model / Q: {q}\nAnalysis & Algorithm / A: {a}")
                    metadatas.append({"category": "Trading_Omniscience", "domain": domain})
                    ids.append(f"finance_{int(time.time())}_{i}_{idx}")
            
            if docs:
                collection.add(documents=docs, metadatas=metadatas, ids=ids)
                total_injected += len(docs)
                print(f"💹 تم حقن {len(docs)} خوارزمية مالية بنجاح! الإجمالي حتى الآن: {total_injected} خوارزمية/تحليل.")
        
        # فترة راحة 10 ثوانٍ لحماية مفاتيح API من الحظر لـ Gemini Pro
        await asyncio.sleep(10)
        
    print("==========================================================================")
    print(f"🎉 الإنجاز العظيم: تم حقن وتدريب رافد على {total_injected} خوارزمية تداول واقتصاد معقدة جداً بنجاح!")
    print(" رافد الآن 'محلل مالي كمّي' بلا منازع.")
    print("==========================================================================")

if __name__ == "__main__":
    asyncio.run(execute_knowledge_injection())
