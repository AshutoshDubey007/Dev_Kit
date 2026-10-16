#!/usr/bin/env node

/**
 * DevKit Production Database Restore CLI
 * 
 * Restores collections and documents from a verified backup archive.
 * 
 * Safety invariants:
 * - Requires explicit `--confirm` flag to execute writes (defaults to dry-run mode)
 * - Validates backup manifest before modifying database
 * 
 * Usage:
 *   node scripts/db-restore.mjs --input backups/backup-2026-10-16T...
 *   node scripts/db-restore.mjs --input backups/backup-2026-10-16T... --confirm
 *   node scripts/db-restore.mjs --input backups/backup-2026-10-16T... --confirm --drop
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
let inputDir = '';
let isConfirmed = false;
let shouldDrop = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) {
    inputDir = args[i + 1];
    i++;
  } else if (args[i] === '--confirm') {
    isConfirmed = true;
  } else if (args[i] === '--drop') {
    shouldDrop = true;
  }
}

if (!inputDir) {
  console.error('❌ Missing required --input argument.');
  console.log('Usage: node scripts/db-restore.mjs --input <backup-dir> [--confirm] [--drop]');
  process.exit(1);
}

if (!path.isAbsolute(inputDir)) {
  inputDir = path.resolve(rootDir, inputDir);
}

const manifestPath = path.join(inputDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Manifest not found at: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

async function runRestore() {
  console.log(`\n🔄 DevKit Database Restore Utility`);
  console.log(`📁 Source Archive:    ${inputDir}`);
  console.log(`📅 Backup Timestamp:  ${manifest.timestamp}`);
  console.log(`🛡️ Mode:              ${isConfirmed ? 'EXECUTE (LIVE RESTORE)' : 'DRY-RUN (SAFETY SIMULATION)'}`);
  if (shouldDrop) {
    console.log(`⚠️ Drop Policy:        EXISTING COLLECTIONS WILL BE DROPPED BEFORE INSERTION`);
  }
  console.log('');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log(`🔗 Target Database:   ${db.databaseName}\n`);

    const collectionNames = Object.keys(manifest.collections || {});

    for (const colName of collectionNames) {
      const colMeta = manifest.collections[colName];
      const dataFilePath = path.join(inputDir, colMeta.file);

      if (!fs.existsSync(dataFilePath)) {
        console.warn(`⚠️ Missing file for collection ${colName}: ${dataFilePath}, skipping`);
        continue;
      }

      const rawData = fs.readFileSync(dataFilePath, 'utf8');
      const docs = JSON.parse(rawData);

      console.log(`   📂 ${colName.padEnd(24)}: ${docs.length.toString().padStart(5)} documents to restore`);

      if (isConfirmed && docs.length > 0) {
        const collection = db.collection(colName);

        if (shouldDrop) {
          try {
            await collection.drop();
          } catch {}
        }

        // Upsert by _id or insert
        for (const doc of docs) {
          if (doc._id) {
            await collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
          } else {
            await collection.insertOne(doc);
          }
        }
      }
    }

    if (!isConfirmed) {
      console.log('\n🔒 DRY-RUN COMPLETED. No database changes were made.');
      console.log('   To apply these changes, re-run with the `--confirm` flag:');
      console.log(`   node scripts/db-restore.mjs --input "${inputDir}" --confirm\n`);
    } else {
      console.log('\n✅ Restore completed successfully!\n');
    }
  } catch (err) {
    console.error('❌ Restore failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runRestore();
