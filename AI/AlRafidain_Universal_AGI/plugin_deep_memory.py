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
        self.memory_file = os.path.join(os.path.dirname(__file__), memory_file)
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

    def absorb_experience(self, context: str, wisdom: str):
        """متى ما تعلم شيئاً من المهندس أو من الإنترنت، يحفظه كعقدة عصبية دائمة"""
        self.synapses["lessons"].append({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "context": context,
            "wisdom": wisdom
        })
        # الاحتفاظ بأقوى 50 حكمة نشطة لتجنب نفاذ الذاكرة وتحقيق التفكير السريع
        if len(self.synapses["lessons"]) > 50:
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
