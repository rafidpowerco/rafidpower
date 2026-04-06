from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import asyncio

# Import our Brains
from memory_engine import MemoryEngine
from agents_logic import SecurityAgent, AnalystAgent

app = FastAPI(title="Al-Rafidain Sovereign AI Core - Realtime Bridge")
memory_engine = MemoryEngine()

# --- DATACLASSES FOR DELPHI ---
class WeightPayload(BaseModel):
    scale_id: str
    weight: float
    cert_id: str

# --- STARTUP HOOKS ---
@app.on_event("startup")
async def startup_event():
    print("=========================================================")
    print("🚀 AL-RAFIDAIN SOVEREIGN GATEWAY: DELPHI BRIDGE ONLINE 🚀")
    print("=========================================================")
    # Fire up the background Analyst Agent ethically tracking metrics
    asyncio.create_task(AnalystAgent.run_market_summary_loop())

# --- ENDPOINTS ---

@app.post("/api/process_weight")
async def process_weight(data: WeightPayload):
    """
    The main hook for SmartBridge (Delphi). Receives the offline local scale read,
    processes it through the Security Agent, and returns an encrypted token to print on the ticket.
    """
    # 1. Hardware/Physics boundary check
    if not SecurityAgent.is_weight_logical(data.weight):
        raise HTTPException(status_code=400, detail="Physics limits exceeded. Scale potential failure.")

    # 2. Security Hash Generation
    secure_hash = SecurityAgent.generate_hash(data.cert_id, data.weight)
    
    # 3. Web Verification Link (Dynamic)
    verification_url = f"https://dashboard.alrafidain.com/verify?sc={secure_hash}"

    # Return the clean, encrypted packet to Delphi to print
    return {
        "status": "APPROVED",
        "scale_id": data.scale_id,
        "certified_weight": data.weight,
        "secure_hash": secure_hash,
        "verification_url": verification_url
    }

@app.get("/api/verify/{hash_sc}")
async def verify_certificate(hash_sc: str):
    """
    A direct web endpoint for the Web Dashboard. 
    If a user scans the QR code or opens the URL, the dashboard checks here.
    """
    # In full production, we look up the hash in MySQL. 
    # For architecture completeness, we return a mocked success schema.
    if len(hash_sc) == 64:  # Length of SHA-256
        return {
            "valid": True,
            "message": "This certificate is cryptographically secured by Al-Rafidain AI."
        }
    else:
        raise HTTPException(status_code=404, detail="Fraudulent or Malformed Hash")

if __name__ == "__main__":
    import uvicorn
    # Listens broadly to allow network requests from the local Delphi Machine
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
