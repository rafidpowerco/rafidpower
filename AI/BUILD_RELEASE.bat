@echo off
echo ====================================================
echo   Rafid Sovereign AGI - Production Build Compiler
echo   Enforcing IP Protection and Obfuscation...
echo ====================================================

echo [1] Checking Dependencies...
python -m pip install pyarmor
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install PyArmor.
    exit /b 1
)

echo [2] Cleaning old builds...
if exist "dist" rmdir /s /q "dist"

echo [3] Obfuscating Core AI Engines (IP Protection)
echo Encrypting logic to prevent reverse-engineering...
pyarmor gen -O dist web_ai_daemon.py autonomous_finance_learner.py daemon_runner.py secure_crypto.py

echo.
echo ====================================================
echo ✅ BUILD COMPLETE! 
echo The encrypted production-ready files are generated inside the "dist" folder.
echo You must run these files in production to ensure Intellectual Property is secured.
echo ====================================================
pause
