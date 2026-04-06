import os
import hashlib
from typing import List

# Import our Vector Database Engine from Phase 1
from memory_engine import MemoryEngine

try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    print("Warning: langchain library not found. Using native text chunker.")

class RafidKnowledgeIngester:
    """
    PHASE 2: KNOWLEDGE INJECTION
    أداة حقن المعرفة: تقوم بقراءة مجلدات الأكواد (Delphi) وكتالوجات الموازين
    وتقطيعها بذكاء ثم صبّها في الذاكرة الطويلة للذكاء الاصطناعي ليحفظها للأبد.
    """
    def __init__(self, memory_engine: MemoryEngine):
        self.memory = memory_engine
        # تقسيم النصوص الطويلة (مثل الكتالوجات) إلى أجزاء يمكن استيعابها
        if HAS_LANGCHAIN:
            self.splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
        else:
            self.splitter = None

    def _native_chunker(self, text: str, chunk_size: int = 1000) -> List[str]:
        # Fallback if langchain is not present
        return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size - 200)]

    def ingest_delphi_codebase(self, source_directory: str):
        """يقرأ أكواد Delphi الخاصة بالمهندس ليتعلم منها أسلوب البرمجة"""
        print(f"🔍 أداة الحقن: جاري مسح أكواد Delphi في {source_directory}...")
        
        if not os.path.exists(source_directory):
            print(f"⚠️ المسار غير موجود: {source_directory}. يرجى إضافة الملفات إليه.")
            os.makedirs(source_directory, exist_ok=True)
            return

        ingested_count = 0
        for root, _, files in os.walk(source_directory):
            for file in files:
                if file.endswith(('.pas', '.dfm')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            code_content = f.read()
                            
                            doc_id = f"CODE_{hashlib.md5(file_path.encode()).hexdigest()}"
                            
                            self.memory.store_knowledge(
                                doc_id=doc_id,
                                text=code_content,
                                metadata={
                                    "type": "delphi_source",
                                    "filename": file,
                                    "author": "Engineer_Ayman"
                                }
                            )
                            ingested_count += 1
                    except Exception as e:
                        print(f"Error reading {file}: {e}")
                        
        print(f"✅ تم حقن وحفظ {ingested_count} ملفات برمجية (Delphi) في جينات الذكاء الاصطناعي.")

    def ingest_scale_catalogs(self, catalogs_directory: str):
        """يقرأ المواصفات الفنية لـ Zemic و Yaohua لتحليل الأعطال مستقبلا"""
        print(f"📖 أداة الحقن: جاري قراءة كتالوجات الموازين من {catalogs_directory}...")
        
        if not os.path.exists(catalogs_directory):
            print(f"⚠️ المسار غير موجود: {catalogs_directory}. تم إنشاؤه. يرجى وضع ملفات النص أو الـ JSON هنا.")
            os.makedirs(catalogs_directory, exist_ok=True)
            return

        # Example for ingesting txt specs
        for root, _, files in os.walk(catalogs_directory):
            for file in files:
                if file.endswith(('.txt', '.json', '.md')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                        # تقسيم الكتلوج لصفحات أو فقرات (Chunks)
                        if self.splitter:
                            chunks = self.splitter.split_text(content)
                        else:
                            chunks = self._native_chunker(content)
                            
                        for i, chunk in enumerate(chunks):
                            chunk_id = f"CATALOG_{file}_{i}"
                            self.memory.store_knowledge(
                                doc_id=chunk_id,
                                text=chunk,
                                metadata={
                                    "type": "hardware_specs",
                                    "brand": "Zemic/Yaohua",
                                    "chapter": f"part_{i}"
                                }
                            )
        print(f"✅ تم استيعاب الكتالوجات بنجاح. العقل المهندس أصبح خبيراً في صيانة الموازين.")

if __name__ == "__main__":
    print("=========================================================")
    print("🚀 بدء تدشين المرحلة 2: حقن المعرفة (KNOWLEDGE INJECTION)")
    print("=========================================================")
    
    # 1. تنشيط ذاكرة العقل العملاق
    core_memory = MemoryEngine()
    
    # 2. حرق الأداة وبدء الاستيعاب الميكانيكي
    ingester = RafidKnowledgeIngester(core_memory)
    
    # Paths where you will throw your Delphi files and manual specs
    delphi_path = "./Training_Data/Delphi_Source_Codes"
    catalogs_path = "./Training_Data/Hardware_Catalogs"
    
    ingester.ingest_delphi_codebase(delphi_path)
    ingester.ingest_scale_catalogs(catalogs_path)
    
    print("\n[المرحلة 2 أُنجزت]: العقل الذكي جاهز الآن للدخول في المرحلة 3 (الجسر الرقمي).")
