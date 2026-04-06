import os
import subprocess
import time
import re
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DESKTOP_URL_FILE = os.path.join(os.path.expanduser("~"), "Desktop", "رابط_الدخول_للذكاء_الاصطناعي.txt")

def consume_pipe(pipe):
    try:
        for _ in pipe:
            pass
    except Exception:
        pass

def start_system():
    print("[1] BOOTING SOVEREIGN NEURAL CORE...")
    d_proc = subprocess.Popen(["python", "agi_master_api.py"], cwd=BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print("[2] INITIALIZING TELEGRAM GUARDIAN...")
    t_proc = subprocess.Popen(["python", "run_telegram_bot.py"], cwd=BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print("[2.5] INJECTING MAESTRO IMMORTAL LOOP DAEMON...")
    vbs_path = os.path.join(BASE_DIR, "START_MAESTRO_SERVICE.vbs")
    if os.path.exists(vbs_path):
        subprocess.Popen(["cscript", "//nologo", "START_MAESTRO_SERVICE.vbs"], cwd=BASE_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    time.sleep(3)
    
    print("[3] ESTABLISHING GLOBAL CLOUD TUNNEL...")
    c_path = os.path.join(BASE_DIR, "cloudflared.exe")
    if os.path.exists(c_path):
        tunnel_proc = subprocess.Popen([c_path, "tunnel", "--url", "http://127.0.0.1:9000"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, cwd=BASE_DIR)
        for line in tunnel_proc.stdout:
            match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
            if match:
                url = match.group(0)
                with open(DESKTOP_URL_FILE, "w", encoding="utf-8") as f:
                    f.write(f"الرابط الآمن المباشر للوصول من هاتفك خارج المنزل:\n\n{url}\n")
                threading.Thread(target=consume_pipe, args=(tunnel_proc.stdout,), daemon=True).start()
                break

    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        d_proc.terminate()
        t_proc.terminate()
        if 'tunnel_proc' in locals():
            tunnel_proc.terminate()

if __name__ == "__main__":
    start_system()
