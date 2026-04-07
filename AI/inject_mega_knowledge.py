import chromadb
import time
import json
import glob
import os

print("=========================================================")
print("  Rafid Sovereign AGI - Mega Knowledge Pack Injector     ")
print("=========================================================")

# الاتصال بصندوق الذاكرة (ChromaDB)
chroma_client = chromadb.PersistentClient(path="./chroma_db_vault")
collection = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")

data_folder = "./data"
json_files = glob.glob(os.path.join(data_folder, "rafid_mega_knowledge_pack_*.json"))

if not json_files:
    print(f"⚠️ لا توجد ملفات جاهزة للحقن في مجلد {data_folder}.")
    exit()

total_injected = 0

for file_path in json_files:
    print(f"📖 جاري قراءة ملف المعرفة: {os.path.basename(file_path)}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            pack_data = json.load(f)
            
        docs = []
        metadatas = []
        ids = []
            
        for idx, qa in enumerate(pack_data):
            question = qa.get("q", "")
            answer = qa.get("a", "")
            
            if question and answer:
                doc = f"Q: {question}\nTarget Engineered Answer: {answer}"
                doc_id = f"mega_pack_{os.path.basename(file_path)}_{int(time.time())}_{idx}"
                
                docs.append(doc)
                metadatas.append({"category": "Elite_Ultra_Infusion", "source": "Gemini_Ultra_Manual"})
                ids.append(doc_id)
        
        if docs:
            collection.add(documents=docs, metadatas=metadatas, ids=ids)
            total_injected += len(docs)
            print(f"✅ تم حقن {len(docs)} عصبة معرفية من هذا الملف بنجاح.")
            
    except Exception as e:
        print(f"❌ حدث خطأ أثناء قراءة {file_path}: {e}")

print("---------------------------------------------------------")
print(f"🏆 تمت العملية بنجاح! رافد الآن يتذكر {total_injected} فكرة هندسية وبرمجية إضافية عميقة.")
print("بإمكانك طلب باقات (Packs) جديدة من Gemini دائمًا ووضعها في مجلد Data ثم تشغيل هذا السكربت.")
