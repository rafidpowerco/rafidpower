import hashlib
import time
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import databases
import sqlalchemy

# Configuration and Database setup
DATABASE_URL = "mysql+aiomysql://user:password@localhost:3306/alrafidain_db"
database = databases.Database(DATABASE_URL)
SECRET_CRYPTO_KEY = os.getenv("RAFID_SECURE_KEY", "SUPER_SECRET_RAFID_KEY_2026")

app = FastAPI(title="Al-Rafidain Sovereign AI Backend")

# --- DATA MODELS ---
class WeightPayload(BaseModel):
    certificate_id: str
    scale_serial: str
    exact_weight: float

class AutoUpdateStatus(BaseModel):
    latest_version: str
    download_url: str

# --- 5-AGENT ARCHITECTURE (Stubs for the Framework) ---
class ProcessorAgent:
    """Handles Real-Time Weight Validation"""
    @staticmethod
    async def validate_weight(scale_serial: str, weight: float) -> bool:
        # Check against DB for sudden unrealistic jumps (Fraud Check)
        if weight < 0 or weight > 100000:
            return False
        return True

class LearnerAgent:
    """Maintains logs of all bugs and fraud vectors"""
    @staticmethod
    async def log_fraud_attempt(payload: WeightPayload, fraud_reason: str):
        query = """
        INSERT INTO Anti_Fraud_Logs (certificate_id, scale_serial, attempted_weight, fraud_reason, timestamp)
        VALUES (:cid, :serial, :weight, :reason, :ts)
        """
        values = {"cid": payload.certificate_id, "serial": payload.scale_serial, "weight": payload.exact_weight, "reason": fraud_reason, "ts": datetime.now()}
        # await database.execute(query=query, values=values)
        print(f"🚫 FRAUD LOGGED: {fraud_reason}")

class CryptographyModule:
    """Phase C: Anti-Fraud QR Security System"""
    @staticmethod
    def generate_secure_qr_hash(certificate_id: str, exact_weight: float) -> str:
        date_str = datetime.now().strftime("%Y-%m-%d")
        # Algorithm: Hash(Certificate_ID + Exact_Weight + Date + Secret_Key)
        payload = f"{certificate_id}_{exact_weight}_{date_str}_{SECRET_CRYPTO_KEY}"
        secure_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        return secure_hash

# --- ROUTES ---

@app.on_event("startup")
async def startup():
    # await database.connect()
    print("🚀 Al-Rafidain API Brain Online")

@app.on_event("shutdown")
async def shutdown():
    # await database.disconnect()
    pass

@app.post("/v1/scales/certify")
async def certify_weighing(payload: WeightPayload, background_tasks: BackgroundTasks):
    """
    Called by the Delphi Client. Assesses weight, generates cryptographic QR,
    and signals if an EXE hot-swap auto-update is required.
    """
    # 1. Ask Processor Agent to validate the physics/logic
    is_valid = await ProcessorAgent.validate_weight(payload.scale_serial, payload.exact_weight)
    
    if not is_valid:
        background_tasks.add_task(LearnerAgent.log_fraud_attempt, payload, "Physics Boundary Violation")
        raise HTTPException(status_code=403, detail="Fraud Detected. Weighing rejected.")

    # 2. Phase C: Cryptographic Security
    qr_hash = CryptographyModule.generate_secure_qr_hash(payload.certificate_id, payload.exact_weight)
    
    # 3. Simulate Database Insertion for Certificates
    print(f"✅ Certified {payload.certificate_id} with weight {payload.exact_weight}")
    
    # 4. Phase A: Zero-Installation Protocol Check
    # If a new Delphi EXE is on the server, we tell the client to launch its silent updater.
    needs_update = False 
    
    return {
        "status": "APPROVED",
        "secure_qr_hash": qr_hash,
        "verification_url": f"https://dashboard.alrafidain.com/verify?hash={qr_hash}",
        "auto_update_triggered": needs_update
    }
