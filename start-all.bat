@echo off
echo ====================================
echo PIXEE - Full Project Setup
echo ====================================
echo.

REM Download Models
echo [1/5] Downloading ML Models...
powershell -ExecutionPolicy Bypass -File ".\download-models.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Model download failed
    pause
    exit /b 1
)
echo.

REM Install Dependencies
echo [2/5] Installing Dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.

echo [3/5] Setup Complete!
echo.
echo ====================================
echo Starting Application...
echo ====================================
echo.

REM Start Frontend
echo [4/5] Starting Frontend...
call npm start

pause
