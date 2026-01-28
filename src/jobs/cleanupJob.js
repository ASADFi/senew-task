const reservationService = require('../services/reservationService');

class CleanupJob {
  constructor() {
    this.intervalId = null;
    this.intervalMs = 60 * 1000; // Run every 1 minute
  }

  // Start the cleanup job
  start() {
    console.log('Starting reservation cleanup job...');
    
    // Run immediately on start
    this.run();
    
    // Then run periodically
    this.intervalId = setInterval(() => {
      this.run();
    }, this.intervalMs);
  }

  // Stop the cleanup job
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cleanup job stopped');
    }
  }

  // Execute cleanup
  async run() {
    try {
      const result = await reservationService.expireReservations();
      if (result.expiredCount > 0) {
        console.log(`[${new Date().toISOString()}] Cleanup job: Expired ${result.expiredCount} reservations`);
      }
    } catch (error) {
      console.error('Cleanup job error:', error.message);
    }
  }
}

module.exports = new CleanupJob();
