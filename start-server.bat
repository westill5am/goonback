@echo off
echo =================================
echo GoonerBrain Backend Startup
echo =================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Run diagnostics first
echo Running system diagnostics...
node console-error-debugger-enhanced.js
echo.

REM Start the smart startup script
echo Starting GoonerBrain server...
echo.
node smart-startup.js

pause
