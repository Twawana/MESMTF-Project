import { connectDB } from './config/database.js';
import User from './models/User.pg.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking PostgreSQL database users...');

const checkUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'name', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`📊 Found ${users.length} users in PostgreSQL database:`);
    
    if (users.length === 0) {
      console.log('   (No users found)');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.role}) - ${user.name}`);
      });
    }
    
    // Check for admin user specifically
    const adminUser = await User.findOne({
      where: { username: 'admin' }
    });
    
    if (adminUser) {
      console.log('\n✅ Admin user found:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log(`   Created: ${adminUser.createdAt}`);
    } else {
      console.log('\n❌ Admin user NOT found in database!');
      console.log('   Run: node create-admin-pg.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Database connection failed. Please ensure:');
      console.log('   - PostgreSQL is running');
      console.log('   - Database exists (run: node setup-postgres.js)');
      console.log('   - Connection details in .env are correct');
    }
    
    process.exit(1);
  }
};

checkUsers();
