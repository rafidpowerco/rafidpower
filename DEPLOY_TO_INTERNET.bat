@echo off
chcp 65001 > nul
title RAFID POWER - DEPLOY TO RAFIDPOWER.XYZ
color 0a
cd /d "c:\Users\Administrator\Desktop\rafid-scale-website"

echo.
echo ===========================================================
echo    RAFID POWER - DEPLOY TO RAFIDPOWER.XYZ
echo    النشر التجاري الفوري على الانترنت
echo ===========================================================
echo.

echo [1/4] Checking Git status...
git status

echo.
echo [2/4] Staging all changes...
git add -A

echo.
echo [3/4] Committing with timestamp...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
git commit -m "SOVEREIGN DEPLOY %dt:~0,4%-%dt:~4,2%-%dt:~6,2% - ZIND AI + Logo + UI Polish"

echo.
echo [4/4] Pushing to GitHub - triggers Render auto-deploy...
git push origin main

echo.
echo ===========================================================
echo  DONE! Wait 3-5 minutes then visit: www.rafidpower.xyz
echo ===========================================================
echo.
pause
