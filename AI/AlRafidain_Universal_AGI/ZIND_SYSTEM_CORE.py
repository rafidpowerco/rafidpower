import os
import sys
import threading
import time

# استيراد الوحدات الأساسية لمنظومة ZIND
from ZIND_interactive_chat import main as interactive_chat_main
from ZIND_autonomous_learner import ZindAutonomousLearner

# Console Colors
RESET = "\033[0m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
GREEN = "\033[92m"

def start_autonomous_daemon():
    """
    يشغل محرك التعلم المستقل في الخلفية كشبح (Daemon) دون التدخل في الدردشة
    """
    # نوقف الطباعة الناتجة عن المعلم المستقل قليلاً حتى لا تزعج الدردشة التفاعلية
    # أو نتركه يطبع ليظهر كأن النظام حي ويفكر في نفس الوقت!
    try:
        learner = ZindAutonomousLearner()
        # ننتظر 10 ثوان قبل بدء المراقبة لكي تستقر واجهة الشات أولاً
        time.sleep(10) 
        learner.run_autonomous_loop()
    except Exception as e:
        print(f"\n{YELLOW}[!] خطأ في محرك التعلم المستقل: {e}{RESET}")

def check_api_keys():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"{CYAN}======================================================================{RESET}")
    print(f"{CYAN}  🔥 بـدء تـشغـيـل العـقـدة المـركـزيـة (ZIND Prime Core Node) 🔥  {RESET}")
    print(f"{CYAN}======================================================================{RESET}")
    
    gemini_key = os.getenv("UNIVERSAL_API_KEY")
    claude_key = os.getenv("CLAUDE_API_KEY")
    
    if not gemini_key and not claude_key:
        print(f"{YELLOW}[!] النظام الخارق (Multi-Agent MoE) جاهز. نحتاج لمفتاح API للبدء.{RESET}")
        print("1. للعمل بمعمارية Claude 3 المتقدمة (Anthropic) الصق مفتاحك المبتدئ بـ sk-ant-api...")
        print("2. للعمل بمحرك Gemini (المجاني) الصق مفتاحك هنا.")
        key = input("الصق المفتاح المرغوب هنا (ثم اضغط Enter): ").strip()
        
        if key.startswith("sk-ant"):
            os.environ["CLAUDE_API_KEY"] = key
            print(f"{GREEN}[✓] تم تفويض معمارية Claude الخارقة للعمل بنجاح.{RESET}")
        else:
            os.environ["UNIVERSAL_API_KEY"] = key
            print(f"{GREEN}[✓] تم تفويض معمارية Gemini السحابية بنجاح.{RESET}")

def run_zind_single_node():
    check_api_keys()
    
    print(f"{GREEN}[✓] جاري تفعيل محرك المراقبة المستقلة (يعمل كخيوط خلفية Daemon)...{RESET}")
    
    # 1. إطلاق المراقب المستقل في الخلفية
    daemon_thread = threading.Thread(target=start_autonomous_daemon, daemon=True)
    daemon_thread.start()
    
    time.sleep(2) # انتظار وهمي لتهيئة الخيوط
    print(f"{GREEN}[✓] جاري تفعيل واجهة التخاطب التفاعلية...{RESET}\n")
    time.sleep(1)
    
    # 2. إطلاق الشات التفاعلي على الواجهة الأمامية
    try:
        interactive_chat_main()
    except KeyboardInterrupt:
        print(f"\n{CYAN}[ZIND Prime] جاري إغلاق العقدة المركزية... وداعاً.{RESET}")
        sys.exit(0)

if __name__ == "__main__":
    run_zind_single_node()
