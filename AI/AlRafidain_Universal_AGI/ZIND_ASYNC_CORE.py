import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List

from llm_engine import UniversalLLMEngine
from plugin_vector_memory import VectorLongTermMemory, StateManager
from llm_engine import UniversalLLMEngine
from plugin_vector_memory import VectorLongTermMemory, StateManager
from system_prompts import ZIND_PROMPTS
from plugin_security import ZindSecurityVault
from plugin_sandbox import IsolateSandbox
# 1. Enterprise Logging (JSON Format)
# ==========================================
class EnterpriseJSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "system": "ZIND_Orchestrator",
            "module": record.module,
            "message": record.getMessage(),
        }
        return json.dumps(log_record)

def setup_logger(name: str = "ZIND") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(EnterpriseJSONFormatter())
        logger.addHandler(handler)
    return logger

# ==========================================
# 2. Message Bus (Inter-Agent Communication)
# ==========================================
@dataclass
class Message:
    sender: str
    receiver: str  # "broadcast" لإرسال الرسالة لجميع الوكلاء
    topic: str     # نوع المهمة (مثل: fact_check, correlate_data, code_exec)
    payload: Any
    timestamp: float = field(default_factory=time.time)

class MessageBus:
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.subscribers: Dict[str, asyncio.Queue] = {}

    def register(self, agent_id: str, queue: asyncio.Queue):
        self.subscribers[agent_id] = queue
        self.logger.info(f"Registered Agent: [{agent_id}]")

    async def publish(self, message: Message):
        self.logger.debug(f"Routing [{message.topic}] from {message.sender} to {message.receiver}")
        if message.receiver == "broadcast":
            for agent_id, queue in self.subscribers.items():
                if agent_id != message.sender:
                    await queue.put(message)
        elif message.receiver in self.subscribers:
            await self.subscribers[message.receiver].put(message)
        else:
            self.logger.error(f"Agent {message.receiver} not found on the bus!")

# ==========================================
# 3. Base Agent Architecture
# ==========================================
class BaseAgent:
    def __init__(self, agent_id: str, bus: MessageBus, logger: logging.Logger):
        self.agent_id = agent_id
        self.bus = bus
        self.logger = logger
        self.security = ZindSecurityVault() # نظام التشفير العسكري
        self.inbox = asyncio.Queue()
        self.bus.register(self.agent_id, self.inbox)

    async def send(self, receiver: str, topic: str, payload: Any):
        # تحويل الـ payload إلى تشفير فوري باستخدام Vault
        encrypted_payload = self.security.encrypt_payload(payload)
        msg = Message(sender=self.agent_id, receiver=receiver, topic=topic, payload=encrypted_payload)
        await self.bus.publish(msg)

    async def listen(self):
        self.logger.info(f"Agent [{self.agent_id}] is online and listening.")
        try:
            while True:
                msg: Message = await self.inbox.get()
                
                # فك التشفير بمجرد استلام الرسالة لتستطيع معالجتها
                if isinstance(msg.payload, str) and getattr(self, "security", None):
                    try:
                        msg.payload = self.security.decrypt_payload(msg.payload)
                    except Exception as e:
                        self.logger.error(f"[{self.agent_id}] Decryption failed! Kill switch might be active: {e}")
                        
                await self.process_message(msg)
                self.inbox.task_done()
        except asyncio.CancelledError:
            self.logger.warning(f"Agent [{self.agent_id}] shutting down (Kill Switch Activated).")

    async def process_message(self, message: Message):
        raise NotImplementedError("Must be implemented by subclasses")

    async def _ask_llm(self, role: str, payload: Any, task_type: str = "format_json") -> dict:
        """دالة مساعدة لمعالجة نصوص الـ Prompts وتحليل הـ JSON أوتوماتيكياً (DRY Principle)"""
        prompt = ZIND_PROMPTS[role].format(payload=payload)
        llm = UniversalLLMEngine()
        response_text = await llm.generate(prompt, task_type=task_type)
        try:
            clean_json = response_text.strip("` \n").replace("json\n", "")
            return json.loads(clean_json)
        except json.JSONDecodeError:
            self.logger.error(f"[{self.agent_id}] Failed to parse JSON. Raw LLM output: {response_text}")
            return {"error": "Failed to parse JSON", "raw": response_text}

