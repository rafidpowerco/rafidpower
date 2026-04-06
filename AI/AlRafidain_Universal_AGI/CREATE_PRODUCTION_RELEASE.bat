@echo off
title Al-Rafidain AGI - Commercial Build Packager
color 0b
cd /d "%~dp0"

echo ========================================================
echo       AL-RAFIDAIN AGI - COMMERCIAL RELEASE BUILDER
echo ========================================================
echo.
echo [1] Compiling and Building the React Web Dashboard...
cd ..\client
call npm run build
cd ..\AI\AlRafidain_Universal_AGI

echo.
echo [1.5] Injecting Professional Brain Knowledge...
call python TRAIN_CORE_KNOWLEDGE.py

echo.
echo [2] Generating Encrypted AI Core...
call ENCRYPT_SOURCE_CODE.bat

echo.
echo [3] Packaging Release into "COMMERCIAL_DISTRIBUTION"...
if exist "COMMERCIAL_DISTRIBUTION" rmdir /s /q "COMMERCIAL_DISTRIBUTION"
mkdir "COMMERCIAL_DISTRIBUTION"

echo   - Copying Web Dashboard Build...
mkdir "COMMERCIAL_DISTRIBUTION\Web_Dashboard"
xcopy /e /i /y "..\..\client\dist" "COMMERCIAL_DISTRIBUTION\Web_Dashboard" >nul

echo   - Copying Encrypted AI Engine...
xcopy /e /i /y "AlRafidain_Secured_Core" "COMMERCIAL_DISTRIBUTION\AlRafidain_Secured_Core" >nul

echo   - Copying Configuration Template...
copy /y ".env.example" "COMMERCIAL_DISTRIBUTION\.env" >nul

echo   - Copying Immortal Daemon Installer...
copy /y "DEPLOY_GLOBAL_IMMORTALITY.bat" "COMMERCIAL_DISTRIBUTION\" >nul

echo.
echo ========================================================
echo [ 100%% SUCCESS - YOUR PRODUCT IS READY FOR THE MARKET ]
echo ========================================================
echo The folder "COMMERCIAL_DISTRIBUTION" now contains:
echo 1. The Production Build of your Website.
echo 2. The Fully Encrypted AGI Engine.
echo 3. The Auto-Installer (Daemon).
echo 4. The Settings File (.env).
echo.
echo You can now zip this folder and sell it directly to factories.
echo ========================================================
pause
