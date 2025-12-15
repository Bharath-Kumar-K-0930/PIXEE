@echo off
echo Stopping any lingering node processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm run dev*" 2>nul
taskkill /F /IM node.exe 2>nul

echo Cleaning build artifacts and dependencies...
if exist ".next" rmdir /s /q .next
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

echo Installing new dependencies...
call npm install

echo Starting development server...
npm run dev
