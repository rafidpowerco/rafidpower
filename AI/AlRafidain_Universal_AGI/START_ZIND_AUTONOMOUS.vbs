Set WshShell = CreateObject("WScript.Shell")
' Run the ZIND Autonomous Learner completely hidden in the background
WshShell.CurrentDirectory = "c:\Users\Administrator\Desktop\rafid-scale-website\AI\AlRafidain_Universal_AGI"

' pythonw.exe runs python completely hidden without a terminal window
WshShell.Run "C:\ProgramData\miniconda3\pythonw.exe ZIND_autonomous_learner.py", 0, False
