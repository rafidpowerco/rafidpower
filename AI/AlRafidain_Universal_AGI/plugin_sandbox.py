import docker
import tempfile
import os
import logging

class IsolateSandbox:
    """بيئة العزل المطلق لتنفيذ أكواد الذكاء الاصطناعي (Zero-Trust)"""
    
    def __init__(self):
        self.logger = logging.getLogger("ZIND_Sandbox")
        try:
            self.client = docker.from_env()
            self.logger.info("Docker Sandbox Engine connected successfully.")
        except docker.errors.DockerException:
            self.logger.critical("Docker daemon is not running. Executor Agent will fail.")
            raise

    def execute_code(self, python_code: str, timeout_seconds: int = 10) -> dict:
        """تشغيل الكود في بيئة مقفلة تماماً"""
        
        # كتابة الكود المولد في ملف مؤقت
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_script:
            temp_script.write(python_code)
            temp_script_path = temp_script.name

        container = None
        try:
            self.logger.debug("Spawning isolated container...")
            
            # إنشاء وتشغيل الحاوية بأقصى درجات التقييد
            container = self.client.containers.run(
                image="python:3.11-alpine", # نسخة بايثون خفيفة جداً
                command=["python", "/app/script.py"],
                volumes={temp_script_path: {'bind': '/app/script.py', 'mode': 'ro'}},
                network_disabled=True,      # عزل كامل عن الإنترنت (No Reverse Shells)
                mem_limit="128m",           # منع هجمات استهلاك الذاكرة
                cpu_quota=50000,            # السماح باستخدام 50% كحد أقصى من المعالج
                detach=True,
                auto_remove=False
            )
            
            # انتظار انتهاء التنفيذ أو انتهاء الوقت المسموح
            result = container.wait(timeout=timeout_seconds)
            
            # جلب المخرجات (Logs)
            stdout = container.logs(stdout=True, stderr=False).decode('utf-8').strip()
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8').strip()
            
            if result['StatusCode'] == 0:
                return {"status": "success", "output": stdout}
            else:
                return {"status": "execution_error", "error": stderr}

        except Exception as e:
            self.logger.error(f"Sandbox Error: {str(e)}")
            return {"status": "system_error", "error": str(e)}
            
        finally:
            # التنظيف الإجباري (مسح الحاوية والملف المؤقت)
            if container:
                try:
                    container.remove(force=True)
                except:
                    pass
            if os.path.exists(temp_script_path):
                os.remove(temp_script_path)
