import json
import random
import os

class RafidSyntheticDataGenerator:
    """
    مولد البيانات الاصطناعية لتدريب النماذج الصغيرة لاحقاً.
    يقوم بإنشاء آلاف السيناريوهات لأعطال موازين Zemic وحلولها برمجياً في Delphi.
    هذه البيانات هي "الذهب" الذي سيتم حفظه في ملف JSON لتكوين قاعدة المعرفة.
    """
    def __init__(self):
        self.error_types = ["انحراف الوزن (Drift)", "تأرجح القراءة (Oscillation)", "عدم العودة للصفر (Zero Tracking Failure)", "فشل الاتصال (ModBus Timeout)"]
        self.sensors = ["Zemic HM9B", "Zemic L6E", "Zemic H8C", "LoadCell 50T"]
        self.delphi_solutions = [
            "تفعيل فلتر Kalmann في دالة ReadWeight() داخل ديلفي.",
            "إرسال أمر التصفير (Zero Command) عبر بروتوكول Modbus RTU مع زيادة الـ Timeout إلى 500ms.",
            "تطبيق معادلة التعويض الحراري (Thermal Compensation) باستخدام متغيرات البيئة قبل حساب الوزن الصافي.",
            "إعادة ضبط مؤشر الـ BaudRate في مكون ComPort إلى 9600 وحل مشكلة ضياع البتات."
        ]

    def generate_scenarios(self, count=100) -> list:
        data = []
        for i in range(count):
            scenario = {
                "id": f"RAFID-ERR-{i+1000}",
                "scale_type": "ميزان جسري (Truck Scale)",
                "sensor_used": random.choice(self.sensors),
                "symptom": random.choice(self.error_types),
                "environmental_factors": {"temperature_C": random.randint(-5, 55), "humidity_percent": random.randint(10, 90)},
                "delphi_code_fix_summary": random.choice(self.delphi_solutions),
                "complexity_level": "عالي (محمي بالملكية الفكرية للموازين)"
            }
            data.append(scenario)
        return data

    def save_to_json(self, data, filename="rafid_scale_synthetic_data.json"):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ تم توليد وحفظ {len(data)} سيناريو بنجاح في ملف: {filename}")

if __name__ == "__main__":
    generator = RafidSyntheticDataGenerator()
    print("جاري توليد سيناريوهات الأعطال الاصطناعية لتدريب النماذج المحلية (Llama 3/Flash)...")
    knowledge_db = generator.generate_scenarios(count=50) # عينة 50 سيناريو
    generator.save_to_json(knowledge_db, "c:/Users/Administrator/Desktop/rafid-scale-website/AI/rafid_scale_knowledge_base.json")
