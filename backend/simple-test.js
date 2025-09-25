import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Simple MongoDB test...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create a simple test collection
    const TestSchema = new mongoose.Schema({
        name: String,
        created: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Clear any existing test documents
    await Test.deleteMany({});
    console.log('🗑️ Cleared test collection');
    
    // Create a test document
    const testDoc = new Test({ name: 'Test User' });
    await testDoc.save();
    console.log('✅ Test document created');
    
    // Find the test document
    const found = await Test.findOne({ name: 'Test User' });
    if (found) {
        console.log('✅ Test document found:', found.name);
    } else {
        console.log('❌ Test document not found');
    }
    
    // Clean up
    await Test.deleteMany({});
    console.log('🗑️ Cleaned up test collection');
    
    console.log('🎉 MongoDB is working correctly!');
    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
