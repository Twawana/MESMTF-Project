# 🐘 PostgreSQL Setup Guide for MESMTF

## 📋 **Prerequisites**

### **1. Install PostgreSQL**

#### **Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Set password for `postgres` user (remember this!)
4. Default port: 5432
5. Start PostgreSQL service

#### **Mac:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create postgres user if needed
createuser -s postgres
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **2. Verify PostgreSQL Installation**
```bash
# Check if PostgreSQL is running
psql --version

# Connect to PostgreSQL (will prompt for password)
psql -U postgres -h localhost
```

## 🚀 **Setup Steps**

### **Step 1: Update Environment Variables**
Your `.env` file should have:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/mesmtf
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mesmtf
DB_USER=postgres
DB_PASSWORD=password  # Use your actual PostgreSQL password
DB_DIALECT=postgres
```

### **Step 2: Install Dependencies**
```bash
cd backend
npm install pg sequelize
```

### **Step 3: Create Database**
```bash
# Run the database setup script
node setup-postgres.js
```

### **Step 4: Create Initial Users**
```bash
# Create admin and sample users
node create-admin-pg.js
```

### **Step 5: Verify Setup**
```bash
# Check if users were created
node check-users-pg.js
```

### **Step 6: Start the Server**
```bash
# Start the backend server
npm run dev
```

## 🔧 **Troubleshooting**

### **Connection Issues:**
- **Error: `ECONNREFUSED`**
  - PostgreSQL is not running
  - Check: `sudo systemctl status postgresql` (Linux) or Services (Windows)

- **Error: `password authentication failed`**
  - Wrong password in `.env` file
  - Reset password: `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'newpassword';"`

- **Error: `database "mesmtf" does not exist`**
  - Run: `node setup-postgres.js`

### **Permission Issues:**
```bash
# Linux: Give postgres user permissions
sudo -u postgres createdb mesmtf
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mesmtf TO postgres;"
```

## 📊 **Database Structure**

### **Users Table:**
- `id` (Primary Key, Auto-increment)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed with bcrypt)
- `name`
- `role` (ENUM: patient, doctor, nurse, pharmacist, receptionist, admin)
- `status` (ENUM: active, inactive, suspended)
- `profile` (JSONB - flexible profile data)
- `createdAt`, `updatedAt` (Timestamps)

### **Key Features:**
- ✅ **JSONB Support**: Flexible profile data storage
- ✅ **Indexes**: Optimized queries on username, email, role
- ✅ **Constraints**: Unique usernames/emails, role validation
- ✅ **Hooks**: Automatic password hashing
- ✅ **Timestamps**: Automatic created/updated tracking

## 🧪 **Testing**

### **Test Registration:**
1. Open `register.html`
2. Fill out the form
3. Submit - data will be saved to PostgreSQL

### **Test Login:**
1. Open `login-simple.html`
2. Use: `admin` / `admin123`
3. Should successfully authenticate

### **View Users:**
1. Open `view-users.html`
2. Click "Load Users from Database"
3. See all registered users from PostgreSQL

## 🔄 **Migration from MongoDB**

The system has been converted from MongoDB to PostgreSQL:

### **Changes Made:**
- ✅ Replaced Mongoose with Sequelize ORM
- ✅ Updated User model for PostgreSQL
- ✅ Modified auth controller for Sequelize syntax
- ✅ Added database connection configuration
- ✅ Created setup and seeding scripts
- ✅ Updated package.json dependencies

### **Benefits of PostgreSQL:**
- 🚀 **Better Performance**: Optimized for complex queries
- 🔒 **ACID Compliance**: Guaranteed data consistency
- 📊 **Advanced Data Types**: JSONB, Arrays, etc.
- 🔍 **Full-Text Search**: Built-in search capabilities
- 📈 **Scalability**: Better handling of concurrent users
- 🛡️ **Security**: Row-level security, advanced permissions

## 🎉 **You're Ready!**

Your MESMTF system now uses PostgreSQL for robust, scalable data storage!

**Default Login Credentials:**
- Admin: `admin` / `admin123`
- Doctor: `dr.smith` / `doctor123`
- Patient: `patient.john` / `patient123`
