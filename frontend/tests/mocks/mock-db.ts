/**
 * In-Memory Mock MongoDB Database for Hermetic Unit Testing
 * 
 * Provides a lightweight, high-performance, in-memory implementation of the MongoDB Db
 * interface for unit tests without requiring a live MongoDB server or network access.
 */

import { ObjectId } from 'mongodb';

export function cloneDoc<T>(doc: T): T {
  if (doc === null || doc === undefined) return doc;
  if (doc instanceof ObjectId) return new ObjectId(doc.toString()) as unknown as T;
  if (doc instanceof Date) return new Date(doc.getTime()) as unknown as T;
  if (Array.isArray(doc)) return doc.map(cloneDoc) as unknown as T;
  if (typeof doc === 'object') {
    const copy: any = {};
    for (const [k, v] of Object.entries(doc)) {
      copy[k] = cloneDoc(v);
    }
    return copy;
  }
  return doc;
}

export function matchesFilter(doc: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      if (!val.some((sub) => matchesFilter(doc, sub))) return false;
      continue;
    }
    const docVal = doc[key];
    if (val instanceof ObjectId && docVal instanceof ObjectId) {
      if (!val.equals(docVal)) return false;
      continue;
    }
    if (val instanceof Date && docVal instanceof Date) {
      if (val.getTime() !== docVal.getTime()) return false;
      continue;
    }
    if (val && typeof val === 'object' && !(val instanceof ObjectId) && !(val instanceof Date)) {
      if ('$in' in val && Array.isArray(val.$in)) {
        const hasMatch = val.$in.some((item: any) => {
          if (item instanceof ObjectId && docVal instanceof ObjectId) return item.equals(docVal);
          if (item instanceof Date && docVal instanceof Date) return item.getTime() === docVal.getTime();
          return item === docVal;
        });
        if (!hasMatch) return false;
        continue;
      }
      if ('$ne' in val) {
        if (docVal === val.$ne) return false;
        continue;
      }
      if ('$gt' in val) {
        if (!(docVal > (val as any).$gt)) return false;
        continue;
      }
      if ('$gte' in val) {
        if (!(docVal >= (val as any).$gte)) return false;
        continue;
      }
      if ('$lt' in val) {
        if (!(docVal < (val as any).$lt)) return false;
        continue;
      }
      if ('$lte' in val) {
        if (!(docVal <= (val as any).$lte)) return false;
        continue;
      }
    }
    if (docVal !== val) {
      return false;
    }
  }
  return true;
}

export function applyUpdate(doc: any, update: any): void {
  if (!update) return;
  if (update.$set) {
    for (const [k, v] of Object.entries(update.$set)) {
      doc[k] = cloneDoc(v);
    }
  }
  if (update.$inc) {
    for (const [k, v] of Object.entries(update.$inc)) {
      doc[k] = (Number(doc[k]) || 0) + (Number(v) || 0);
    }
  }
  if (update.$setOnInsert) {
    for (const [k, v] of Object.entries(update.$setOnInsert)) {
      if (doc[k] === undefined) {
        doc[k] = cloneDoc(v);
      }
    }
  }
}

export interface MockCollection {
  name: string;
  insertOne: (doc: any) => Promise<{ insertedId: ObjectId; acknowledged: boolean }>;
  findOne: (filter: any) => Promise<any | null>;
  find: (filter?: any) => { toArray: () => Promise<any[]> };
  findOneAndUpdate: (filter: any, update: any, options?: any) => Promise<any | null>;
  updateOne: (filter: any, update: any, options?: any) => Promise<{ matchedCount: number; modifiedCount: number; acknowledged: boolean }>;
  replaceOne: (filter: any, replacement: any, options?: any) => Promise<{ matchedCount: number; modifiedCount: number; acknowledged: boolean }>;
  createIndex: (keys: any, options?: any) => Promise<string>;
  drop: () => Promise<boolean>;
  countDocuments: (filter?: any) => Promise<number>;
}

export interface MockDatabase {
  databaseName: string;
  collection: (name: string) => MockCollection;
  command: (cmd: any) => Promise<any>;
  listCollections: () => { toArray: () => Promise<Array<{ name: string }>> };
  clear: () => void;
  _stores: Map<string, any[]>;
}

