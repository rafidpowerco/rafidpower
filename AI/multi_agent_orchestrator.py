import os
import time
import json
import requests
from google import genai
from dotenv import load_dotenv

load_dotenv()

print("=========================================================")
print("     Rafid Multi-Agent Orchestrator (2026 Tech)          ")
print("  (Sentiment | Quant | Automation) - Single EXE Engine   ")
print("=========================================================")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("❌ خطأ: مفتاح API لبطاقة GEMINI مفقود.")
    exit(1)

client = genai.Client(api_key=api_key)
MODEL_ID = "gemini-1.5-pro"

# ---------------------------------------------------------
# 1. الوكيل الأول: محلل المشاعر (Sentiment Agent)
# ---------------------------------------------------------
def agent_sentiment_analysis():
    print("🕵️‍♂️ [Sentiment Agent]: جاري سحب وتحليل مشاعر الصناعة والأخبار العالمية...")
    # Mocking Web Scraping / RSS due to environment constraints
    scraped_news = "انخفاض حاد في إمدادات شرائح أشباه الموصلات المخصصة للصناعة بسبب أزمة لوجستية في مضيق تايوان."
    
    prompt = f"حلل تأثير هذا الخبر الصناعي '{scraped_news}'. هل هو إيجابي أم سلبي لتكاليف صناعة الموازين؟ أجب بكلمة واحدة: POSITIVE أو NEGATIVE أو NEUTRAL."
    
    response = client.models.generate_content(model=MODEL_ID, contents=prompt)
    sentiment = response.text.strip().upper()
    print(f"   => حالة المشاعر السوقية: {sentiment}")
    return {"raw_news": scraped_news, "sentiment": sentiment}

# ---------------------------------------------------------
# 2. الوكيل الثاني: المراقب المالي (Quant Agent)
# ---------------------------------------------------------
def agent_quant_analysis():
    print("📊 [Quant Agent]: جاري مراقبة أسهم الموردين والمواد الخام (Yahoo Finance API)...")
    # محاكاة سحب أسعار الذهب، البيتكوين، والنحاس (الحديد والمكونات)
    try:
        # Example API call (Binance/Yahoo equivalent for real-time check)
        copper_price_fake = 4.12 # USD/lb
        steel_index_fake = 850   # USD/Ton
        print(f"   => النحاس: ${copper_price_fake} | النحاس/الصلب الصناعي: ${steel_index_fake}")
        
        # Financial logic check
        if steel_index_fake > 800:
            status = "COST_INFLATION"
        else:
            status = "COST_STABLE"
            
        return {"copper": copper_price_fake, "steel": steel_index_fake, "financial_status": status}
    except Exception as e:
        print("خطأ في Quant Agent")
        return None

# ---------------------------------------------------------
# 3. الوكيل الثالث: مهندس الأتمتة (Automation Agent)
# ---------------------------------------------------------
def agent_automation_engineer(sentiment_data, quant_data):
    print("⚙️ [Automation Agent]: ربط الأحداث وإصدار قرارات الأتمتة (Single EXE)...")
    
    # AI logic to merge cross-domain outputs
    prompt = f"""
    أنت مهندس الأتمتة لمنظومة 'رافد'.
    مدخلات محلل المشاعر: {sentiment_data}
    مدخلات المراقب المالي: {quant_data}
    
    قم بالربط بين المشاعر السلبية/الإيجابية وبين الوضع المالي. 
    ما هو قرار الأتمتة الداخلي الذي يجب إرساله لنظام SmartBridge؟
    أخرجه بصيغة JSON تحتوي على:
    {{"action": "UPDATE_PRICES" او "HOLD", "justification": "لماذا؟", "system_alert": "رسالة التحذير"}}
    """
    
    response = client.models.generate_content(
        model=MODEL_ID, 
        contents=prompt,
        config=genai.types.GenerateContentConfig(response_mime_type="application/json")
    )
    
    decision = json.loads(response.text.strip())
    
    print("\n✅ تم اتخاذ قرار الأتمتة بنجاح:")
    print(f"   [الإجراء]: {decision.get('action')}")
    print(f"   [المبرر]: {decision.get('justification')}")
    print(f"   [الإشعار للنظام]: {decision.get('system_alert')}")
    
    # هنا يتم الإرسال الفعلي لـ n8n أو قاعدة بيانات الواجهة (Simulated)
    # webhook_url = 'http://localhost:5678/webhook/rafid-auto'
    # requests.post(webhook_url, json=decision)
    print("\n🚀 (محاكاة) تم إرسال القرار عبر n8n/Webhook إلى أنظمة الشركة الداخلية.")

# =========================================================
# Execution Core
# =========================================================
if __name__ == "__main__":
    print("بدء دورة تحالف الوكلاء (Agentic Alliance Cycle)...\n")
    
    s_data = agent_sentiment_analysis()
    q_data = agent_quant_analysis()
    
    if s_data and q_data:
        agent_automation_engineer(s_data, q_data)
