import os
import sys
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
import time
import subprocess
import threading
from daily_command_center import DailyCommandCenter

def launch_api_server():
    print("🚀 إطلاق سيرفر الواجهة البرمجية (AGI Master API) في الخلفية...")
    # يطلق الـ API الذي يسمح للهواتف والبرامج بالتحدث مع العقل
    subprocess.run(["python", "-m", "uvicorn", "agi_master_api:app", "--host", "0.0.0.0", "--port", "9000"])

def launch_command_center():
    print("🛡️ إطلاق مركز القيادة الاستراتيجي (اليومي والمالي والفيزيائي)...")
    time.sleep(3) # إعطاء السيرفر وقتاً للنهوض
    commander = DailyCommandCenter()
    
    # الحلقة الدائمة لإدارة الشركة والمصنع برمجياً بصمت
    while True:
        try:
            commander.daily_briefing()
            time.sleep(3600)  # يتم تكرار الفحص الشامل للمعمل والاقتصاد كل ساعة
        except KeyboardInterrupt:
            print("\n🛑 تم إيقاف العقل بأمر المشغل البشري.")
            break
        except Exception as e:
            print(f"⚠️ تحذير بسيط تم تجاوزه ذاتياً: {e}")
            time.sleep(60)

if __name__ == "__main__":
    os.system("cls" if os.name == "nt" else "clear")
    print("""
    ██████╗  █████╗ ███████╗██╗██████╗  █████╗ ██╗███╗   ██╗
    ██╔══██╗██╔══██╗██╔════╝██║██╔══██╗██╔══██╗██║████╗  ██║
    ██████╔╝███████║█████╗  ██║██║  ██║███████║██║██╔██╗ ██║
    ██╔══██╗██╔══██║██╔══╝  ██║██║  ██║██╔══██║██║██║╚██╗██║
    ██║  ██║██║  ██║██║     ██║██████╔╝██║  ██║██║██║ ╚████║
    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
    
         [ SOVEREIGN UNIVERSAL ARTIFICIAL INTELLIGENCE ]
         [ BUILT BY ENG. AYMAN AND ANTIGRAVITY PARTNER ]
    """)
    print("========================================================================\n")
    
    # 1. Thread for the Universal API
    api_thread = threading.Thread(target=launch_api_server, daemon=True)
    api_thread.start()
    
    # 2. Main Process manages the factory & economics
    launch_command_center()
