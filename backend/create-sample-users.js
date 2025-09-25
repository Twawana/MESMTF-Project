import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log('👥 Creating sample users...');

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Hash passwords
    const doctorPassword = await bcrypt.hash('doctor123', 12);
    const nursePassword = await bcrypt.hash('nurse123', 12);
    const pharmacistPassword = await bcrypt.hash('pharm123', 12);
    const receptionistPassword = await bcrypt.hash('recep123', 12);
    const patientPassword = await bcrypt.hash('patient123', 12);
    
    // Create sample users
    const sampleUsers = [
        {
            username: 'dr.smith',
            email: 'dr.smith@moh.gov',
            password: doctorPassword,
            name: 'Dr. John Smith',
            role: 'doctor',
            isActive: true,
            status: 'active',
            profile: {
                phone: '+264 61 123 4568',
                address: 'Ministry of Health, Windhoek',
                dateOfBirth: new Date('1975-05-15'),
                gender: 'male',
                specialization: 'Internal Medicine',
                licenseNumber: 'MD001'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            username: 'nurse.jane',
            email: 'nurse.jane@moh.gov',
            password: nursePassword,
            name: 'Jane Wilson',
            role: 'nurse',
            isActive: true,
            status: 'active',
            profile: {
                phone: '+264 61 123 4569',
                address: 'Ministry of Health, Windhoek',
                dateOfBirth: new Date('1985-08-22'),
                gender: 'female'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            username: 'pharm.mike',
            email: 'pharm.mike@moh.gov',
            password: pharmacistPassword,
            name: 'Mike Johnson',
            role: 'pharmacist',
            isActive: true,
            status: 'active',
            profile: {
                phone: '+264 61 123 4570',
                address: 'Ministry of Health, Windhoek',
                dateOfBirth: new Date('1980-12-10'),
                gender: 'male'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            username: 'recep.mary',
            email: 'recep.mary@moh.gov',
            password: receptionistPassword,
            name: 'Mary Brown',
            role: 'receptionist',
            isActive: true,
            status: 'active',
            profile: {
                phone: '+264 61 123 4571',
                address: 'Ministry of Health, Windhoek',
                dateOfBirth: new Date('1990-03-18'),
                gender: 'female'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            username: 'patient.john',
            email: 'patient.john@email.com',
            password: patientPassword,
            name: 'John Doe',
            role: 'patient',
            isActive: true,
            status: 'active',
            profile: {
                phone: '+264 81 123 4567',
                address: 'Windhoek, Namibia',
                dateOfBirth: new Date('1990-03-20'),
                gender: 'male'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    // Insert the users (only if they don't exist)
    for (const user of sampleUsers) {
        const existingUser = await usersCollection.findOne({ username: user.username });
        if (!existingUser) {
            await usersCollection.insertOne(user);
            console.log(`✅ Created user: ${user.username} (${user.role})`);
        } else {
            console.log(`⏭️ User already exists: ${user.username}`);
        }
    }
    
    console.log('\n🎉 Sample users creation completed!');
    console.log('\n🔐 Available login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Doctor: dr.smith / doctor123');
    console.log('   Nurse: nurse.jane / nurse123');
    console.log('   Pharmacist: pharm.mike / pharm123');
    console.log('   Receptionist: recep.mary / recep123');
    console.log('   Patient: patient.john / patient123');
    
    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
