import os
import subprocess

class AGIToolbox:
    """
    [صندوق الأدوات والأيدي الفيزيائية للذكاء الاصطناعي]
    النظام اللغوي (LLM) هو "الدماغ"، وهذا الكود هو "الأيدي".
    هنا نعطي الذكاء الاصطناعي القدرة على تنفيذ إجراءات حقيقية على حاسوبك 
    مثل: كتابة الملفات، قراءة الأكواد، أو حتى تشغيل الأوامر في شاشة الـ CMD.
    """
    
    @staticmethod
    def write_code_to_file(filepath: str, code_content: str) -> str:
        """أداة تسمح للـ AGI بكتابة وتحديث أكواد المشاريع"""
        try:
            # التأكد من وجود المسار
            directory = os.path.dirname(filepath)
            if directory and not os.path.exists(directory):
                os.makedirs(directory)
                
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(code_content)
            return f"✅ SUCCESS: File {filepath} written successfully."
        except Exception as e:
            return f"❌ ERROR: Failed to write file. {e}"

    @staticmethod
    def read_local_file(filepath: str) -> str:
        """أداة تسمح للـ AGI بقراءة أكواد موجودة مسبقاً (مثل قراءة مشاريع ديلفي لكشف الأخطاء)"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return "❌ ERROR: File not found."
        except Exception as e:
            return f"❌ ERROR: {e}"

    @staticmethod
    def run_terminal_command(command: str) -> str:
        """
        أداة تسمح للـ AGI بتنفيذ أوامر أو تشغيل الكود الذي قام للتو بكتابته.
        مثال: طلب 'pip install library' أو 'python script.py'
        """
        try:
            # يتم استدعاء سطر الأوامر بأمان وإرجاع النتيجة
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=60 # زمن أقصى للعملية
            )
            output = result.stdout if result.returncode == 0 else result.stderr
            return f"Terminal Output:\n{output}"
        except subprocess.TimeoutExpired:
            return "❌ ERROR: Command timed out."
        except Exception as e:
            return f"❌ ERROR: Execution failed. {e}"
