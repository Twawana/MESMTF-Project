#!/bin/bash

echo "========================================"
echo "MESMTF Backend Startup Script"
echo "========================================"
echo

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version

echo
echo "Checking if MongoDB is running..."
echo "Please make sure MongoDB is running on your system."
echo "If you don't have MongoDB installed, you can:"
echo "1. Install MongoDB Community Edition"
echo "2. Use MongoDB Atlas (cloud)"
echo "3. Use Docker: docker run -d -p 27017:27017 mongo:5.0"
echo

echo "Navigating to backend directory..."
cd backend

echo
echo "Installing dependencies..."
npm install

echo
echo "Setting up environment..."
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo
    echo "IMPORTANT: Please edit backend/.env file with your MongoDB connection string"
    echo "Default MongoDB URI: mongodb://localhost:27017/mesmtf"
    echo
fi

echo
echo "Seeding database with initial data..."
npm run seed

echo
echo "Starting the backend server..."
echo "The server will start on http://localhost:5000"
echo "API Documentation will be available at http://localhost:5000/api-docs"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev
