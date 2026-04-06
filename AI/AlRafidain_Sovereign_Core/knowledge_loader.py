import os
import glob
from memory_engine import MemoryEngine

try:
    import PyPDF2
    HAS_PDF = True
except ImportError:
    HAS_PDF = False
    print("PyPDF2 not installed. PDFs will be skipped. Run 'pip install PyPDF2'")

class KnowledgeLoader:
    """
    TASK 1: DATA INGESTION
    Reads manuals (.pdf), code (.pas), and specs (.txt) from data_vault/ 
    and embeds them into ChromaDB.
    """
    def __init__(self, memory: MemoryEngine, vault_path: str = "./data_vault"):
        self.memory = memory
        self.vault_path = vault_path
        if not os.path.exists(self.vault_path):
            os.makedirs(self.vault_path)

    def extract_pdf_text(self, filepath: str) -> str:
        if not HAS_PDF: return ""
        text = ""
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text

    def chunk_and_store(self, filename: str, content: str, file_type: str):
        chunk_size = 1500
        overlap = 200
        length = len(content)
        
        for i in range(0, length, chunk_size - overlap):
            chunk = content[i:i + chunk_size]
            doc_id = f"{filename}_chunk_{i}"
            
            self.memory.store_knowledge(
                doc_id=doc_id,
                text=chunk,
                metadata={"file": filename, "type": file_type}
            )

    def run_ingestion(self):
        print(f"📖 Scanning {self.vault_path} for engineering files...")
        
        for root, _, files in os.walk(self.vault_path):
            for file in files:
                filepath = os.path.join(root, file)
                ext = file.lower().split('.')[-1]
                
                if ext == "pdf":
                    content = self.extract_pdf_text(filepath)
                    self.chunk_and_store(file, content, "manual")
                    print(f"✅ Ingested PDF Manual: {file}")
                    
                elif ext in ["pas", "txt", "md"]:
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                        self.chunk_and_store(file, content, "source_code" if ext=="pas" else "specs")
                        print(f"✅ Ingested Text/Code: {file}")
                    except Exception as e:
                        print(f"❌ Failed to read {file}: {e}")

if __name__ == "__main__":
    memory = MemoryEngine()
    loader = KnowledgeLoader(memory)
    loader.run_ingestion()
