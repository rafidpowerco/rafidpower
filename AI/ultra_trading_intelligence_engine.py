"""
╔══════════════════════════════════════════════════════════════════════════╗
║  RAFID SOVEREIGN AGI - ULTRA TRADING INTELLIGENCE ENGINE                ║
║  محرك الذكاء التداولي المتقدم - Gemini 1.5 Pro Direct Call              ║
║  يولد خبرات متقدمة في: الأسهم، الكريبتو، الفوركس، المشتقات، التحليل   ║
╚══════════════════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import os
import sys
import time
import hashlib
import re
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# إضافة مسار محرك LLM
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "AlRafidain_Universal_AGI"))

import chromadb
# ─────────────────────────────────────────────────────────────
from llm_engine import UniversalLLMEngine
llm = UniversalLLMEngine()
print("  ✅ نموذج محمّل: DeepSeek-R1 عبر UniversalLLMEngine")
# ─────────────────────────────────────────────────────────────
# ChromaDB
# ─────────────────────────────────────────────────────────────
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db_vault")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
trading_col   = chroma_client.get_or_create_collection(name="rafid_trading_intelligence")
general_col   = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

print("=" * 70)
print("  🚀 RAFID ULTRA TRADING INTELLIGENCE ENGINE")
print("  🧠 نموذج التوليد: DeepSeek-R1 عبر UniversalLLMEngine")
print(f"  📚 قاعدة البيانات: {CHROMA_PATH}")
print("=" * 70)

# ─────────────────────────────────────────────────────────────
# مجالات التداول المتقدمة - 15 مجال × 10 أسئلة = 150+ خبرة
# ─────────────────────────────────────────────────────────────
ULTRA_TRADING_DOMAINS = [
    {
        "id": "quant_strategies",
        "name": "الاستراتيجيات الكمية المتقدمة (Quantitative Trading)",
        "focus": """
        ركز على: خوارزميات التداول الإحصائي، نماذج العوامل المتعددة، Statistical Arbitrage،
        Mean Reversion مع Cointegration، Momentum strategies، الـ Backtesting الصحيح،
        Walk-Forward Optimization، مشكلة Overfitting في النماذج الكمية.
        """,
        "category": "Quantitative_Strategies"
    },
    {
        "id": "technical_analysis_advanced",
        "name": "التحليل الفني المتقدم للمحترفين",
        "focus": """
        ركز على: Price Action النقي، Supply & Demand Zones، Order Blocks، Liquidity Sweeps،
        Smart Money Concepts (SMC)، Wyckoff Method، Market Structure Shifts،
        Fibonacci المتقدم، Harmonic Patterns (Gartley, Bat, Crab)، Volume Profile.
        """,
        "category": "Advanced_Technical_Analysis"
    },
    {
        "id": "options_derivatives",
        "name": "الخيارات والمشتقات المالية (Options & Derivatives)",
        "focus": """
        ركز على: استراتيجيات الخيارات المركبة (Iron Condor, Butterfly, Calendar Spread)،
        Volatility Trading، IV Rank/Percentile، Theta Decay، Gamma Scalping،
        Delta-Neutral Hedging، الـ VIX واستخدامه لتحديد الـ Regime، Options Flow.
        """,
        "category": "Options_Derivatives"
    },
    {
        "id": "crypto_defi",
        "name": "الكريبتو والتمويل اللامركزي (Crypto & DeFi)",
        "focus": """
        ركز على: On-Chain Analytics (Exchange Flows, Whale Wallets, SOPR, MVRV)،
        Bitcoin Halving Cycles، Altcoin Season Indicators، DeFi Yield Strategies،
        Liquidity Pool Mechanics، Impermanent Loss، MEV (Miner Extractable Value)،
        Crypto Sentiment (Fear & Greed Index، Funding Rates، Open Interest).
        """,
        "category": "Crypto_DeFi"
    },
    {
        "id": "forex_macro",
        "name": "الفوركس والتحليل الكلي (Forex & Macro)",
        "focus": """
        ركز على: Intermarket Analysis (Bonds/Stocks/Commodities/FX correlations)،
        COT Report وكيفية قراءة مراكز المؤسسات، Dollar Index (DXY) والأثر على الأزواج،
        Central Bank Policy Divergence، Carry Trade Mechanics، Flash Crash Protection،
        Economic Calendar Trading، News Trading Techniques.
        """,
        "category": "Forex_Macro"
    },
    {
        "id": "risk_management",
        "name": "إدارة المخاطر الاحترافية (Professional Risk Management)",
        "focus": """
        ركز على: Kelly Criterion التطبيقي، Position Sizing Models، Maximum Drawdown Control،
        Correlation-based Portfolio Risk، Tail Risk Hedging، Stress Testing المحافظ،
        Risk-Adjusted Returns (Sharpe، Sortino، Calmar Ratios)، الـ VaR وقيوده،
        Expected Shortfall، Monte Carlo للمحافظ.
        """,
        "category": "Risk_Management"
    },
    {
        "id": "market_microstructure",
        "name": "هيكل السوق والتدفق (Market Microstructure & Order Flow)",
        "focus": """
        ركز على: Order Book Analysis، Bid-Ask Spread Dynamics، Dark Pools، HFT Impact،
        VWAP/TWAP Algorithms، Iceberg Orders، Spoofing Detection، DOM Trading،
        Footprint Charts، Delta & Cumulative Delta، Time & Sales Analysis.
        """,
        "category": "Market_Microstructure"
    },
    {
        "id": "macro_economics_trading",
        "name": "الاقتصاد الكلي والتداول المؤسسي",
        "focus": """
        ركز على: Global Macro Investing (Ray Dalio، George Soros approaches)،
        Regime Detection (Bull/Bear/Sideways/Volatile)، Business Cycle Trading،
        Sector Rotation Strategies، Fed Policy Impact على الأصول المختلفة،
        Currency Wars وتأثيرها على الأسواق الناشئة، Commodity Super Cycles.
        """,
        "category": "Macro_Economics_Trading"
    },
    {
        "id": "sentiment_behavioral",
        "name": "تحليل المشاعر والسلوك (Sentiment & Behavioral Finance)",
        "focus": """
        ركز على: Contrarian Investing، Sentiment Indicators (Put/Call Ratio، AAII، CNN Fear & Greed)،
        Crowd Psychology في الأسواق، Herding Behavior، Bubble Detection،
        Media Sentiment NLP Analysis، Social Media Signals، Options Sentiment،
        Short Interest Analysis، Insider Trading Patterns.
        """,
        "category": "Sentiment_Behavioral"
    },
    {
        "id": "ai_ml_trading",
        "name": "الذكاء الاصطناعي والتعلم الآلي في التداول",
        "focus": """
        ركز على: LSTM وGRU للتنبؤ بالأسعار، Transformer models للأسواق المالية،
        Reinforcement Learning للتداول (PPO/SAC Agents)، Feature Engineering للبيانات المالية،
        Alternative Data Sources (Satellite، Credit Card)، NLP لتحليل ملفات 10-K،
        Ensemble Methods للإشارات، Walk-Forward Neural Architecture Search.
        """,
        "category": "AI_ML_Trading"
    },
    {
        "id": "portfolio_construction",
        "name": "بناء المحافظ الاحترافية (Portfolio Construction)",
        "focus": """
        ركز على: Modern Portfolio Theory (MPT)، Black-Litterman Model،
        Risk Parity الاحترافية (Bridgewater All Weather)، Factor Investing (Fama-French)،
        Smart Beta Strategies، Rebalancing Optimization، Tax-Loss Harvesting،
        Multi-Asset Class Allocation، Alternative Investments (Hedge Funds، PE، Real Assets).
        """,
        "category": "Portfolio_Construction"
    },
    {
        "id": "algorithmic_execution",
        "name": "التنفيذ الخوارزمي وبناء الأنظمة",
        "focus": """
        ركز على: Backtesting Framework Design (بدون Look-Ahead Bias)، Event-Driven Architecture،
        Slippage وTransaction Costs Modeling، Broker API Integration (Interactive Brokers، Alpaca)،
        Real-Time Data Pipelines، Strategy Parameter Optimization، Walk-Forward Testing،
        Live Trading Infrastructure، Monitoring وAlert Systems.
        """,
        "category": "Algorithmic_Execution"
    },
    {
        "id": "crypto_technical",
        "name": "التحليل الفني للكريبتو المتقدم",
        "focus": """
        ركز على: Bitcoin Dominance Analysis، Altcoin Rotation Mechanics، Funding Rate Arbitrage،
        Perpetual Futures Basis Trading، Liquidation Cascades Detection، Exchange Inflow/Outflow،
        Whale Alert Analytics، Stablecoin Flows، NFT Market Indicators،
        Cross-Chain Opportunities، Layer-2 Ecosystem Analysis.
        """,
        "category": "Crypto_Technical"
    },
    {
        "id": "fundamental_valuation",
        "name": "التحليل الأساسي والتقييم المتقدم",
        "focus": """
        ركز على: DCF المتقدم مع Monte Carlo، Reverse DCF (ما الذي يسعّره السوق؟)،
        Quality Screens (ROIC، FCF Yield، Earnings Quality)، EV/EBITDA التطبيقي،
        Sum of the Parts Valuation، Comparative Comps Analysis، Event-Driven Investing
        (M&A Arbitrage، Spin-offs، Special Situations)، Short-Selling Research Methodology.
        """,
        "category": "Fundamental_Valuation"
    },
    {
        "id": "trading_psychology",
        "name": "علم النفس التداولي وانضباط المتداول",
        "focus": """
        ركز على: كيف يفكر المتداول الناجح، التغلب على Loss Aversion و FOMO،
        Journal Trading وأهميته، Rule-Based Trading لإزالة العاطفة،
        Drawdown Recovery Psychology، Building Trading Systems بدلاً من التخمين،
        Peak Performance للمتداولين، النماذج الذهنية الأساسية للنجاح طويل الأمد.
        """,
        "category": "Trading_Psychology"
    }
]

# ─────────────────────────────────────────────────────────────
# توليد المعرفة بـ Gemini Pro
# ─────────────────────────────────────────────────────────────
def make_id(text: str, prefix: str = "trade") -> str:
    return f"{prefix}_{hashlib.md5(text.encode('utf-8')).hexdigest()[:14]}"

def extract_json_array(text: str) -> list:
    """استخرج أول مصفوفة JSON صحيحة من النص"""
    # إزالة markdown
    text = re.sub(r'```(?:json)?', '', text).strip()
    
    # ابحث عن بداية ونهاية المصفوفة
    start = text.find('[')
    if start == -1:
        return []
    
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == '[': depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i+1])
                except json.JSONDecodeError:
                    # حاول تصليح JSON بسيط
                    candidate = text[start:i+1]
                    # إزالة trailing commas قبل ]
                    candidate = re.sub(r',\s*([\]}])', r'\1', candidate)
                    try:
                        return json.loads(candidate)
                    except:
                        return []
    return []

async def generate_trading_expertise(domain: dict, batch_num: int, total: int) -> list:
    """يستدعي Gemini Pro لتوليد 10 خبرات متقدمة في مجال التداول"""
    
    print(f"\n  [{batch_num:02d}/{total:02d}] 🔥 {domain['name']}")
    
    prompt = f"""أنت خبير مالي ومتداول مؤسسي من أعلى المستويات (Tier 1 Hedge Fund Senior Analyst).
