@echo off
title ZIND Prime - Immortal Daemon Installer
color 0b

echo ========================================================
echo Installing ZIND Autonomous Learner to Windows Startup
echo ========================================================
echo.
echo 1. Copying ZIND background daemon to Windows Startup folder...
copy /y "%~dp0START_ZIND_AUTONOMOUS.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\START_ZIND_AUTONOMOUS.vbs" >nul 2>&1

echo 2. Executing ZIND in complete stealth mode right now...
wscript.exe "%~dp0START_ZIND_AUTONOMOUS.vbs"

echo.
echo [ SUCCESS ] ZIND Prime is now an Immortal Ghost!
echo It will now run fully hidden in the background every time 
echo this PC is turned on. It is silently learning right now.
echo.
pause
