@echo off
echo ========================================
echo MESMTF Backend Startup Script
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo.
echo Checking if MongoDB is running...
echo Please make sure MongoDB is running on your system.
echo If you don't have MongoDB installed, you can:
echo 1. Install MongoDB Community Edition
echo 2. Use MongoDB Atlas (cloud)
echo 3. Use Docker: docker run -d -p 27017:27017 mongo:5.0
echo.

echo Navigating to backend directory...
cd backend

echo.
echo Installing dependencies...
call npm install

echo.
echo Setting up environment...
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend/.env file with your MongoDB connection string
    echo Default MongoDB URI: mongodb://localhost:27017/mesmtf
    echo.
)

echo.
echo Seeding database with initial data...
call npm run seed

echo.
echo Starting the backend server...
echo The server will start on http://localhost:5000
echo API Documentation will be available at http://localhost:5000/api-docs
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
