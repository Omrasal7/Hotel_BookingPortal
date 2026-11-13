const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMySqlMigration() {
  console.log('Connecting to MySQL Server to initialize database & schema...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');

  console.log('Applying schema.sql...');
  await connection.query(schemaSql);
  console.log('Schema applied successfully.');

  console.log('Applying seed.sql...');
  await connection.query(seedSql);
  console.log('Sample data seeded successfully.');

  await connection.end();
  console.log('MySQL Database initialization complete!');
}

runMySqlMigration().catch((err) => {
  console.error('MySQL migration error:', err.message);
  console.log('Note: The backend automatically falls back to SQLite if MySQL is not available.');
  process.exit(0);
});

