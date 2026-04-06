import google.generativeai as genai

# قمنا بوضع مفتاحك هنا لغرض التجربة (لكن في المشاريع الحقيقية سنقوم بإخفائه لحمايته)
API_KEY = "AIzaSyAy6xY7IpVcMBratqFby_DfU_zf1IFk-rc"

# إعداد الاتصال
genai.configure(api_key=API_KEY)

# اختيار العقل المفكر (النموذج)
model = genai.GenerativeModel('gemini-1.5-pro')

# توجيه أول سؤال لاختبار الربط
print("جاري الاتصال بعقل جيمناي...")
response = model.generate_content("مرحباً، أنا برنامج الموازين الذي يعمل على سيرفر أنتي كرافتي. هل أنت متصل بي الآن وتسمعني؟ أجبني بكلمتين فقط.")

# طباعة الرد
print("الرد القادم من جيمناي:")
print(response.text)
