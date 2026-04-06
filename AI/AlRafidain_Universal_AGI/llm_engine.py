import json
import os
import urllib.request
import urllib.error

class UniversalLLMEngine:
    """
    محرك العصبونات (LLM Engine).
    يقوم بالاتصال بأي مصدر للذكاء (بشكل أساسي Ollama المحلي لتجنب تكاليف السحابة).
    """
    def __init__(self, provider="local_ollama", model="llama3"):
        self.provider = provider
        self.model = model
        self.ollama_url = "http://localhost:11434/api/generate"
        self.api_key = os.getenv("UNIVERSAL_API_KEY", "")

    def generate(self, complete_prompt: str) -> str:
        if self.provider == "local_ollama":
            return self._call_ollama(complete_prompt)
        elif self.provider == "gemini":
            return self._call_cloud(complete_prompt)
        else:
            return "مُحاكاة التفكير: المحرك غير مرتبط. يُرجى تفعيل Ollama."

    def _call_ollama(self, prompt: str) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        try:
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(self.ollama_url, data=data, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=300) as response:
                if response.getcode() == 200:
                    response_body = response.read().decode('utf-8')
                    return json.loads(response_body).get("response", "")
                else:
                    return "Ollama Error. هل قمت بتشغيل السيرفر المحلي؟"
        except Exception as e:
            # Fallback for architectural demonstration if no LLM installed yet
            return f"[نص مولّد افتراضياً للعملية، المحرك المحلي غير نشط: {e}]\nبناءً على المعطيات المعمارية المطلوبة، سيتم توزيع الأحمال البرمجية إلى هيكل خدمات مصغرة (Microservices) لضمان الأداء."

    def _call_cloud(self, prompt: str) -> str:
        pass
