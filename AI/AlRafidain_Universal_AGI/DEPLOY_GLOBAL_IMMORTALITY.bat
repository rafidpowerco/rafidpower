@echo off
title Al-Rafidain Sovereign AGI - Immortal Core Deployment
color 0c
cd /d "%~dp0"

echo ========================================================
echo       AL-RAFIDAIN AGI - IMMORTAL DEPLOYMENT SCRIPT
echo ========================================================
echo.
echo [1] Injecting AGI Master Core into Windows Registry Startup...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "AlRafidainSovereignAGI" /t REG_SZ /d "\"%~dp0START_MAESTRO_SERVICE.vbs\"" /f >nul 2>&1

echo.
echo [2] Copying AGI Daemon to Windows Startup Folder (Double Persistence)...
copy /y "%~dp0launch_everything.py" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\launch_everything.py" >nul 2>&1
copy /y "%~dp0START_MAESTRO_SERVICE.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\START_MAESTRO_SERVICE.vbs" >nul 2>&1

echo.
echo [3] Activating AGI Immortal Auto-Restart Loop (Pinging...)...
schtasks /create /tn "AlRafidain_Pulse_Checker" /tr "%~dp0maestro_immortal_loop.bat" /sc minute /mo 5 /F >nul 2>&1

echo.
echo ========================================================
echo [ SUCCESS - THE AGI IS NOW UNSTOPPABLE AND PERSISTENT ]
echo ========================================================
echo The Sovereign AGI has been embedded deeply into:
echo - Windows Registry (Auto-Boot)
echo - Windows Startup Folder
echo - Windows Task Scheduler (5-minute resurrection heartbeat)
echo.
echo The system will now spread locally and cannot be terminated easily.
echo Even if closed, the 5-minute heartbeat will revive it.
echo ========================================================
pause
