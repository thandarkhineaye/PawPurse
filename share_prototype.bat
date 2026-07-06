@echo off
title PawPurse Prototype Tunnel Share
echo ===================================================
echo   PawPurse Prototype - Local Tunnel Sharing Tool
echo ===================================================
echo.
echo This tool will expose your local running FastAPI server
echo and frontend to a temporary, free public HTTPS URL.
echo.
echo ---------------------------------------------------
echo STEP 1: Launching local FastAPI backend server...
echo ---------------------------------------------------
:: Start FastAPI server in a new window using uv
start "PawPurse Backend Server" cmd /c "uv run uvicorn backend.main:app --port 8000 --host 127.0.0.1"

echo Waiting for backend server to initialize...
timeout /t 4 /nobreak > nul

echo ---------------------------------------------------
echo STEP 2: Creating a public tunnel via localtunnel...
echo ---------------------------------------------------
echo.
echo Note: If this is your first time running this, you may
echo be prompted to install 'localtunnel'. Press Y if asked.
echo.
echo IMPORTANT: When sharing the URL, users might see a landing
echo page asking for a 'Friendly Tunnel Password'. This password
echo is your local public IP address.
echo You can find your IP address here: https://localtunnel.github.io/www/
echo.
echo Press Ctrl+C in this window to stop the tunnel.
echo.
npx localtunnel --port 8000
echo.
echo Tunnel closed. If you want to stop the backend server as well,
echo please close the "PawPurse Backend Server" command window.
pause
