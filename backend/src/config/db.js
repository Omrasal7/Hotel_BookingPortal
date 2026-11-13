const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let sqliteDb = null;
let currentDialect = process.env.DB_DIALECT || 'sqlite';

const initialHotels = [
  {
    id: 1,
    name: 'The Grand Heritage Palace',
    location: 'Jaipur',
    description: 'A majestic royal palace experience in the Pink City featuring traditional Rajasthani architecture, lush Mughal gardens, and authentic fine-dining restaurants.',
    amenities: JSON.stringify(['Free High-Speed WiFi', 'Heritage Swimming Pool', 'Ayurvedic Royal Spa', 'Complimentary Breakfast', '24/7 Room Service', 'Airport Shuttle']),
    room_price_per_night: 4500.00,
    total_rooms: 5,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Azure Bay Beach Resort & Spa',
    location: 'Goa',
    description: 'Beachfront luxury resort overlooking pristine Arabian Sea sands in Calangute. Enjoy private sunbeds, oceanview infinity pools, and vibrant coastal cuisine.',
    amenities: JSON.stringify(['Private Beach Access', 'Infinity Pool', 'Free Buffet Breakfast', 'Beachside Bar', 'Fitness Center', 'High-Speed WiFi']),
    room_price_per_night: 3800.00,
    total_rooms: 6,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'The Regal Skyline Suites',
    location: 'Mumbai',
    description: 'Sophisticated high-rise suites in the heart of Mumbai business district. Perfect for discerning corporate travelers and luxury weekend staycations.',
    amenities: JSON.stringify(['Panoramic City View', 'Rooftop Lounge', 'High-Speed Business WiFi', 'Executive Meeting Rooms', '24/7 Concierge', 'Valet Parking']),
    room_price_per_night: 5200.00,
    total_rooms: 4,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Alpine Mist Mountain Resort',
    location: 'Manali',
    description: 'Nestled amidst snow-capped Himalayan peaks and pine forests. Cozy cedar-wood rooms with private fireplaces, hot springs, and guided mountain treks.',
    amenities: JSON.stringify(['Snow Mountain View', 'Heated Indoor Pool', 'Campfire & Barbecue', 'Free WiFi', 'Trekking Desk', 'Multi-Cuisine Restaurant']),
    room_price_per_night: 3200.00,
    total_rooms: 5,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    name: 'Emerald Tea Valley Retreat',
    location: 'Munnar',
    description: 'Idyllic eco-luxury resort surrounded by rolling green tea plantations and misty valleys. Wake up to bird songs, spice plantation walks, and pure serenity.',
    amenities: JSON.stringify(['Tea Garden Trails', 'Organic Restaurant', 'Balcony with Valley View', 'Spa & Wellness', 'Free WiFi', 'Yoga Sessions']),
    room_price_per_night: 2900.00,
    total_rooms: 5,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    name: 'Silicon Valley Executive Hotel',
    location: 'Bengaluru',
    description: 'Contemporary tech-hub hotel located close to Electronic City and Indiranagar. Ergonomic workspaces, fast fiber internet, and artisan coffee bar.',
    amenities: JSON.stringify(['Ultra-Fast Fiber WiFi', 'Ergonomic Workstation', 'Rooftop Pool', 'Cocktail Bar', 'Soundproof Rooms', 'Fitness Studio']),
    room_price_per_night: 3400.00,
    total_rooms: 4,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
  }
];

function getSqliteDb() {
  if (!sqliteDb) {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = process.env.NODE_ENV === 'test'
      ? ':memory:'
      : path.join(__dirname, '../../database/hotel_booking.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
  }
  return sqliteDb;
}

async function initSqlite() {
  const db = getSqliteDb();
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS hotels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          description TEXT NOT NULL,
          amenities TEXT NOT NULL,
          room_price_per_night REAL NOT NULL,
          total_rooms INTEGER NOT NULL DEFAULT 5,
          rating REAL DEFAULT 4.5,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          booking_reference TEXT NOT NULL UNIQUE,
          hotel_id INTEGER NOT NULL,
          guest_name TEXT NOT NULL,
          guest_email TEXT NOT NULL,
          check_in_date TEXT NOT NULL,
          check_out_date TEXT NOT NULL,
          total_nights INTEGER NOT NULL,
          base_amount REAL NOT NULL,
          discount_amount REAL NOT NULL DEFAULT 0.0,
          total_amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'CONFIRMED',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          cancelled_at DATETIME,
          FOREIGN KEY (hotel_id) REFERENCES hotels(id)
        )
      `);

      db.get('SELECT COUNT(*) as count FROM hotels', [], (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          const stmt = db.prepare(`
            INSERT INTO hotels (id, name, location, description, amenities, room_price_per_night, total_rooms, rating, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const h of initialHotels) {
            stmt.run(h.id, h.name, h.location, h.description, h.amenities, h.room_price_per_night, h.total_rooms, h.rating, h.image_url);
          }
          stmt.finalize((finalErr) => {
            if (finalErr) return reject(finalErr);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  });
}

async function initMySql() {
  const mysql = require('mysql2/promise');
  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_booking_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  pool = mysql.createPool(poolConfig);
  // Verify connection
  await pool.query('SELECT 1');
}

async function initDatabase() {
  if (currentDialect === 'mysql') {
    try {
      await initMySql();
      console.log('Connected successfully to MySQL Database:', process.env.DB_NAME);
      return;
    } catch (err) {
      console.warn('MySQL connection failed, falling back to embedded SQLite database. Reason:', err.message);
      currentDialect = 'sqlite';
    }
  }
  await initSqlite();
  console.log('Using SQLite Database for seamless local execution.');
}

async function query(sql, params = []) {
  if (currentDialect === 'mysql' && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // SQLite execution
  const db = getSqliteDb();
  const trimmed = sql.trim().toUpperCase();

  return new Promise((resolve, reject) => {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({
          insertId: this.lastID,
          affectedRows: this.changes
        });
      });
    }
  });
}

module.exports = {
  initDatabase,
  query,
  getDialect: () => currentDialect,
  close: async () => {
    if (pool) await pool.end();
    if (sqliteDb) {
      return new Promise((res) => sqliteDb.close(res));
    }
  }
};

