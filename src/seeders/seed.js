const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const { sequelize, User, Order, OrderItem, Payment } = require('../models/sql');
const { Category, Product, Review, Cart } = require('../models/mongo');
const connectMongoDB = require('../config/mongodb');

// ==========================================
// 1. Seed Users (MySQL) — 5 users
// ==========================================
const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('123456', 12);

  const users = [
    {
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'admin',
      phone: faker.string.numeric(10),
      isVerified: true
    },
    {
      name: 'Seller One',
      email: 'seller1@ecommerce.com',
      password: hashedPassword,
      role: 'seller',
      phone: faker.string.numeric(10),
      isVerified: true
    },
    {
      name: 'Seller Two',
      email: 'seller2@ecommerce.com',
      password: hashedPassword,
      role: 'seller',
      phone: faker.string.numeric(10),
      isVerified: true
    },
    {
      name: 'Buyer One',
      email: 'buyer1@ecommerce.com',
      password: hashedPassword,
      role: 'buyer',
      phone: faker.string.numeric(10),
      isVerified: true
    },
    {
      name: 'Buyer Two',
      email: 'buyer2@ecommerce.com',
      password: hashedPassword,
      role: 'buyer',
      phone: faker.string.numeric(10),
      isVerified: true
    }
  ];

  const createdUsers = await User.bulkCreate(users, { individualHooks: false });
  console.log(`✅ ${createdUsers.length} users seeded`);
  return createdUsers;
};

// ==========================================
// 2. Seed Categories (MongoDB) — 10 categories
// ==========================================
const seedCategories = async () => {
  const parentCategories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', description: 'Fashion and apparel' },
    { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
    { name: 'Sports', description: 'Sports equipment and accessories' },
    { name: 'Books', description: 'Books and educational materials' }
  ];

  const createdParents = [];
  for (const cat of parentCategories) {
    const created = await Category.create(cat);
    createdParents.push(created);
  }

  const subCategories = [
    { name: 'Laptops', description: 'Laptop computers', parent: createdParents[0]._id },
    { name: 'Smartphones', description: 'Mobile phones', parent: createdParents[0]._id },
    { name: 'Men Fashion', description: 'Clothing for men', parent: createdParents[1]._id },
    { name: 'Women Fashion', description: 'Clothing for women', parent: createdParents[1]._id },
    { name: 'Fitness', description: 'Fitness equipment', parent: createdParents[3]._id }
  ];

  const createdSubs = [];
  for (const cat of subCategories) {
    const created = await Category.create(cat);
    createdSubs.push(created);
  }

  const allCategories = [...createdParents, ...createdSubs];
  console.log(`✅ ${allCategories.length} categories seeded`);
  return allCategories;
};

// ==========================================
// 3. Seed Products (MongoDB) — 50 products
// ==========================================
const seedProducts = async (categories, users) => {
  const sellers = users.filter(u => u.role === 'seller');
  const subCategories = categories.filter(c => c.parent !== null);

  const products = [];
  for (let i = 0; i < 50; i++) {
    const price = parseFloat(faker.commerce.price({ min: 10, max: 2000 }));
    const hasDiscount = Math.random() > 0.5;

    products.push({
      name: faker.commerce.productName() + ` ${i + 1}`,
      description: faker.commerce.productDescription().slice(0, 200).padEnd(20, '.'),
      price,
      comparePrice: hasDiscount ? parseFloat((price * 1.3).toFixed(2)) : undefined,
      category: subCategories[Math.floor(Math.random() * subCategories.length)]._id,
      images: [faker.image.urlPicsumPhotos()],
      stock: faker.number.int({ min: 0, max: 100 }),
      sold: faker.number.int({ min: 0, max: 50 }),
      sellerId: sellers[Math.floor(Math.random() * sellers.length)].id,
      brand: faker.company.name(),
      tags: [faker.commerce.department(), faker.commerce.productAdjective()]
    });
  }

  const createdProducts = await Product.insertMany(products);
  console.log(`✅ ${createdProducts.length} products seeded`);
  return createdProducts;
};

// ==========================================
// 4. Seed Reviews (MongoDB) — 30 reviews
// ==========================================
const seedReviews = async (products, users) => {
  const buyers = users.filter(u => u.role === 'buyer');
  const reviewedPairs = new Set();
  const reviews = [];

  let count = 0;
  while (count < 30) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const pairKey = `${buyer.id}-${product._id}`;

    if (reviewedPairs.has(pairKey)) continue;
    reviewedPairs.add(pairKey);

    reviews.push({
      userId: buyer.id,
      userName: buyer.name,
      productId: product._id,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.words(3),
      comment: faker.lorem.sentence({ min: 5, max: 15 })
    });
    count++;
  }

  for (const review of reviews) {
    await Review.create(review);
  }
  console.log(`✅ ${reviews.length} reviews seeded`);
};

// ==========================================
// 5. Seed Orders + OrderItems + Payments (MySQL) — 10 orders
// ==========================================
const seedOrders = async (products, users) => {
  const buyers = users.filter(u => u.role === 'buyer');

  for (let i = 0; i < 10; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const numItems = faker.number.int({ min: 1, max: 4 });
    const orderProducts = faker.helpers.arrayElements(products, numItems);

    let totalAmount = 0;
    const items = orderProducts.map(product => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const unitPrice = product.price;
      const subtotal = quantity * unitPrice;
      totalAmount += subtotal;

      return {
        productId: product._id.toString(),
        productName: product.name,
        quantity,
        unitPrice,
        subtotal
      };
    });

    const shippingCost = parseFloat(faker.commerce.price({ min: 5, max: 30 }));
    totalAmount += shippingCost;

    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isPaid = status !== 'pending';

    const order = await Order.create({
      userId: buyer.id,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status,
      shippingAddress: JSON.stringify({
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        zip: faker.location.zipCode()
      }),
      shippingCost,
      paymentStatus: isPaid ? 'paid' : 'unpaid'
    });

    for (const item of items) {
      await OrderItem.create({ ...item, orderId: order.id });
    }

    await Payment.create({
      orderId: order.id,
      userId: buyer.id,
      amount: parseFloat(totalAmount.toFixed(2)),
      method: faker.helpers.arrayElement(['credit_card', 'paypal', 'cash_on_delivery']),
      status: isPaid ? 'completed' : 'pending',
      paidAt: isPaid ? faker.date.recent() : null
    });
  }

  console.log('✅ 10 orders with items and payments seeded');
};

// ==========================================
// Run the seeder
// ==========================================
const seedAll = async () => {
  try {
    console.log('🌱 Starting seeder...\n');

    // Connect to databases
    await sequelize.authenticate();
    await connectMongoDB();
    console.log('📦 Connected to both databases\n');

    // Clear existing data
    await mongoose.connection.dropDatabase();
    await sequelize.sync({ force: true });
    console.log('🗑️  Cleared existing data\n');

    // Seed in order (dependencies matter)
    const users = await seedUsers();
    const categories = await seedCategories();
    const products = await seedProducts(categories, users);
    await seedReviews(products, users);
    await seedOrders(products, users);

    console.log('\n🎉 All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedAll();
