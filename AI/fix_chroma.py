import sqlite3

db_path = "./chroma_db_vault/chroma.sqlite3"
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("UPDATE embedding_metadata SET string_value = 'Fixed_Domain' WHERE key = 'domain'")
    cursor.execute("UPDATE embedding_metadata SET string_value = 'Fixed_Category' WHERE key = 'category'")
    
    conn.commit()
    print("Metadata fixed successfully.")
except Exception as e:
    print(e)
