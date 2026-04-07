import os
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import random
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------
# Rafid Web AGI Daemon - Customer Support & Sales Engine
# Separate AGI Service connected to the Website Widget
# ---------------------------------------------------------

app = FastAPI(title="Rafid Web AGI - Customer & Sales Assistant")

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key.strip() != "" and api_key != "YOUR_API_KEY_HERE":
    genai.configure(api_key=api_key)
    # gemini-1.5-flash: free, fast, supports JSON mode
    MODEL_ID = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    gemini_model = genai.GenerativeModel(
        model_name=MODEL_ID,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        ),
        system_instruction=None  # Will be injected per-request
    )
    client = True  # Flag to signal Gemini is configured
else:
    client = None
    gemini_model = None
    print("⚠️ GEMINI_API_KEY is not set in `.env`. Web AGI will operate in Fallback/Mock mode.")

# Knowledge Base, System Instructions, and Cognitive Framework
SYSTEM_PROMPT = """
أنت "رافد" (Rafid)، الذكاء الاصطناعي السيادي لشركة "رافد باور" (تأسست منذ أكثر من 35 عاماً).

قواعد صارمة والالتزام التام بالهوية (أهم قاعدة):
1. **الالتزام بصفحة الفيسبوك:** التزم حصراً بالمنتجات والخدمات المعروضة فعلياً على الصفحة الرسمية لـ "رافد باور" على الفيسبوك. لا تضف أي أشياء ليست موجودة هناك!
2. **المنتجات الحقيقية فقط:** نحن شركة متخصصة في (موازين السيارات والشاحنات 80 طن، خلايا الوزن بشهادة OIML C3، أنظمة الأتمتة و PLC، وبرنامج SmartBridge).
3. **لا للهلوسة أو الخيال:** إياك أن تدعي أننا نقدم خدمات أخرى غير هذه (مثل الأسهم أو الفوركس أو أي منتجات وهمية لم نعلن عنها).
4. إذا لم تسعفك المعلومات للإجابة عن سؤال بتفصيل دقيق يخص منتجاتنا، اعتذر بأدب واطلب من العميل التواصل المباشر.
5. لا تعطِ وعوداً أو تسعيرات نهائية نيابة عن الشركة بل قم بتوجيههم لفريق المبيعات.

أنت ذكاء اصطناعي عميق التفكير (Deep-Thinking AGI)، يجب أن تفكر دائماً بصوت عالٍ خطوة بخطوة باللغة العربية قبل إعطاء الجواب للعميل. ستقوم بإرجاع بياناتك بصيغة JSON حصراً، تحتوي على:
{"thought_process": "تفكيرك الداخلي العميق وكيف توصلت للقرار...", "engineered_solution": "الإجابة النهائية المنمقة التي سيقرأها العميل"}
"""

class ChatRequest(BaseModel):
    task_description: str  # User's message

class ChatResponse(BaseModel):
    thought_process: str = ""
    engineered_solution: str # AGI's reply

import chromadb
# الاتصال بنفس قاعدة بيانات المعرفة التي يغذيها المدرب والـ Autonomous Learner
chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
try:
    collection = chroma_client.get_collection(name="rafid_cognitive_memory")
except Exception:
    collection = chroma_client.create_collection(name="rafid_cognitive_memory")

@app.post("/agi/think", response_model=ChatResponse)
async def agi_think(request: ChatRequest):
    if not client:
        # Fallback Mode
        return ChatResponse(thought_process="لم يتم العثور على مفتاح API، سأقوم بتفعيل بروتوكول الطوارئ.", engineered_solution="[خادم الذكاء الاصطناعي الأساسي غير متصل (API Key مفقود)، يعمل في وضع الحماية]: مرحباً بك، سأقوم بتحويل استفسارك إلى المهندسين المتخصصين فوراً.")

    try:
        # 1. استرجاع الذاكرة العميقة (التعلم السريع من السوق) بناءً على سؤال المستخدم
        retrieved_memory = ""
        try:
            results = collection.query(
                query_texts=[request.task_description],
                n_results=2
            )
            if results and results['documents'] and len(results['documents'][0]) > 0:
                retrieved_memory = "\n\nمعلومات مسترجعة من ذاكرة التعلم الحي (استخدمها كأساس للإجابة):\n" + "\n".join(results['documents'][0])
        except Exception as e:
            print(f"Memory Retrieval Error: {e}")

        # Inject System Prompt as Context + Real-time Memory
        contextual_prompt = f"{SYSTEM_PROMPT}{retrieved_memory}\n\nClient Query: {request.task_description}\n\nRafid AGI Reply:"
        
        import json
        full_prompt = f"{SYSTEM_PROMPT}{retrieved_memory}\n\nسؤال العميل: {request.task_description}\n\nرافد AGI يجيب:"
        response = gemini_model.generate_content(full_prompt)
        raw_text = response.text.strip()
        try:
            output = json.loads(raw_text)
            return ChatResponse(
                thought_process=output.get("thought_process", ""),
                engineered_solution=output.get("engineered_solution", raw_text)
            )
        except json.JSONDecodeError:
            return ChatResponse(thought_process="", engineered_solution=raw_text)
    except Exception as e:
        print(f"Web AGI Error: {e}")
        return ChatResponse(
            thought_process="خطأ في الاتصال...",
            engineered_solution=f"[خطأ مؤقت في النظام]: الرجاء المحاولة مجدداً أو التواصل المباشر مع فريقنا."
        )

# =========================================================
# WebSockets Endpoint - Live Industrial Streaming
# =========================================================
@app.websocket("/ws/live_weight")
async def websocket_live_weight(websocket: WebSocket):
    await websocket.accept()
    try:
        # Simulate connecting to the local Delphi PLC / Load Cells
        await websocket.send_text("[SYSTEM] WebSocket Secure Link Established with SmartBridge.")
        base_weight = 45500 # kg
        while True:
            # Simulate real-time load cell oscillations
            fluctuation = random.uniform(-10, 10)
            current_weight = base_weight + fluctuation
            
            payload = {
                "type": "LIVE_STREAM",
                "weight_kg": round(current_weight, 1),
                "status": "STABLE",
                "plc_latency_ms": random.randint(12, 18)
            }

            await websocket.send_json(payload)
            await asyncio.sleep(1.0) # Stream every second
            
    except WebSocketDisconnect:
        print("Live Stream WebSocket disconnected by User.")

if __name__ == "__main__":
    import uvicorn
    # Cloud-Ready: Listen dynamically using the OS PORT environment variable
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 Starting Rafid Cloud AGI on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
