@echo off
title Al-Rafidain Global AI Tunnel
color 0a

cd /d "%~dp0"

IF NOT EXIST "cloudflared.exe" (
    echo [System] Downloading Secure Routing Agent ^(Cloudflare^)...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
)

echo.
echo ===================================================================
echo 🌍 AL-RAFIDAIN AGI - GLOBAL TUNNEL ESTABLISHED 
echo ===================================================================
echo.
echo Please wait 5 seconds... Look for the URL that ends with:
echo    "trycloudflare.com"
echo.
echo Copy that link and open it on your phone to chat with the AI!
echo -------------------------------------------------------------------

cloudflared.exe tunnel --url http://127.0.0.1:9000
pause
