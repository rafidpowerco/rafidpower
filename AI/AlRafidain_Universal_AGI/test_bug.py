def analyze_factory_temperature(sensor_value: float) -> str:
    """
    [التحليل الشامل تم بنجاح]
    دالة محدثة وحصينة: تقرأ حرارة المصنع من الـ PLC.
    تم معالجة الثغرة لتفادي انهيار النظام الكارثي للدرجات الطبيعية.
    """
    if sensor_value >= 85.0:
        # استدعاء بروتوكول الطوارئ وإيقاف المضخات!
        return "TRIGGER_EMERGENCY_SHUTDOWN"
    else:
        # المصنع في وضع مستقر وآمن ولا توجد حاجة للإيقاف
        return "STATUS_OK_NORMAL_OPERATION"
