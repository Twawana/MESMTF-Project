import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Creating admin user directly...');

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Clear existing users
    await usersCollection.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 Password hashed');
    
    // Create admin user document
    const adminUser = {
        username: 'admin',
        email: 'admin@moh.gov',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'admin',
        isActive: true,
        status: 'active',
        profile: {
            phone: '+264 61 123 4567',
            address: 'Ministry of Health, Windhoek',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'other'
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // Insert the user
    const result = await usersCollection.insertOne(adminUser);
    console.log('✅ Admin user created with ID:', result.insertedId);
    
    // Verify the user was created
    const foundUser = await usersCollection.findOne({ username: 'admin' });
    if (foundUser) {
        console.log('✅ Admin user verified in database');
        console.log('   Username:', foundUser.username);
        console.log('   Name:', foundUser.name);
        console.log('   Role:', foundUser.role);
    } else {
        console.log('❌ Admin user not found after creation');
    }
    
    console.log('\n🎉 User creation completed!');
    console.log('🔐 Login with: admin / admin123');
    
    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
