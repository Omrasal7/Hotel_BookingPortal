const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Initializing database...');
    await db.initDatabase();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Thomas Cook Hotel Booking Portal Backend Running!`);
      console.log(`Server URL: http://localhost:${PORT}`);
      console.log(`Database Dialect: ${db.getDialect()}`);
      console.log(`Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`Hotels API: http://localhost:${PORT}/api/hotels`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();

