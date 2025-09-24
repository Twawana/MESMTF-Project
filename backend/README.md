# MESMTF Backend API

**Medical Expert System for Malaria and Typhoid Fever - Backend API**

A comprehensive healthcare management system backend built with Node.js, Express, and MongoDB, featuring role-based authentication, medical expert system capabilities, and RESTful APIs.

## 🚀 Features

- **Role-Based Authentication**: JWT-based auth with 6 user roles (Patient, Doctor, Nurse, Pharmacist, Receptionist, Admin)
- **Medical Expert System**: AI-powered diagnosis assistance for Malaria and Typhoid Fever
- **Patient Management**: Complete patient records and medical history
- **Appointment Scheduling**: Advanced appointment management with conflict detection
- **Prescription Management**: Digital prescriptions with dispensing tracking
- **Diagnosis System**: Comprehensive diagnosis recording with expert system recommendations
- **Admin Dashboard**: System monitoring, reporting, and user management
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Data Validation**: Comprehensive input validation and sanitization
- **Security**: Rate limiting, CORS, helmet security headers

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MESMTF-Project/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mesmtf
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   # ... other configurations
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔗 API Endpoints

The server will start on `http://localhost:5000`

### 📚 API Documentation
Interactive API documentation is available at: `http://localhost:5000/api-docs`

### 🔐 Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### 👥 User Management
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/status` - Update user status (Admin only)

### 🏥 Patient Management
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (Admin only)
- `GET /api/patients/search` - Search patients

### 📅 Appointment Management
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `PATCH /api/appointments/:id/status` - Update appointment status

### 🔬 Diagnosis System
- `GET /api/diagnosis` - Get diagnoses
- `GET /api/diagnosis/:id` - Get diagnosis by ID
- `POST /api/diagnosis` - Create new diagnosis (Doctor only)
- `PUT /api/diagnosis/:id` - Update diagnosis (Doctor only)
- `POST /api/diagnosis/expert-system/assess` - Get expert system assessment

### 💊 Prescription Management
- `GET /api/prescriptions` - Get prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create new prescription (Doctor only)
- `PUT /api/prescriptions/:id` - Update prescription (Doctor only)
- `PATCH /api/prescriptions/:id/dispense` - Dispense prescription (Pharmacist only)
- `PATCH /api/prescriptions/:id/cancel` - Cancel prescription

### 🛡️ Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/system-health` - Get system health status
- `GET /api/admin/reports/summary` - Get summary reports
- `GET /api/admin/audit-logs` - Get audit logs
- `POST /api/admin/backup` - Initiate system backup
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## 👤 User Roles & Permissions

### Patient
- View own appointments, diagnoses, and prescriptions
- Update own profile information

### Doctor
- Manage patients and appointments
- Create diagnoses and prescriptions
- Access expert system recommendations
- View medical reports

### Nurse
- Assist with patient management
- Update appointment status and vital signs
- Access expert system for symptom assessment

### Pharmacist
- View and dispense prescriptions
- Manage medication inventory
- Update prescription status

### Receptionist
- Manage patient registration
- Schedule and manage appointments
- Handle check-in/check-out processes

### Admin
- Full system access
- User management
- System monitoring and reporting
- Backup and maintenance operations

## 🧪 Default Login Credentials

After running the seed script, you can use these credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Doctor | dr.smith | doctor123 |
| Nurse | nurse.jane | nurse123 |
| Pharmacist | pharm.mike | pharm123 |
| Receptionist | recep.mary | recep123 |
| Patient | patient.john | patient123 |

## 🤖 Medical Expert System

The system includes AI-powered diagnosis assistance for:

### Malaria Assessment
- Symptom analysis against malaria symptom database
- Risk level calculation (Low, Moderate, High)
- Test result integration (Rapid test, Microscopy)
- Treatment recommendations

### Typhoid Assessment
- Symptom pattern recognition
- Risk stratification
- Laboratory test integration (Widal test, Blood culture)
- Clinical decision support

### Expert System Features
- Real-time symptom assessment
- Confidence scoring
- Treatment protocol suggestions
- Follow-up recommendations

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- MongoDB injection prevention

## 📊 Monitoring & Logging

- System health monitoring
- Performance metrics
- Audit logging for sensitive operations
- Error tracking and reporting
- Database backup automation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment
```bash
# Build Docker image
docker build -t mesmtf-backend .

# Run container
docker run -p 5000:5000 --env-file .env mesmtf-backend
```

## 📈 Performance Optimization

- Database indexing for optimal query performance
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Connection pooling for database operations
- Compression middleware for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@moh.gov
- Phone: +264 61 123 4567
- Emergency: +264 81 123 4567

## 🔄 API Versioning

Current API version: v1
Base URL: `http://localhost:5000/api/`

Future versions will be available at `/api/v2/`, `/api/v3/`, etc.
