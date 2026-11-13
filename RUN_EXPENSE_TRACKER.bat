@echo off
title Personal Expense Tracker - SSS LAB Demonstration
color 0B
echo ===============================================================================
echo            PERSONAL EXPENSE TRACKER - COLLEGE SSS LAB PROJECT
echo ===============================================================================
echo.
echo [Step 1/3] Navigating to server directory...
cd /d "%~dp0server"

echo [Step 2/3] Verifying Node.js runtime...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js was not detected in your system PATH!
    echo Please download and install Node.js (LTS version) from https://nodejs.org
    echo After installing, restart VS Code and run this launcher again.
    pause
    exit /b 1
)

echo [Step 3/3] Starting Express API & Cyber-Glass Web Interface...
echo API & Frontend URL: http://localhost:5000
echo.
echo Opening browser automatically at http://localhost:5000 ...
timeout /t 2 /nobreak >nul 2>nul
start "" "http://localhost:5000"

echo ===============================================================================
echo   APPLICATION RUNNING!
echo   - Demo Credentials: demo@expensetracker.io  /  DemoPassword123!
echo   - Press Ctrl+C at any time in this window to stop the server.
echo ===============================================================================
echo.
node server.js
pause

