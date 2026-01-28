# 🚀 Quick Start Guide

Get the Flash Deal API running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (should be v14+)
node --version

# Check if MongoDB is running
mongosh --eval "db.version()"

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   Flash Deal API Server Running        ║
║   Port: 3000                           ║
║   Environment: development             ║
╚════════════════════════════════════════╝

MongoDB connected successfully
Redis connected successfully
Starting reservation cleanup job...
```

## Test the API

### Using curl (Terminal)

#### 1. Create a Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "sku": "IPHONE15PRO",
    "description": "Latest iPhone",
    "price": 999.99,
    "totalStock": 100
  }'
```

Copy the `_id` from the response (you'll need it for next steps).

#### 2. Reserve Products
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "items": [
      {
        "productId": "YOUR_PRODUCT_ID_HERE",
        "sku": "IPHONE15PRO",
        "quantity": 2
      }
    ]
  }'
```

#### 3. Check Product Status
```bash
curl http://localhost:3000/api/products/YOUR_PRODUCT_ID_HERE/status
```

#### 4. Checkout
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123"
  }'
```

### Using Postman

1. Import `postman_collection.json`
2. Run requests in order:
   - Create Product
   - Reserve Products
   - Checkout

### Using VS Code REST Client

1. Install "REST Client" extension
2. Open `api-tests.http`
3. Click "Send Request" above each request

## Common Issues

### "MongoDB connection error"
```bash
# Start MongoDB
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

### "Redis connection error"
```bash
# Start Redis
brew services start redis

# Or manually
redis-server
```

### "Port 3000 already in use"
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

## Test Reservation Expiry

```bash
# 1. Reserve products
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"userId": "testuser", "items": [{"productId": "YOUR_ID", "sku": "IPHONE15PRO", "quantity": 1}]}'

# 2. Check product status immediately
curl http://localhost:3000/api/products/YOUR_ID/status
# Note the "lockedInRedis" value

# 3. Wait 11 minutes (or change RESERVATION_TTL_SECONDS in .env to 60 for testing)

# 4. Check product status again
curl http://localhost:3000/api/products/YOUR_ID/status
# "lockedInRedis" should be 0 (auto-released)
```

## Test Concurrency

Open 3 terminals and run these simultaneously:

**Terminal 1:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "items": [{"productId": "YOUR_ID", "sku": "IPHONE15PRO", "quantity": 50}]}'
```

**Terminal 2:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"userId": "user2", "items": [{"productId": "YOUR_ID", "sku": "IPHONE15PRO", "quantity": 50}]}'
```

**Terminal 3:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"userId": "user3", "items": [{"productId": "YOUR_ID", "sku": "IPHONE15PRO", "quantity": 50}]}'
```

Only 2 should succeed (if stock is 100), the 3rd will fail with "Insufficient stock" - proving no overselling!

## Next Steps

- Read full [README.md](README.md) for architecture details
- Explore the codebase structure in `src/`
- Modify `.env` to adjust TTL and other settings
- Add more products and test multiple SKU reservations

## Need Help?

Check the logs:
```bash
# Server logs show all operations
# Look for:
# - "Cleanup job: Expired X reservations"
# - Error messages
# - Request/response logs (morgan middleware)
```

Happy testing! 🎉
