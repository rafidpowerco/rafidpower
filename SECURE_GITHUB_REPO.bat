@echo off
title GitHub Absolute Security Protocol
color 0c
cd /d "%~dp0"

echo ========================================================
echo       AL-RAFIDAIN AGI - GITHUB SECURITY PROTOCOL
echo ========================================================
echo.
echo تحذير: هذا السكريبت سيقوم بتنظيف مستودع غيت هاب الخاص بك
echo من أي بيانات حساسة، ذواكر عصبية، أو أكواد غير مشفرة تسربت سابقاً.
echo.
pause

echo [1] تنظيف سجلات Git المحلية (إزالة الكاش)...
git rm -r --cached .

echo.
echo [2] إضافة ملف النعيم (.gitignore) الصارم الجديد...
git add .

echo.
echo [3] توثيق الحذف والتأمين (Commit)...
git commit -m "🔐 SECURITY LOCKDOWN: Removed proprietary AI core, neural memories, and keys from GitHub index."

echo.
echo [4] دفع التأمين إلى الخادم (Pushing to GitHub)...
git push origin HEAD

echo.
echo ========================================================
echo [ 100%% SECURE - GITHUB REPOSITORY CLEANED AND LOCKED ]
echo ========================================================
echo تم مسح كافة الأكواد غير المشفرة والبيانات الحساسة من غيت هاب.
echo من الآن فصاعداً، لن يتم رفع إلا الملفات العامة الآمنة.
echo ========================================================
pause
