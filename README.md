# Flash Deal API

A high-performance RESTful API for managing flash deal products with real-time inventory management, product reservations, and checkout system. Built with Node.js, MongoDB, and Redis to handle concurrent requests and prevent overselling.

## Features

- **Product Management**: Create and manage products with stock tracking
- **Real-time Reservations**: Reserve products with automatic expiration
- **Checkout System**: Convert reservations to orders
- **Concurrency Control**: Redis-based locking to prevent overselling
- **Auto-cleanup**: Background job to expire stale reservations
- **Rate Limiting**: Protect API from abuse
- **Health Checks**: Monitor system status
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 7
- **Cache/Queue**: Redis 7
- **ODM**: Mongoose
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan

## Project Structure

```
src/
├── app.js                    # Express app configuration
├── server.js                 # Server entry point
├── config/
│   ├── database.js          # MongoDB connection
│   └── redis.js             # Redis connection
├── controllers/
│   ├── productController.js
│   ├── reservationController.js
│   └── checkoutController.js
├── models/
│   ├── Product.js           # Product schema
│   ├── Reservation.js       # Reservation schema
│   └── Order.js             # Order schema
├── services/
│   ├── productService.js
│   ├── reservationService.js
│   ├── checkoutService.js
│   └── redisService.js
├── routes/
│   ├── index.js
│   ├── productRoutes.js
│   ├── reservationRoutes.js
│   └── checkoutRoutes.js
├── middleware/
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validation.js
└── jobs/
    └── cleanupJob.js        # Auto-expire reservations
```

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- Redis >= 7.0
- npm >= 9.0.0

## Quick Start

See [QUICK_START.md](QUICK_START.md) for a quick 5-minute setup guide.

## Installation

### Option 1: Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd senew-task
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start MongoDB and Redis**
```bash
# MongoDB
brew services start mongodb-community

# Redis
brew services start redis
```

5. **Run the application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Option 2: Docker Compose (Recommended)

1. **Start all services**
```bash
docker-compose up -d
```

2. **Check logs**
```bash
docker-compose logs -f api
```

3. **Stop services**
```bash
docker-compose down
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Products
```
POST   /api/products              # Create a product
GET    /api/products              # List all products
GET    /api/products/:id          # Get product details
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
GET    /api/products/:id/status   # Get product stock status
```

### Reservations
```
POST   /api/reservations          # Create reservation
GET    /api/reservations/:userId  # Get user reservations
DELETE /api/reservations/:id      # Cancel reservation
```

### Checkout
```
POST   /api/checkout              # Complete purchase
```

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/senew0-task
REDIS_HOST=localhost
REDIS_PORT=6379
RESERVATION_TTL_SECONDS=600
NODE_ENV=development
```

## How It Works

### 1. Product Creation
Products are created with initial stock. The system tracks both database stock and Redis locks.

### 2. Reservation Flow
- User creates a reservation for products
- System checks available stock in Redis
- If available, creates a lock in Redis with TTL
- Creates reservation record in MongoDB
- Returns reservation details to user

### 3. Auto-Expiration
- Background job runs every minute
- Checks for expired reservations
- Releases locks back to Redis
- Updates reservation status

### 4. Checkout
- Converts active reservations to orders
- Permanently reduces stock in MongoDB
- Removes Redis locks
- Clears reservation records

### 5. Concurrency Control
- Redis atomic operations prevent race conditions
- Distributed locking ensures no overselling
- MongoDB transactions for data consistency

## Testing

### Manual Testing

Use the provided test files:
- `api-tests.http` - VS Code REST Client
- `postman_collection.json` - Postman collection

### Test Scenarios

1. **Basic Flow**
   - Create product → Reserve → Checkout

2. **Expiration Test**
   - Create reservation → Wait for TTL → Check stock release

3. **Concurrency Test**
   - Multiple simultaneous reservations
   - Verify no overselling occurs

4. **Edge Cases**
   - Insufficient stock
   - Invalid product ID
   - Expired reservations
   - Double checkout prevention

## Rate Limits

- General API: 100 requests per 15 minutes
- Reservations: 5 requests per minute
- Checkout: 3 requests per minute

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Monitoring

### Logs
- Request/response logs via Morgan
- MongoDB connection status
- Redis connection status
- Cleanup job activities

### Health Endpoint
```bash
curl http://localhost:3000/api/health
```

## Production Deployment

1. **Set environment to production**
```env
NODE_ENV=production
```

2. **Use Docker Compose**
```bash
docker-compose up -d
```

3. **Enable monitoring** (recommended)
- Add logging service (e.g., Winston + CloudWatch)
- Add monitoring (e.g., Prometheus + Grafana)
- Add error tracking (e.g., Sentry)

4. **Security considerations**
- Use strong MongoDB credentials
- Enable Redis authentication
- Use HTTPS/TLS in production
- Implement JWT authentication
- Add input sanitization

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Check connection string in .env
# Ensure MongoDB is accessible on specified port
```

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG
```

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
