import os
import json
import logging
from cryptography.fernet import Fernet
from cryptography.exceptions import InvalidToken

class ZindSecurityVault:
    """خزنة التشفير السيادي لنظام ZIND"""
    
    def __init__(self):
        self.logger = logging.getLogger("ZIND_Security")
        
        # يجب تمرير المفتاح عبر متغيرات البيئة حصراً وليس في الكود
        master_key = os.getenv("ZIND_MASTER_KEY")
        
        if not master_key:
            self.logger.critical("ZIND_MASTER_KEY is missing! Generating a temporary key.")
            # توليد مفتاح مؤقت (في بيئة الإنتاج يجب إيقاف النظام فوراً بدل التوليد)
            master_key = Fernet.generate_key().decode()
            print(f"!!! URGENT: SAVE THIS MASTER KEY: {master_key} !!!")
            
        self._cipher = Fernet(master_key.encode())
        self.is_compromised = False

    def encrypt_payload(self, payload: dict) -> str:
        """تشفير القاموس (Dictionary) إلى نص مشفر"""
        if self.is_compromised:
            raise PermissionError("System is in LOCKDOWN mode.")
        
        json_data = json.dumps(payload)
        encrypted_bytes = self._cipher.encrypt(json_data.encode())
        return encrypted_bytes.decode()

    def decrypt_payload(self, encrypted_text: str) -> dict:
        """فك تشفير النص للعودة إلى القاموس الأصلي"""
        if self.is_compromised:
            raise PermissionError("System is in LOCKDOWN mode.")
            
        try:
            decrypted_bytes = self._cipher.decrypt(encrypted_text.encode())
            return json.loads(decrypted_bytes.decode())
        except InvalidToken:
            self.logger.error("ALERT: Decryption failed. Possible tampering detected!")
            self.trigger_kill_switch()
            raise ValueError("Corrupted or tampered payload.")

    def trigger_kill_switch(self):
        """بروتوكول التدمير الذاتي: مسح المفاتيح من الذاكرة فوراً"""
        self.logger.critical("!!! KILL SWITCH ACTIVATED !!! Wiping memory keys.")
        self._cipher = None
        self.is_compromised = True
        # هنا يتم قطع الاتصال بقواعد البيانات فوراً
