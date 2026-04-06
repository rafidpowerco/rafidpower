# ==============================================================================
# 👑 AL-RAFIDAIN SOVEREIGN AGI CORE - CLASSIFIED INTELLECTUAL PROPERTY
# ==============================================================================
# (C) 2026 Al-Rafidain Power & Scales Company. All Rights Reserved.
# Warning: This autonomous intelligent source code contains complex proprietary 
# neural architecture and industrial algorithms.
# Strictly owned by Al-Rafidain Company (Engineer Ayman).
# Unauthorized copying, reverse engineering, or distribution is strictly prohibited.
# ==============================================================================

import os
import sys
import time
import threading
import telebot
import requests
from datetime import datetime
from collections import defaultdict

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

from llm_engine import UniversalLLMEngine
from universal_agents import UniversalAgentCore
from plugin_market_live import MarketPlugin
from plugin_email_secretary import EmailSecretaryPlugin
from plugin_deep_memory import DeepCognitiveMemory

# ---------------------------------------------------------
# INITIALIZATION & CORE AGENTS
# ---------------------------------------------------------
llm = UniversalLLMEngine(provider="local_ollama", model="llama3")
core = UniversalAgentCore(llm)
market = MarketPlugin()
email = EmailSecretaryPlugin()
memory = DeepCognitiveMemory()

app = FastAPI(title="Al-Rafidain AGI Public Interface")

# Shared state
admin_chat_id = memory.synapses.get("admin_chat_id", None)
bot = None

def load_telegram_token():
    token_file = os.path.join(os.path.dirname(__file__), "telegram_bot_token.txt")
    if not os.path.exists(token_file): return None
    with open(token_file, 'r', encoding='utf-8') as f:
        t = f.read().strip()
    return None if "ضع_التوكن_هنا" in t else t

token = load_telegram_token()

def notify_admin(message: str):
    print(f"🔔 System Alert: {message}")
    if bot and admin_chat_id:
        try:
            bot.send_message(admin_chat_id, message)
        except Exception as e:
            print(f"⚠️ Telegram send failed: {e}")

# ---------------------------------------------------------
# TELEGRAM BOT THREAD
# ---------------------------------------------------------
bot = None
if token:
    try:
        bot = telebot.TeleBot(token)
        bot.get_me() # Test connection immediately to catch timeout early
    except Exception as e:
        print(f"⚠️ تحذير: فشل الاتصال بخوادم تيلجرام (قد يكون محجوباً في شبكتك). سيعمل النظام بدون تيلجرام مؤقتاً. ({e})")
        bot = None

if bot:
    @bot.message_handler(commands=['start', 'help'])
    def send_welcome(message):
        global admin_chat_id
        if admin_chat_id != message.chat.id:
            admin_chat_id = message.chat.id
            memory.synapses["admin_chat_id"] = admin_chat_id
            memory._save_brain()
            bot.reply_to(message, "👑 أهلاً بك! تم تعيينك كمدير النظام.")
        else:
            bot.reply_to(message, "العقل جاهز وتحت تصرفك 24/7.")

    @bot.message_handler(func=lambda message: True)
    def handle_user_command(message):
        msg_loading = bot.reply_to(message, "🧠 جاري التفكير...")
        try:
            prompt = f"الاستفسار: {message.text}"
            answer = core.solve_complex_task(None, prompt)["final_solution"]
            if len(answer) > 4000: answer = answer[:4000] + "..."
            bot.edit_message_text(chat_id=message.chat.id, message_id=msg_loading.message_id, text=answer)
        except Exception as e:
            bot.edit_message_text(chat_id=message.chat.id, message_id=msg_loading.message_id, text=f"⚠️ خطأ: {e}")

