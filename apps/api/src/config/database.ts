import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Menentukan lokasi database berdasarkan lokasi file ini
const currentDirectory = dirname(fileURLToPath(import.meta.url));

const dataDirectory = resolve(currentDirectory, '../../data');

// Membuat folder data jika belum tersedia
mkdirSync(dataDirectory, { recursive: true });

// Lokasi file SQLite
const databasePath = resolve(dataDirectory, 'brobean.sqlite');

// Membuat koneksi database
const db = new Database(databasePath);

// Konfigurasi SQLite
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
