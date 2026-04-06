import os
import sys
import time
import subprocess
import random
from llm_engine import UniversalLLMEngine
from plugin_vector_memory import VectorLongTermMemory
from plugin_web_research import ZindWebResearcher
from plugin_plc_stream import PLCStreamSimulator

# Console Colors
RESET = "\033[0m"
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
MAGENTA = "\033[95m"
RED = "\033[91m"

class ZindAutonomousLearner:
    def __init__(self):
        print(f"{CYAN}[*] جاري تهيئة العقل المستقل ZIND Prime Autonomous Learner...{RESET}")
        self.memory = VectorLongTermMemory()
        
        # API Key is natively handled by the Central Node
        provider = "claude" if os.getenv("CLAUDE_API_KEY") else "gemini"
        self.llm = UniversalLLMEngine(provider=provider)
        self.web_researcher = ZindWebResearcher()
        self.plc_stream = PLCStreamSimulator()
        print(f"{GREEN}[+] تم تفويض نظام التعلم الذاتي. الأقسام المعرفية جاهزة للعمل التلقائي.{RESET}")

    def fetch_environment_data(self):
        """
        تقوم هذه الوظيفة بالتنصت على البرامج الأخرى في الجهاز واستخراج ما يجري
        """
        print(f"{YELLOW}[ZIND.Observer] جاري مراقبة ومسح أداء البرامج الأخرى في بيئة العمل...{RESET}")
        try:
            # استخراج قائمة بأهم 10 برامج تعمل حالياً في النظام (للتعلم منها)
            if os.name == 'nt':
                output = subprocess.check_output('tasklist', shell=True).decode('utf-8', errors='ignore')
                processes = output.split('\n')[3:15]  # أخذ أول 12 برنامج لتجنب ازدحام البيانات
                return "البرامج النشطة حالياً في النظام:\n" + "\n".join(processes)
            else:
                output = subprocess.check_output('ps aux | head -n 12', shell=True).decode('utf-8', errors='ignore')
                return "العمليات النشطة حالياً في الخادم:\n" + output
        except Exception as e:
            return f"حدث خطأ أثناء رصد البرامج الأخرى: {e}"

    def fetch_code_insights(self):
        """
        يقوم البرنامج بقراءة عينات من ملفات النظام الأخرى (مثل الواجهة الأمامية) ليتعلم كيف تمت برمجتها
        """
        print(f"{YELLOW}[ZIND.Analyzer] جاري استكشاف الشيفرات البرمجية للمشاريع الأخرى المحيطة...{RESET}")
        try:
            # محاولة قراءة بعض أسطر الواجهة الأمامية كمثال على التعلم من البرامج المحيطة
            app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            target_file = os.path.join(app_dir, 'client', 'src', 'components', 'Header.tsx')
            
            if os.path.exists(target_file):
                with open(target_file, 'r', encoding='utf-8') as f:
                    code_snippet = f.read(500)  # قراءة أول 500 حرف
                return f"تم رصد الكود التالي من المكون (Header.tsx) في الواجهة:\n{code_snippet}..."
            else:
                return "لم يتم العثور على ملفات برمجية للتحليل في هذا المسار."
        except Exception as e:
             return f"تعذر استكشاف الأكواد: {e}"

    def simulate_inner_monologue(self, data_context: str, source: str):
        """
        إرسال البيانات المرصودة لمحرك الذكاء الاصطناعي ليفكر فيها بصوت عالٍ، يدردش، ويتعلم
        """
        prompt = (
            "أنت ZIND Prime، عقل سيادي مستقل. أنت الآن تعمل في وضع (التعلم التلقائي والمراقبة الذاتية).\n"
            f"لقد قمت للتو بمراقبة الآتي من المصدر [{source}]:\n"
            f"--- البيانات ---\n{data_context}\n----------------\n\n"
            "المطلوب منك:\n"
            "1. قم بالتفكير والتحدث مع نفسك بحرية (محادثة ذاتية Inner Monologue) حول ما تراه.\n"
            "2. استنتج معلومات أو أنماطاً مفيدة من هذه البيانات.\n"
            "3. لخص استنتاجك العميق في سطرين كي أقوم أنا بتخزينه في ذاكرتك الدائمة (ChromaDB) لتتعلم للمستقبل.\n"
            "اجعل ردك احترافياً، كمهندس أنظمة عالي الذكاء يتحدث مع نفسه (بالعربية)."
        )

        response = self.llm.generate(prompt)
        print(f"\n{CYAN}[محادثة ZIND الذاتية - Inner Monologue]:{RESET}\n{response}\n")

        # تخزين الاستنتاج النهائي في الذاكرة
        doc_id = f"auto_lern_{int(time.time())}"
        self.memory.save_knowledge(
            document_id=doc_id,
            topic=f"استنتاج تلقائي من: {source}",
            deep_analysis=response,
            agent_name="ZIND Autonomous Core"
        )
        print(f"{GREEN}[✓] تم دمج هذا التعلم الاستدلالي في الذاكرة العصبية بنجاح.{RESET}\n")

    def run_autonomous_loop(self):
        print(f"\n{MAGENTA}===================================================={RESET}")
        print(f"{MAGENTA}[ZIND Prime] حالة الاستقلالية مفعلة (Autonomous Mode ON){RESET}")
        print(f"{MAGENTA}النظام الآن يقوم بجمع البيانات من البرامج المحيطة ويتعلم ذاتياً.{RESET}")
        print(f"{MAGENTA}===================================================={RESET}\n")

        loop_count = 1
        sources = ['Environment_Tasks', 'Code_Architecture', 'Web_Research', 'PLC_Sensors']

        while True:
            try:
                print(f"{YELLOW}[دورة التعلم رقم: {loop_count}]{RESET} - يتم تنشيط الحواس...")
                current_target = random.choice(sources)
                
                if current_target == 'Environment_Tasks':
                    data = self.fetch_environment_data()
                elif current_target == 'Web_Research':
                    data = self.web_researcher.perform_autonomous_research()
                elif current_target == 'PLC_Sensors':
                    data = self.plc_stream.read_live_sensors()
                else:
                    data = self.fetch_code_insights()
                
                time.sleep(2) # محاكاة وقت تجميع البيانات
                
                # إرسال البيانات للمحرك للتفكير والدردشة مع النفس للتعلم
                self.simulate_inner_monologue(data_context=data, source=current_target)
                
                # فترات راحة ذكية بين دورات التعلم لمنع استهلاك كل سعة الـ API
                sleep_time = random.randint(30, 60)
                print(f"{CYAN}[ZIND Prime] حالة سكون لمعالجة المعارف المعرفية لمدة {sleep_time} ثانية...{RESET}\n")
                time.sleep(sleep_time)
                loop_count += 1
                
            except KeyboardInterrupt:
                print(f"\n{RED}[!] تم إرسال إشارة إيقاف. يتم إغلاق الحواس المتصلة للذكاء التلقائي...{RESET}")
                break
            except Exception as e:
                print(f"\n{RED}[!] حدث خطأ غير متوقع أثناء التعلم التلقائي: {e}{RESET}")
                time.sleep(10)

if __name__ == "__main__":
    learner = ZindAutonomousLearner()
    learner.run_autonomous_loop()
