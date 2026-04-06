import time
import json
from agi_toolbox import AGIToolbox
from llm_engine import UniversalLLMEngine

class AutoDeveloperAgent:
    """
    ========================================================================
    المبرمج الآلي المستقل (The Sovereign Auto-Coder)
    ========================================================================
    هذا هو قمة الهرم في أنظمة الذكاء الاصطناعي (ReAct Pattern).
    لا يقوم فقط بـ "كتابة رد نصي"، بل يعمل في حلقة مستمرة:
    1. يفكر في المطلوب.
    2. يقرر استخدام أداة (يكتب كود في ملف).
    3. يقرر أمر تشغيله (عبر سطر الأوامر).
    4. يرى الخطأ (إن وجد) ويعود للخطوة 1 لتصليحه حتى ينجح!
    """
    def __init__(self):
        self.llm = UniversalLLMEngine()
        self.toolbox = AGIToolbox()
        
    def solve_programming_task_autonomously(self, goal: str):
        print(f"\n🚀 [بداية المهمة المستقلة]: {goal}")
        print("🧠 الذكاء الاصطناعي يتولى القيادة بالكامل. يرجى الانتظار...")
        
        # الحلقة التكرارية: التفكير -> الفعل -> المراقبة (Thought -> Action -> Observation)
        max_steps = 5
        current_step = 1
        observation = "No actions taken yet."
        
        while current_step <= max_steps:
            print(f"\n--- [الدورة رقم {current_step}] ---")
            
            # تلقين الـ LLM بأنه وكيل يملك أدوات ويجب أن يرد بصيغة JSON لكي نطبقها برمجياً
            system_prompt = (
                "أنت مبرمج استثنائي تمتلك أدوات حقيقية للوصول لنظام المستخدم.\n"
                "لديك 3 أدوات:\n"
                "1. WRITE_FILE(filepath, content)\n"
                "2. READ_FILE(filepath)\n"
                "3. RUN_COMMAND(command)\n"
                "4. FINISH(final_message)\n\n"
                "يجب أن يكون ردك بصيغة JSON التالية حصراً:\n"
                "{\n"
                '  "thought": "تفكيرك الداخلي هنا",\n'
                '  "action": "اسم الأداة المحددة",\n'
                '  "action_input": "المدخل للأداة (مسار الملف، الكود، أو الأمر)"\n'
                "}"
            )
            
            user_prompt = f"الهدف: {goal}\nنتيجة الفعل السابق: {observation}\nما هي خطوتك التالية؟"
            
            try:
                # العقل يفكر ويقرر الإجراء
                llm_response = self.llm.generate(f"System: {system_prompt}\nUser: {user_prompt}")
                
                # نحن هنا نتعامل مع الذكاء الاصطناعي كبرنامج (Parising JSON)
                # (سنفترض استجابة الـ LLM مثالية للتوضيح المعماري)
                start_idx = llm_response.find('{')
                end_idx = llm_response.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_raw = llm_response[start_idx:end_idx]
                    decision = json.loads(json_raw)
                else:
                    # بناء إجرائي لمحاكاة حالة فشل التنسيق
                    decision = {"thought": "تحليل أولي", "action": "FINISH", "action_input": llm_response}

                action = decision.get("action", "FINISH")
                action_input = decision.get("action_input", "")
                
                print(f"🤔 التفكير: {decision.get('thought', '')}")
                print(f"⚙️ الأداة المطلوبة: {action}")
                
                # تنفيذ الأداة الحقيقية على جهاز الويندوز الخاص بك!
                if action == "WRITE_FILE":
                    observation = self.toolbox.write_code_to_file("C:/Temp_AGI_Code.py", action_input)
                elif action == "READ_FILE":
                    observation = self.toolbox.read_local_file(action_input)
                elif action == "RUN_COMMAND":
                    observation = self.toolbox.run_terminal_command(action_input)
                elif action == "FINISH":
                    print(f"\n✅ إعلان النهاية وإنجاز المهمة:\n{action_input}")
                    break
                else:
                    observation = "Tool not recognized. Try again."
                    
                print(f"👁️ النتيجة الملاحظة من النظام: {observation[:100]}...")
                
            except Exception as e:
                print(f"⚠️ ارتباك في الدماغ الاصطناعي أثناء التحليل: {e}")
                break
                
            current_step += 1
            time.sleep(2) # راحة قصيرة بين العمليات
            
        if current_step > max_steps:
            print("🛑 استنفاد محاولات الذكاء الاصطناعي. ربما المهمة معقدة جداً أو واجهت حلقة مفرغة.")

if __name__ == "__main__":
    developer_agent = AutoDeveloperAgent()
    # مثال ضخم: اطلب منه كتابة كود معقد وتشغيله لاختباره
    developer_agent.solve_programming_task_autonomously("اكتب كود بايثون بسيط يقوم بطباعة أرقام عشوائية، واحفظه في جهاز، ثم قم بتشغيله وأخبرني بالنتيجة النهائية.")
