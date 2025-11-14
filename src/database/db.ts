import Database from 'better-sqlite3';
import path from 'path';

// Create a database in the project directory
const dbPath = path.join(__dirname, '../../car-dealer.db');
const db = new Database(dbPath);

// Initialize database schema
function initializeDatabase() {
  // Create cars table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      mileage INTEGER NOT NULL,
      image TEXT,
      description TEXT,
      featured BOOLEAN DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      questionType TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export { db, initializeDatabase };
