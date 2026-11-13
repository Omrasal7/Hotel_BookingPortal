const express = require('express');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const db = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging for development/testing
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint (for test automation suites and CI/CD pipelines)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    databaseDialect: db.getDialect(),
    timestamp: new Date().toISOString(),
    service: 'Thomas Cook Hotel Booking Portal API'
  });
});

// Mount Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;

