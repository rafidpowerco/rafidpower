import os
import chromadb
from chromadb.config import Settings
from typing import List

class MemoryEngine:
    """
    THE LONG-TERM MEMORY (The Knowledge Vault)
    Handles Retrieval-Augmented Generation (RAG) using ChromaDB vector database.
    """
    def __init__(self, db_path: str = "./alrafidain_chroma_vault"):
        self.db_path = db_path
        # Initialize persistent client for local storage
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Create or load the core knowledge collection
        self.collection = self.client.get_or_create_collection(
            name="rafid_core_knowledge",
            metadata={"hnsw:space": "cosine"}
        )
        print(f"🧠 MemoryEngine initialized at vault: {self.db_path}")

    def store_knowledge(self, doc_id: str, text: str, metadata: dict = None):
        """
        Ingests text, code, or engineering documents into the vector memory.
        """
        if metadata is None:
            metadata = {}
            
        self.collection.upsert(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )
        print(f"📥 Knowledge stored: {doc_id}")

    def retrieve(self, query: str, n_results: int = 3) -> List[str]:
        """
        Retrieves the most semantically relevant knowledge based on the query.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        if not results['documents']:
            return []
            
        return results['documents'][0]
