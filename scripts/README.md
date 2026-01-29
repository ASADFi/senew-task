# Database Seeding Scripts

This folder contains scripts to populate your database with test data for the Flash Deal API.

## Available Scripts

### 1. `seed.js` - Local Development Seeding

Use this when running MongoDB and Redis locally on your machine.

**Prerequisites:**
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379`

**Usage:**
```bash
npm run seed
```

### 2. `seed-docker.js` - Docker Compose Seeding

Use this when running services with Docker Compose.

**Prerequisites:**
- Docker and Docker Compose installed
- MongoDB and Redis containers running

**Usage:**
```bash
# Step 1: Start MongoDB and Redis
docker-compose up -d mongodb redis

# Step 2: Wait for services to be healthy (about 10-20 seconds)
docker-compose ps

# Step 3: Run the seed script
node scripts/seed-docker.js
```

## What Gets Created

The seed scripts create **15 sample products** across different categories:

### Electronics & Tech (Flash Deals)
- iPhone 15 Pro Max - $1,199.99 (100 units)
- Samsung Galaxy S24 Ultra - $1,099.99 (80 units)
- MacBook Pro 16" M3 - $2,499.99 (50 units)
- Sony WH-1000XM5 Headphones - $349.99 (200 units)
- Apple Watch Series 9 - $429.99 (150 units)
- iPad Air M2 - $599.99 (120 units)
- Nintendo Switch OLED - $349.99 (300 units)
- PlayStation 5 - $499.99 (75 units)
- AirPods Pro 2 - $249.99 (250 units)
- Canon EOS R6 Mark II - $2,499.99 (30 units)
- DJI Mini 4 Pro Drone - $759.99 (60 units)
- Samsung 65" OLED TV - $1,799.99 (40 units)

### Regular Products
- Dyson V15 Detect Vacuum - $649.99 (90 units)
- Fitbit Charge 6 - $159.99 (180 units)
- Kindle Paperwhite - $139.99 (220 units)

**Total Inventory Value:** ~$200,000+

## What the Scripts Do

1. **Connect to MongoDB and Redis**
   - Establishes connections to both databases
   
2. **Clear Existing Data**
   - Removes all existing products from MongoDB
   - Clears all product-related keys from Redis
   
3. **Create Products**
   - Inserts 15 products into MongoDB
   - Initializes stock counts in Redis for each product
   - Sets up proper relationships between MongoDB and Redis
   
4. **Display Summary**
   - Shows created products with IDs and SKUs
   - Provides statistics (total value, stock counts, etc.)
   - Lists product IDs you can use for testing

## Output Example

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
  ✓ Samsung Galaxy S24 Ultra
    SKU: GALAXYS24ULTRA | Stock: 80 | Price: $1099.99
  ...

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
    ID: 6589abc123def456...
    SKU: IPHONE15PROMAX
```

## Using the Test Data

After seeding, you can test the API with the generated Product IDs:

### 1. Get All Products
```bash
curl http://localhost:3000/api/products
```

### 2. Reserve a Product
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "items": [
      {
        "productId": "YOUR_PRODUCT_ID",
        "sku": "IPHONE15PROMAX",
        "quantity": 2
      }
    ]
  }'
```

### 3. Check Product Status
```bash
curl http://localhost:3000/api/products/YOUR_PRODUCT_ID/status
```

### 4. Complete Checkout
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123"
  }'
```

## Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`
- For Docker: ensure containers are healthy with `docker-compose ps`

### "Redis connection error"
- Make sure Redis is running
- Check your `.env` file has correct `REDIS_HOST` and `REDIS_PORT`
- For Docker: ensure Redis container is healthy

### "Cannot find module"
- Run `npm install` to install dependencies first

### "Duplicate key error"
- The scripts clear existing data, but if interrupted, run again
- Or manually clear: `mongo senew0-task --eval "db.products.deleteMany({})"`

## Re-seeding

You can run the seed scripts multiple times. They will:
- Clear all existing products
- Create fresh test data
- Reset all stock counters

This is useful for:
- Testing from a clean state
- Resetting after development
- Demonstrating features
