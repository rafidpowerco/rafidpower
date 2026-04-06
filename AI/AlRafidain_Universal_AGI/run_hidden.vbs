Set WshShell = CreateObject("WScript.Shell")
' Run the core AGI loop completely hidden in the background
WshShell.CurrentDirectory = "c:\Users\Administrator\Desktop\rafid-scale-website\AI\AlRafidain_Universal_AGI"
WshShell.Run "pythonw.exe run_autonomous_brain.py", 0, False
