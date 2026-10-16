import { MongoClient, Db } from 'mongodb';

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoMockDb: any | undefined;
}

/**
 * Injects a mock database instance for testing.
 * When set, getDatabase() will return this mock instance without connecting to MongoDB.
 */
export function setMockDatabase(mockDb: any | null): void {
  global._mongoMockDb = mockDb || undefined;
}

/**
 * Returns the currently active mock database instance, if one has been injected.
 */
export function getMockDatabase(): any | undefined {
  return global._mongoMockDb;
}

/**
 * Lazily obtains or initializes the MongoDB client connection promise.
 * Avoids eager connection or rejection side-effects during module import.
 */
export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error('Please define MONGODB_URI in .env.local'));
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

/**
 * Returns the MongoDB Database instance.
 * If a mock database was injected via setMockDatabase(), it is returned immediately.
 */
export async function getDatabase(dbName = 'devkit'): Promise<Db> {
  if (global._mongoMockDb) {
    return global._mongoMockDb as unknown as Db;
  }
  const connectedClient = await getClientPromise();
  return connectedClient.db(dbName);
}

// Lazy proxy object for backwards compatibility with default export (e.g. NextAuth adapter)
const clientPromiseProxy = new Proxy({} as Promise<MongoClient>, {
  get(_target, prop) {
    const promise = getClientPromise();
    const value = (promise as any)[prop];
    return typeof value === 'function' ? value.bind(promise) : value;
  },
});

export default clientPromiseProxy;
