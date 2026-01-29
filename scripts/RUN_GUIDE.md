# Quick Run Guide - Database Seeding

Choose the method that works best for your setup:

## 🚀 Method 1: Docker Compose (Recommended - Easiest)

This will automatically start MongoDB, Redis, seed the database, and start the API.

### Option A: All-in-One Script
```bash
# Run the automated setup script
./scripts/setup-and-seed.sh
```

### Option B: Step-by-Step
```bash
# 1. Start MongoDB and Redis
docker-compose up -d mongodb redis

# 2. Wait 10-15 seconds for services to be healthy
sleep 15

# 3. Seed the database
npm run seed:docker

# 4. Start the API
docker-compose up api
```

### Option C: Start Everything at Once
```bash
# This will start MongoDB, Redis, and API together
# Then seed from another terminal
docker-compose up -d

# Wait for services to be ready
sleep 15

# Seed the database
npm run seed:docker
```

---

## 💻 Method 2: Local Development

If you have MongoDB and Redis installed locally.

### Prerequisites
- MongoDB running on port 27017
- Redis running on port 6379

```bash
# 1. Start MongoDB (if not already running)
brew services start mongodb-community

# 2. Start Redis (if not already running)
brew services start redis

# 3. Seed the database
npm run seed

# 4. Start the API in development mode
npm run dev
```

---

## 🧪 Quick Test After Seeding

Once your database is seeded, test the API:

```bash
# 1. Check health
curl http://localhost:3000/api/health

# 2. Get all products
curl http://localhost:3000/api/products

# 3. Get a specific product
curl http://localhost:3000/api/products/PRODUCT_ID_FROM_SEED_OUTPUT
```

---

## 📋 What to Expect

After running the seed script, you'll see:

```
╔════════════════════════════════════════╗
║     Database Seeding Script            ║
╚════════════════════════════════════════╝

📦 Connecting to MongoDB...
✓ MongoDB connected successfully

🔴 Connecting to Redis...
✓ Redis connected successfully

🗑️  Clearing existing data...
✓ Existing data cleared

📝 Creating products...
  ✓ iPhone 15 Pro Max
    SKU: IPHONE15PROMAX | Stock: 100 | Price: $1199.99
  ... (15 products total)

════════════════════════════════════════
✓ Database seeding completed!
════════════════════════════════════════

Summary:
  • Total products created: 15
  • Flash deal products: 12
  • Regular products: 3
  • Total stock items: 1745
  • Total inventory value: $200,000+

Product IDs for testing:
  iPhone 15 Pro Max
    ID: 6589abc123...
    SKU: IPHONE15PROMAX
```

**Copy the Product IDs** - you'll need them for testing!

---

## 🔍 Verify Everything Works

### Check MongoDB
```bash
# Using Docker
docker-compose exec mongodb mongosh senew0-task --eval "db.products.countDocuments()"
# Should return: 15

# Using local MongoDB
mongosh senew0-task --eval "db.products.countDocuments()"
```

### Check Redis
```bash
# Using Docker
docker-compose exec redis redis-cli KEYS "product:*"
# Should list all product keys

# Using local Redis
redis-cli KEYS "product:*"
```

---

## 🛠️ Troubleshooting

### "Docker is not running"
- Start Docker Desktop
- Wait for it to fully start
- Try again

### "MongoDB connection error"
```bash
# Check if MongoDB container is running
docker-compose ps mongodb

# Check logs
docker-compose logs mongodb

# Restart if needed
docker-compose restart mongodb
```

### "Redis connection error"
```bash
# Check if Redis container is running
docker-compose ps redis

# Check logs
docker-compose logs redis

# Restart if needed
docker-compose restart redis
```

### "Port already in use"
```bash
# Find what's using the port
lsof -i :3000
lsof -i :27017
lsof -i :6379

# Kill the process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

### "Cannot find module"
```bash
# Install dependencies
npm install
```

---

## 🔄 Re-seeding

To clear everything and start fresh:

```bash
# Option 1: Just re-run the seed script
npm run seed:docker  # or npm run seed for local

# Option 2: Completely reset Docker containers
docker-compose down -v  # -v removes volumes too
docker-compose up -d mongodb redis
sleep 15
npm run seed:docker
```

---

## 📚 Next Steps

After seeding:

1. **Test the API manually**
   - Use `api-tests.http` in VS Code (install REST Client extension)
   - Or use `postman_collection.json` with Postman
   - Or use curl commands

2. **Test reservation flow**
   ```bash
   # Reserve a product
   curl -X POST http://localhost:3000/api/reservations \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user123",
       "items": [{
         "productId": "YOUR_PRODUCT_ID",
         "sku": "IPHONE15PROMAX",
         "quantity": 2
       }]
     }'
   ```

3. **Test concurrency**
   - Open 3 terminals
   - Run reservation requests simultaneously
   - Verify no overselling occurs

4. **Read the documentation**
   - Check `README.md` for full API documentation
   - Check `QUICK_START.md` for detailed examples
   - Check `scripts/README.md` for seeding details

---

## 🎉 Success Checklist

- [ ] Docker containers running (or local MongoDB/Redis)
- [ ] Database seeded with 15 products
- [ ] API server started
- [ ] Health check returns success
- [ ] Can list all products
- [ ] Can create reservations
- [ ] Can complete checkout

Once all checked, you're ready to test the full Flash Deal system!