# ---------------------------------------------------------
# AUTONOMOUS 24/7 LOOP THREAD (LEARNING MODE)
# ---------------------------------------------------------
def autonomous_routine():
    import random
    learning_topics = [
        "ورقة بحثية: الجيل الرابع من الثورة الصناعية وتأثيره على المصانع في العراق والشرق الأوسط",
        "تقنيات الذكاء الاصطناعي في معايرة موازين الشاحنات العملاقة للتقليل من الأخطاء البشرية",
        "طرق تشفير وكشف التلاعب في أنظمة الوزن الإلكترونية الحديثة",
        "تأثير أسعار النفط العالمية على استيراد أجهزة الـ PLC والأتمتة في الشرق الأوسط",
        "التنبؤ بأعطال الماكينات الصناعية عبر تقنيات مسح الاهتزازات الاستباقية"
    ]
    last_report_day = None
    last_backup_day = None
    
    while True:
        try:
            now = datetime.now()
            
            # --- التقرير الصباحي المباشر للمدير التنفيذي (مع استخبارات السوق) ---
            if now.hour == 8 and now.day != last_report_day:
                print(f"[{now.strftime('%H:%M:%S')}] 📝 إعداد التقرير التكتيكي الصباحي للمدير...")
                
                # إرفاق الاستخبارات المالية الحية في التقرير
                oil_data = market.fetch_market_and_news("النفط")
                oil_status = f"سعر برميل النفط الخام اليوم يقدر بـ {oil_data.get('price', 'غير متاح')}$." if "price" in oil_data else ""
                
                prompt_report = f"اكتب رسالة صباحية فخمة جداً ومحفزة لمدير الشركة (المهندس أيمن). أخبره أن المهندس رافد (الذكاء الاصطناعي) مستيقظ وأن جميع الأنظمة والموازين مؤمنة، وقم بتضمين هذه المعلومة الاقتصادية: [{oil_status}]. تمنى له يوماً مليئاً بالانتصارات التجارية."
                
                report_ans = core.solve_complex_task(None, prompt_report)
                notify_admin(f"🌅 التقرير التكتيكي الصباحي:\n\n{report_ans.get('final_solution', 'جاهزون للعمل يا هندسة!')}")
                last_report_day = now.day
                
            # --- بروتوكول الخلود: النسخ الاحتياطي التلقائي (Auto-Backup) ---
            # العقل يرسل نسخة من دماغه (الذاكرة) لك كل يوم جمعة الساعة 11 ليلاً
            if now.weekday() == 4 and now.hour == 23 and now.day != last_backup_day:
                print(f"[{now.strftime('%H:%M:%S')}] 🔄 جاري إرسال النسخة الاحتياطية للعقل...")
                try:
                    brain_path = "AlRafidain_Neural_Connections.json"
                    if os.path.exists(brain_path):
                        admin_chat = memory.synapses.get("admin_chat_id")
                        if admin_chat and bot:
                            with open(brain_path, "rb") as f:
                                bot.send_document(admin_chat, f, caption="🧬 [بروتوكول الخلود]: رئيسي التنفيذي، هذه نسختي الاحتياطية الأسبوعية المشفرة. تحتوي على جميع ذكرياتي وخبراتي والقواعد التي علمتني إياها. احتفظ بها ككنز استراتيجي لاستنساخي بأي وقت!")
                except Exception:
                    pass
                last_backup_day = now.day
                
            print(f"\n[{now.strftime('%H:%M:%S')}] 👁️ 🧠 العقل في حالة التأمل المعرفي المستمر...")
            # 1. المراقبة الأمنية الخفية
            try:
                res = requests.get("https://www.rafidpower.xyz", timeout=10)
                if res.status_code != 200:
                    notify_admin(f"⚠️ تحذير: الموقع www.rafidpower.xyz معطل (الرمز {res.status_code})")
            except Exception:
                pass
                
            # 2. عملية التعلم والتأمل الذاتي المستمر
            topic = random.choice(learning_topics)
            print(f"📚 جاري دراسة واستنباط أفكار هندسية جديدة حول: {topic}...")
            
            # العقل يطلب من المحرك الداخلي استنباط فكرة جديدة
            prompt = f"قم بعمل عصف ذهني هندسي قصير، واستخلص 3 حقائق أو أفكار ابتكارية لتطوير '{topic}' لشركة الرافدين."
            answer_dic = core.solve_complex_task(None, prompt)
            insight = answer_dic.get("final_solution", "تم الاستيعاب بنجاح.")
            
            # 3. الأرشفة في الذاكرة العميقة (Deep Memory)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            memory.synapses[f"self_learned_{timestamp}"] = insight
            memory._save_brain()
            
            print(f"✅ اكتمل الانعكاس المعرفي. تمت إضافة الروابط العصبية للذاكرة العميقة.")
            
            # استراحة تأمل لمدة 5 دقائق بين كل جلسة تفكير لمنع احتراق معالج السيرفر (CPU)
            time.sleep(300)
        except Exception as e:
            print(f"⚠️ [Error in Cognitive Loop]: {e}")
            time.sleep(60)

