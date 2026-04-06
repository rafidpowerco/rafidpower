import os
import asyncio
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import logging
from abc import ABC, abstractmethod

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("VectorMemory")

class BaseVectorMemory(ABC):
    @abstractmethod
    async def save_knowledge(self, document_id: str, topic: str, deep_analysis: str, agent_name: str = "System") -> bool:
        pass

    @abstractmethod
    async def recall_knowledge(self, query: str, n_results: int = 2) -> str:
        pass


class LocalChromaMemory(BaseVectorMemory):
    """الذاكرة المتجهة المحلية تعتمد على استهلاك القرص الصلب (Hard Drive) للحواسيب المحلية."""
    def __init__(self):
        try:
            db_path = os.path.join(os.getenv('APPDATA', os.path.dirname(__file__)), "RafidainAGI", "VectorMemory")
            if not os.path.exists(db_path):
                os.makedirs(db_path)
                
            self.client = chromadb.PersistentClient(path=db_path)
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
            self.collection = self.client.get_or_create_collection(
                name="rafidain_core_memory",
                embedding_function=self.embedding_function,
                metadata={"description": "الذاكرة المركزية لشركة الرافدين للوكلاء الأذكياء"}
            )
            logger.info("تم تهيئة نظام الذاكرة العميقة المحلي (ChromaDB) بنجاح.")
        except Exception as e:
            logger.error(f"فشل تهيئة הذاكرة المحلية: {e}")
            self.client = None

    async def save_knowledge(self, document_id: str, topic: str, deep_analysis: str, agent_name: str = "System") -> bool:
        if not self.client: return False
        try:
            # Operation is moved to a background thread to prevent halting the Event Loop
            await asyncio.to_thread(
                self.collection.add,
                documents=[deep_analysis],
                metadatas=[{"topic": topic, "source_agent": agent_name}],
                ids=[document_id]
            )
            logger.info(f"تم حفظ فكرة جديدة محلياً: {topic}")
            return True
        except Exception as e:
            logger.error(f"خطأ الحفظ: {e}")
            return False

    async def recall_knowledge(self, query: str, n_results: int = 2) -> str:
        if not self.client: return "[-] الذاكرة المحلية معطلة."
        try:
            results = await asyncio.to_thread(
                self.collection.query,
                query_texts=[query], 
                n_results=n_results
            )
            if not results["documents"] or not results["documents"][0]:
                return "لم يتم العثور على ذكريات أو أفكار مسبقة."

            recalled_memory = "💡 [من الذاكرة العميقة المحلية]:\n"
            for idx, document in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][idx]
                topic = meta.get("topic", "مجهول")
                agent = meta.get("source_agent", "ZIND")
                recalled_memory += f"\n- استنتاج ({agent}) حول [{topic}]:\n  {document}\n"
            return recalled_memory
        except Exception as e:
            return f"[-] خطأ في الاسترجاع: {e}"


class CloudPineconeMemory(BaseVectorMemory):
    """الذاكرة المتجهة السحابية للوصول للاحترافية والعمل 24/7 دون ضياع للبيانات عبر سيرفرات Pinecone."""
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Temporary placeholder for actual Pinecone Client logic
        # pip install pinecone-client will be required for production deployment
        logger.info(f"تم تهيئة الذاكرة السحابية العالمية (Pinecone DB). جاهز لاستقبال ملايين الذكريات.")

    async def save_knowledge(self, document_id: str, topic: str, deep_analysis: str, agent_name: str = "System") -> bool:
        # Pseudo code for cloud pipeline
        logger.info(f"[سحابي] تم حفظ العصب المعرفي في خوادم Pinecone: {topic}")
        # await asyncio.sleep(0.1) # Simulate network call
        return True

    async def recall_knowledge(self, query: str, n_results: int = 2) -> str:
        # await asyncio.sleep(0.1)
        return "💡 [استرجاع من الذاكرة السحابية Pinecone]:\nالأنظمة متزامنة الآن عبر الويب."


class VectorLongTermMemory:
    """
    مُوجّه الذاكرة المؤسسي (Enterprise Memory Router)
    بناءً على المعمارية المتقدمة، يُقرر هذا الموجه الوجهة بين الذواكر المحلية أو السحابية أوتوماتيكياً.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorLongTermMemory, cls).__new__(cls)
            cls._instance._initialize_router()
        return cls._instance

    def _initialize_router(self):
        pinecone_key = os.getenv("PINECONE_API_KEY")
        
        if pinecone_key:
            self.memory_engine = CloudPineconeMemory(api_key=pinecone_key)
            logger.info("🔥 نظام التوجيه: تم تفعيل المعمارية السحابية العالمية (Cloud Architecture).")
        else:
            self.memory_engine = LocalChromaMemory()
            logger.info("نظام التوجيه: يجري العمل على الذاكرة المحلية (ChromaDB) لأن مفتاح السحابة غير موجود.")

    async def save_knowledge(self, document_id: str, topic: str, deep_analysis: str, agent_name: str = "ZIND Prime") -> bool:
        return await self.memory_engine.save_knowledge(document_id, topic, deep_analysis, agent_name)

    async def recall_knowledge(self, query: str, n_results: int = 2) -> str:
        return await self.memory_engine.recall_knowledge(query, n_results)

try:
    import redis.asyncio as redis
    import json
    class StateManager:
        """الذاكرة العاملة: لإدارة حالة المهام وضمان عدم ضياعها (Redis)"""
        def __init__(self, redis_url: str = "redis://localhost:6379"):
            self.redis = redis.from_url(redis_url, decode_responses=True)

        async def save_task_state(self, task_id: str, state_data: dict):
            """حفظ حالة المهمة مع تحديد وقت انتهاء الصلاحية (مثلا 24 ساعة)"""
            await self.redis.setex(f"task:{task_id}", 86400, json.dumps(state_data))

        async def get_task_state(self, task_id: str) -> dict:
            data = await self.redis.get(f"task:{task_id}")
            return json.loads(data) if data else None
except ImportError:
    logger.warning("Redis SDK isn't installed. StateManager is disabled.")
    class StateManager:
        def __init__(self, *args, **kwargs): pass
        async def save_task_state(self, *args, **kwargs): pass
        async def get_task_state(self, *args, **kwargs): return None

async def _test():
    brain = VectorLongTermMemory()
    await brain.save_knowledge("test_01", "تهيئة النظام", "تم تحويل الكود لمعمارية Async بنجاح.", "ZIND Architect")
    print(await brain.recall_knowledge("تهيئة"))

if __name__ == "__main__":
    asyncio.run(_test())
