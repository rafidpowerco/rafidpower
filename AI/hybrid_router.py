import json

class RafidHybridRouter:
    """
    نظام التوجيه الذكي (Hybrid Router) لمشروع موازين الرافدين.
    وظيفته تقليل التكلفة بنسبة 80% عن طريق تحليل السؤال وتوجيهه:
    - أسئلة معقدة (فيزياء، معايرة، ديلفي) -> تذهب لـ Gemini Ultra أو النماذج الكبيرة.
    - أسئلة بسيطة (مهام روتينية، تقارير عادية) -> تذهب لـ Gemini Flash أو Llama 3 محلي.
    """
    def __init__(self):
        # بنك المصطلحات التي تدل على الحاجة لذكاء خارق
        self.advanced_keywords = [
            "خوارزمية", "zemic", "load cell", "delphi", "معايرة دقيقة",
            "modbus", "plc", "فيزياء", "تعويض حراري", "انحراف", "استقرار", "وزن"
        ]
        
    def determine_complexity(self, query: str) -> int:
        score = 1
        query_lower = query.lower()
        if len(query) > 100:
            score += 2
        matched_keywords = [kw for kw in self.advanced_keywords if kw in query_lower]
        score += len(matched_keywords) * 3
        return min(score, 10)

    def route_query(self, query: str) -> dict:
        complexity = self.determine_complexity(query)
        if complexity >= 7:
            return {
                "model": "Gemini_Ultra",
                "reason": f"سؤال معقد هندسياً (الدرجة {complexity}/10). يحتاج لدقة عالية.",
                "cost_expected": "High",
                "action_prompt": "تفعيل البحث العميق في قاعدة بيانات Zemic و Delphi للموازين."
            }
        else:
            return {
                "model": "Gemini_Flash_or_Local_Llama3",
                "reason": f"سؤال روتيني (الدرجة {complexity}/10). يكفي نموذج سريع.",
                "cost_expected": "Very Low",
                "action_prompt": "الرد بمعلومات عامة أو واجهة المستخدم."
            }

if __name__ == "__main__":
    router = RafidHybridRouter()
    q1 = "كيف اطبع فاتورة الميزان للعميل؟"
    print(f"السؤال 1: {q1}\nالتوجيه: {json.dumps(router.route_query(q1), ensure_ascii=False, indent=2)}\n")
    
    q2 = "يوجد انحراف 50 كيلو في قراءة حساس Zemic HM9B بعد تحميل 50 طن، كيف أعدل كود Delphi لتعويض هذا التشوه؟"
    print(f"السؤال 2: {q2}\nالتوجيه: {json.dumps(router.route_query(q2), ensure_ascii=False, indent=2)}\n")