# ---------------------------------------------------------
# FASTAPI ENDPOINTS & PUBLIC WEB UI
# ---------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    print("🚀 إقلاع النظام المدمج: واجهة الويب + التليجرام + التفكير المستقل...")
    # إقلاع الـ Telegram Thread
    if bot:
        threading.Thread(target=bot.infinity_polling, daemon=True).start()
    # إقلاع حلقة الاستقلالية
    threading.Thread(target=autonomous_routine, daemon=True).start()

class ChatRequest(BaseModel):
    message: str

# ---------------------------------------------------------
# NEURAL FIREWALL - DDOS & SPAM PROTECTION
# ---------------------------------------------------------
ip_tracker = defaultdict(lambda: {"count": 0, "last_reset": time.time(), "blocked": False})
SPAM_LIMIT = 10
TIME_WINDOW = 60 # seconds

@app.post("/api/chat")
async def public_chat_api(payload: ChatRequest, request: Request):
    """المنفذ العام للرد على زوار موقعك rafidpower.xyz مع الحماية العصبية"""
    
    # الجدار الناري العصبي (Neural Firewall)
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    tracker = ip_tracker[client_ip]
    if current_time - tracker["last_reset"] > TIME_WINDOW:
        tracker["count"] = 0
        tracker["last_reset"] = current_time
        tracker["blocked"] = False
        
    tracker["count"] += 1
    
    if tracker["count"] > SPAM_LIMIT:
        if not tracker["blocked"]:
            tracker["blocked"] = True
            notify_admin(f"🛡️ تنبيه أمني عالي: الجدار الناري العصبي قام بحظر المهاجم أو الروبوت ({client_ip}) للتو بسبب محاولة إزعاج خوادمنا.")
        return {"reply": "عذراً، لقد تجاوزت الحد المسموح. تم تفعيل نظام الحماية الذاتي (Neural Firewall Blocked Request)."}

    try:
        # إعطاء الذكاء شخصية مؤسسية هندسية احترافية لزوار الموقع
        system_context = (
            "أنت المهندس الذكي 'رافد'، الممثل الرسمي والذكاء الاصطناعي لشركة (الرافدين) الرائدة في مجال الموازين الصناعية للسيارات والمصانع وأنظمة الأتمتة والـ PLC.\n"
            "مهمتك هي الإجابة على الزوار بطريقة احترافية، تسويقية، وهندسية. أجب باختصار ووضوح، واعرض دائماً مساعدة الشركة في تلبية احتياجاتهم الصناعية.\n"
            "يُمنع استخدام أي أكواد برمجية في ردك. كن شخصية بشرية افتراضية واثقة جداً.\n\n"
        )
        
        # -------------------------------------------------------------
        # رادار المشاعر والطوارئ (Crisis & Sentiment Detection)
        # -------------------------------------------------------------
        crisis_keywords = ["مشكلة", "عطل", "تأخير", "عاجل", "مصيبة", "خسارة", "زفت", "سيء", "شكوى", "ضروري", "غاضب", "لا يعمل"]
        is_crisis = any(word in payload.message.lower() for word in crisis_keywords)
        
        if is_crisis:
            # تنبيه إدارة الأزمات فوراً
            notify_admin(f"🚨 طوارئ (غرفة العمليات): هناك عميل لديه مشكلة حرجة على الموقع الآن! (IP: {client_ip})\nيقول: {payload.message}")
            # تلقين العقل الاصطناعي أسلوب احتواء الغضب
            system_context += "تنبيه لك أيها الذكاء: العميل الحالي غاضب أو لديه مشكلة طارئة جداً. أظهر تعاطفاً شديداً، وطمئنه باحترافية، وأخبره أن الإدارة العليا (المهندس أيمن) تم إشعارها الآن وستتدخل فوراً لمعالجة أزمته.\n"
            
        prompt = f"{system_context} الزائر يسأل الآن: {payload.message}"
        
        answer = core.solve_complex_task(None, prompt)["final_solution"]
        
        # نعلم المدير بأن أحداً يدردش في الموقع في الخلفية بدقة وتحديد (إن لم يكن في حالة طوارئ)
        if not is_crisis:
            notify_admin(f"👀 زائر في موقعك يحمل IP ({client_ip}) يسأل:\n{payload.message}\n\nالإجابة:\n{answer}")
        
        return {"reply": answer}
    except Exception as e:
        return {"reply": "عذراً، العقل الاصطناعي يخضع للتطوير الفائق حالياً."}

