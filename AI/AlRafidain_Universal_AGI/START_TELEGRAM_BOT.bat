@echo off
title Al-Rafidain Telegram Bot Gateway
color 0d
cd /d "%~dp0"

echo ========================================================
echo   AL-RAFIDAIN OMNIPRESENT TELEGRAM BOT INSTALLER
echo ========================================================
echo.
echo Please wait, preparing the Telegram bridging arrays...
pip install pyTelegramBotAPI >nul 2>&1

echo.
echo Launching Central Neural Bot...
python run_telegram_bot.py
pause
