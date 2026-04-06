from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import asyncio
import os
from datetime import datetime

# استيراد أجزاء العقل والمستشعرات
from universal_agents import UniversalAgentCore
from llm_engine import UniversalLLMEngine
from plugin_market_live import MarketPlugin
from plugin_plc_master import PLCMasterPlugin

app = FastAPI(
    title="Al-Rafidain Master AGI Console",
    description="The centralized nervous system serving coding, industrial, and financial intelligence.",
    version="1.0-Sovereign"
)

# 1. إطلاق العصبونات والمستشعرات ككائنات حية في الخادم
llm = UniversalLLMEngine(provider="local_ollama", model="llama3")
brain = UniversalAgentCore(llm)
market = MarketPlugin()
factory_plc = PLCMasterPlugin(plc_ip="192.168.0.5")

class PromptPayload(BaseModel):
    task_description: str

@app.on_event("startup")
async def boot_sequence():
    print("==================================================================================")
    print("🟢 AL-RAFIDAIN AGI SERVER ONLINE 🟢")
    print("الذكاء السيادي قيد التشغيل. المعامل، الاقتصاد، والبرمجة الآن تحت إدارة العقل الأوحد.")
    print("🌐 Dashboard UI Available at: http://localhost:9000/")
    print("==================================================================================")

@app.get("/")
async def serve_dashboard():
    """واجهة المستخدم الرسومية الخارقة الخاصة بإدارة العقل"""
    html_path = os.path.join(os.path.dirname(__file__), "console_dashboard.html")
    with open(html_path, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/agi/think")
async def deep_think(payload: PromptPayload):
    try:
        response = brain.solve_complex_task(memory_vault=None, task_description=payload.task_description)
        return {
            "status": "success",
            "domain_assigned": response["domain"],
            "engineered_solution": response["final_solution"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agi/factory_status")
async def get_factory_health():
    temp = factory_plc.read_machine_temperature()
    status = "STABLE" if 0 < temp < 70 else "CRITICAL"
    return {
        "machine_temperature_celsius": temp,
        "health": status,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/agi/financial_correlation")
async def analyze_market_correlation(payload: PromptPayload):
    """
    يأخذ اسم الشركة/المورد الفعلي، يرسل (عنكبوت الإنترنت) لجلب السعر والأخبار،
    ثم يرمي البيانات لـ LLM (ذكاء لامــــا 3) الذي يحلل "الرابط" بين الخبر والسعر.
    """
    intel_data = market.fetch_market_and_news(payload.task_description)
    
    if "error" in intel_data:
        return {"status": "error", "engineered_solution": intel_data["error"]}
        
    prompt = f"""
    أنت الآن 'محلل استخبارات مالي' فائق الذكاء، متصل بالإنترنت للتو.
    الهدف المطلوب دراسته: {payload.task_description} 
    التسعيرة الحية الآن من البورصة المباشرة: {intel_data['price']} دولار.
    
    أحدث الأخبار العاجلة التي اصطادها النظام من شبكة الإنترنت قبل ثوانٍ:
    """
    for n in intel_data['news']:
        prompt += f"\n- {n['title']} (المصدر: {n['publisher']})"
        
    prompt += "\n\nالمطلوب: بناءً على نظريات الاقتصاد، ومنطق سلسلة التوريد.. قم بتحليل الرابط المباشر بين هذه الأخبار السياسية/الاقتصادية، وبين سعر السهم الحالي المخترق. هل تتوقع صعوداً أم هبوطاً مرتقباً استناداً للتحليل؟ أجب بفقرتين احترافيتين جداً بالعربية."
    
    # عصر الذكاء واستخراج الاستنتاج
    correlation_insight = brain.llm.generate(prompt)
    
    response_html = f"<b>السعر الحالي المسترد من الويب:</b> {intel_data['price']}$<br><br><b>تحليل الارتباط السيادي (News Correlation):</b><br>{correlation_insight}"
    
    return {
        "status": "success",
        "domain_assigned": "Financial Internet Intelligence",
        "engineered_solution": response_html
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("agi_master_api:app", host="0.0.0.0", port=9000, reload=True)
