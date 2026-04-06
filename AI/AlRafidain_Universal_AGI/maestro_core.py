# ==============================================================================
# 👑 AL-RAFIDAIN SOVEREIGN AGI - MAESTRO IMMORTAL CORE
# ==============================================================================
# (C) 2026 Al-Rafidain Power & Scales Company. All Rights Reserved.
# STRICTLY PROPRIETARY AND CONFIDENTIAL. ANY UNAUTHORIZED USE, REDISTRIBUTION, 
# OR MODIFICATION IS STRICTLY PROHIBITED.
# ==============================================================================
import os
import logging
from datetime import datetime
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun
from plugin_vector_memory import VectorLongTermMemory

# إعداد نظام تتبع مؤسسي (Enterprise Logging)
log_dir = os.path.join(os.getenv('APPDATA', os.path.dirname(__file__)), "RafidainAGI", "Logs")
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_dir, f"maestro_{datetime.now().strftime('%Y%m%d')}.log"),
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger("MaestroCore")

# ==========================================
# 1. إعداد العقل المدبر (Gemini 1.5 Pro)
# ==========================================
from dotenv import load_dotenv

# Load environment variables from .env file (or system)
load_dotenv()

# We no longer hardcode the API key, it is loaded safely from the environment.
if not os.getenv("GOOGLE_API_KEY"):
    logger.error("مفتاح GOOGLE_API_KEY مفقود من ملف الإعدادات .env!")
    print("[!] تحذير: مفتاح GOOGLE_API_KEY مفقود من ملف الإعدادات .env!")

# ضبط محرك جيمناي بأقصى درجات التركيز 
try:
    gemini_llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.1)
except Exception as e:
    logger.error(f"فشل في تهيئة محرك الذكاء: {str(e)}")

# تفعيل أداة البحث في الإنترنت (الحواس)
search_tool = DuckDuckGoSearchRun()

# استدعاء الذاكرة طويلة المدى للوكلاء
brain_memory = VectorLongTermMemory()

# ==========================================
# 2. بناء فريق الوكلاء الأذكياء
# ==========================================
internet_researcher = Agent(
    role='كبير باحثي البيانات الحية',
    goal='البحث في الإنترنت عن أحدث المعلومات والبيانات الدقيقة حول أي موضوع يُطلب منك',
    backstory='أنت خبير استخبارات مفتوحة المصدر (OSINT) قادر على استخراج أدق التفاصيل من الإنترنت بسرعة فائقة.',
    verbose=True,
    allow_delegation=False,
    tools=[search_tool],
    llm=gemini_llm
)

strategic_analyst = Agent(
    role='المدير الاستراتيجي والمحلل',
    goal='تحليل البيانات التي يجمعها الباحث وصياغتها في تقرير تنفيذي احترافي وعميق',
    backstory='أنت مستشار استراتيجي تعمل لدى كبرى الشركات التقنية، تمتلك قدرة فذة على ربط النقاط واستخلاص النتائج من البيانات الخام.',
    verbose=True,
    allow_delegation=False,
    llm=gemini_llm
)

# ==========================================
# 3. تحديد المهام
# ==========================================
research_task = Task(
    description='ابحث في الإنترنت عن: "أحدث التطورات في أنظمة الذكاء الاصطناعي المستقلة لعام 2026". اجمع أهم 3 نقاط رئيسية.',
    expected_output='قائمة بـ 3 نقاط رئيسية توضح أحدث التطورات مع مصادرها المتاحة.',
    agent=internet_researcher
)

analysis_task = Task(
    description='بناءً على النقاط الثلاث التي جمعها الباحث، اكتب تقريراً باللغة العربية من فقرتين يوضح كيف ستؤثر هذه التطورات على قطاع الأعمال.',
    expected_output='تقرير استراتيجي احترافي باللغة العربية يربط التقنية بالأعمال.',
    agent=strategic_analyst
)

# ==========================================
# 4. المايسترو وإطلاق النظام
# ==========================================
def run_ai_system():
    try:
        msg = ">> جاري تشغيل المايسترو: استدعاء فريق الوكلاء..."
        logger.info(msg)
        print(f"===========================================\n{msg}\n===========================================\n")
        
        core_crew = Crew(
            agents=[internet_researcher, strategic_analyst],
            tasks=[research_task, analysis_task],
            verbose=True,
            process=Process.sequential
        )
        
        final_result = core_crew.kickoff()
        
        logger.info("تمت المهمة بنجاح! التقرير النهائي تم توليده.")
        print("\n===========================================")
        print(">> تمت المهمة بنجاح! التقرير النهائي:")
        print("===========================================")
        print(final_result)
        
        logger.info("جاري تخزين التحليل في قاعدة البيانات المتجهة (ChromaDB)...")
        import time
        brain_memory.save_knowledge(
            document_id=f"report_{int(time.time())}",
            topic="تأثير تطورات أنظمة الذكاء الاصطناعي على قطاع الأعمال لعام 2026",
            deep_analysis=str(final_result),
            agent_name="المحلل الاستراتيجي"
        )
        logger.info("تمت أرشفة المعرفة بنجاح في الفص العميق.")
        
    except Exception as e:
        logger.critical(f"حدث انهيار غير متوقع أثناء تشغيل النظام: {str(e)}", exc_info=True)
        print("\n[!] حدث خطأ أثناء تشغيل النظام الرجاء التحقق من السجلات.")

if __name__ == "__main__":
    run_ai_system()