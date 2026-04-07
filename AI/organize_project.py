import os
import shutil
import re

BASE_DIR = r"C:\Users\Administrator\Desktop\my work\rafid-scale-website\AI"

FOLDERS = {
    "core": ["ai_core_nucleus.py", "agi_evolution_core.py", "multi_agent_orchestrator.py", "hybrid_router.py"],
    "agents": ["autonomous_finance_learner.py", "dataset_evolution_engine.py", "massive_dataset_generator.py", "pinn_self_correction.py", "synthetic_data_pipeline.py", "agi_trainer.py", "train_rafid_memory.py"],
    "interfaces": ["web_ai_daemon.py", "delphi_api_bridge.py", "smartbridge_auto_update_protocol.py"],
    "security": ["secure_crypto.py"],
    "database": ["smartbridge_db_architecture.sql", "rafid_cross_domain_dataset_001.json", "rafid_dataset_batch_001.json", "chroma_db_vault"],
    "docs": ["Rafid_SmartBridge_Whitepaper.md", "anti_fraud_math_derivation.md", "agi_learned_insights.txt"],
    "scripts": ["copy_logo.py", "create_desktop_shortcuts.py"],
    "archive": ["AlRafidain_Universal_AGI", "AlRafidain_Sovereign_Core", "AlRafidain_Master_Deliverables", "AGI_Vector_Memory", "AAA"]
}

def organize_files():
    for folder, files in FOLDERS.items():
        folder_path = os.path.join(BASE_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        for item in files:
            source = os.path.join(BASE_DIR, item)
            destination = os.path.join(folder_path, item)
            if os.path.exists(source):
                try:
                    shutil.move(source, destination)
                    print(f"Moved: {item} -> {folder}/")
                except Exception as e:
                    print(f"Error moving {item}: {e}")

def clean_cache():
    for root, dirs, files in os.walk(BASE_DIR):
        if "__pycache__" in dirs:
            cache_path = os.path.join(root, "__pycache__")
            shutil.rmtree(cache_path, ignore_errors=True)
            print(f"Cleaned up {cache_path}")

def secure_api_keys():
    # Simple regex to find common patterns like "API_KEY = 'something'"
    pattern = re.compile(r'(?i)(api_key|token|password|secret)\s*[:=]\s*[\'"]([^\'"]+)[\'"]')
    env_vars = {}
    
    python_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        if "archive" in root:
            continue
        for f in files:
            if f.endswith('.py'):
                python_files.append(os.path.join(root, f))
                
    for filepath in python_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            matches = pattern.findall(content)
            for key, val in matches:
                # Basic check to avoid capturing config lines that are just reading from os.getenv
                if "os.getenv" not in val and len(val) > 5:
                    env_var_name = key.upper()
                    env_vars[env_var_name] = val
                    
        except Exception as e:
            print(f"Error scanning {filepath} for secrets: {e}")
            
    if env_vars:
        env_path = os.path.join(BASE_DIR, '.env')
        # Append to existing or create new
        existing_env = ""
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                existing_env = f.read()
                
        with open(env_path, 'a', encoding='utf-8') as f:
            for k, v in env_vars.items():
                if f"{k}=" not in existing_env:
                    f.write(f"\n{k}={v}")
                    print(f"Secured {k} into .env")

if __name__ == "__main__":
    print("Starting organization and security enforcement...")
    organize_files()
    clean_cache()
    secure_api_keys()
    print("Done! Project structure represents Clean Architecture patterns.")
