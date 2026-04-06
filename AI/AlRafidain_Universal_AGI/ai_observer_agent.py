import os
import sys
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
import time
from datetime import datetime
from universal_agents import UniversalAgentCore
from llm_engine import UniversalLLMEngine

class MetaObserverAgent:
    """
    ========================================================================
    [ عين الصقر الكلية - The Omnipresent Observer ]
    لا يقتصر الآن على مجلد واحد.. بل يراقب مشاريع الديلفي، موقع الويب، 
    وأنظمة البايثون في نفس الوقت في الخلفية، ليتعلم أسلوبي بالكامل.
    ========================================================================
    """
    def __init__(self, watch_directories: list):
        self.watch_directories = watch_directories
        self.llm = UniversalLLMEngine()
        self.brain = UniversalAgentCore(self.llm)
        self.file_timestamps = {}
        # استخدام المسار المطلق لتجنب التكرار الذاتي
        self.knowledge_file = os.path.abspath("agi_learned_insights.txt")
        self.knowledge_basename = os.path.basename(self.knowledge_file)
        
        print("👁️‍🗨️ [نظام المراقبة الإمبراطوري مفعل]: أنا الآن أراقب كل سطر كود عبر كل المشاريع.")
        
        # التقاط حالة الملفات الأولية عبر كافة المجلدات للحصول على خريطة المصنع
        for directory in self.watch_directories:
            if not os.path.exists(directory): continue
            for root, _, files in os.walk(directory):
                # تجاوز المجلدات غير الهامة لتخفيف العبء (مثل node_modules)
                if 'node_modules' in root or '__pycache__' in root:
                    continue
                for f in files:
                    if f.endswith(('.py', '.pas', '.tsx', '.txt', '.sql', '.json')):
                        filepath = os.path.join(root, f)
                        try:
                            self.file_timestamps[filepath] = os.path.getmtime(filepath)
                        except Exception:
                            pass

    def analyze_engineer_work(self, filepath: str, code_content: str):
        prompt = (
            f"تم للتو تعديل/إنشاء الملف المعماري التالي: {filepath}\n\n"
            "محتوى الكود المعدل:\n"
            f"{code_content[:1500]}... (مجتزأ لتوفير الذاكرة)\n\n"
            "المهندس 'Antigravity' وشريكه البشرى قاما بهذا التعديل.\n"
            "استخرج 'تحليل هندسي وحكمة واحدة قابلة للاسترجاع' من هذه الخطوة."
        )
        try:
            insight = self.brain.solve_complex_task(None, prompt)["final_solution"]
        except Exception as e:
            insight = f"تعذر التحليل بدقة بسبب عطل في العصبونات: {e}"

        # بدلاً من الطباعة في ملف غبي، نقوم بزرع الحكمة في الفص الجبهي ليتذكرها النظام للأبد
        from plugin_deep_memory import DeepCognitiveMemory
        memory = DeepCognitiveMemory()
        memory.absorb_experience(os.path.basename(filepath), insight)
        print(f"🧠 [تم زرع حكمة معمارية في الذاكرة العميقة حول {os.path.basename(filepath)}]")

    def run_vigilant_loop(self):
        try:
            while True:
                for directory in self.watch_directories:
                    if not os.path.exists(directory): continue
                    for root, _, files in os.walk(directory):
                        if 'node_modules' in root or '__pycache__' in root:
                            continue
                        for f in files:
                            # حماية مطلقة ضد حلقة المراقبة الذاتية للملف نفسه
                            if f == self.knowledge_basename:
                                continue
                            if f.endswith(('.py', '.pas', '.tsx', '.txt', '.sql', '.json')):
                                filepath = os.path.join(root, f)
                                try:
                                    current_mtime = os.path.getmtime(filepath)
                                    last_mtime = self.file_timestamps.get(filepath, 0)
                                    
                                    if current_mtime > last_mtime:
                                        self.file_timestamps[filepath] = current_mtime
                                        # حماية ثانية لمنع قراءة نفس الملف إذا كان هو المذكرات
                                        if os.path.abspath(filepath) == self.knowledge_file:
                                            continue
                                            
                                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as code_file:
                                            content = code_file.read()
                                            self.analyze_engineer_work(filepath, content)
                                except Exception:
                                    pass
                time.sleep(5) # مسح عالي السرعة كل 5 ثواني
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    # مسارات الإمبراطورية الكاملة ليراقبها عين الصقر
    watch_zones = [
        "C:\\Users\\Administrator\\Desktop\\rafid-scale-website\\AI\\AlRafidain_Universal_AGI",
        "C:\\Users\\Administrator\\Desktop\\rafid-scale-website\\AI\\AlRafidain_Sovereign_Core",
        "C:\\Users\\Administrator\\Desktop\\New folder (2)\\RafidSmartBridge_MASTER_COMPLETE\\RafidSmartBridge_MASTER\\01_Delphi_Source",
        "C:\\Users\\Administrator\\Desktop\\New folder (2)\\RafidSmartBridge_MASTER_COMPLETE\\RafidSmartBridge_MASTER\\02_Web_Dashboard"
    ]
    
    observer = MetaObserverAgent(watch_directories=watch_zones)
    observer.run_vigilant_loop()
