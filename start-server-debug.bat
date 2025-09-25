@echo off
echo Starting MESMTF Backend Server...
echo.

cd backend

echo Checking if port 8080 is free...
netstat -ano | findstr :8080
if %errorlevel% == 0 (
    echo Port 8080 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /PID %%a /F
    timeout /t 2 /nobreak >nul
)

echo.
echo Installing dependencies...
npm install

echo.
echo Starting server...
npm run dev

pause
