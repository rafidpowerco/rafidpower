import os
import json
import time
from typing import List
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

print("=========================================================")
print("  Rafid Sovereign AGI - Infinite Fine-Tuning Generator   ")
print("  (Automating the generation of the 3000 Cases Moat)     ")
print("=========================================================")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("❌ خطأ: لم يتم العثور على مفتاح GEMINI_API_KEY حقيقي.")
    exit(1)

client = genai.Client(api_key=api_key)
MODEL_ID = "gemini-1.5-pro"

# Define the precise schema to force the AI to return exactly what we want without markdown
class TrainingSample(BaseModel):
    instruction: str
    context: str
    response: str

class DatasetBatch(BaseModel):
    samples: List[TrainingSample]

PROMPT = """
# Role: Industrial AI Training Expert & Senior Software Architect
# Project: Rafid AI Specialized Fine-tuning Dataset Generation
# Domain: Industrial Weighing Systems & Smart Bridge Management

## Context:
I am developing "Rafid AI", a specialized model for industrial scale management and calibration.
The goal is to create a "Behavioral Ownership" layer and a "Data Moat" that makes this AI an expert in industrial maintenance and weighing software logic.

## The Constitution (Golden Rule):
All software solutions generated must adhere to the "Single EXE" principle:
- No external dependencies.
- No complex installations.
- All logic must be contained within a single executable environment.

## Target Knowledge Areas (The Niche):
1. Scale Calibration: Procedures based on OIML R76 standards.
2. Load Cell Troubleshooting: Multi-sensor balance issues and signal noise.
3. Rafid SmartBridge Logic: Real-time cloud synchronization, API integration, and QR code ticketing.
4. Maintenance: Preventive maintenance schedules for industrial weighing bridges.

## Task: 
Generate a fresh batch of 50 highly unique, extremely technical, and diverse training samples. 
The tone must be: Professional, Engineering-focused, and Security-conscious.
DO NOT REPEAT standard answers. Make them complex real-world scenarios.
"""

def generate_batch(batch_number: int):
    print(f"\n⏳ وجاري العمل على استخراج الباتش رقم {batch_number} (يحتوي على 50 حالة معمارية هندسية)...")
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=PROMPT,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DatasetBatch,
                temperature=0.8, # Higher temperature for more diverse scenarios
            )
        )
        
        output = json.loads(response.text.strip())
        return output.get("samples", [])
    except Exception as e:
        print(f"⚠️ خطأ أثناء توليد الباتش: {e}")
        return []

def mass_generate():
    output_filename = "rafid_specialized_finetuning_dataset.json"
    target_count = 3000
    batch_size = 50
    current_dataset = []

    # Load existing if available
    if os.path.exists(output_filename):
        with open(output_filename, "r", encoding="utf-8") as f:
            try:
                current_dataset = json.load(f)
            except:
                current_dataset = []

    print(f"📁 عدد السيناريوهات الحالية في القاعدة: {len(current_dataset)}")
    
    needed_batches = (target_count - len(current_dataset)) // batch_size
    if needed_batches <= 0:
        print("✅ تم الوصول للهدف (3000 حالة). لا حاجة للمزيد.")
        return

    print(f"🚀 سيتم توليد {needed_batches} باتش للوصول للهدف النهائي...")

    # Let's do 1 batch for now to demonstrate the power, 
    # the user can loop this on the VPS indefinitely.
    new_samples = generate_batch(1)
    if new_samples:
        current_dataset.extend(new_samples)
        
        with open(output_filename, "w", encoding="utf-8") as f:
            json.dump(current_dataset, f, indent=4, ensure_ascii=False)
            
        print(f"✅ تم بنجاح! تم حفظ الـ 50 حالة بشكل JSON منظم. العدد الإجمالي الآن: {len(current_dataset)}")

if __name__ == "__main__":
    mass_generate()
