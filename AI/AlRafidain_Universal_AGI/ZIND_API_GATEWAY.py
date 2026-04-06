import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

# استيراد ZIND من ملف الرسائل غير المتزامنة الفعلي
from ZIND_ASYNC_CORE import ZindOrchestrator, Message

# --- Pydantic Models for API validation ---
class TaskRequest(BaseModel):
    target_agent: str
    topic: str
    payload: dict

# --- Orchestrator Global Instance ---
zind_app = None # سيتم تهيئته عند بدء السيرفر
orchestrator_task = None

# --- Lifespan Manager (إدارة التشغيل والإيقاف) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global zind_app, orchestrator_task
    print("Starting ZIND OS Services...")
    
    # 1. تهيئة النظام
    zind_app = ZindOrchestrator() 
    
    # 2. تشغيل الـ Orchestrator في الخلفية (Non-blocking)
    orchestrator_task = asyncio.create_task(zind_app.start_system())
    
    yield # السيرفر يعمل الآن ويستقبل الطلبات
    
    # 3. بروتوكول الإيقاف الآمن عند إغلاق السيرفر
    print("Shutting down ZIND OS...")
    await zind_app.kill_switch()
    if orchestrator_task:
        orchestrator_task.cancel()

# --- FastAPI Initialization ---
app = FastAPI(title="ZIND OS API Gateway", description="بوابة الاتصال العالمية للذكاء السيادي الخاص بموازين الرافدين", lifespan=lifespan)

# --- API Endpoints ---
@app.post("/api/task/submit")
async def submit_task(request: TaskRequest):
    """نقطة الدخول الرئيسية لإرسال المهام إلى وكلاء ZIND"""
    try:
        # إنشاء وكيل مؤقت ليمثل الـ API ويقوم بإرسال الرسالة إلى الـ Message Bus
        api_agent_id = "API_Gateway"
        if api_agent_id not in zind_app.bus.subscribers:
            # تسجيل صندوق وارد مؤقت للـ API
            zind_app.bus.register(api_agent_id, asyncio.Queue())
        
        # صياغة الرسالة وإرسالها للوكيل المطلوب
        msg = Message(
            sender=api_agent_id,
            receiver=request.target_agent,
            topic=request.topic,
            payload=request.payload
        )
        
        # نشر الرسالة في ناقل الرسائل الخاص بـ ZIND
        await zind_app.bus.publish(msg)
        
        return {
            "status": "success", 
            "message": f"Task '{request.topic}' submitted to '{request.target_agent}' successfully.",
            "timestamp": msg.timestamp
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/health")
async def health_check():
    """التحقق من حالة النظام والوكلاء النشطين"""
    if not zind_app:
        return {"status": "offline/starting"}
        
    return {
        "status": "online",
        "active_agents": list(zind_app.bus.subscribers.keys())
    }

# ==========================================
# تشغيل خادم الويب المركزي
# ==========================================
if __name__ == "__main__":
    import uvicorn
    # بمجرد تشغيل هذا الملف، سيتم تدشين خادم الـ API ليرتبط بموقع الـ React
    uvicorn.run(app, host="0.0.0.0", port=8000)
