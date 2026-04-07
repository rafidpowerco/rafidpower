@echo off
title Rafid Sovereign AGI - Web Daemon
color 0C

echo ========================================================
echo       AL-RAFIDAIN SOVEREIGN AGI - WEB DAEMON
echo               (Port: 9000 - Gemini 1.5 Pro)
echo ========================================================
echo.

cd /d "%~dp0AI"

echo [1] Checking and installing required dependencies...
pip install fastapi uvicorn google-genai python-dotenv pydantic cryptography

echo.
echo [2] Initializing Cryptographic Shields and AGI Core...
echo.

uvicorn web_ai_daemon:app --host 0.0.0.0 --port 9000 --reload

pause
