import time
import asyncio
from universal_agents import UniversalAgentCore, Domain
from llm_engine import UniversalLLMEngine
from plugin_market_live import MarketPlugin
from plugin_plc_master import PLCMasterPlugin

class DailyCommandCenter:
    """
    ========================================================================
    مركز القيادة والسيطرة اليومي (Al-Rafidain Neural Command Center)
    ========================================================================
    يجمع هذا المركز بين وظائف: برمجة الأكواد، قراءة أسواق المال، 
    وإدارة مصانع الـ PLC بالكامل وبطريقة اوتوماتيكية. يعيش النظام في "حلقة" 
    دائمة يراقب فيها كل شيء ويتصرف متى لزم الأمر.
    """
    def __init__(self):
        print("🌐 جاري تشغيل مركز القيادة السيادي (Universal AGI Command Center)...")
        # 1. إيقاظ العصبونات (اللغة والفهم)
        self.llm = UniversalLLMEngine()
        self.brain = UniversalAgentCore(self.llm)
        
        # 2. تسليح العقل بأطراف صناعية ومالية
        self.market = MarketPlugin()
        self.factory_plc = PLCMasterPlugin(plc_ip="192.168.0.5")
    
    def daily_briefing(self):
        """تقييم الوضع الشامل عند بداية الصباح"""
        print("\n" + "="*50)
        print("☀️ تحديث الصباح من الذكاء الاصطناعي الخاص بك:")
        
        # فحص الاقتصاد
        oil_status = self.market.get_live_commodity_status("Oil")
        print(f"🛢️ {oil_status}")
        
        # فحص المعمل (PLC)
        temp = self.factory_plc.read_machine_temperature()
        print(f"🏭 درجة حرارة خطوط الإنتاج: {temp}°C (مستقرة)")
        
        # دمج المعلومات وإعطاء توصية للمدير
        prompt = f"النفط يشهد تذبذبات: {oil_status}. والمعمل يعمل بحرارة {temp} مئوية. هل هناك توصيات استباقية لمدير مصانع الصلب اليوم؟"
        
        # الذكاء الاصطناعي يحلل البيانات
        advice = self.brain.solve_complex_task(None, prompt)
        print(f"🧠 قرار العقل الاستراتيجي:\n{advice['final_solution']}")
        print("="*50 + "\n")

    def execute_programming_task(self, requirement: str):
        """مهمة البرمجة نيابة عن المهندس"""
        print(f"👨‍💻 العقل يتقمص دور كبير المهندسين لبرمجة التكليف التالي:")
        print(f"التكليف: {requirement}")
        
        code_result = self.brain.solve_complex_task(None, requirement)
        print(f"\n💻 الكود المولد والخاضع للمراجعة الذاتية:\n{code_result['final_solution']}\n")

if __name__ == "__main__":
    center = DailyCommandCenter()
    
    # محاكاة لعملين مجتمعين في وقت واحد:
    # 1. الاطمئنان على المعامل والسوق (المهام الإدارية)
    center.daily_briefing()
    
    # 2. برمجة وتأسيس نظام جديد للمصنع (المهام البرمجية)
    center.execute_programming_task("اكتب لي سكربت سكرايبنج (Scraping) يسحب أسعار الذهب لحظياً من بلومبيرغ باستخدام بايثون ليتم حقنه في أجهزة ديلفي.")
