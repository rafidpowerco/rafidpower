@echo off
@CHCP 65001 >nul
color 0a
title RAFID POWER - Professional Web Server
cd /d "%~dp0"
echo =======================================
echo Starting Rafid Power Web Server...
echo =======================================
echo.
npm run dev
EXIT /b 0
