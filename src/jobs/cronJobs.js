const cron = require('node-cron');
const { Op } = require('sequelize');
const { Order, User } = require('../models/sql');
const Cart = require('../models/mongo/Cart');
const Product = require('../models/mongo/Product');

// ==========================================
// JOB 1: Abandoned Cart Reminder
// Runs every 6 hours
// Finds carts not updated in 24 hours
// ==========================================
const abandonedCartJob = cron.schedule('0 */6 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: cutoff },
      'items.0': { $exists: true }
    });

    console.log(`[CRON] Found ${abandonedCarts.length} abandoned carts`);

    // In production: send reminder emails to each user
    // For now, just log them
    for (const cart of abandonedCarts) {
      console.log(`[CRON] Abandoned cart - userId: ${cart.userId}, items: ${cart.items.length}`);
    }

  } catch (err) {
    console.error('[CRON] Abandoned cart job failed:', err);
  }
}, { scheduled: false });

// ==========================================
// JOB 2: Token Cleanup
// Runs daily at midnight
// Removes expired reset/verify tokens
// ==========================================
const tokenCleanupJob = cron.schedule('0 0 * * *', async () => {
  try {
    const [count] = await User.update(
      {
        resetToken   : null,
        resetExpires : null
      },
      {
        where: {
          resetExpires: { [Op.lt]: new Date() }
        }
      }
    );

    console.log(`[CRON] Cleaned up ${count} expired reset tokens`);

  } catch (err) {
    console.error('[CRON] Token cleanup job failed:', err);
  }
}, { scheduled: false });

// ==========================================
// JOB 3: Low Stock Alert
// Runs every 12 hours
// Finds products with stock < 5
// ==========================================
const lowStockJob = cron.schedule('0 */12 * * *', async () => {
  try {
    const lowStockProducts = await Product.find({
      stock    : { $lt: 5 },
      isActive : true
    }).select('name stock sellerId');

    if (lowStockProducts.length === 0) return;

    console.log(`[CRON] ${lowStockProducts.length} products with low stock:`);

    for (const product of lowStockProducts) {
      console.log(`[CRON]   - "${product.name}" → ${product.stock} left (seller: ${product.sellerId})`);
    }

    // In production: send email to each seller about their low-stock products

  } catch (err) {
    console.error('[CRON] Low stock alert job failed:', err);
  }
}, { scheduled: false });

// ==========================================
// JOB 4: Order Auto-Complete
// Runs daily at midnight
// Marks delivered orders as completed after 14 days
// ==========================================
const autoCompleteJob = cron.schedule('0 0 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [count] = await Order.update(
      { status: 'completed' },
      {
        where: {
          status    : 'delivered',
          updatedAt : { [Op.lt]: cutoff }
        }
      }
    );

    console.log(`[CRON] Auto-completed ${count} orders (delivered > 14 days)`);

  } catch (err) {
    console.error('[CRON] Auto-complete job failed:', err);
  }
}, { scheduled: false });

// ==========================================
// JOB 5: Daily Sales Report
// Runs daily at 8 AM
// Logs yesterday's sales summary
// ==========================================
const salesReportJob = cron.schedule('0 8 * * *', async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt] : today
        },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    console.log(`[CRON] Daily Sales Report — ${yesterday.toDateString()}`);
    console.log(`[CRON]   Orders: ${orders.length}`);
    console.log(`[CRON]   Revenue: $${totalRevenue.toFixed(2)}`);

    // In production: generate a PDF report and email it to admin

  } catch (err) {
    console.error('[CRON] Sales report job failed:', err);
  }
}, { scheduled: false });

// ==========================================
// Start all jobs
// ==========================================
const startAllJobs = () => {
  abandonedCartJob.start();
  tokenCleanupJob.start();
  lowStockJob.start();
  autoCompleteJob.start();
  salesReportJob.start();

  console.log('[CRON] All scheduled jobs started');
};

module.exports = startAllJobs;

