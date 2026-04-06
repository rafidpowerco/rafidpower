import os
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

class VectorLongTermMemory:
    """
    نظام الذاكرة طويلة المدى للوكلاء الأذكياء (Long-Term Vector Memory)
    يعتمد على قاعدة بيانات ChromaDB المتجهة لتخزين المعرفة واسترجاعها دلالياً.
    """
    
    _instance = None  # لضمان عدم فتح أكثر من اتصال بقاعدة البيانات (Singleton Pattern)

    def __new__(cls):
        # التوجيه التجاري: تخزين الذاكرة المتجهة في APPDATA
        app_data_path = os.path.join(os.getenv('APPDATA', os.path.dirname(__file__)), "RafidainAGI", "VectorMemory")
        
        if cls._instance is None:
            cls._instance = super(VectorLongTermMemory, cls).__new__(cls)
            cls._instance._initialize_db(app_data_path)
        return cls._instance

    def _initialize_db(self, db_path):
        """
        تقوم هذه الدالة بتهيئة قاعدة البيانات المتجهة وإنشاء المجلد الخاص بها في حال لم يكن موجوداً.
        """
        try:
            # التأكد من وجود مسار تخزين الذاكرة
            if not os.path.exists(db_path):
                os.makedirs(db_path)
                
            # إعداد العميل (Client) ليعمل محلياً ويسجل البيانات على القرص الصلب
            self.client = chromadb.PersistentClient(path=db_path)
            
            # استخدام دالة التضمين الافتراضية (يمكن استبدالها لاحقاً بـ OpenAI أو Gemini)
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
            
            # إنشاء أو جلب "مجموعة البيانات" (Collection) الخاصة بذاكرة الشركة
            self.collection = self.client.get_or_create_collection(
                name="rafidain_core_memory",
                embedding_function=self.embedding_function,
                metadata={"description": "الذاكرة المركزية لشركة الرافدين للوكلاء الأذكياء"}
            )
            print("[+] تم تهيئة نظام الذاكرة طويلة المدى المتجهة (ChromaDB) بنجاح.")
        except Exception as e:
            print(f"[!] خطأ كارثي أثناء تهيئة الذاكرة المتجهة: {str(e)}")
            self.client = None

    def save_knowledge(self, document_id: str, topic: str, deep_analysis: str, agent_name: str = "System"):
        """
        دالة لحفظ المعرفة أو التحليلات العميقة داخل الذاكرة.
        
        المدخلات:
        document_id: معرف فريد للمعلومة (مثل timestamp).
        topic: عنوان أو موضوع التحليل (يستخدم كـ Metadata).
        deep_analysis: النص الكامل للتحليل الفني أو الاستراتيجي.
        agent_name: الوكيل الذي قام باكتشاف هذه المعلومة.
        """
        if not self.client:
            print("[-] لا يمكن الحفظ، قاعدة البيانات غير متصلة.")
            return False

        try:
            # دمج المعرفة في قاعدة البيانات
            self.collection.add(
                documents=[deep_analysis],
                metadatas=[{"topic": topic, "source_agent": agent_name}],
                ids=[document_id]
            )
            print(f"[+] تمت إضافة معرفة جديدة للذاكرة العميقة بعنوان: {topic}")
            return True
        except Exception as e:
            print(f"[!] خطأ أثناء حفظ المعرفة في قاعدة البيانات المتجهة: {str(e)}")
            return False

    def recall_knowledge(self, query: str, n_results: int = 2):
        """
        دالة للبحث الدلالي (Semantic Search) واسترجاع أقرب المعلومات المتعلقة بسؤال أو موضوع معين.
        
        المدخلات:
        query: السؤال أو الموضوع المراد البحث عنه.
        n_results: عدد النتائج (التجارب السابقة) المراد استرجاعها.
        
        المخرجات:
        نص مجمع يحتوي على خبرات النظام السابقة حول هذا الموضوع.
        """
        if not self.client:
            return "[-] ذاكرة النظام معطلة حالياً."

        try:
            # إجراء البحث الدلالي داخل قاعدة البيانات
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # التحقق مما إذا كانت هناك نتائج
            if not results["documents"] or not results["documents"][0]:
                return "لم يتم العثور على أية ذكريات أو تحليلات سابقة حول هذا الموضوع."

            # تجميع النتائج في نص منسق
            recalled_memory = "💡 [استرجاع من الذاكرة العميقة]:\n"
            for idx, document in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][idx]
                topic = meta.get("topic", "موضوع غير معروف")
                agent = meta.get("source_agent", "وكيل مجهول")
                
                recalled_memory += f"\n- من ذاكرة ({agent}) حول موضوع [{topic}]:\n"
                recalled_memory += f"  {document}\n"
            
            return recalled_memory
            
        except Exception as e:
            print(f"[!] خطأ أثناء البحث واسترجاع المعرفة: {str(e)}")
            return "[-] حدث خطأ أثناء محاولة تذكر المعلومات."

# =====================================================================
# منطقة الاختبار الذاتي للنظام (للتأكد من الجاهزية للإنتاج)
# =====================================================================
if __name__ == "__main__":
    import time
    
    print("=== بدء اختبار نظام الذاكرة طويلة المدى ===")
    
    # 1. تهيئة الذاكرة
    brain_memory = VectorLongTermMemory()
    
    # 2. توليد معرّف فريد
    doc_id = f"mem_{int(time.time())}"
    
    # 3. حفظ تجربة سابقة معقدة (كمثال لحفظ أوزان شاحنات أو نظام PLC)
    experience_text = (
        "عند ربط نظام PLC من نوع Siemens S7-1200 بجهاز الوزن، واجهنا مشكلة تأخير في قراءة الحساسات (Latency). "
        "تم الحل عن طريق تعديل معدل البود (Baud Rate) إلى 115200 وتصفية التشويش باستخدام كابلات محمية (Shielded Cables)."
    )
    
    is_saved = brain_memory.save_knowledge(
        document_id=doc_id,
        topic="مشاكل ربط PLC مع موازين الشاحنات",
        deep_analysis=experience_text,
        agent_name="المهندس الاستراتيجي"
    )
    
    # 4. محاولة تذكر المشكلة وحلها من قبل وكيل آخر بعد فترة
    print("\n--- بعد مرور وقت طويل ---")
    question = "كيف يمكننا حل مشكلة بطء استجابة حساسات الوزن المرتبطة بنظام سيمنز؟"
    print(f"السؤال الوارد للوكيل بخصوص الموضوع: {question}")
    
    # 5. استرجاع الذاكرة
    answer_from_memory = brain_memory.recall_knowledge(query=question, n_results=1)
    print("\nالنتيجة من الذاكرة:")
    print(answer_from_memory)
    print("\n=== اكتمل الاختبار التلقائي للنظام بنجاح ===")
