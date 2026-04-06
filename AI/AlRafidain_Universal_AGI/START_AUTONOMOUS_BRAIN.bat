@echo off
title Al-Rafidain Autonomous AGI Brain
color 0a

cd /d "%~dp0"

echo ========================================================
echo       AL-RAFIDAIN OMNIPRESENT SOVEREIGN AGI BRAIN
echo ========================================================
echo.
echo Installing dependencies automatically...
pip install -r requirements.txt >nul 2>&1

echo.
echo Starting the 24/7 Autonomous Brain Algorithm with Public Chat UI...
uvicorn run_autonomous_brain:app --host 0.0.0.0 --port 9000 --reload
pause
