import 'dotenv/config';
import mongoose from 'mongoose';

const configuredMongoUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL;
const mongoUri = configuredMongoUri?.trim().replace(/^['"]|['"]$/g, '');

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is required. Add it to your environment or a .env file.');
}

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}
