import requests
try:
    import yfinance as yf
    HAS_YF = True
except ImportError:
    HAS_YF = False

class MarketPlugin:
    """
    ====================================================================
    [ محرك التصفح والاستخبارات المالية - Financial Intelligence Web Scraper ]
    يتيح للعقل الاصطناعي تصفح الإنترنت الحقيقي لجلب الأخبار لحظة بلحظة، 
    وقراءة أسعار الأسهم لربط الأحداث السياسية بالحركة الاقتصادية.
    ====================================================================
    """
    def __init__(self):
        self.primary_tickers = {
            "النفط": "CL=F",
            "الذهب": "GC=F",
            "ابل": "AAPL",
            "تيسلا": "TSLA",
            "بيتكوين": "BTC-USD",
            "السوق العام": "^GSPC"
        }

    def fetch_market_and_news(self, query: str) -> dict:
        """يتصفح الإنترنت لجلب السعر المباشر والمانشيتات الإخبارية اللحظية"""
        if not HAS_YF:
            return {"error": "النظام يفتقر لمحرك yfinance. يرجى التحديث."}
            
        # حاول مطابقة الاسم العربي أو استخدم الرمز المدخل كما هو
        ticker_symbol = self.primary_tickers.get(query, query)
        
        try:
            ticker = yf.Ticker(ticker_symbol)
            # 1. جلب السعر اللحظي (يتطلب اتصال حقيقي بالإنترنت)
            data = ticker.history(period="1d")
            if data.empty:
                return {"error": "لم يتم العثور على أي معلومات حقيقية عبر الإنترنت لهذا المورد."}
            latest_close = data['Close'].iloc[-1]
            
            # 2. تصفح الأخبار العالمية العاجلة لهذا السهم باستخدام عنكبوت الويب
            news_items = ticker.news
            extracted_news = []
            if news_items:
                for item in news_items[:5]: # سحب آخر 5 أخبار
                    extracted_news.append({
                        "title": item.get('title', 'خبر بدون عنوان'),
                        "publisher": item.get('publisher', 'وكالة مجهولة')
                    })
            else:
                extracted_news.append({"title": "لا توجد أخبار عاجلة في آخر 24 ساعة.", "publisher": "النظام"})
                
            return {
                "symbol": ticker_symbol,
                "price": round(latest_close, 2),
                "news": extracted_news
            }
        except Exception as e:
            return {"error": f"فشل في تصفح الإنترنت. السبب: {e}"}
