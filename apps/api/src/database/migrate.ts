
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../config/database.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(currentDirectory, 'migrations');

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationFiles = readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const alreadyApplied = db
      .prepare('SELECT migration FROM schema_migrations WHERE migration = ?')
      .get(file);

    if (alreadyApplied) {
      console.log(`Migration dilewati: ${file}`);
      continue;
    }

    const sql = readFileSync(join(migrationsDirectory, file), 'utf8')
      .replace(/^\uFEFF/, '');

    const applyMigration = db.transaction(() => {
      db.exec(sql);
      db.prepare(
        'INSERT INTO schema_migrations (migration) VALUES (?)'
      ).run(file);
    });

    applyMigration();
    console.log(`Migration berhasil: ${file}`);
  }

  console.log('Semua migration selesai.');
}
