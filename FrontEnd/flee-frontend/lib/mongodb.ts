import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI || '';
const uri = 'mongodb+srv://carrold8:WuuqosEmPl7c6E6m@fleecluster.3sb6hhw.mongodb.net/?retryWrites=true&w=majority&appName=FleeCluster';
if (!uri) throw new Error('Missing MONGODB_URI');

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}

export default globalWithMongo._mongoClientPromise!;