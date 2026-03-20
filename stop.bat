@echo off
title Stopping Gmail Secretary
echo Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ✓ Server stopped successfully!
) else (
    echo.
    echo No running server found.
)
echo.
pause
