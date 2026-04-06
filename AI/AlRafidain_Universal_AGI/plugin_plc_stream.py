import random
import time

class PLCStreamSimulator:
    """
    يحاكي بيانات حية قادمة من أجهزة PLC وحساسات الموازين (Load Cells)
    لمنح ZIND قدرة التعلم من بيانات المعدات الصناعية الحقيقية (IoT).
    """
    def __init__(self):
        self.scales = [
            {"id": "SCALE_A1_ARBIL", "capacity": 100000, "base_temp": 35.0},
            {"id": "SCALE_B2_BASRA", "capacity": 120000, "base_temp": 45.0},
            {"id": "SCALE_C3_BAGHDAD", "capacity": 80000, "base_temp": 40.0}
        ]

    def read_live_sensors(self):
        """
        يقرأ حالة الحساسات ويزيف بعض الانحرافات والأعطال (Anomalies) بنسبة نادرة ليتعلم الذكاء منها.
        """
        print(f"\033[93m[ZIND.IoT_Edge] جاري سحب قراءات الـ PLC من الموازين الجسرية...\033[0m")
        
        target_scale = random.choice(self.scales)
        
        # محاكاة القراءات
        current_weight = random.uniform(0, target_scale["capacity"])
        temperature = target_scale["base_temp"] + random.uniform(-5.0, 15.0)
        vibration = random.uniform(0.1, 2.5) # mm/s
        voltage_mv = random.uniform(2.9, 3.1) # Load cell excitation voltage
        
        # خلق شذوذ (Anomaly) ليقوم ZIND بتحليله (الصيانة التنبؤية Predictive Maintenance)
        anomaly_chance = random.random()
        status = "NORMAL"
        
        if anomaly_chance > 0.85:
            # Overload or heavy vibration
            vibration = random.uniform(3.0, 8.5)
            status = "WARNING: HIGH VIBRATION"
        elif anomaly_chance > 0.70:
            temperature += 20.0
            status = "WARNING: OVERHEATING DETECTED"
        elif anomaly_chance > 0.60:
            voltage_mv = random.uniform(2.0, 2.5)
            status = "ERROR: VOLTAGE DROP - POSSIBLE CABLE DAMAGE"

        data_report = f"""
--- تقرير استشعار صناعي: {target_scale['id']} ---
الوقت: {time.strftime('%Y-%m-%d %H:%M:%S')}
الوزن الحالي: {current_weight:.2f} KG
حرارة الحساسات: {temperature:.1f} C
مستوى الاهتزاز: {vibration:.2f} mm/s
فولتية الخلايا (Load Cell): {voltage_mv:.3f} mV/V
الحالة التقنية: {status}
---------------------------------------------
"""
        return data_report
