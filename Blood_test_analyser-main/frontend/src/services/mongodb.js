import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const mongoUri = process.env.VITE_MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('VITE_MONGODB_URI is not defined in environment variables');
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('blood_test_analyzer');
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('✅ Connected to MongoDB Atlas');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('Database connection closed');
  }
}

export function getDatabase() {
  if (!cachedDb) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return cachedDb;
}