# ==========================================
# 4. ZIND Autonomous Agents
# ==========================================
class ResearcherAgent(BaseAgent):
    def __init__(self, agent_id: str, bus: MessageBus, logger: logging.Logger, memory: VectorLongTermMemory):
        super().__init__(agent_id, bus, logger)
        self.memory = memory

    async def process_message(self, message: Message):
        if message.topic == "fact_check":
            query = message.payload['query']
            self.logger.info(f"[{self.agent_id}] Checking Semantic Memory for: {query}")
            
            # 1. التذكر الدلالي (RAG): هل واجهنا هذا من قبل؟
            past_experiences = await self.memory.recall_knowledge(query)
            
            if "لم يتم العثور" not in past_experiences and past_experiences.strip():
                self.logger.info(f"[{self.agent_id}] Found answer in Semantic Memory! Bypassing LLM API.")
                await self.send(message.sender, "fact_result", {"verified": True, "source": "ZIND_Memory", "content": past_experiences})
            else:
                self.logger.info(f"[{self.agent_id}] No memory found. Querying Universal LLM Engine...")
                try:
                    # صياغة الأمر (Prompt Engineering) لإجبار النموذج وتوفير استهلاك الـ Tokens
                    system_prompt = f"""
                    You are ZIND Researcher Agent. 
                    Analyze the following query and provide a factual result.
                    Respond strictly in JSON format with keys: 'verified' (boolean) and 'findings' (string).
                    Query: {query}
                    """
                    llm = UniversalLLMEngine()
                    # استدعاء المحرك بشكل متزامن طبيعي الآن لأنه مبني بـ Async
                    response = await llm.generate(system_prompt, task_type="fact_check")
                    self.logger.info(f"[{self.agent_id}] Native Async LLM Response Received successfully.")
                    
                    await self.send(
                        receiver=message.sender, 
                        topic="fact_result", 
                        payload={"verified": True, "content": response}
                    )
                except Exception as e:
                    self.logger.error(f"[{self.agent_id}] LLM Query failed: {str(e)}")
                    await self.send(message.sender, "fact_error", {"error": str(e)})

class ProcessorAgent(BaseAgent):
    async def process_message(self, message: Message):
        if message.topic == "raw_data":
            result = await self._ask_llm("Processor", message.payload, task_type="format_json")
            self.logger.info(f"[{self.agent_id}] Processed Data. Anomaly Score: {result.get('anomaly_score')}")
            await self.send("Analyst", "concept_data", result)

class AnalystAgent(BaseAgent):
    async def process_message(self, message: Message):
        if message.topic == "concept_data":
            result = await self._ask_llm("Analyst", message.payload, task_type="complex_reasoning")
            self.logger.info(f"[{self.agent_id}] Analyzed Data. Action: {result.get('action_type')}")
            if result.get("action_type") in ["requires_execution", "requires_research"]:
                await self.send("Executor", "execute_action", result)

class ExecutorAgent(BaseAgent):
    def __init__(self, agent_id: str, bus: MessageBus, logger: logging.Logger):
        super().__init__(agent_id, bus, logger)
        try:
            self.sandbox = IsolateSandbox()
        except Exception as e:
            self.logger.warning(f"[{self.agent_id}] Docker is offline. Sandbox disabled: {e}")
            self.sandbox = None

    async def process_message(self, message: Message):
        if message.topic == "execute_action":
            result = await self._ask_llm("Executor", message.payload, task_type="write_python_code")
            self.logger.info(f"[{self.agent_id}] Generated Script: {result.get('script_name')}")
            
            script_code = result.get("python_code", "")
            
            if self.sandbox and script_code:
                self.logger.info(f"[{self.agent_id}] Pushing code to Docker Sandbox...")
                # عملية العزل ثقيلة على المعالج، لذا نشغلها في Thread منفصل
                execution_result = await asyncio.to_thread(self.sandbox.execute_code, script_code)
                self.logger.info(f"[{self.agent_id}] Execution Finished. Status: {execution_result.get('status')}")
                result["execution"] = execution_result
            else:
                self.logger.warning(f"[{self.agent_id}] Skipping execution (No Sandbox/Code).")
                await asyncio.sleep(1) # محاكاة
                result["execution"] = {"status": "skipped", "output": "sandbox disabled"}

            await self.send("Learner", "execution_result", result)

