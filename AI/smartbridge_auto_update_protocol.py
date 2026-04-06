import os
import ctypes
import shutil
import requests
import hashlib
from time import sleep

class RafidAutoUpdater:
    """
    نظام التحديث التلقائي الصامت (Silent Auto-Updater) لتطبيق SmartBridge EXE.
    الهدف: تأمين "القاعدة الذهبية" وتحديث مصانع العملاء عن بُعد دون الحاجة لزيارتهم.
    """
    def __init__(self, current_version, exe_path, server_url):
        self.current_version = current_version
        self.exe_path = exe_path
        self.server_url = server_url  # السيرفر السحابي الخاص بك
        self.download_path = exe_path + ".new"
        self.backup_path = exe_path + ".bak"

    def check_for_updates(self):
        """التحقق من وجود إصدار جديد عبر الـ API"""
        print(f"Checking for updates on {self.server_url}...")
        try:
            # افتراض أن السيرفر يرجع معلومات التحديث
            response = requests.get(f"{self.server_url}/latest-version", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data['version'] > self.current_version:
                    print(f"✅ New version found: {data['version']}. Downloading...")
                    return self.download_and_verify(data['download_url'], data['sha256_hash'])
        except Exception as e:
            print(f"Network error, proceeding with current version: {e}")
        return False

    def download_and_verify(self, url, expected_hash):
        """تحميل الملف الجديد والتأكد من عدم تلاعبه أو تلفه أثناء النقل"""
        response = requests.get(url, stream=True)
        sha256 = hashlib.sha256()
        
        with open(self.download_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                sha256.update(chunk)
                
        if sha256.hexdigest() == expected_hash:
            print("🔐 Security Check: Download verified and secure.")
            return self.apply_update()
        else:
            print("🚨 CRITICAL ERROR: File corruption or interception detected! Update aborted.")
            os.remove(self.download_path)
            return False

    def apply_update(self):
        """
        استبدال الملف الحي (Hot Swap)
        يتم إعادة تسمية الملف القديم كنسخة احتياطية، ثم إحلال الملف الجديد مكانه.
        """
        try:
            # 1. أخذ نسخة احتياطية من البرنامج القديم
            if os.path.exists(self.backup_path):
                os.remove(self.backup_path)
            os.rename(self.exe_path, self.backup_path)
            
            # 2. إحلال البرنامج الجديد
            os.rename(self.download_path, self.exe_path)
            
            print("✨ Golden Base Secured: Automatically updated to the latest EXE logic.")
            return True
        except Exception as e:
            print(f"Update failed during file swap: {e}")
            # التراجع في حال الفشل
            if os.path.exists(self.backup_path):
                os.rename(self.backup_path, self.exe_path)
            return False

if __name__ == "__main__":
    # يمكن دمج هذا الكود بملف Python صغير يعمل في الخلفية كخدمة Windows أو عبر Delphi مباشرة.
    updater = RafidAutoUpdater(
        current_version=1.0, 
        exe_path="C:\\Rafidain\\SmartBridge.exe", 
        server_url="https://api.rafid-scale.com/updater" # مثال اختياري
    )
    
    # يتم استدعاء هذا أثناء تشغيل البرنامج أو في عملية خلفية
    updater.check_for_updates()
