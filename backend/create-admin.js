import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

console.log('🔧 Creating admin user...');

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing users first
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
        username: 'admin',
        email: 'admin@moh.gov',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'admin',
        isActive: true,
        profile: {
            phone: '+264 61 123 4567',
            address: 'Ministry of Health, Windhoek',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'other'
        }
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    
    // Create a doctor user too
    const doctorPassword = await bcrypt.hash('doctor123', 12);
    const doctorUser = new User({
        username: 'dr.smith',
        email: 'dr.smith@moh.gov',
        password: doctorPassword,
        name: 'Dr. John Smith',
        role: 'doctor',
        isActive: true,
        profile: {
            phone: '+264 61 123 4568',
            address: 'Ministry of Health, Windhoek',
            dateOfBirth: new Date('1975-05-15'),
            gender: 'male',
            specialization: 'Internal Medicine',
            licenseNumber: 'MD001'
        }
    });
    
    await doctorUser.save();
    console.log('✅ Doctor user created successfully!');
    
    // Create a patient user
    const patientPassword = await bcrypt.hash('patient123', 12);
    const patientUser = new User({
        username: 'patient.john',
        email: 'patient.john@email.com',
        password: patientPassword,
        name: 'John Doe',
        role: 'patient',
        isActive: true,
        profile: {
            phone: '+264 81 123 4567',
            address: 'Windhoek, Namibia',
            dateOfBirth: new Date('1990-03-20'),
            gender: 'male'
        }
    });
    
    await patientUser.save();
    console.log('✅ Patient user created successfully!');
    
    console.log('\n🎉 User creation completed!');
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Doctor: dr.smith / doctor123');
    console.log('   Patient: patient.john / patient123');
    
    process.exit(0);
} catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
}
