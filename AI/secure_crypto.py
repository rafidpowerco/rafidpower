import os
import base64
import hashlib
import hmac
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# ---------------------------------------------------------
# Al-Rafidain Sovereign AGI - Cryptographic Security Module
# Enterprise-Grade Integrity & Anti-Tampering Mechanism
# ---------------------------------------------------------

ENCRYPTION_KEY = os.getenv("RAFID_AES_KEY", "0123456789abcdef0123456789abcdef")  # 32 bytes for AES-256
HMAC_SECRET = os.getenv("RAFID_HMAC_SECRET", "super_secret_rafid_hmac_key").encode('utf-8')

def encrypt_payload(payload_str: str) -> str:
    """
    Encrypts a JSON payload (e.g., ticket data) using AES-256-GCM.
    Returns a Base64 encoded string containing IV + Ciphertext + Tag.
    """
    iv = os.urandom(12) # GCM standard IV size
    cipher = Cipher(algorithms.AES(ENCRYPTION_KEY.encode('utf-8')), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    ciphertext = encryptor.update(payload_str.encode('utf-8')) + encryptor.finalize()
    
    # Pack IV, Ciphertext, and Auth Tag to verify later
    secure_blob = iv + encryptor.tag + ciphertext
    return base64.b64encode(secure_blob).decode('utf-8')

def verify_hmac_signature(payload_json_string: str, provided_signature: str) -> bool:
    """
    Prevents Man-In-The-Middle (MITM) attacks by verifying HMAC-SHA256 signature.
    Delphi must sign the raw JSON with the same HMAC_SECRET before sending to AGI.
    """
    expected_signature = hmac.new(
        HMAC_SECRET, 
        payload_json_string.encode('utf-8'), 
        hashlib.sha256
    ).hexdigest()
    
    # Use hmac.compare_digest to prevent timing attacks
    return hmac.compare_digest(expected_signature, provided_signature)
