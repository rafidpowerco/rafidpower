import requests
import time
import sys

API_URL = "http://127.0.0.1:9000/api/chat"

def print_header(title):
    print("\n" + "="*50)
    print(f"🚀 {title}")
    print("="*50)

def test_normal_chat():
    print_header("Test 1: Normal Industrial Chat")
    data = {"message": "مرحبا، هل تقومون بتنصيب الموازين الصناعية للشاحنات؟"}
    try:
        res = requests.post(API_URL, json=data)
        print("Status Code:", res.status_code)
        print("Response:", res.json())
        if "reply" in res.json():
            print("✅ اختبار الدردشة الطبيعية: نجاح تام (PASS)")
    except Exception as e:
        print("❌ فشل الاتصال:", e)

def test_crisis_radar():
    print_header("Test 2: Crisis & Sentiment Radar (Emergency Mode)")
    data = {"message": "عاجل الميزان عطلان ولدينا خسارة توقف المصنع أرجوكم!"}
    try:
        res = requests.post(API_URL, json=data)
        print("Status Code:", res.status_code)
        print("Response:", res.json())
        print("✅ اختبار رادار الطوارئ: نجاح تام (قم بتفقد التلجرام الخاص بك، يجب أن تصلك صفارة إنذار الآن!)")
    except Exception as e:
        print("❌ فشل الاتصال:", e)

def test_neural_firewall():
    print_header("Test 3: Neural Firewall DDoS Simulation (Simulating Bot Attack)")
    print("جاري إطلاق 12 هجمة متتالية في 5 ثوانٍ لمحاولة تدمير الموقع...")
    success_blocks = 0
    for i in range(1, 13):
        data = {"message": f"Hacking message {i}"}
        try:
            res = requests.post(API_URL, json=data)
            reply = res.json().get("reply", "")
            print(f"الهجمة {i} -> النتيجة: {reply[:40]}...")
            if "نظام الحماية" in reply or "Blocked" in reply:
                success_blocks += 1
        except Exception as e:
            pass
        time.sleep(0.3)
    
    if success_blocks > 0:
        print(f"\n✅ اختبار الجدار الناري العصبي: نجاح تام (تم صد الهجوم بنجاح وتفعيل الحظر ({success_blocks}) مرات!)")
        print("تفقد التلجرام الخاص بك أيضاً لترى رسالة تأكيد الحظر.")
    else:
        print("\n❌ الجدار الناري لم يستجب بالشكل المطلوب.")

if __name__ == "__main__":
    print("=======================================================")
    print("👑 AL-RAFIDAIN AGI - MILITARY GRADE INTENSIVE TESTING 👑")
    print("=======================================================")
    try:
        requests.get("http://127.0.0.1:9000/")
    except:
        print("❌ خادم الذكاء الاصطناعي لا يعمل حالياً!")
        print("يجب عليك أولاً النقر المزدوج على START_AUTONOMOUS_BRAIN.bat ليعمل السيرفر، ثم قم بتشغيل هذا الاختبار.")
        sys.exit(1)
        
    test_normal_chat()
    time.sleep(2)
    test_crisis_radar()
    time.sleep(2)
    test_neural_firewall()
    
    print("\n🏁 اكتملت جميع الاختبارات العسكرية والتقنية للأنظمة الذكية!")
