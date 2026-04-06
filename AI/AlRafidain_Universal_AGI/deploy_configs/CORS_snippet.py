from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Al-Rafidain Sovereign AGI Core")

# --- CORS CONFIGURATION ---
# IMPORTANT: Defines who can communicate with the API core.
# Origins can be restricted to specific IPs or domains in strict production.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://api.rafidpower.xyz",
    "https://rafidpower.xyz",
    "https://www.rafidpower.xyz",
    # "*" can be used for initial testing to allow the Delphi Desktop App
    # and Web Dashboard to connect without origin restrictions.
    "*"  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allows all headers
)
# --------------------------

@app.get("/")
async def root():
    return {"status": "Al-Rafidain AGI Core Online"}
