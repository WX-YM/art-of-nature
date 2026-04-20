import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is required.');
}

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri);
  }

  return connectionPromise;
}
