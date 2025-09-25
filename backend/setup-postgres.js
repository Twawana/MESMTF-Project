import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  // Connect to PostgreSQL server (without specific database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'mesmtf';
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await client.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      // Create database
      console.log(`🔧 Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }

    await client.end();
    console.log('🎉 Database setup completed!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Update your .env file with correct database credentials');
    console.log('3. Run: node create-admin-pg.js');
    console.log('4. Start the server: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL connection failed. Please ensure:');
      console.log('   - PostgreSQL is installed and running');
      console.log('   - Connection details in .env are correct');
      console.log('   - Default credentials: postgres/password');
    }
    
    process.exit(1);
  }
};

setupDatabase();
