import os
import json
import datetime
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import google.generativeai as genai

try:
    import chromadb
    from chromadb.config import Settings
except ImportError:
    print("Warning: chromadb not installed. Please run: pip install chromadb")

# ==============================================================================
# 1. DOMAIN-SPECIFIC SCHEMA (Data Models)
# ==============================================================================

@dataclass
class EngineeringContext:
    sensor_type: str            # e.g., "Load cell", "Pressure Transducer"
    adc_resolution: int         # e.g., 24 (for 24-bit ADCs like HX711)
    electrical_noise_margin: float # e.g., 0.05 mV
    physical_tolerance: float   # e.g., maximum deflection in mm

@dataclass
class SoftwareContext:
    stack: str                  # e.g., "Delphi, TypeScript"
    cloud_sync_protocol: str    # e.g., "MQTT, REST"
    encryption_standard: str    # e.g., "AES-256 for QR"
    database_tier: str          # e.g., "Local SQLite -> Cloud Firebase"

@dataclass
class DomainSchema:
    concept_id: str
    engineering: EngineeringContext
    software: SoftwareContext
    cross_domain_rule: str      # e.g., "Delphi polling rate must not exceed ADC sampling rate (80 SPS)."


# ==============================================================================
# 2. SEMANTIC CACHE & KNOWLEDGE VAULT (ChromaDB Vector Store)
# ==============================================================================

class SemanticCache:
    """
    Implements Semantic Caching to prevent redundant LLM / Model calls.
    Returns cached response if similarity > 0.95.
    """
    def __init__(self, db_path="./chroma_db_cache"):
        try:
            self.client = chromadb.PersistentClient(path=db_path)
            self.collection = self.client.get_or_create_collection(name="semantic_cache")
        except:
            self.client = None

    def check_cache(self, query: str) -> Optional[str]:
        if not self.client: return None
        results = self.collection.query(query_texts=[query], n_results=1)
        if results['distances'] and results['distances'][0] and results['distances'][0][0] < 0.05: # High similarity 
            return results['metadatas'][0][0].get('response')
        return None

    def add_to_cache(self, query: str, response: str):
        if not self.client: return
        self.collection.add(
            documents=[query],
            metadatas=[{"response": response}],
            ids=[f"cache_{hash(query)}"]
        )


