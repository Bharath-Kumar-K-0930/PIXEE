@echo off
echo Stopping any lingering node processes (optional safety step)...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm run dev*" 2>nul

if exist ".next" (
    echo Cleaning .next directory...
    rmdir /s /q .next
    echo Cleaned .next directory.
) else (
    echo .next directory not found, skipping clean.
)

echo Starting development server...
npm run dev
