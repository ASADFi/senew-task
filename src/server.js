require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const redisService = require('./services/redisService');
const cleanupJob = require('./jobs/cleanupJob');

const PORT = process.env.PORT || 3000;

// Initialize server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Initialize Redis service
    redisService.initialize();

    // Start cleanup job
    cleanupJob.start();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Flash Deal API Server Running        ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV}            ║
║   Time: ${new Date().toISOString()}      ║
╚════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      cleanupJob.stop();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      cleanupJob.stop();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
