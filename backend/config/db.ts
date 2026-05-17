import mongoose from 'mongoose';

let retryCount = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    return;
  }

  const attempt = async (): Promise<void> => {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      retryCount = 0;
      console.log('✅ MongoDB connected successfully');
    } catch (error: any) {
      retryCount++;
      const msg = error?.message?.includes('whitelist')
        ? 'IP not whitelisted on MongoDB Atlas — go to cloud.mongodb.com → Network Access → Add IP'
        : error?.message || String(error);

      console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${msg}`);

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        setTimeout(attempt, RETRY_DELAY_MS);
      } else {
        console.error('🛑 Max retries reached. Server is running but database is offline.');
        console.error('   Fix: Whitelist your IP at cloud.mongodb.com → Network Access');
      }
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected — reconnecting...');
    retryCount = 0;
    setTimeout(attempt, RETRY_DELAY_MS);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });

  await attempt();
};

export default connectDB;
