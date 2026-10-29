@echo off
title VocaLNQ Next.js - Port 1234
cd /d "%~dp0.."
echo ==========================================================
echo Starting VocaLNQ at http://localhost:1234 ...
echo ==========================================================

REM Check SQLite seed
if not exist "vocab.db" (
  echo Seeding SQLite database...
  node scripts/seed.js
)

REM Open browser after 2 seconds in background
start /min cmd /c "timeout /t 2 >nul & start http://localhost:1234"

REM Start Next.js on port 1234
set PORT=1234
npx next dev -p 1234
