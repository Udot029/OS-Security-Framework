@echo off
REM Start the Python Flask backend server

echo.
echo ========================================
echo OS Security Framework - Backend Server
echo ========================================
echo.

REM Check if Python is installed
python --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

echo [1] Installing dependencies...
python -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2] Starting Flask server...
echo.
echo ========================================
echo Server running on: http://localhost:5000
echo ========================================
echo.
echo The frontend dashboard will connect automatically.
echo Press Ctrl+C to stop the server.
echo.

cd backend\api
python server.py

pause
