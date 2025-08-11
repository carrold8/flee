import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
if (!uri) throw new Error('Missing MONGODB_URI');

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}

export default globalWithMongo._mongoClientPromise!;