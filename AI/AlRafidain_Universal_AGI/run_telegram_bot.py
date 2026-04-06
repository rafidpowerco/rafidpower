import os
import telebot
from universal_agents import UniversalAgentCore
from llm_engine import UniversalLLMEngine
from plugin_market_live import MarketPlugin

# 1. قراءة التوكن بأسهل طريقة للمستخدم
token_file = os.path.join(os.path.dirname(__file__), "telegram_bot_token.txt")

if not os.path.exists(token_file):
    print("🛑 العطل: القابس مفقود! لم يتم العثور على ملف telegram_bot_token.txt")
    print("الرجاء وضع التوكن في الملف ثم إعادة التشغيل.")
    exit(1)

with open(token_file, 'r', encoding='utf-8') as f:
    TELEGRAM_TOKEN = f.read().strip()

if not TELEGRAM_TOKEN or "ضع_التوكن_هنا" in TELEGRAM_TOKEN:
    print("🛑 العطل: التوكن غير صالح! الرجاء وضع كود التوكن الحقيقي داخل الملف.")
    exit(1)

print("⏳ جاري استنهاض العقل المركزي وتوصيله بشبكة تليجرام...")
llm = UniversalLLMEngine(provider="local_ollama", model="llama3")
brain = UniversalAgentCore(llm)
market = MarketPlugin()
bot = telebot.TeleBot(TELEGRAM_TOKEN)
print("✅ العقل متصل الآن! يمكنك التحدث معه من تطبيق تليجرام في هاتفك.")

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    welcome_msg = (
        "مرحباً بكم في 🌐 (الرافدين AGI Сиادي).\n\n"
        "أنا المساعد الشامل لـ(الجميع)! أجمع بين:\n"
        "🏢 سكرتارية الأعمال.\n"
        "💻 هندسة البرمجيات.\n"
        "📈 استخبارات السوق والأسهم.\n\n"
        "اكتب لي أي مسألة، أو اطلب تحليل سهم (مثل: الذهب، ابل)، أو اطلب صيغة رسالة لعميل!"
    )
    bot.reply_to(message, welcome_msg)

@bot.message_handler(func=lambda message: True)
def agi_central_processor(message):
    user_text = message.text
    chat_id = message.chat.id
    
    bot.send_chat_action(chat_id, 'typing')
    msg_loading = bot.reply_to(message, "🧠 جاري العصف الذهني واسترجاع الذكريات لحل معضلتك...")
    
    try:
        # هل المستخدم يطلب تصفح أسهم مالية؟
        trigger_market = any(kw in user_text for kw in ["النفط", "الذهب", "ابل", "تيسلا", "سهم", "سوق", "بورصة", "أسهم"])
        
        if trigger_market:
            bot.edit_message_text(chat_id=chat_id, message_id=msg_loading.message_id, text="🌍 جاري إرسال عناكب الإنترنت لجمع المانشيتات العالمية...")
            market_data = market.fetch_market_and_news(user_text)
            
            if "error" in market_data:
                final_answer = market_data["error"]
            else:
                prompt = (
                    f"حلل بدقة عالية السهم/لمورد من الإنترنت: الهدف: {user_text}\n"
                    f"السعر اللحظي الآن: {market_data['price']} دولار.\n"
                    f"آخر الأخبار: {market_data['news']}\n"
                    "اربط بين الخبر والسعر وأعطني رأياً حاسماً."
                )
                final_answer = brain.solve_complex_task(None, prompt)["final_solution"]
        else:
            # مهام تنفيذية برمجية وسكرتارية ودردشة
            final_answer = brain.solve_complex_task(None, user_text)["final_solution"]
        
        # تليجرام لا يقبل رسائل طويلة جداً كدفعة واحدة (أكثر من 4096 حرف). نقطعها إن لزم
        if len(final_answer) > 4000:
            final_answer = final_answer[:4000] + "... [تم الاقتطاع لضخامة الحجم]"
            
        bot.edit_message_text(chat_id=chat_id, message_id=msg_loading.message_id, text=final_answer)
        
    except Exception as e:
        bot.edit_message_text(chat_id=chat_id, message_id=msg_loading.message_id, text=f"⚠️ عطل سيادي أثناء التفكير: {e}")

if __name__ == "__main__":
    bot.infinity_polling()
