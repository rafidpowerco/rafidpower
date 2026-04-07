Set WshShell = CreateObject("WScript.Shell")
' Run the daemon runner invisibly (0 means hidden window)
' It uses pythonw to ensure no cmd popup remains if installed properly, or just python.
WshShell.Run "pythonw.exe ""C:\Users\Administrator\Desktop\my work\rafid-scale-website\AI\daemon_runner.py""", 0, False
