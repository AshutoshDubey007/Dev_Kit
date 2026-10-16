#!/usr/bin/env node

/**
 * DevKit Production Database Backup CLI
 * 
 * Safely extracts collections and documents into timestamped JSON backups with integrity manifest.
 * 
 * Usage:
 *   node scripts/db-backup.mjs
 *   node scripts/db-backup.mjs --output backups/pre-launch
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local if present
const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI is not set. Please define MONGODB_URI in your environment or .env.local.');
  process.exit(1);
}

// Parse CLI args
const args = process.argv.slice(2);
let outputDir = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[i + 1];
    i++;
  }
}

if (!outputDir) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  outputDir = path.join(rootDir, 'backups', `backup-${timestamp}`);
} else if (!path.isAbsolute(outputDir)) {
  outputDir = path.resolve(rootDir, outputDir);
}

fs.mkdirSync(outputDir, { recursive: true });

async function runBackup() {
  console.log(`📦 Starting DevKit Database Backup...`);
  console.log(`📁 Target directory: ${outputDir}`);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log(`🔗 Connected to database: ${db.databaseName}`);

    const collections = await db.listCollections().toArray();
    const manifest = {
      version: '1.0',
      database: db.databaseName,
      timestamp: new Date().toISOString(),
      collections: {},
    };

    let totalDocs = 0;

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Skip system or internal collections
      if (colName.startsWith('system.')) continue;

      const collection = db.collection(colName);
      const docs = await collection.find({}).toArray();
      const filePath = path.join(outputDir, `${colName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');

      manifest.collections[colName] = {
        count: docs.length,
        file: `${colName}.json`,
        sizeBytes: fs.statSync(filePath).size,
      };

      totalDocs += docs.length;
      console.log(`   ✓ ${colName.padEnd(24)}: ${docs.length.toString().padStart(5)} records saved`);
    }

    const manifestPath = path.join(outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`\n🎉 Backup complete!`);
    console.log(`   Total collections: ${Object.keys(manifest.collections).length}`);
    console.log(`   Total records:     ${totalDocs}`);
    console.log(`   Manifest:          ${manifestPath}\n`);
  } catch (err) {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runBackup();
