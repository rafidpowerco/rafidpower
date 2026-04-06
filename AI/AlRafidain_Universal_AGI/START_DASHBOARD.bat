@echo off
title Al-Rafidain Sovereign AGI Server
color 0b
echo =========================================================
echo    AL-RAFIDAIN SOVEREIGN AGI - DASHBOARD LAUNCHER
echo =========================================================
echo.
echo Please wait, ensuring all critical neural modules exist...
pip install fastapi uvicorn pydantic requests yfinance pymodbus >nul 2>&1

echo.
echo [System] Entering Sovereign AI directory...
cd /d "%~dp0"

echo [System] Booting up Dashboard Server on Port 9000...
echo.
python agi_master_api.py

echo.
echo [Error] Server stopped unexpectedly! Check the red text above.
pause