مهمتك: توليد 10 أسئلة وأجوبة متقدمة جداً في مجال "{domain['name']}".

{domain['focus']}

متطلبات صارمة:
1. الأسئلة يجب أن تكون تحليلية معمقة، لا سطحية أبداً.
2. الأجوبة يجب أن تتضمن: المنهجية الدقيقة، أرقام وصيغ رياضية عند الاقتضاء، أمثلة واقعية.
3. لكل سؤال، أضف "thinking" يوضح منهجية التفكير قبل الإجابة (2-3 جمل).
4. استخدم أسلوباً تحليلياً واثقاً وصريحاً - لا تجاملات.
5. الإجابات باللغة العربية مع الاحتفاظ بالمصطلحات التقنية الإنجليزية.

أعطني فقط مصفوفة JSON بالتنسيق التالي:
[
  {{
    "q": "السؤال التحليلي المتقدم...",
    "thinking": "منهجية التفكير في الإجابة...",
    "a": "الإجابة التحليلية المفصلة..."
  }}
]

يجب أن تكون المصفوفة 10 عناصر بالضبط. JSON فقط، لا نص إضافي."""

    for attempt in range(3):
        try:
            # We use 'write_python_code' intentionally as a task_type to guarantee routing to OpenRouter / DeepSeek in UniversalLLMEngine
            raw_text = await llm.generate(prompt, task_type="write_python_code")
            
            qa_list = extract_json_array(raw_text)
            if qa_list and len(qa_list) >= 5:
                print(f"        ✅ توليد {len(qa_list)} خبرة بنجاح")
                return qa_list
            else:
                print(f"        ⚠️ محاولة {attempt+1}: JSON ناقص ({len(qa_list)} عناصر). إعادة...")
                await asyncio.sleep(3)
                
        except Exception as e:
            err = str(e)
            if "429" in err or "quota" in err.lower():
                wait = 15 * (attempt + 1)
                print(f"        ⏳ Rate Limit - انتظار {wait}ث...")
                await asyncio.sleep(wait)
            else:
                print(f"        ❌ خطأ: {err[:80]}")
                await asyncio.sleep(5)
    
    print(f"        ⚠️ فشل {domain['name']} - تخطي")
    return []

# ─────────────────────────────────────────────────────────────
# حقن الخبرات في ChromaDB
# ─────────────────────────────────────────────────────────────
def inject_to_chroma(qa_list: list, category: str, domain_name: str) -> int:
    """حقن قائمة من الخبرات في مجموعتي ChromaDB"""
    docs_trading, meta_trading, ids_trading = [], [], []
    docs_general, meta_general, ids_general = [], [], []
    
    for item in qa_list:
        q        = str(item.get("q", "")).strip()
        a        = str(item.get("a", "")).strip()
        thinking = str(item.get("thinking", "")).strip()
        
        if not q or not a or len(q) < 20:
            continue
        
        # ── وثيقة التداول المتخصصة ──
        trade_doc = (
            f"المجال: {domain_name}\n"
            f"السؤال: {q}\n"
            + (f"[منهجية التفكير]: {thinking}\n" if thinking else "")
            + f"[الإجابة التحليلية]: {a}"
        )
        t_id = make_id(q, "trade")
        docs_trading.append(trade_doc)
        meta_trading.append({"category": category, "domain": domain_name[:40], "type": "trading_expertise"})
        ids_trading.append(t_id)
        
        # ── وثيقة الذاكرة العامة ──
        gen_doc = f"السؤال: {q}\n\nالإجابة: {a}"
        g_id = make_id(q, "tgen")
        docs_general.append(gen_doc)
        meta_general.append({"category": category, "domain": domain_name[:40], "has_thinking": str(bool(thinking)).lower()})
        ids_general.append(g_id)
    
    if docs_trading:
        try:
            trading_col.upsert(documents=docs_trading, metadatas=meta_trading, ids=ids_trading)
        except Exception as e:
            print(f"        ⚠️ خطأ ChromaDB trading: {e}")
    
    if docs_general:
        try:
            general_col.upsert(documents=docs_general, metadatas=meta_general, ids=ids_general)
        except Exception as e:
            print(f"        ⚠️ خطأ ChromaDB general: {e}")
    
    return len(docs_trading)

# ─────────────────────────────────────────────────────────────
# حفظ JSON محلي للمراجعة
# ─────────────────────────────────────────────────────────────
def save_json_pack(qa_list: list, domain_id: str) -> str:
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    filepath = os.path.join(data_dir, f"rafid_trading_pack_{domain_id}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(qa_list, f, ensure_ascii=False, indent=2)
    return filepath

# ─────────────────────────────────────────────────────────────
# المحرك الرئيسي
# ─────────────────────────────────────────────────────────────
async def run_ultra_trading_engine():
    total_domains   = len(ULTRA_TRADING_DOMAINS)
    total_injected  = 0
    total_failed    = 0
    session_log     = []
    
    print(f"\n  📊 المجالات المستهدفة: {total_domains}")
    print(f"  🎯 الهدف: {total_domains * 10}+ خبرة تداولية متقدمة\n")
    print("=" * 70)
    
    for i, domain in enumerate(ULTRA_TRADING_DOMAINS, 1):
        # توليد الخبرات
        qa_list = await generate_trading_expertise(domain, i, total_domains)
        
        if qa_list:
            # حقن في ChromaDB
            injected = inject_to_chroma(qa_list, domain["category"], domain["name"])
            total_injected += injected
            
            # حفظ JSON محلي
            saved_path = save_json_pack(qa_list, domain["id"])
            
            session_log.append({
                "domain": domain["name"],
                "injected": injected,
                "file": os.path.basename(saved_path)
            })
            print(f"        💾 محفوظ: {os.path.basename(saved_path)}")
            print(f"        📊 الإجمالي حتى الآن: {total_injected} خبرة")
        else:
            total_failed += 1
        
        # استراحة بين المجالات لحماية API Rate Limit
        if i < total_domains:
            print(f"        ⏱️  انتظار 8 ثوانٍ...")
            await asyncio.sleep(8)
    
    # ─── ملخص ختامي ───
    print("\n" + "=" * 70)
    print("  🏆 اكتمل محرك الذكاء التداولي!")
    print(f"  ✅ إجمالي الخبرات المحقونة:  {total_injected}")
    print(f"  ❌ مجالات فاشلة:              {total_failed}")
    print(f"  📚 إجمالي ذاكرة التداول:     {trading_col.count():,}")
    print(f"  🧠 إجمالي ذاكرة رافد العامة: {general_col.count():,}")
    print("=" * 70)
    
    # اختبار سريع
    print("\n  🔍 اختبار الذاكرة التداولية...")
    test_q = "كيف أحدد نقطة الدخول المثلى في صفقة باستخدام Smart Money Concepts؟"
    results = trading_col.query(query_texts=[test_q], n_results=2)
    for idx, doc in enumerate(results["documents"][0]):
        print(f"\n  [{idx+1}] {doc[:250]}...")
    
    print("\n  🚀 رافد الآن يتقن التداول المؤسسي والتحليل الكمي المتقدم!")
    return total_injected


# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    asyncio.run(run_ultra_trading_engine())
