import os
import time
import requests
import xml.etree.ElementTree as ET
import json
import chromadb
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

print("=========================================================")
print("  Rafid Sovereign AGI - Autonomous Monitor & Learner     ")
print("  (OpenRouter / DeepSeek-R1 Powered - Runs 24/7)        ")
print("=========================================================")

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("❌ خطأ: OPENROUTER_API_KEY مفقود في ملف .env")
    exit(1)

# Using OpenRouter with the same free DeepSeek-R1 model
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)
MODEL_ID = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-r1:free")

# Connect to the Sovereign Memory Vault
chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

def fetch_rss_news(url, source_name, max_items=3):
    """Fetch news headlines from RSS feeds."""
    headlines = []
    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        root = ET.fromstring(response.content)
        for item in root.findall('.//item')[:max_items]:
            title = item.find('title')
            if title is not None and title.text:
                headlines.append(f"- [{source_name}] {title.text}")
    except Exception as e:
        print(f"⚠️ تعذر جلب أخبار {source_name}: {e}")
    return headlines

def fetch_live_market_data():
    """Fetch real-time crypto prices and news."""
    print("🌐 [1] جلب حالة الأسواق والأخبار العالمية في الوقت الحقيقي...")
    data_points = []

    # Live crypto prices (Binance API - free, no key needed)
    try:
        btc = requests.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", timeout=5).json().get('price', 'N/A')
        eth = requests.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT", timeout=5).json().get('price', 'N/A')
        data_points.append(f"أسعار مباشرة: البيتكوين = {btc}$ | الإيثيريوم = {eth}$")
    except:
        data_points.append("(أسعار الكريبتو غير متوفرة مؤقتاً)")

    # News from major sources
    news = []
    news.extend(fetch_rss_news("https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,GC=F", "Yahoo Finance/Gold"))
    news.extend(fetch_rss_news("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk"))
    
    if news:
        data_points.append("\\nأبرز الأخبار:")
        data_points.extend(news)

    return "\\n".join(data_points)

def autonomous_learn_and_monitor():
    """
    The core 24/7 learning loop:
    1. Fetches live market & industrial news
    2. Sends to DeepSeek-R1 for deep analysis
    3. Stores insights in ChromaDB memory
    4. Rafid chat widget uses this memory automatically when answering
    """
    live_data = fetch_live_market_data()

    print(f"\\n🧠 [2] DeepSeek-R1 يحلل البيانات ويستخلص التقرير الاستراتيجي...")

    prompt = f"""
    أنت المحلل المالي الكمّي (Quant Analyst) والمراقب الصناعي لنواة "رافد".
    
    بيانات السوق الحية الآن:
    {live_data}
    
    قم بما يلي:
    1. تحليل التأثير على أسعار المعادن والمكونات الصناعية (الحديد، النحاس، الإلكترونيات).
    2. ما هو التأثير على تكلفة تصنيع الموازين الجسرية هذا الأسبوع؟
    3. تنبيه قصير للإدارة إذا كان المناخ الاقتصادي يستدعي تعديل الأسعار أو الإسراع في المشتريات.
    
    الإجابة باللغة العربية، احترافية ومختصرة، يجب حفظها كمعرفة استراتيجية لرافد.
    """

    try:
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": "أنت مستشار مالي وصناعي خبير لشركة رافد. إجاباتك دقيقة ومختصرة."},
                {"role": "user", "content": prompt}
            ]
        )

        insight = response.choices[0].message.content.strip()

        print("\\n✅ التحليل الاستراتيجي المستخلص:")
        print(insight)

        # Store in ChromaDB so Rafid chat widget uses it automatically
        doc_id = f"market_monitor_{int(time.time())}"
        collection.add(
            documents=[f"[تحليل ذاتي تلقائي - {time.strftime('%Y-%m-%d %H:%M')}]:\\n{insight}"],
            metadatas=[{"category": "Autonomous_Market_Intel", "timestamp": str(time.time())}],
            ids=[doc_id]
        )

        print(f"\\n💾 [3] تم حفظ المعرفة في الذاكرة السيادية (ID: {doc_id})")
        print("💡 رافد في موقعك الآن يعرف وضع السوق وسيجيب بناءً على هذا التحليل!")

    except Exception as e:
        print(f"⚠️ خطأ في دورة التعلم: {e}")

# =========================================================
# Main Loop - Runs forever every 4 hours
# =========================================================
if __name__ == "__main__":
    # Run immediately on start, then every 4 hours
    while True:
        print("\\n" + "="*60)
        print(f"⏳ دورة المراقبة والتعلم التلقائي: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)

        autonomous_learn_and_monitor()

        wait_hours = 4
        print(f"\\n💤 رافد يراقب... الدورة القادمة بعد {wait_hours} ساعات.")
        time.sleep(wait_hours * 3600)
