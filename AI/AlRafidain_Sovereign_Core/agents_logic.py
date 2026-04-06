import hashlib
import asyncio
from datetime import datetime

class SecurityAgent:
    """
    SECURITY LOGIC
    Analyzes weight bounds and generates an immutable Cryptographic QR Hash.
    """
    SECRET_KEY = "RAFIDAIN_SOVEREIGN_SECRET_2026"

    @staticmethod
    def generate_hash(cert_id: str, exact_weight: float) -> str:
        # We lock the data using the exact date of generation
        date_str = datetime.now().strftime("%Y-%m-%d")
        
        # Payload combining the certificate, numeric weight, date, and deep secret
        payload = f"{cert_id}_{exact_weight}_{date_str}_{SecurityAgent.SECRET_KEY}"
        
        # SHA-256 for military-grade immutability
        secure_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        return secure_hash

    @staticmethod
    def is_weight_logical(weight: float) -> bool:
        # A quick physics/hardware check. If a truck scale reads more than 150 Tons, it's likely broken.
        if weight < 0 or weight > 150000:
            return False
        return True


class AnalystAgent:
    """
    ANALYST LOGIC
    Runs independently in the background, logging market changes purely based on 'no harm' ethics.
    """
    @staticmethod
    async def run_market_summary_loop():
        print("📈 Analyst Agent: Initialized Ethical Background Monitoring.")
        while True:
            # In Phase 2, this will scrape specific industrial commodity prices
            # For now, we simulate the cycle of generating a daily strategic report
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            report = f"[{now}] Market Sync Check. Iron Ore / Wheat prices estimated stable. No actions taken (Ethical Rule)."
            # Normally this would route back to Memory_Engine or a Database.
            # print(report) 
            
            # Runs every 24 hours (simulated as 10 minutes for testing here)
            await asyncio.sleep(600)
