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
print(" 🔴 RAFID SOVEREIGN AGI - BEAST MODE ACTIVATED (200 ULTRA-COMPLEX INJECTIONS)")
print("==========================================================================")

chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

llm = UniversalLLMEngine()

# 20 مجبراً معقداً لاستخراج 200 سؤال عميق (10 لكل مجال)
BEAST_DOMAINS = [
    "التحليل الكوانتي واهتزازات الهياكل المعمارية لموازين الشاحنات",
    "برمجة النواة (Kernel Level) لاكتشاف حقن الذاكرة (Memory Injection) في أنظمة Delphi",
    "استخدام الوراثة الجينية (Genetic Algorithms) في تحسين سلاسل التوريد",
    "الهندسة العكسية لبروتوكول Modbus TCP وتشفير قنوات SCADA",
    "توصيل الشبكات العصبية العميقة (Deep Neural Networks) بـ PLCs في الوقت الفعلي",
    "نظريات الفيزياء الفلكية والنسبية المطبقة في معايرة أنظمة الملاحة وتتبع الشاحنات",
    "اختراق وتعديل بيانات SQL Server المتقدمة عن طريق هجمات (Timing Attacks) والحماية منها",
    "تطبيقات رياضية (تحويل فورييه) لتنقية ذبذبات خلايا Zemic من الضوضاء الصناعية",
    "تحليل نظرية الألعاب (Game Theory) في التسعير الاحتكاري للبرمجيات الصناعية",
    "التشفير غير المتماثل وتقنيات الختم الزمني (Blockchain) لمنع التزوير المالي",
    "الفلسفة النفسية للبشر (Cognitive Biases) واستغلالها في تصميم واجهات مستخدم (UX) خبيثة",
    "تقنيات التبريد الكمي ومعالجة الحرارة الفائقة في وحدات معالجة البيانات الطرفية (Edge GPUs)",
    "الهندسة الجيوتقنية وتأثير هبوط أساسات التربة على دقة قبان الوزن الأرضي",
    "أنظمة (Zero-Trust Architecture) وعزل شبكات الـ VLAN داخل المصانع",
    "الذكاء الاصطناعي التوليدي في إنتاج أكواد Delphi تلقائية لحل أخطاء الـ Memory Leaks",
    "تأثير العواصف الشمسية (Solar Flares) فيزيائياً على دوائر الـ Microcontrollers، الحماية العازلة (Faraday Cages)",
    "الاقتصاد الكلي والأسواق الموازية وتأثيرها المباشر على توريد أجزاء موازين الشاحنات بالدولار",
    "تشريح هجمات (Stuxnet) السيبرانية وكيف نتأكد من مناعة وحدات الـ PLC الخاصة برافد ضدها",
    "تطبيقات الواقع المعزز (AR) لمساعدة مهندسي الصيانة في تشخيص أعطال الجسور عن بعد",
    "هندسة البلازما وقطع الحديد بالليزر وتأثير الإجهاد الحراري على حديد موازين الشاحنات"
]

async def unleash_beast_batch(domain: str, batch_num: int):
    print(f"🔥 [دفعة {batch_num}/20] جاري تخليق 10 ألغاز هندسية متطرفة في: {domain}")
    
    prompt = f"""
    أنت الآن تعمل بوضعية (BEAST MODE). استخدم أقصى وأعنف درجات التعقيد التقني، البرمجي، الفيزيائي والرياضي.
    قم بتأليف 10 سيناريوهات/أسئلة (مستحيلة الحل تقريباً) في مجال '{domain}'.
    ثم أجب على كل سؤال بإجابة تحليلية، علمية، برمجية ودقيقة جداً (Expert Level).
    
    أريد فقط مصفوفة JSON كما يلي:
    [
      {{
        "q": "السؤال المعقد ذو الأبعاد المتعددة...",
        "a": "الإجابة العلمية العميقة الخالية من الحشو..."
      }}
    ]
    """
    
    # تحويل الطلبات المعقدة هذه لمحرك Google Gemini Flash أو DeepSeek (بناء على التوجيه المدمج)
    # سنستخدم "training_generation" ليأخذها المجاني السريع (Gemini) أو "write_python_code" للحصول على DeepSeek
    # سننوع المحركات!
    engine_task = "write_python_code" if batch_num % 2 == 0 else "training_generation"
    
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
            return []
    except Exception as e:
        print(f"⚠️ ارتباك عابر في محرك {engine_task}: {e}")
        return []

async def execute_knowledge_injection():
    total_injected = 0
    # تفعيل المعالجة المتوازية (استهلاك الرام والمعالج بالكامل) - تنفيذ 5 طلبات في نفس اللحظة
    sem = asyncio.Semaphore(5)

    async def _process_domain(domain, i):
        async with sem:
            qa_batch = await unleash_beast_batch(domain, i+1)
            # فترة راحة قصيرة لتخفيف صدمة الـ API
            await asyncio.sleep(2)
            return qa_batch, domain, i

    print("🚀 بدء المعالجة المتوازية (Parallel Processing) للاستفادة القصوى من قدرات الرام والمعالج...")
    tasks = [_process_domain(domain, i) for i, domain in enumerate(BEAST_DOMAINS)]
    results = await asyncio.gather(*tasks)
    
    for qa_batch, domain, idx in results:
        if qa_batch:
            docs = []
            metadatas = []
            ids = []
            
            for j, qa in enumerate(qa_batch):
                q = qa.get("q", "")
                a = qa.get("a", "")
                if q and a:
                    docs.append(f"Q: {q}\nTarget Engineered Answer: {a}")
                    metadatas.append({"category": "Beast_Mode_Automated", "domain": domain})
                    ids.append(f"beast_{int(time.time())}_{idx}_{j}")
            
            if docs:
                collection.add(documents=docs, metadatas=metadatas, ids=ids)
                total_injected += len(docs)
                print(f"💉 تم حقن {len(docs)} خبرة بنسبة لـ {domain[:20]} بنجاح! الإجمالي: {total_injected}")
        
    print("==========================================================================")
    print(f"🎉 الإنجاز العظيم: تم حقن وتدريب رافد على {total_injected} مسألة معقدة جداً بأقصى سرعة!")
    print(" رافد الآن 'وحش المعرفة' بلا منازع.")
    print("==========================================================================")

if __name__ == "__main__":
    asyncio.run(execute_knowledge_injection())
