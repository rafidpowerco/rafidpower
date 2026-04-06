@echo off
title Al-Rafidain AGI Daemon
cd /d "%~dp0"

:loop
echo [AGI-DAEMON] Starting Maestro Core...
C:\ProgramData\miniconda3\python.exe maestro_core.py
echo [AGI-DAEMON] Process ended or crashed! Restarting in 5 seconds (Restart=always)...
timeout /t 5 /nobreak >nul
goto loop
