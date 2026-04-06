import json
import os
from datetime import datetime

class DeepCognitiveMemory:
    """
    ========================================================================
    [ الفص الجبهي المعرفي - Deep Cognitive Memory Lobe ]
    تحفة معمارية: هذا الموديول يحول الذكاء الاصطناعي من 'آلة حاسبة ترد على الأسئلة'
    إلى 'كيان حي يتذكر'. يقوم بتخزين الاستنتاجات، الأخطاء المصلحة، والحكم المعمارية
    في شبكة عصبونات محلية ليتذكرها في الأيام القادمة ولا يكرر أخطاءه.
    ========================================================================
    """
    def __init__(self, memory_file="AlRafidain_Neural_Connections.json"):
        # التوجيه التجاري: تخزين الذاكرة في مجلد التطبيقات الخاص بالويندوز (APPDATA) لتجاوز حماية الـ Admin في Program Files
        app_data_path = os.path.join(os.getenv('APPDATA', os.path.dirname(__file__)), "RafidainAGI")
        if not os.path.exists(app_data_path):
            os.makedirs(app_data_path, exist_ok=True)
            
        self.memory_file = os.path.join(app_data_path, memory_file)
        self.synapses = self._load_brain()

    def _load_brain(self) -> dict:
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return {"lessons": [], "core_beliefs": ["الأمان أولاً", "السرعة والجودة المعمارية"]}

    def _save_brain(self):
        with open(self.memory_file, 'w', encoding='utf-8') as f:
            json.dump(self.synapses, f, ensure_ascii=False, indent=4)

    PRIORITY_KEYWORDS = ["plc", "api", "ip", "خطأ", "error", "قانون", "عقد", "سعر", "عميل", "port", "modbus", "مهم", "ضروري"]

    def absorb_experience(self, context: str, wisdom: str, priority: int = 1):
        """
        يحفظ الدروس بنظام أولويات ذكي:
        - الدروس التقنية والأعمال (أولوية عالية) تُحفظ دائماً.
        - الدروس العامة تُزال أولاً عند الحاجة لتوفير مساحة.
        - الحد الأقصى 200 درس نشط (بدلاً من 50) لذاكرة أعمق.
        """
        # رفع أولوية الدروس التقنية تلقائياً
        combined_text = (context + " " + wisdom).lower()
        if any(kw in combined_text for kw in self.PRIORITY_KEYWORDS):
            priority = 3  # أولوية عالية جداً

        self.synapses["lessons"].append({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "context": context,
            "wisdom": wisdom,
            "priority": priority,
            "access_count": 0
        })

        # إذا تجاوزنا 200 درس، نحذف الدروس ذات الأولوية الأقل أولاً
        if len(self.synapses["lessons"]) > 200:
            # ترتيب حسب الأولوية ثم الزمن، وحذف الأضعف
            self.synapses["lessons"].sort(key=lambda x: (x.get("priority", 1), x.get("access_count", 0)))
            self.synapses["lessons"].pop(0)

        self._save_brain()

    def recall_relevant_wisdom(self, current_task: str) -> str:
        """استرجاع الذكريات العميقة للمساعدة في حل المعضلات الجديدة"""
        if not self.synapses["lessons"]:
            return "لا توجد ذكريات أو دروس سابقة في هذا الدماغ بعد."
        
        # في هذه المرحلة نسترجع أحدث 5 دروس وحكم اكتسبها النظام لاستخدامها كخبرة متراكمة
        active_memory = self.synapses["lessons"][-5:]
        memory_str = "\n".join([f"تذكرت في ({m['timestamp']}) حول [{m['context']}]: {m['wisdom']}" for m in active_memory])
        return memory_str
