Set WshShell = CreateObject("WScript.Shell")
' 0 تعني إخفاء النافذة تماماً لتعمل كشبح (Background Service)
WshShell.Run chr(34) & "C:\Users\Administrator\Desktop\rafid-scale-website\AI\AlRafidain_Universal_AGI\maestro_immortal_loop.bat" & Chr(34), 0, False
Set WshShell = Nothing
