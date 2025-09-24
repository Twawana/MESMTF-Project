# MESMTF Setup Guide

## Medical Expert System for Malaria and Typhoid Fever

This guide will help you set up and run the MESMTF system with the new backend API integration.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18.0.0 or higher)
   - Download from [https://nodejs.org/](https://nodejs.org/)
   - Verify installation: `node --version`

2. **MongoDB** (v5.0 or higher)
   - **Option 1**: Install MongoDB Community Edition locally
   - **Option 2**: Use MongoDB Atlas (cloud database)
   - **Option 3**: Use Docker: `docker run -d -p 27017:27017 mongo:5.0`

### Automated Setup (Recommended)

#### Windows:
```bash
# Double-click or run in Command Prompt
start-backend.bat
```

#### Linux/Mac:
```bash
# Make executable and run
chmod +x start-backend.sh
./start-backend.sh
```

### Manual Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env file with your settings
# Minimum required: MONGODB_URI=mongodb://localhost:27017/mesmtf

# Seed the database with initial data
npm run seed

# Start the development server
npm run dev
```

#### 2. Frontend Setup

The frontend files are already configured to work with the backend API. Simply open any HTML file in your browser after the backend is running.

## 🔧 Configuration

### Environment Variables

Edit `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mesmtf

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# Hospital Information
HOSPITAL_NAME=Ministry of Health Hospital
HOSPITAL_LOCATION=Windhoek, Namibia
HOSPITAL_CONTACT_EMAIL=info@moh.gov
HOSPITAL_CONTACT_PHONE=+264 61 123 4567
HOSPITAL_EMERGENCY_CONTACT=+264 81 123 4567

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🔑 Default Login Credentials

After running the seed script, you can use these credentials:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | admin123 |
| **Doctor** | dr.smith | doctor123 |
| **Nurse** | nurse.jane | nurse123 |
| **Pharmacist** | pharm.mike | pharm123 |
| **Receptionist** | recep.mary | recep123 |
| **Patient** | patient.john | patient123 |

## 🌐 Accessing the System

### Backend API
- **Server**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

### Frontend Pages
- **Login**: `login.html`
- **Admin Portal**: `admin.html`
- **Doctor Portal**: `doctor.html`
- **Nurse Portal**: `nurse.html`
- **Pharmacist Portal**: `patientsPage.html`
- **Receptionist Portal**: `reception.html`
- **Patient Portal**: `patient.html`

## 🔄 What's Changed

### From localStorage to API

The system has been upgraded from localStorage-based data management to a full backend API:

#### ✅ New Features:
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Proper user permissions
- **Real Database**: MongoDB for persistent data storage
- **Medical Expert System**: AI-powered diagnosis assistance
- **API Documentation**: Interactive Swagger documentation
- **Data Validation**: Server-side input validation
- **Security**: Rate limiting, CORS, input sanitization

#### 🔄 Migration:
- **Authentication**: Login now uses JWT tokens instead of localStorage
- **Patient Data**: Stored in MongoDB with proper relationships
- **Appointments**: Full scheduling system with conflict detection
- **Prescriptions**: Complete prescription lifecycle management
- **Diagnoses**: Expert system integration for medical assessments

## 🧪 Testing the System

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Test API Endpoints
Visit http://localhost:5000/api-docs to test the API interactively.

### 3. Test Frontend Integration
1. Open `login.html` in your browser
2. Login with any of the default credentials
3. Navigate through the role-specific portals
4. Test patient management, appointments, diagnoses, and prescriptions

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"
- Ensure MongoDB is running
- Check the MONGODB_URI in your .env file
- For local MongoDB: `mongodb://localhost:27017/mesmtf`

#### 2. "Module not found" errors
- Run `npm install` in the backend directory
- Ensure Node.js version is 18.0.0 or higher

#### 3. "CORS errors" in browser
- Check that the backend is running on port 5000
- Verify CORS_ORIGIN in .env matches your frontend URL

#### 4. "Authentication failed"
- Clear browser localStorage/sessionStorage
- Try logging in again with default credentials
- Check browser console for detailed error messages

#### 5. Frontend not loading data
- Ensure backend is running and accessible
- Check browser network tab for failed API requests
- Verify API endpoints in browser developer tools

### Getting Help

1. **Check the logs**: Backend logs will show detailed error information
2. **Browser Console**: Check for JavaScript errors in browser developer tools
3. **API Documentation**: Use http://localhost:5000/api-docs to test API endpoints
4. **Network Tab**: Check browser network tab for failed requests

## 🚀 Production Deployment

### Using Docker

```bash
# Build and run with Docker Compose
cd backend
docker-compose up -d
```

### Manual Production Setup

1. Set `NODE_ENV=production` in .env
2. Use a production MongoDB instance
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use a reverse proxy (nginx) for HTTPS
6. Set up monitoring and logging

## 📚 API Documentation

Once the backend is running, visit http://localhost:5000/api-docs for complete API documentation with interactive testing capabilities.

## 🔒 Security Notes

- Change default JWT secrets in production
- Use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement proper backup strategies
- Use environment variables for sensitive data

## 📞 Support

For technical support or questions:
- Email: support@moh.gov
- Phone: +264 61 123 4567
- Emergency: +264 81 123 4567
