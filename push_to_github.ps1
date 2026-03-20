# push_to_github.ps1
# One-click script to push Zelo Assist to GitHub
# Run this from the gmail.app directory in PowerShell

Write-Host "🚀 Pushing Zelo Assist to GitHub..." -ForegroundColor Cyan

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Download it from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installing, restart this terminal and run this script again."
    exit 1
}

Write-Host "✅ Git found" -ForegroundColor Green

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
}
else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Set remote (force update if already exists)
git remote remove origin 2>$null
git remote add origin https://github.com/Gazda403/zelo-assist.git
Write-Host "✅ Remote set to github.com/Gazda403/zelo-assist" -ForegroundColor Green

# Stage all files (respects .gitignore automatically)
git add .
Write-Host "✅ Files staged" -ForegroundColor Green

# Commit
git commit -m "🚀 Zelo Assist v1.0 — Full source push"
Write-Host "✅ Committed" -ForegroundColor Green

# Push
git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "✅ Done! Your code is now on GitHub:" -ForegroundColor Green
Write-Host "   https://github.com/Gazda403/zelo-assist" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Next step: Go to https://vercel.com/new and import this repo!" -ForegroundColor Yellow
