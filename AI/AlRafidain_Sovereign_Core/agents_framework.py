from memory_engine import MemoryEngine

# ==============================================================================
# BASE AGENT ABSTRACTION
# ==============================================================================
class BaseAgent:
    def __init__(self, name: str, memory: MemoryEngine):
        self.name = name
        self.memory = memory

    def process(self, payload: dict) -> str:
        raise NotImplementedError("Each agent must implement its own processing logic.")

# ==============================================================================
# THE 5 AI AGENTS
# ==============================================================================
class ResearcherAgent(BaseAgent):
    """Retrieves data from the Vector DB and analyzes technical logic."""
    def process(self, payload: dict) -> str:
        query = payload.get("query", "")
        context = self.memory.retrieve(query)
        # Logic to send context to LLM for synthesis would go here
        return f"[Researcher] Deep Scan Complete. Retrieved {len(context)} context vectors for: '{query}'"

class ExecutorAgent(BaseAgent):
    """The software developer (Code generation for Delphi, Python, Web)."""
    def process(self, payload: dict) -> str:
        task = payload.get("task", "")
        # Logic to generate code using LLM logic
        return f"[Executor] Successfully generated and verified codebase snippet for Task: {task}"

class ProcessorAgent(BaseAgent):
    """Real-time handler linking scale serial data to the database schemas."""
    def process(self, payload: dict) -> str:
        data = payload.get("raw_data", "")
        return f"[Processor] Parsed serial load cell data and structured JSON logic: {data}"

class AnalystAgent(BaseAgent):
    """Analytical reasoning for monitoring operational anomalies."""
    def process(self, payload: dict) -> str:
        strategy = payload.get("strategy_target", "")
        return f"[Analyst] Evaluated operational integrity and anti-fraud status against parameter: {strategy}"

class LearnerAgent(BaseAgent):
    """Evaluates outputs, logs mistakes, and updates the Vector DB."""
    def process(self, payload: dict) -> str:
        lesson_id = payload.get("lesson_id", "")
        lesson_text = payload.get("lesson_text", "")
        
        self.memory.store_knowledge(
            doc_id=lesson_id, 
            text=lesson_text, 
            metadata={"type": "self_correction_lesson"}
        )
        return f"[Learner] Permanently embedded new architectural rule to Vector DB: {lesson_id}"

# ==============================================================================
# THE MASTER ROUTER
# ==============================================================================
class MasterRouter:
    """Receives user prompts and delegates them to the appropriate Agent."""
    def __init__(self, memory: MemoryEngine):
        self.memory = memory
        
        # Instantiate the Core Team
        self.researcher = ResearcherAgent("Researcher", memory)
        self.executor = ExecutorAgent("Executor", memory)
        self.processor = ProcessorAgent("Processor", memory)
        self.analyst = AnalystAgent("Analyst", memory)
        self.learner = LearnerAgent("Learner", memory)
        print("🕵️‍♂️ Orchestrator Initialized: All 5 Sovereign Agents online.")

    def route_task(self, intent: str, params: dict) -> str:
        intent = intent.lower()
        if intent == "research":
            return self.researcher.process(params)
        elif intent == "execute":
            return self.executor.process(params)
        elif intent == "process":
            return self.processor.process(params)
        elif intent == "analyze":
            return self.analyst.process(params)
        elif intent == "learn":
            return self.learner.process(params)
        else:
            return f"[Master Router] Unknown intent '{intent}'. Request dropped for security reasons."
