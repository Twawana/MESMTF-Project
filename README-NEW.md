# 🏥 MESMTF - Medical Expert System for Malaria and Typhoid Fever

[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive medical expert system designed to assist healthcare professionals in diagnosing and managing malaria and typhoid fever cases in Namibia.

## 🚀 Quick Start

### Automated Setup (Recommended)

**Windows:**
```bash
start-backend.bat
```

**Linux/Mac:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

### Manual Setup

1. **Prerequisites**
   - Node.js (v18.0.0+)
   - MongoDB (v5.0+)

2. **Installation**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/MESMTF-Project.git
   cd MESMTF-Project

   # Setup backend
   cd backend
   npm install
   cp .env.example .env
   npm run seed
   npm run dev
   ```

3. **Access System**
   - Open `login.html` in your browser
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api-docs

## 🔑 Default Login Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | admin | admin123 | Full system access |
| **Doctor** | dr.smith | doctor123 | Patient diagnosis & treatment |
| **Nurse** | nurse.jane | nurse123 | Patient care & monitoring |
| **Pharmacist** | pharm.mike | pharm123 | Prescription dispensing |
| **Receptionist** | recep.mary | recep123 | Patient registration & appointments |
| **Patient** | patient.john | patient123 | Personal health records |

## ✨ Key Features

### 🤖 **Medical Expert System**
- AI-powered diagnosis assistance for malaria and typhoid fever
- Symptom analysis with confidence scoring
- Treatment protocol recommendations
- Risk assessment and stratification

### 👥 **Multi-Role Support**
- **Doctors**: Patient diagnosis, prescription management, medical reports
- **Nurses**: Patient monitoring, vital signs, care coordination
- **Pharmacists**: Prescription dispensing, inventory management
- **Receptionists**: Patient registration, appointment scheduling
- **Admins**: System management, user administration, analytics
- **Patients**: Health records access, appointment booking

### 📊 **Comprehensive Management**
- **Patient Records**: Complete medical history and demographics
- **Appointment System**: Scheduling with conflict detection
- **Prescription Management**: Digital prescriptions with tracking
- **Diagnosis System**: Structured diagnosis with expert system integration
- **Reporting**: Analytics and system monitoring

### 🔒 **Security & Authentication**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and CORS protection

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (HTML/JS)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Role-based UI │    │ • RESTful API   │    │ • Patient Data  │
│ • Authentication│    │ • Expert System │    │ • Medical Records│
│ • Real-time UI  │    │ • JWT Auth      │    │ • System Config │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
MESMTF-Project/
├── 📁 backend/                 # Backend API
│   ├── 📁 controllers/         # API controllers
│   ├── 📁 models/             # Database models
│   ├── 📁 routes/             # API routes
│   ├── 📁 middleware/         # Authentication & validation
│   ├── 📁 scripts/            # Database seeding
│   └── 📄 server.js           # Main server file
├── 📁 frontend/               # Frontend assets
│   ├── 📁 js/api/            # API integration layer
│   └── 📁 css/               # Styles
├── 📄 login.html             # Authentication page
├── 📄 doctor.html            # Doctor portal
├── 📄 admin.html             # Admin dashboard
├── 📄 patient.html           # Patient portal
├── 📄 test-system.html       # System testing
└── 📄 SETUP-GUIDE.md         # Detailed setup instructions
```

## 🧪 Testing

### Automated System Test
Open `test-system.html` in your browser to run comprehensive system tests:
- Backend connectivity
- Database health
- Authentication system
- All API endpoints
- Expert system integration

### Manual Testing
1. **Authentication**: Test login with different roles
2. **Patient Management**: Create, view, update patient records
3. **Appointments**: Schedule and manage appointments
4. **Diagnoses**: Use expert system for symptom assessment
5. **Prescriptions**: Create and dispense prescriptions

## 🔧 Configuration

### Environment Variables (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mesmtf

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Hospital Info
HOSPITAL_NAME=Ministry of Health Hospital
HOSPITAL_LOCATION=Windhoek, Namibia
```

## 📚 API Documentation

Interactive API documentation available at: http://localhost:5000/api-docs

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/patients` - Patient management
- `GET /api/appointments` - Appointment scheduling
- `POST /api/diagnosis/expert-system/assess` - Expert system
- `GET /api/prescriptions` - Prescription management
- `GET /api/admin/dashboard` - System analytics

## 🚀 Deployment

### Docker Deployment
```bash
cd backend
docker-compose up -d
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB instance
- [ ] Configure strong JWT secrets
- [ ] Set up HTTPS with reverse proxy
- [ ] Configure monitoring and logging
- [ ] Set up automated backups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

**Technical Support:**
- 📧 Email: support@moh.gov
- 📞 Phone: +264 61 123 4567
- 🚨 Emergency: +264 81 123 4567

**Documentation:**
- [Setup Guide](SETUP-GUIDE.md) - Detailed installation instructions
- [API Documentation](http://localhost:5000/api-docs) - Interactive API docs
- [System Test](test-system.html) - Automated testing suite

## 🙏 Acknowledgments

- **Ministry of Health, Namibia** - Domain expertise and requirements
- **Healthcare Professionals** - Clinical validation and feedback
- **Open Source Community** - Tools and libraries that made this possible

---

**Made with ❤️ for healthcare professionals in Namibia**
