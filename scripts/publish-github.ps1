# Creates github.com/rafidpowerco/rafid-scale-website if missing, then pushes main.
# Usage (PowerShell):  $env:GITHUB_TOKEN = "ghp_xxxxxxxx"; .\scripts\publish-github.ps1
$ErrorActionPreference = "Stop"
$owner = "rafidpowerco"
$name = "rafid-scale-website"
$token = $env:GITHUB_TOKEN
if (-not $token) {
  Write-Error "Set GITHUB_TOKEN to a classic PAT with repo scope (https://github.com/settings/tokens)."
}
$headers = @{
  Authorization = "Bearer $token"
  Accept        = "application/vnd.github+json"
  "User-Agent"  = "rafid-scale-publish"
}
$repoUrl = "https://api.github.com/repos/$owner/$name"
$exists = $false
try {
  Invoke-RestMethod -Uri $repoUrl -Headers $headers -Method Get | Out-Null
  $exists = $true
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
}
if (-not $exists) {
  $body = @{ name = $name; private = $false; auto_init = $false } | ConvertTo-Json
  $u = Invoke-RestMethod -Uri "https://api.github.com/users/$owner" -Headers @{ "User-Agent" = "rafid-scale-publish" }
  if ($u.type -eq "Organization") {
    Invoke-RestMethod -Uri "https://api.github.com/orgs/$owner/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json"
  } else {
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json"
  }
}
Set-Location $PSScriptRoot\..
if (-not (git remote get-url origin 2>$null)) {
  git remote add origin "https://github.com/$owner/$name.git"
} else {
  git remote set-url origin "https://github.com/$owner/$name.git"
}
$authed = "https://x-access-token:${token}@github.com/${owner}/${name}.git"
git remote set-url origin $authed
git push -u origin main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git remote set-url origin "https://github.com/$owner/$name.git"
Write-Host "Done: https://github.com/$owner/$name"
