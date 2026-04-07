import os
import json
import urllib.request
import urllib.error
import time
import asyncio
import logging
from typing import Optional
from abc import ABC, abstractmethod

try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False
from abc import ABC, abstractmethod

# Configure professional logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("LLMEngine")

class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Providers defining the strict interface."""
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        pass

    def execute_request_with_retry(self, req: urllib.request.Request, retries: int = 3) -> Optional[dict]:
        """A robust HTTP execution wrapper with exponential backoff."""
        for attempt in range(retries):
            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    if response.getcode() == 200:
                        return json.loads(response.read().decode('utf-8'))
            except urllib.error.HTTPError as he:
                logger.warning(f"HTTP Error {he.code}: {he.reason} on attempt {attempt + 1}")
            except Exception as e:
                logger.warning(f"Network error: {e} on attempt {attempt + 1}")
            
            # Exponential backoff
            time.sleep(2 ** attempt)
        
        logger.error("All HTTP retry attempts failed.")
        return None

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing! Using Mock Mode for Gemini.")
            self.mock_mode = True
        elif not HAS_GENAI:
            logger.warning("google-generativeai SDK is not installed. Using Mock Mode for Gemini.")
            self.mock_mode = True
        else:
            self.mock_mode = False
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            
            self.safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }

    async def generate(self, prompt: str, max_retries: int = 3) -> str:
        if getattr(self, "mock_mode", False):
            await asyncio.sleep(1)
            # نُعيد استجابة وهمية (Mock) تتطابق مع متطلبات الـ JSON للوكلاء حتى لا ينهار النظام
            return '{"status": "mock_success", "findings": "Running in Mock Mode. API Key missing.", "verified": true, "anomaly_score": 0.0, "extracted_concepts": ["mock"]}'
        delay = 2
        for attempt in range(max_retries):
            try:
                logger.debug(f"Calling Native Gemini API (Attempt {attempt + 1}/{max_retries})...")
                response = await self.model.generate_content_async(
                    prompt,
                    safety_settings=self.safety_settings
                )
                return response.text
                
            except Exception as e:
                error_msg = str(e)
                logger.warning(f"Gemini API Error: {error_msg}")
                if "429" in error_msg or "503" in error_msg or "Quota" in error_msg:
                    if attempt < max_retries - 1:
                        logger.info(f"Rate limit hit. Waiting {delay} seconds before retry...")
                        await asyncio.sleep(delay)
                        delay *= 2
                    else:
                        logger.error("Max retries reached. API is currently unavailable.")
                        return '{"error": "API Limit Reached or Unavailable"}'
                else:
                    return f'{{"error": "Internal Model Error: {error_msg}"}}'
        return "Internal Error"

class GeminiProProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing! Using Mock Mode for Gemini Pro.")
            self.mock_mode = True
        elif not HAS_GENAI:
            logger.warning("google-generativeai SDK is not installed. Using Mock Mode for Gemini Pro.")
            self.mock_mode = True
        else:
            self.mock_mode = False
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            
            self.safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }

    async def generate(self, prompt: str, max_retries: int = 3) -> str:
        if getattr(self, "mock_mode", False):
            await asyncio.sleep(1)
            return '{"status": "mock_success", "findings": "Running in Mock Mode. API Key missing.", "verified": true, "anomaly_score": 0.0, "extracted_concepts": ["mock"]}'
        delay = 2
        for attempt in range(max_retries):
            try:
                logger.debug(f"Calling Native Gemini Pro API (Attempt {attempt + 1}/{max_retries})...")
                response = await self.model.generate_content_async(
                    prompt,
                    safety_settings=self.safety_settings
                )
                return response.text
                
            except Exception as e:
                error_msg = str(e)
                logger.warning(f"Gemini Pro API Error: {error_msg}")
                if "429" in error_msg or "503" in error_msg or "Quota" in error_msg:
                    if attempt < max_retries - 1:
                        logger.info(f"Rate limit hit. Waiting {delay} seconds before retry...")
                        await asyncio.sleep(delay)
                        delay *= 2
                    else:
                        logger.error("Max retries reached. API is currently unavailable.")
                        return '{"error": "API Limit Reached or Unavailable"}'
                else:
                    return f'{{"error": "Internal Model Error: {error_msg}"}}'
        return "Internal Error"

class ClaudeProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

    async def generate(self, prompt: str) -> str:
        payload = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(self.url, data=data, headers=self.headers)
        
        response_json = await asyncio.to_thread(self.execute_request_with_retry, req)
        if response_json and "content" in response_json:
            return response_json["content"][0]["text"]
        return "System Warning: Anthropic API failed to return expected parameters."

class OllamaProvider(BaseLLMProvider):
    def __init__(self, model_name: str = "llama3"):
        self.model_name = model_name
        self.url = "http://localhost:11434/api/generate"

    async def generate(self, prompt: str) -> str:
        payload = {"model": self.model_name, "prompt": prompt, "stream": False}
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(self.url, data=data, headers={'Content-Type': 'application/json'})
        
        response_json = await asyncio.to_thread(self.execute_request_with_retry, req)
        if response_json and "response" in response_json:
            return response_json["response"]
        return "System Warning: Local Ollama failed to return expected parameters."

class DeepSeekOpenRouterProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://rafid-scale.com",
            "X-Title": "Rafid Sovereign AGI",
            "Content-Type": "application/json"
        }

    async def generate(self, prompt: str) -> str:
        if not self.api_key:
            return "System Warning: OPENROUTER_API_KEY is missing."
        payload = {
            "model": os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-r1:free"),
            "messages": [{"role": "user", "content": prompt}]
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(self.url, data=data, headers=self.headers)
        response_json = await asyncio.to_thread(self.execute_request_with_retry, req)
        if response_json and "choices" in response_json and len(response_json["choices"]) > 0:
            return response_json["choices"][0]["message"]["content"]
        return "System Warning: DeepSeek via OpenRouter failed to generate a response."

class UniversalLLMEngine:
    """
    Cost-Aware Enterprise-grade Router handling task-based LLM routing dynamically.
    """
    def __init__(self):
        # 1. Local Free Model (Ollama)
        self.ollama = OllamaProvider("llama3")
        
        # 2. OpenRouter (DeepSeek Free for Coding)
        openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        self.deepseek = DeepSeekOpenRouterProvider(openrouter_key)
        
        # 3. Native Gemini (Free for Training/Fast Ops)
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.gemini = GeminiProvider(gemini_key)
        
        # 4. Native Gemini Pro (For Deep Analytics)
        self.gemini_pro = GeminiProProvider(gemini_key)
        
        logger.info("Universal LLM Engine initialized (Distributed Routing + Sovereign Advanced Analytics).")

    async def generate(self, complete_prompt: str, task_type: str = "basic_search") -> str:
        """يختار المحرك بناءً على نوع المهمة وتكلفتها والمستوى الذكي المطلوب"""
        if task_type == "deep_financial_analysis":
            logger.info(f"[LLM Router] Routing complex task '{task_type}' to Gemini 1.5 Pro (Ultra Tier Equivalent)")
            if self.gemini_pro: return await self.gemini_pro.generate(complete_prompt)
            if self.deepseek: return await self.deepseek.generate(complete_prompt)
            return await self.ollama.generate(complete_prompt)
            
        elif task_type == "write_python_code":
            logger.info(f"[LLM Router] Routing coding task '{task_type}' to DeepSeek-R1 (Free/OpenRouter)")
            if self.deepseek: return await self.deepseek.generate(complete_prompt)
            if self.gemini: return await self.gemini.generate(complete_prompt)
            return await self.ollama.generate(complete_prompt)
            
        elif task_type in ["training_generation", "basic_search", "summarize_logs"]:
            logger.info(f"[LLM Router] Routing training/fast task '{task_type}' to Google Gemini (Free Tier)")
            if self.gemini: return await self.gemini.generate(complete_prompt)
            if self.deepseek: return await self.deepseek.generate(complete_prompt)
            return await self.ollama.generate(complete_prompt)
            
        elif task_type in ["format_json", "extract_keywords", "route_message"]:
            logger.info(f"[LLM Router] Routing task '{task_type}' to Local SLM Ollama (Cost: $0.00)")
            return await self.ollama.generate(complete_prompt)
            
        else:
            logger.warning(f"[LLM Router] Unknown task '{task_type}'. Defaulting to Gemini.")
            if self.gemini: return await self.gemini.generate(complete_prompt)
            return await self.ollama.generate(complete_prompt)
