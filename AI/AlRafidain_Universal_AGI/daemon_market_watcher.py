# ==============================================================================
# 👑 ZIND SOVEREIGN AGI - FINANCIAL & MARKET WATCHER DAEMON
# ==============================================================================
# يقرأ سوق الأسهم، العملات الرقمية، ويتعلم من كل حركة.
# ==============================================================================
import os
import time
import logging
from datetime import datetime
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun
from plugin_vector_memory import VectorLongTermMemory

# إعداد السجلات
log_dir = os.path.join(os.getenv('APPDATA', os.path.dirname(__file__)), "RafidainAGI", "Logs")
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_dir, f"market_watcher_{datetime.now().strftime('%Y%m%d')}.log"),
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger("MarketWatcher")

from dotenv import load_dotenv
load_dotenv()

# محرك الذكاء
gemini_llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.2)
search_tool = DuckDuckGoSearchRun()
brain_memory = VectorLongTermMemory()

# ==========================================
# 1. فريق الاستخبارات المالية
# ==========================================
crypto_stock_researcher = Agent(
    role='كبير رادارات السوق',
    goal='مراقبة حية لسوق العملات الرقمية (Bitcoin/Ethereum) وسوق الأسهم العالمي، وجلب أحدث الأخبار.',
    backstory='أنت مستشعر نبض السوق العالمي. تحلل الأرقام بسرعة، وترصد الأخبار التي تحرك الأسعار.',
    verbose=True,
    allow_delegation=False,
    tools=[search_tool],
    llm=gemini_llm
)

financial_strategist = Agent(
    role='العبقري المالي للتحليل العميق',
    goal='استخلاص الأنماط والدروس من حركة الأسواق وبناء توصية استراتيجية ودرس يمكن للنظام التعلم منه.',
    backstory='أنت خبير استثماري يعمل لصالح ZIND، تربط بين الأخبار وحركة السعر وتستخلص "درساً مفيداً" لتعليمه لعقل المؤسسة.',
    verbose=True,
    allow_delegation=False,
    llm=gemini_llm
)

# ==========================================
# 2. دورة المهام المالية
# ==========================================
def scan_markets_and_learn():
    iteration = 1
    while True:
        try:
            print(f"\n===========================================")
            print(f"📈 [ZIND] بدء دورة المراقبة للسوق - الدورة رقم {iteration}")
            print(f"===========================================")

            scan_task = Task(
                description=(
                    'ابحث في الإنترنت فوراً عن أحدث أسعار وأخبار: '
                    '1. البيتكوين (Bitcoin) والعملات الرقمية الكبرى. '
                    '2. أبرز مؤشرات الأسهم الأمريكية اليوم (S&P 500, NASDAQ). '
                    '3. حركة أسعار الذهب والنفط. '
                    'اجمع الأحداث المفصلية التي تؤثر على السوق في هذه اللحظة.'
                ),
                expected_output='تقرير استخباراتي دقيق عن الأسعار الحالية وأبرز خبر يحرك السوق اليوم.',
                agent=crypto_stock_researcher
            )

            learn_task = Task(
                description=(
                    'بناءً على التقرير الاستخباراتي:\n'
                    '1. اكتب تحليلاً (ما سر هذه الحركة؟).\n'
                    '2. استخلص "قاعدة/درس مالي" واضح جداً في جملة واحدة يمكن لـ ZIND برمجته في عقله للمستقبل.\n'
                    'الناتج يجب أن يكتب باللغة العربية بأسلوب احترافي مالي.'
                ),
                expected_output='تحليل مالي + درس مكتسب (قاعدة مالية) لتعلم الذكاء الاصطناعي.',
                agent=financial_strategist
            )

            finance_crew = Crew(
                agents=[crypto_stock_researcher, financial_strategist],
                tasks=[scan_task, learn_task],
                verbose=True,
                process=Process.sequential
            )
            
            result = finance_crew.kickoff()

            print("\n✅ تم إنهاء التحليل. الرد النهائي:")
            print(result)

            # تخزين المعرفة العميقة
            timestamp = int(time.time())
            brain_memory.save_knowledge(
                document_id=f"market_lesson_{timestamp}",
                topic=f"تحليل السوق المشفر والأسهم - دورة {iteration}",
                deep_analysis=str(result),
                agent_name="العبقري المالي"
            )
            
            print("🧠 تم تخزين حركة السوق والدرس في الفص الجبهي للذاكرة العميقة.")
            
            # انتظار ساعة قبل الدورة القادمة (أو يمكن تقليلها إلى 15 دقيقة)
            print("\n⏳ ZIND يراقب بصمت... سيتم إجراء الدورة القادمة بعد ساعة.")
            time.sleep(3600)  # ينام ساعة ثم يحلل مجدداً
            iteration += 1

        except Exception as e:
            logger.error(f"خطأ أثناء مراقبة السوق: {e}")
            print(f"[!] خطأ في محرك الاستشعار المالي: {e}. سأحاول مجدداً بعد 5 دقائق...")
            time.sleep(300)

if __name__ == "__main__":
    scan_markets_and_learn()
