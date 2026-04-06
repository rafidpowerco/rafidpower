import os
import requests
import json
from agents_framework import MasterRouter
from memory_engine import MemoryEngine

class UniversalAGIGateway:
    """
    ====================================================================
                 AL-RAFIDAIN UNIVERSAL A.G.I CORE
    هذا هو قلب الذكاء الاصطناعي العام (ليس مخصصاً للموازين بعد الآن).
    هنا يتم ربط "الوكلاء" و "ذاكرة ChromaDB" بمحركات الفهم الحقيقية 
    إما عبر نماذج محليّة مجانية بالكامل (Ollama) أو سحابية (Gemini/OpenAI).
    ====================================================================
    """
    def __init__(self, mode="local_ollama", model_name="llama3"):
        self.mode = mode
        self.model_name = model_name
        self.ollama_endpoint = "http://localhost:11434/api/generate"
        print(f"🌐 Universal Brain Initialized in [{self.mode.upper()}] mode natively.")

    def _call_local_ollama(self, system_prompt: str, user_prompt: str) -> str:
        """يتصل بنموذج ذكاء اصطناعي مثبت محلياً على جهازك ليفكر بأمان تام وثقة 100% دون إنترنت"""
        payload = {
            "model": self.model_name,
            "prompt": f"System: {system_prompt}\nUser: {user_prompt}",
            "stream": False
        }
        try:
            response = requests.post(self.ollama_endpoint, json=payload, timeout=120)
            if response.status_code == 200:
                return response.json().get("response", "No deep thought generated.")
            else:
                return f"Neural Error: {response.status_code}"
        except Exception as e:
            return f"🔌 لا يوجد نموذج محلي يعمل (System needs Ollama initialized). Error: {e}"

    def universal_think(self, memory: MemoryEngine, topic_or_task: str) -> str:
        """
        1. يستدعي الذاكرة (RAG) لأي موضوع كان (قانون، طب، لغة، برمجة).
        2. يفكر فيه عبر محرك الـ LLM.
        3. يرد بحصيلة علمية متقدمة.
        """
        # استدعاء المعرفة من الـ ChromaDB بناءً على الموضوع
        retrieved_context = memory.retrieve(topic_or_task, n_results=5)
        context_str = " ".join(retrieved_context) if retrieved_context else "لا توجد خبرة سابقة، استخدم ذكاءك العام."

        # بناء طريقة التفكير
        system_directive = "أنت نموذج ذكاء اصطناعي استشاري، مفكر، ومبتكر. لا يقتصر عملك على الموازين. " \
                           "مهمتك استخدام المعرفة المدمجة للإجابة عن أي معضلة علمية أو برمجية بأسلوب العباقرة."
        
        print("\n🧠 الذكاء الاصطناعي العام يفكر الآن بتمعن...")
        answer = self._call_local_ollama(system_directive, f"Context:\n{context_str}\n\nTask:\n{topic_or_task}")
        
        return answer

if __name__ == "__main__":
    # تجربة العقل العام
    memory_vault = MemoryEngine()
    agi_brain = UniversalAGIGateway(mode="local_ollama", model_name="llama3")
    
    # لم يعد مخصصاً لـ Zemic فقط! الآن يمكنه التفكير بأي شيء
    task = "اكتب لي خطة عمل لإنشاء شركة استشارات برمجية تعتمد على الذكاء الاصطناعي، وكيف أوزع المهام على الوكلاء الآليين."
    print(f"💬 السؤال أو المهمة: {task}")
    
    result = agi_brain.universal_think(memory_vault, task)
    print("\n💡 الرد المستنبط من العقل العام:")
    print(result)
