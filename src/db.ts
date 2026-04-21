import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { SCHEMA_SQL } from './schema.js';

export function resolveDbPath(): string {
  if (process.env.PASSOFF_DB_PATH) return process.env.PASSOFF_DB_PATH;
  return join(homedir(), '.passoff', 'db.sqlite');
}

export function openDb(path?: string): Database.Database {
  const dbPath = path ?? resolveDbPath();
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

export function runMigrations(db: Database.Database): void {
  db.exec(SCHEMA_SQL);
}
