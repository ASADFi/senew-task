require('dotenv').config();
const mongoose = require('mongoose');
const { createClient } = require('redis');
const Product = require('../src/models/Product');

// Sample products data
const sampleProducts = [
  {
    name: 'iPhone 15 Pro Max',
    sku: 'IPHONE15PROMAX',
    description: 'Latest flagship iPhone with titanium design and A17 Pro chip',
    price: 1199.99,
    totalStock: 100,
    isFlashDeal: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'GALAXYS24ULTRA',
    description: 'Premium Android phone with S Pen and 200MP camera',
    price: 1099.99,
    totalStock: 80,
    isFlashDeal: true,
  },
  {
    name: 'MacBook Pro 16" M3',
    sku: 'MBP16M3',
    description: 'Powerful laptop with M3 Max chip, 16GB RAM, 512GB SSD',
    price: 2499.99,
    totalStock: 50,
    isFlashDeal: true,
  },
  {
    name: 'Sony WH-1000XM5',
    sku: 'SONYWH1000XM5',
    description: 'Industry-leading noise canceling wireless headphones',
    price: 349.99,
    totalStock: 200,
    isFlashDeal: true,
  },
  {
    name: 'Apple Watch Series 9',
    sku: 'APPLEWATCH9',
    description: 'Advanced smartwatch with fitness tracking and health monitoring',
    price: 429.99,
    totalStock: 150,
    isFlashDeal: true,
  },
  {
    name: 'iPad Air M2',
    sku: 'IPADAIRM2',
    description: 'Versatile tablet with M2 chip and 11-inch display',
    price: 599.99,
    totalStock: 120,
    isFlashDeal: true,
  },
  {
    name: 'Nintendo Switch OLED',
    sku: 'SWITCHOLED',
    description: 'Gaming console with vibrant OLED screen',
    price: 349.99,
    totalStock: 300,
    isFlashDeal: true,
  },
  {
    name: 'PlayStation 5',
    sku: 'PS5',
    description: 'Next-gen gaming console with 4K gaming and ultra-fast SSD',
    price: 499.99,
    totalStock: 75,
    isFlashDeal: true,
  },
  {
    name: 'AirPods Pro 2',
    sku: 'AIRPODSPRO2',
    description: 'Premium wireless earbuds with active noise cancellation',
    price: 249.99,
    totalStock: 250,
    isFlashDeal: true,
  },
  {
    name: 'Canon EOS R6 Mark II',
    sku: 'CANONEOSR6M2',
    description: 'Professional mirrorless camera with 24.2MP sensor',
    price: 2499.99,
    totalStock: 30,
    isFlashDeal: true,
  },
  {
    name: 'DJI Mini 4 Pro Drone',
    sku: 'DJIMINI4PRO',
    description: 'Compact drone with 4K camera and intelligent features',
    price: 759.99,
    totalStock: 60,
    isFlashDeal: true,
  },
  {
    name: 'Samsung 65" OLED TV',
    sku: 'SAMSUNG65OLED',
    description: '4K OLED TV with quantum HDR and smart features',
    price: 1799.99,
    totalStock: 40,
    isFlashDeal: true,
  },
  {
    name: 'Dyson V15 Detect',
    sku: 'DYSONV15',
    description: 'Cordless vacuum with laser detection and LCD screen',
    price: 649.99,
    totalStock: 90,
    isFlashDeal: false,
  },
  {
    name: 'Fitbit Charge 6',
    sku: 'FITBITCHARGE6',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 159.99,
    totalStock: 180,
    isFlashDeal: false,
  },
  {
    name: 'Kindle Paperwhite',
    sku: 'KINDLEPW',
    description: 'E-reader with adjustable warm light and waterproof design',
    price: 139.99,
    totalStock: 220,
    isFlashDeal: false,
  },
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function seedDatabase() {
  let mongoConnection;
  let redisClient;

  try {
    console.log(`\n${colors.cyan}${colors.bright}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}║     Database Seeding Script            ║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}╚════════════════════════════════════════╝${colors.reset}\n`);

    // Connect to MongoDB
    console.log(`${colors.blue}📦 Connecting to MongoDB...${colors.reset}`);
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`${colors.green}✓ MongoDB connected successfully${colors.reset}\n`);

    // Connect to Redis
    console.log(`${colors.blue}🔴 Connecting to Redis...${colors.reset}`);
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    });

    await redisClient.connect();
    console.log(`${colors.green}✓ Redis connected successfully${colors.reset}\n`);

    // Clear existing data
    console.log(`${colors.yellow}🗑️  Clearing existing data...${colors.reset}`);
    await Product.deleteMany({});
    
    // Clear Redis keys
    const keys = await redisClient.keys('product:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    console.log(`${colors.green}✓ Existing data cleared${colors.reset}\n`);

    // Insert products
    console.log(`${colors.blue}📝 Creating products...${colors.reset}`);
    const createdProducts = [];
    
    for (const productData of sampleProducts) {
      const product = await Product.create({
        ...productData,
        availableStock: productData.totalStock,
        reservedStock: 0,
      });

      // Initialize stock in Redis
      const redisKey = `product:${product._id}:stock`;
      await redisClient.set(redisKey, productData.totalStock.toString());

      createdProducts.push(product);
      
      console.log(`${colors.green}  ✓ ${product.name}${colors.reset}`);
      console.log(`    SKU: ${product.sku} | Stock: ${product.totalStock} | Price: $${product.price}`);
    }

    // Summary
    console.log(`\n${colors.cyan}${colors.bright}════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}${colors.bright}✓ Database seeding completed!${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  • Total products created: ${colors.green}${createdProducts.length}${colors.reset}`);
    console.log(`  • Flash deal products: ${colors.green}${createdProducts.filter(p => p.isFlashDeal).length}${colors.reset}`);
    console.log(`  • Regular products: ${colors.green}${createdProducts.filter(p => !p.isFlashDeal).length}${colors.reset}`);
    console.log(`  • Total stock items: ${colors.green}${createdProducts.reduce((sum, p) => sum + p.totalStock, 0)}${colors.reset}`);
    console.log(`  • Total inventory value: ${colors.green}$${createdProducts.reduce((sum, p) => sum + (p.totalStock * p.price), 0).toFixed(2)}${colors.reset}\n`);

    console.log(`${colors.cyan}Product IDs for testing:${colors.reset}`);
    createdProducts.slice(0, 5).forEach(product => {
      console.log(`  ${colors.yellow}${product.name}${colors.reset}`);
      console.log(`    ID: ${product._id}`);
      console.log(`    SKU: ${product.sku}\n`);
    });

    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Start your API server: ${colors.green}npm run dev${colors.reset}`);
    console.log(`  2. Test with curl or use ${colors.green}api-tests.http${colors.reset}`);
    console.log(`  3. Use the Product IDs above in your test requests\n`);

  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Error seeding database:${colors.reset}`, error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close connections
    if (mongoConnection) {
      await mongoose.connection.close();
      console.log(`${colors.blue}MongoDB connection closed${colors.reset}`);
    }
    if (redisClient) {
      await redisClient.quit();
      console.log(`${colors.blue}Redis connection closed${colors.reset}`);
    }
  }
}

// Run the seed script
seedDatabase();