class LearnerAgent(BaseAgent):
    """الضمير التقني: يراقب ويحسن الأداء باستمرار باستخدام نوعين من الذاكرة"""
    def __init__(self, agent_id: str, bus: MessageBus, logger: logging.Logger, memory: VectorLongTermMemory, state: StateManager):
        super().__init__(agent_id, bus, logger)
        self.memory = memory
        self.state = state

    async def process_message(self, message: Message):
        if message.topic == "execution_result":
            task_id = str(uuid.uuid4())
            result_data = message.payload
            
            # 1. حفظ الحالة النهائية في الذاكرة السريعة (Redis) إذا كانت متاحة
            if self.state:
                try:
                    await self.state.save_task_state(task_id, result_data)
                    self.logger.info(f"[{self.agent_id}] Saved Task State to Redis (ID: {task_id}).")
                except Exception as e:
                    self.logger.warning(f"[{self.agent_id}] Failed to save to Redis (Ignoring Cache).")
            
            # 2. استخلاص العبرة وحفظها في الذاكرة الدلالية العميقة (ChromaDB / Pinecone)
            experience_summary = f"Task Completion Summary: {result_data.get('log', 'No logs')}. Execution was successful."
            
            await self.memory.save_knowledge(
                document_id=task_id,
                topic="System Autonomous Execution",
                deep_analysis=experience_summary,
                agent_name=message.sender
            )
            self.logger.info(f"[{self.agent_id}] New experience encoded and saved to Semantic Vector Router.")

# ==========================================
# 5. ZIND Orchestrator (The Core)
# ==========================================
class ZindOrchestrator:
    def __init__(self):
        self.logger = setup_logger()
        self.bus = MessageBus(self.logger)
        self.agents: List[BaseAgent] = []
        self._tasks: List[asyncio.Task] = []
        self._setup_agents()

    def _setup_agents(self):
        """تهيئة وكلاء ZIND وإمدادهم بالذواكر المركزية"""
        system_memory = VectorLongTermMemory()
        
        try:
            system_state = StateManager()
        except:
            system_state = None
            
        self.agents.append(ResearcherAgent("Researcher", self.bus, self.logger, system_memory))
        self.agents.append(ProcessorAgent("Processor", self.bus, self.logger))
        self.agents.append(AnalystAgent("Analyst", self.bus, self.logger))
        self.agents.append(ExecutorAgent("Executor", self.bus, self.logger))
        self.agents.append(LearnerAgent("Learner", self.bus, self.logger, system_memory, system_state))

    async def start_system(self):
        self.logger.info("Initializing ZIND OS...")
        self._tasks = [asyncio.create_task(agent.listen()) for agent in self.agents]
        
        # محاكاة لتدفق بيانات حقيقي يدخل النظام
        await self._simulate_external_input()
        
        await asyncio.gather(*self._tasks, return_exceptions=True)

    async def _simulate_external_input(self):
        """محاكاة لدخول بيانات خام من العالم الخارجي ليبدأ الوكلاء بالعمل"""
        await asyncio.sleep(1)
        self.logger.info("External Input received. Triggering Researcher Agent...")
        # نطلب من الباحث أن يجيبنا عبر محرك الـ LLM الحقيقي!
        temp_agent = BaseAgent("ExternalAPI", self.bus, self.logger)
        
        # رسالة واقعية تسأل الذكاء الاصطناعي عن الحساسات
        await temp_agent.send("Researcher", "fact_check", {
            "query": "What are the common causes of Load Cell voltage drops in industrial weighbridges?"
        })

    async def kill_switch(self):
        """بروتوكول القتل: إيقاف فوري وتشفير/مسح الذاكرة العشوائية"""
        self.logger.warning("!!! KILL SWITCH ACTIVATED !!! Halting all agents.")
        for task in self._tasks:
            task.cancel()
        await asyncio.gather(*self._tasks, return_exceptions=True)
        self.logger.info("System Offline. Stealth mode engaged.")

# ==========================================
# Entry Point
# ==========================================
async def main():
    zind = ZindOrchestrator()
    
    try:
        # تشغيل النظام لمدة 20 ثانية لنسمح لمحرك LLM بإرجاع الجواب
        await asyncio.wait_for(zind.start_system(), timeout=20.0)
    except asyncio.TimeoutError:
        await zind.kill_switch()

if __name__ == "__main__":
    asyncio.run(main())
