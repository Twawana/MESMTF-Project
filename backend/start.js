import app from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;

console.log('🚀 Starting MESMTF Backend Server...');
console.log(`📍 Port: ${PORT}`);
console.log(`🏥 Hospital: ${process.env.HOSPITAL_NAME}`);
console.log(`📍 Location: ${process.env.HOSPITAL_LOCATION}`);

app.listen(PORT, () => {
  console.log(`✅ MESMTF Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log('');
  console.log('🎯 Ready to accept connections!');
  console.log('Press Ctrl+C to stop the server');
});
