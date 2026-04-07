"""
╔══════════════════════════════════════════════════════════════════╗
║   RAFID SOVEREIGN AGI - MASTER KNOWLEDGE INJECTION ENGINE       ║
║   يحقن جميع حزم المعرفة في ذاكرة ChromaDB مع دعم التفكير العميق ║
╚══════════════════════════════════════════════════════════════════╝
"""

import json
import os
import time
import chromadb
import glob
import hashlib

# ─────────────────────────────────────────────
# الإعداد الأساسي
# ─────────────────────────────────────────────
KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "data")
CHROMA_PATH   = os.path.join(os.path.dirname(__file__), "chroma_db_vault")

print("=" * 65)
print("  🧠 RAFID AGI - MASTER KNOWLEDGE INJECTOR v2.0")
print("  التفكير العميق + المنطق + الأسلوب الخاص")
print("=" * 65)

# اتصال ChromaDB
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

# مجموعتان: عامة + تفكير عميق
general_col  = chroma_client.get_or_create_collection(name="rafid_cognitive_memory")
reasoning_col = chroma_client.get_or_create_collection(name="rafid_deep_reasoning")

# ─────────────────────────────────────────────
# دالة إنشاء ID فريد من محتوى السؤال
# ─────────────────────────────────────────────
def make_id(text: str, prefix: str = "know") -> str:
    h = hashlib.md5(text.encode("utf-8")).hexdigest()[:12]
    return f"{prefix}_{h}"

# ─────────────────────────────────────────────
# دالة حقن ملف JSON واحد
# ─────────────────────────────────────────────
def inject_knowledge_file(filepath: str) -> dict:
    filename = os.path.basename(filepath)
    pack_name = filename.replace(".json", "")
    
    # تحديد الفئة من اسم الملف
    if "economics"    in filename: category = "Macro_Economics"
    elif "stocks"     in filename: category = "Stock_Market"
    elif "web_ai"     in filename: category = "Web_AI_Finance"
    elif "logical"    in filename: category = "Logical_Thinking"
    elif "reasoning"  in filename: category = "Deep_Reasoning"
    elif "philosophy" in filename: category = "Philosophy"
    elif "physics"    in filename: category = "Physics"
    elif "automation" in filename: category = "Automation"
    elif "cybernetics"in filename: category = "Cybernetics"
    else: category = "General_Knowledge"
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"  ⚠️  فشل قراءة {filename}: {e}")
        return {"injected": 0, "failed": 1}
    
    injected = 0
    failed   = 0
    
    docs_general   = []
    meta_general   = []
    ids_general    = []
    
    docs_reasoning = []
    meta_reasoning = []
    ids_reasoning  = []
    
    for item in data:
        q        = item.get("q", "").strip()
        a        = item.get("a", "").strip()
        thinking = item.get("thinking", "").strip()
        
        if not q or not a:
            failed += 1
            continue
        
        # ── الوثيقة الرئيسية (Q+A) ──
        main_doc = f"السؤال: {q}\n\nالإجابة: {a}"
        main_id  = make_id(q, prefix="qa")
        
        docs_general.append(main_doc)
        meta_general.append({
            "category": category,
            "pack": pack_name,
            "has_thinking": "true" if thinking else "false"
        })
        ids_general.append(main_id)
        
        # ── وثيقة التفكير (إذا وُجدت) ──
        if thinking:
            reasoning_doc = (
                f"السؤال: {q}\n\n"
                f"[منهجية التفكير]: {thinking}\n\n"
                f"[الإجابة النهائية]: {a}"
            )
            r_id = make_id(q, prefix="think")
            docs_reasoning.append(reasoning_doc)
            meta_reasoning.append({
                "category": category,
                "pack": pack_name,
                "type": "deep_reasoning"
            })
            ids_reasoning.append(r_id)
        
        injected += 1
    
    # حقن الدُفعة في ChromaDB (مع تجنب التكرار بـ upsert)
    if docs_general:
        try:
            general_col.upsert(
                documents=docs_general,
                metadatas=meta_general,
                ids=ids_general
            )
        except Exception as e:
            print(f"  ⚠️  خطأ في الحقن العام: {e}")
    
    if docs_reasoning:
        try:
            reasoning_col.upsert(
                documents=docs_reasoning,
                metadatas=meta_reasoning,
                ids=ids_reasoning
            )
        except Exception as e:
            print(f"  ⚠️  خطأ في حقن التفكير: {e}")
    
    return {"injected": injected, "failed": failed}

