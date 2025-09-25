import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

console.log('🔍 Checking database users...');

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users in database:`);
    
    users.forEach(user => {
        console.log(`   - ${user.username} (${user.role}) - ${user.name}`);
    });
    
    // Check specifically for admin user
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
        console.log('\n✅ Admin user found:');
        console.log(`   Username: ${adminUser.username}`);
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Email: ${adminUser.email}`);
    } else {
        console.log('\n❌ Admin user NOT found in database!');
    }
    
    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
