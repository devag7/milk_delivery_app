import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'milk_delivery.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      milk TEXT NOT NULL,
      quantity REAL NOT NULL,
      price_per_liter REAL NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}
