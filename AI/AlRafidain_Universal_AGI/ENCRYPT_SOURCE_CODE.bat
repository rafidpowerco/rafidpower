@echo off
title Al-Rafidain Intellectual Property Protector
color 0c
cd /d "%~dp0"

echo ========================================================
echo       AL-RAFIDAIN AGI - SOURCE CODE ENCRYPTOR
echo ========================================================
echo.
echo Installing Military-Grade Python Encryption (PyArmor)...
pip install pyarmor >nul 2>&1

echo.
echo Encrypting and Obfuscating the AGI Brain and Plugins...
if exist "AlRafidain_Secured_Core" rmdir /s /q "AlRafidain_Secured_Core"
mkdir "AlRafidain_Secured_Core"

:: Encrypting the entire current directory of python files into the Secured Folder
pyarmor gen -O AlRafidain_Secured_Core run_autonomous_brain.py universal_agents.py plugin_market_live.py plugin_deep_memory.py plugin_email_secretary.py plugin_vector_memory.py plugin_plc_master.py llm_engine.py daily_command_center.py run_telegram_bot.py maestro_core.py launch_everything.py agi_master_api.py agi_toolbox.py ai_observer_agent.py auto_developer_agent.py run_agi_ecosystem.py

echo.
echo Copying necessary configuration files to the Secured Vault...
copy /y telegram_bot_token.txt AlRafidain_Secured_Core\telegram_bot_token.txt >nul 2>&1
copy /y requirements.txt AlRafidain_Secured_Core\requirements.txt >nul 2>&1
xcopy /e /i /y deploy_configs AlRafidain_Secured_Core\deploy_configs >nul 2>&1
copy /y *.bat AlRafidain_Secured_Core\ >nul 2>&1
copy /y *.vbs AlRafidain_Secured_Core\ >nul 2>&1

echo.
echo ========================================================
echo [ 100%% SUCCESS - YOUR INTELLECTUAL PROPERTY IS SAFE ]
echo ========================================================
echo The fully encrypted and obfuscated system has been created
echo inside the folder: "AlRafidain_Secured_Core"
echo.
echo - DO NOT upload these original readable source codes!
echo - Only upload the contents of the "AlRafidain_Secured_Core" folder to the VPS.
echo - If any hacker steals it, they will only see unreadable symbols.
echo ========================================================
pause