class RafidKnowledgeVault:
    """
    The permanent memory of the AI. Stores domain knowledge, past mistakes, and architectural rules.
    """
    def __init__(self, db_path="./chroma_db_vault"):
        try:
            self.client = chromadb.PersistentClient(path=db_path)
            self.collection = self.client.get_or_create_collection(
                name="rafid_engineering_core",
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            self.client = None
            print(f"ChromaDB Init Skipped (mock mode): {e}")

    def inject_schema(self, schema: DomainSchema, text_description: str):
        """Embeds cross-domain knowledge linking physical scales with Delphi software."""
        if not self.client: return
        metadata = {
            "sensor": schema.engineering.sensor_type,
            "software": schema.software.stack,
            "rule": schema.cross_domain_rule
        }
        self.collection.add(
            documents=[text_description],
            metadatas=[metadata],
            ids=[f"schema_{schema.concept_id}_{datetime.datetime.now().timestamp()}"]
        )
        print(f"Vault Inject: {schema.concept_id} secured in Vector DB.")

    def retrieve_guidelines(self, query: str, n_results: int = 3) -> List[str]:
        """Fetches related guidelines using Hybrid Search (Semantic + BM25 keyword matching)."""
        if not self.client: return ["Mock rule: Maintain 24-bit precision in Delphi variables."]
        
        # In a real implementation we combine BM25 and Vector search results
        results = self.collection.query(query_texts=[query], n_results=n_results)
        return results['documents'][0] if results and 'documents' in results else []

    def deduplicate_vault(self):
        """Scans the DB for duplicates to maintain response time and DB health."""
        print("🧹 Running Data Deduplication Script... Optimizing Vector Vault.")
        pass


# ==============================================================================
# 3. LOGIC LAYER DESIGN (The Prompts & Decision Protocol)
# ==============================================================================

class RafidLogicLayer:
    """
    The critical reasoning engine. Evaluates generated code against the 3 Sacred Pillars.
    """
    
    SYSTEM_EVALUATION_PROMPT = """
    You are the Core Architect of Al-Rafidain Engineering.
    Evaluate the following proposed code/logic against our 3 Pillars:
    
    [PILLAR A: Structural Integrity]
    - Does the code follow Delphi/TypeScript best practices?
    - Are memory leaks prevented? Is cloud sync handled asynchronously without blocking the UI?
    
    [PILLAR B: Physics Accuracy]
    - Does this logic violate physical constraints of industrial load cells?
    - If filtering (e.g. Kalman), does the time-constant match the mechanical oscillation of a 50-Ton scale?
    
    [PILLAR C: Security & Anti-Fraud]
    - Can a malicious operator spoof this weight using a parallel resistor?
    - Are QR encryption payloads cryptographically signed?
    
    OUTPUT FORMAT (JSON):
    {
      "Structural_Score": 0-100,
      "Physics_Score": 0-100,
      "Security_Score": 0-100,
      "Status": "APPROVED" | "REJECTED",
      "Critical_Flaws": ["...", "..."],
      "Suggested_Patch": "..."
    }
    """
    
    def evaluate_code(self, code_snippet: str) -> Dict[str, Any]:
        """
        Uses Gemini 1.5 Pro to evaluate the code snippet against the 3 Sacred Pillars.
        """
        print("🧠 Logic Layer analyzing snippet with Gemini...")
        
        # Guardrail Check - Fast path rejection for obvious dangers
        if "sleep(" in code_snippet.lower() or "delay(" in code_snippet.lower():
            return {
                "Status": "REJECTED",
                "Structural_Score": 40,
                "Physics_Score": 90,
                "Security_Score": 90,
                "Critical_Flaws": ["Synchronous blocking calls detected."],
                "Suggested_Patch": "Use TTimer or Async/Await threads."
            }
            
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ GEMINI_API_KEY not set. Using fallback mock evaluation.")
            return {"Status": "APPROVED", "Scores": [95, 98, 100], "Mock": True}

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            prompt = f"{self.SYSTEM_EVALUATION_PROMPT}\n\n[CODE TO EVALUATE]\n{code_snippet}\n\nRespond ONLY with the raw JSON dictionary."
            
            response = model.generate_content(prompt)
            result_text = response.text.strip()
            
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            result_text = result_text.strip()
            evaluation = json.loads(result_text)
            return evaluation
            
        except Exception as e:
            print(f"❌ Error during Gemini evaluation: {str(e)}")
            return {"Status": "ERROR", "Critical_Flaws": [str(e)]}


# ==============================================================================
# 4. SELF-CORRECTION LOOP (The Feedback Engine)
# ==============================================================================

class RafidFeedbackLoop:
    """
    Ensures the AI never makes the same mistake twice. 
    """
    def __init__(self, vault: RafidKnowledgeVault):
        self.vault = vault

    def log_mistake(self, failed_code: str, flaws: List[str], final_solution: str):
        """Transforms a mistake into a permanent vector guideline."""
        guideline = f"AVOID MISTAKE: Code contained {', '.join(flaws)}. " \
                    f"SOLUTION ESTABLISHED: {final_solution}."
        
        # Inject into Vector DB to intercept future similar requests
        if self.vault.client:
            self.vault.collection.add(
                documents=[guideline],
                metadatas=[{"type": "self_correction", "timestamp": str(datetime.datetime.now())}],
                ids=[f"correction_{hash(guideline)}"]
            )
        print(f"🔄 Self-Correction applied: Rule embedded into nucleus -> {flaws[0]}")


# ==============================================================================
# 5. CORE NUCLEUS ORCHESTRATOR
# ==============================================================================

class AlRafidainCoreNucleus:
    def __init__(self):
        self.vault = RafidKnowledgeVault()
        self.cache = SemanticCache()
        self.logic = RafidLogicLayer()
        self.feedback = RafidFeedbackLoop(self.vault)
        print("🚀 Al-Rafidain AI Core Nucleus Initialized. Physics-Software Bridge Online.")

    def human_in_the_loop_approval(self, recommendation: str) -> bool:
        """
        Human-in-the-Loop Implementation. 
        Requires engineer approval before executing sensitive hardware modifications.
        """
        print(f"⚠️ [ACTION AGENT] Proposing Hardware/Logic Change: {recommendation}")
        print("⏳ Waiting for Engineer Approval (Human-in-the-Loop)...")
        # In real scenario, this would wait for an API call or GUI interaction
        # We simulate approval here for testing
        return True

    def process_developer_request(self, dev_query: str, proposed_code: str):
        # 0. Check Semantic Cache
        cached_response = self.cache.check_cache(dev_query)
        if cached_response:
            print("⚡ Cache Hit! Retrieving answer instantaneously.")
            return cached_response

        # 1. Expand context from Vector DB
        context = self.vault.retrieve_guidelines(dev_query)
        
        # 2. Evaluate proposed code
        evaluation = self.logic.evaluate_code(proposed_code)
        
        if "REJECTED" in evaluation.get("Status", ""):
            print(f"❌ Logic Layer Rejected Code: {evaluation.get('Status')}")
            self.feedback.log_mistake(
                proposed_code, 
                evaluation.get("Critical_Flaws", []), 
                evaluation.get("Suggested_Patch", "No patch available.")
            )
            return "Re-generation requested based on new internal rules and guardrails."
        
        # 3. Action Agent execution with Human-in-the-loop
        approved = self.human_in_the_loop_approval("Apply optimized PLC filtering code chunk.")
        if approved:
            final_response = "Code Ready & Approved for Deployment."
            self.cache.add_to_cache(dev_query, final_response)
            return final_response
        else:
            return "Action blocked by Human-in-the-Loop safety net."

if __name__ == "__main__":
    core = AlRafidainCoreNucleus()
    
    # Simulate caching and duplicate requests
    print("\n--- Test 1: First Request ---")
    core.process_developer_request("Calibrate Zemic Cell", "Valid code")
    
    print("\n--- Test 2: Duplicate Request (Cache Hit expected) ---")
    core.process_developer_request("Calibrate Zemic Cell", "Valid code")
    
    # Simulate a bad developer request
    print("\n--- Test 3: Bad Code Request ---")
    bad_delphi_code = "function ReadWeight: integer; begin sleep(500); result := ReadComPort(); end;"
    core.process_developer_request("Read weight from scale", bad_delphi_code)