export function createMockDb(dbName = 'devkit-test'): MockDatabase {
  const stores = new Map<string, any[]>();
  const uniqueIndexes = new Map<string, Set<string>>();

  function getStore(name: string): any[] {
    let store = stores.get(name);
    if (!store) {
      store = [];
      stores.set(name, store);
    }
    return store;
  }

  function getUniqueKeys(name: string): Set<string> {
    let set = uniqueIndexes.get(name);
    if (!set) {
      set = new Set<string>();
      uniqueIndexes.set(name, set);
    }
    return set;
  }

  function createCollection(name: string): MockCollection {
    const store = getStore(name);
    const uniqueKeys = getUniqueKeys(name);

    return {
      name,
      async insertOne(doc: any) {
        const newDoc = cloneDoc(doc);
        if (!newDoc._id) {
          newDoc._id = new ObjectId();
        }

        // Enforce unique index constraints
        for (const uKey of uniqueKeys) {
          if (newDoc[uKey] !== undefined) {
            const duplicate = store.find((d) => d[uKey] === newDoc[uKey]);
            if (duplicate) {
              const err: any = new Error(`E11000 duplicate key error collection: ${name} index: ${uKey}_1 dup key: { ${uKey}: "${newDoc[uKey]}" }`);
              err.code = 11000;
              throw err;
            }
          }
        }

        store.push(newDoc);
        return { insertedId: newDoc._id, acknowledged: true };
      },

      async findOne(filter: any) {
        const found = store.find((d) => matchesFilter(d, filter));
        return found ? cloneDoc(found) : null;
      },

      find(filter = {}) {
        return {
          toArray: async () => {
            return store.filter((d) => matchesFilter(d, filter)).map(cloneDoc);
          },
        };
      },

      async findOneAndUpdate(filter: any, update: any, options: any = {}) {
        const idx = store.findIndex((d) => matchesFilter(d, filter));
        if (idx !== -1) {
          const before = cloneDoc(store[idx]);
          applyUpdate(store[idx], update);
          return options.returnDocument === 'after' ? cloneDoc(store[idx]) : before;
        }

        if (options.upsert) {
          const newDoc: any = {};
          if (filter) {
            for (const [k, v] of Object.entries(filter)) {
              if (!k.startsWith('$')) newDoc[k] = cloneDoc(v);
            }
          }
          if (!newDoc._id) newDoc._id = new ObjectId();
          applyUpdate(newDoc, update);
          store.push(newDoc);
          return cloneDoc(newDoc);
        }

        return null;
      },

      async updateOne(filter: any, update: any, options: any = {}) {
        const idx = store.findIndex((d) => matchesFilter(d, filter));
        if (idx !== -1) {
          applyUpdate(store[idx], update);
          return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
        }

        if (options.upsert) {
          const newDoc: any = {};
          if (filter) {
            for (const [k, v] of Object.entries(filter)) {
              if (!k.startsWith('$')) newDoc[k] = cloneDoc(v);
            }
          }
          if (!newDoc._id) newDoc._id = new ObjectId();
          applyUpdate(newDoc, update);
          store.push(newDoc);
          return { matchedCount: 0, modifiedCount: 1, acknowledged: true };
        }

        return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
      },

      async replaceOne(filter: any, replacement: any, options: any = {}) {
        const idx = store.findIndex((d) => matchesFilter(d, filter));
        if (idx !== -1) {
          const existingId = store[idx]._id;
          const newDoc = cloneDoc(replacement);
          newDoc._id = existingId;
          store[idx] = newDoc;
          return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
        }
        if (options.upsert) {
          const newDoc = cloneDoc(replacement);
          if (!newDoc._id) newDoc._id = new ObjectId();
          store.push(newDoc);
          return { matchedCount: 0, modifiedCount: 1, acknowledged: true };
        }
        return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
      },

      async createIndex(keys: any, options: any = {}) {
        if (options.unique) {
          for (const key of Object.keys(keys)) {
            uniqueKeys.add(key);
          }
        }
        return Object.keys(keys).join('_') + '_1';
      },

      async drop() {
        store.length = 0;
        return true;
      },

      async countDocuments(filter = {}) {
        return store.filter((d) => matchesFilter(d, filter)).length;
      },
    };
  }

  return {
    databaseName: dbName,
    collection(name: string) {
      return createCollection(name);
    },
    async command(cmd: any) {
      if (cmd.ping) return { ok: 1 };
      return { ok: 1 };
    },
    listCollections() {
      return {
        toArray: async () => Array.from(stores.keys()).map((name) => ({ name })),
      };
    },
    clear() {
      for (const store of stores.values()) {
        store.length = 0;
      }
    },
    _stores: stores,
  };
}
