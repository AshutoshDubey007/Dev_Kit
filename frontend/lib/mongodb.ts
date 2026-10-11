import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  // In development/build without env, don't crash static analysis
  clientPromise = Promise.reject(new Error('Please define MONGODB_URI in .env.local'));
} else {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the MongoClient is not repeated on hot reloads
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

/**
 * Returns the MongoDB Database instance
 */
export async function getDatabase(dbName = 'devkit'): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
