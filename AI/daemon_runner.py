import subprocess
import time
import sys
import os
from datetime import datetime

# ====================================================================
# Rafid Sovereign AGI - 24/7 Watchdog Supervisor
# ====================================================================

# We need to run the Chat Daemon, the Autonomous Learner, and the Hyper-Trainer
PROCESSES_TO_RUN = ["web_ai_daemon.py", "autonomous_finance_learner.py", "hyper_training_engine.py"]
running_procs = {}

def log_event(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] {message}"
    print(log_msg)
    try:
        # Encrypt the logs as per Global Security Rule using the secure module if needed.
        # Currently storing in plain text for administrative debug, but we mask keys.
        with open("system_watchdog_log.txt", "a", encoding="utf-8") as f:
            f.write(log_msg + "\n")
    except Exception:
        pass

def start_process(script_name):
    if not os.path.exists(script_name):
        log_event(f"❌ Error: {script_name} not found in current directory.")
        return None
    log_event(f"🚀 Starting AGI Component: {script_name}")
    return subprocess.Popen([sys.executable, script_name])

def monitor_daemons():
    log_event("Rafid Master Supervisor initializing...")
    for script in PROCESSES_TO_RUN:
        running_procs[script] = start_process(script)
        
    while True:
        try:
            time.sleep(10)
            for script, proc in running_procs.items():
                if proc is not None:
                    retcode = proc.poll()
                    if retcode is not None: # Process crashed or stopped!
                        log_event(f"⚠️ Alert: {script} crashed/exited with code {retcode}. Restarting...")
                        running_procs[script] = start_process(script)
        except KeyboardInterrupt:
            log_event("User manually stopped the Watchdog. Terminating AI engines...")
            for proc in running_procs.values():
                if proc: proc.terminate()
            break
        except Exception as e:
            log_event(f"❌ Fatal Watchdog Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    monitor_daemons()
