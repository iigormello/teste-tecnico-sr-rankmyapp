import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';

const COLLECTION = process.env.MONGODB_COLLECTION ?? 'orders';

export async function connectMongo(): Promise<void> {
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db();
  await db.collection(COLLECTION).createIndex({ orderNumber: 1 }, { unique: true });
  console.log('MongoDB connected successfully');
}

export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
  }
}