# ─────────────────────────────────────────────
# الحقن الشامل لكل الحزم
# ─────────────────────────────────────────────
def run_master_injection():
    pattern = os.path.join(KNOWLEDGE_DIR, "rafid_mega_knowledge_pack_*.json")
    files   = sorted(glob.glob(pattern))
    
    if not files:
        print(f"\n  ❌ لا توجد حزم في: {KNOWLEDGE_DIR}")
        return
    
    print(f"\n  📦 عدد الحزم المكتشفة: {len(files)}\n")
    
    total_injected = 0
    total_failed   = 0
    
    for i, filepath in enumerate(files, 1):
        name = os.path.basename(filepath)
        print(f"  [{i:02d}/{len(files):02d}] 💉 {name}")
        
        result = inject_knowledge_file(filepath)
        total_injected += result["injected"]
        total_failed   += result["failed"]
        
        status = f"        ✅ {result['injected']} خبرة محقونة"
        if result["failed"]:
            status += f" | ⚠️ {result['failed']} فشلت"
        print(status)
        
        # استراحة قصيرة لحماية الذاكرة
        time.sleep(0.1)
    
    # ─── الإحصائيات الختامية ───
    total_general   = general_col.count()
    total_reasoning = reasoning_col.count()
    
    print("\n" + "=" * 65)
    print("  🎯 اكتملت عملية الحقن الشاملة!")
    print(f"  ✅ إجمالي الخبرات المحقونة: {total_injected}")
    if total_failed:
        print(f"  ⚠️  إجمالي الفاشلة:          {total_failed}")
    print(f"\n  📚 إجمالي ذاكرة رافد العامة:      {total_general:,} وثيقة")
    print(f"  🧠 إجمالي ذاكرة التفكير العميق:   {total_reasoning:,} وثيقة")
    print("=" * 65)
    print("\n  رافد الآن يفكر، يحلل، ويجيب بأسلوبه الخاص. 🚀")
    print("=" * 65)


# ─────────────────────────────────────────────
# دالة اختبار: جرّب سؤالاً على الذاكرة الحية
# ─────────────────────────────────────────────
def test_memory_query(question: str, n=2):
    print(f"\n  🔍 اختبار الذاكرة: '{question[:50]}...'")
    
    results = general_col.query(
        query_texts=[question],
        n_results=n
    )
    
    for idx, doc in enumerate(results["documents"][0]):
        meta = results["metadatas"][0][idx]
        print(f"\n  [{idx+1}] [{meta.get('category','?')}]")
        print(f"      {doc[:200]}...")
    
    # فحص التفكير العميق
    r_results = reasoning_col.query(
        query_texts=[question],
        n_results=1
    )
    if r_results["documents"][0]:
        print(f"\n  🧠 تفكير عميق مطابق:")
        print(f"      {r_results['documents'][0][0][:300]}...")


# ─────────────────────────────────────────────
# التشغيل
# ─────────────────────────────────────────────
if __name__ == "__main__":
    run_master_injection()
    
    # اختبار سريع بعد الحقن
    print("\n" + "-" * 65)
    print("  🧪 اختبار الذاكرة بعد الحقن...")
    print("-" * 65)
    test_memory_query("كيف أحلل سهم شركة وأعرف قيمته الحقيقية؟")
