# مثال نسخ احتياطي (Windows) — انسخ وعدّل؛ لا ترفع كلمات المرور إلى Git.
param(
  [string]$DbHost = "127.0.0.1",
  [string]$DbUser = "root",
  [string]$DbName = "botdb"
)
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$out = Join-Path (Get-Location) "botdb-$ts.sql"
& mysqldump -h $DbHost -u $DbUser -p $DbName --single-transaction | Out-File -FilePath $out -Encoding utf8
Write-Host "تم: $out"
