const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Flash Deal API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      reservations: '/api/reservations',
      checkout: '/api/checkout',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
