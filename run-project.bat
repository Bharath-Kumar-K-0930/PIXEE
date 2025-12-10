@echo off
echo ====================================
echo PIXEE Project - Full Setup & Run
echo ====================================
echo.

REM Step 1: Download Models
echo [1/4] Downloading ML Models...
powershell -ExecutionPolicy Bypass -File ".\download-models.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to download models
    pause
    exit /b 1
)
echo.

REM Step 2: Install Dependencies
echo [2/4] Installing Node Dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.

REM Step 3: Clear any old builds
echo [3/4] Cleaning previous builds...
if exist "build" rmdir /s /q build
if exist ".next" rmdir /s /q .next
echo.

REM Step 4: Start the project
echo [4/4] Starting development server...
echo.
echo ====================================
echo Project is now running!
echo Open browser: http://localhost:3000
echo ====================================
echo.
call npm start

pause