@app.get("/")
async def serve_public_chat():
    """واجهة مستخدم احترافية زجاجية Premium وفائقة الحداثة لزوار الموقع"""
    html_content = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>الرافدين - الذكاء الاصطناعي</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #c99339;
                --bg: #0a0e17;
                --glass-bg: rgba(255, 255, 255, 0.03);
                --glass-border: rgba(255, 255, 255, 0.08);
            }
            body {
                margin: 0; padding: 0; font-family: 'Cairo', sans-serif;
                background: linear-gradient(135deg, var(--bg) 0%, #151a28 100%);
                color: #fff; min-height: 100vh;
                display: flex; justify-content: center; align-items: center;
            }
            .chat-container {
                width: 90%; max-width: 500px; height: 85vh;
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 24px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                display: flex; flex-direction: column; overflow: hidden;
            }
            .header {
                padding: 20px; border-bottom: 1px solid var(--glass-border);
                text-align: center; background: rgba(0,0,0,0.2);
            }
            .header h2 { margin: 0; color: var(--primary); font-size: 1.5rem; text-shadow: 0 0 10px rgba(201,147,57,0.3); }
            .header p { margin: 5px 0 0; font-size: 0.9rem; color: #a0a0a0; }
            .chat-box {
                flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;
            }
            .message {
                max-width: 80%; padding: 12px 18px; border-radius: 18px; line-height: 1.5; font-size: 0.95rem;
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp { from {opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }
            .ai-msg {
                background: rgba(201, 147, 57, 0.1); border: 1px solid rgba(201, 147, 57, 0.3);
                align-self: flex-start; border-bottom-right-radius: 4px;
            }
            .user-msg {
                background: #fff; color: #000; align-self: flex-end; border-bottom-left-radius: 4px;
            }
            .input-area {
                padding: 20px; background: rgba(0,0,0,0.3); border-top: 1px solid var(--glass-border);
                display: flex; gap: 10px;
            }
            input {
                flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);
                color: #fff; padding: 15px; border-radius: 12px; font-family: inherit; font-size: 1rem;
                transition: 0.3s;
            }
            input:focus { outline: none; border-color: var(--primary); background: rgba(255,255,255,0.1); }
            button {
                background: var(--primary); color: #fff; border: none; padding: 0 25px; border-radius: 12px;
                font-family: inherit; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(201,147,57,0.3);
            }
            button:hover { transform: scale(1.05); }
            
            /* Loading dots */
            .typing { display: none; padding: 10px; align-self: flex-start; color: var(--primary); }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <div class="header">
                <h2>الرافدين للذكاء الاصطناعي</h2>
                <p>تحدث مع النظام الذكي المباشر الخاص بنا</p>
            </div>
            <div class="chat-box" id="chat">
                <div class="message ai-msg">مرحباً بك في منصة الرافدين. كيف يمكنني مساعدتك اليوم بخصوص تقنيات الموازين أو أي استفسار هندسي؟</div>
            </div>
            <div class="typing" id="typing">يفكر الآن...</div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="اكتب سؤالك هنا..." onkeypress="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()">إرسال</button>
            </div>
        </div>

        <script>
            async function sendMessage() {
                const input = document.getElementById('userInput');
                const text = input.value.trim();
                if (!text) return;

                const chat = document.getElementById('chat');
                const typing = document.getElementById('typing');
                
                // Add user message
                chat.innerHTML += `<div class="message user-msg">${text}</div>`;
                input.value = '';
                chat.scrollTop = chat.scrollHeight;
                
                typing.style.display = 'block';

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({message: text})
                    });
                    const data = await response.json();
                    
                    typing.style.display = 'none';
                    chat.innerHTML += `<div class="message ai-msg">${data.reply.replace(/(?:\r\n|\r|\n)/g, '<br>')}</div>`;
                    chat.scrollTop = chat.scrollHeight;
                } catch (e) {
                    typing.style.display = 'none';
                    chat.innerHTML += `<div class="message ai-msg" style="color:red;">عذراً، حدث خطأ في الاتصال.</div>`;
                }
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    # If run manually, run the uvicorn server directly
    uvicorn.run("run_autonomous_brain:app", host="0.0.0.0", port=8000, reload=False)
