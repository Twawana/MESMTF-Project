import { connectDB } from './config/database.js';
import User from './models/User.pg.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Creating admin user in PostgreSQL...');

const createUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing users
    await User.destroy({ where: {} });
    console.log('🗑️ Cleared existing users');
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@moh.gov',
      password: 'admin123', // Will be hashed by the model hook
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
      isActive: true,
      profile: {
        phone: '+264 61 123 4567',
        address: 'Ministry of Health, Windhoek',
        dateOfBirth: '1980-01-01',
        gender: 'other'
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    
    // Create a doctor user
    const doctorUser = await User.create({
      username: 'dr.smith',
      email: 'dr.smith@moh.gov',
      password: 'doctor123',
      name: 'Dr. John Smith',
      role: 'doctor',
      status: 'active',
      isActive: true,
      profile: {
        phone: '+264 61 123 4568',
        address: 'Ministry of Health, Windhoek',
        dateOfBirth: '1975-05-15',
        gender: 'male',
        specialization: 'Internal Medicine',
        licenseNumber: 'MD001'
      }
    });
    
    console.log('✅ Doctor user created successfully!');
    
    // Create a patient user
    const patientUser = await User.create({
      username: 'patient.john',
      email: 'patient.john@email.com',
      password: 'patient123',
      name: 'John Doe',
      role: 'patient',
      status: 'active',
      isActive: true,
      profile: {
        phone: '+264 81 123 4567',
        address: 'Windhoek, Namibia',
        dateOfBirth: '1990-03-20',
        gender: 'male'
      }
    });
    
    console.log('✅ Patient user created successfully!');
    
    console.log('\n🎉 User creation completed!');
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Doctor: dr.smith / doctor123');
    console.log('   Patient: patient.john / patient123');
    
    // Verify users were created
    const userCount = await User.count();
    console.log(`\n📊 Total users in database: ${userCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Database connection failed. Please ensure:');
      console.log('   - PostgreSQL is running');
      console.log('   - Database exists (run: node setup-postgres.js)');
      console.log('   - Connection details in .env are correct');
    } else if (error.name === 'SequelizeValidationError') {
      console.log('\n💡 Validation errors:');
      error.errors.forEach(err => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }
    
    process.exit(1);
  }
};

createUsers();
