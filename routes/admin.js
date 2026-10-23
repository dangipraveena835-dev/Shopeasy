const express = require('express');
const db = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, adminOnly); // sirf login admin andar aa sakta hai

// GET /api/admin/orders (saari orders, customer ke naam ke saath)
router.get('/orders', (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name AS customer_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.id DESC`).all();
  res.json(orders);
});

// PATCH /api/admin/orders/:id/status  { "status": "shipped" }
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'shipped', 'delivered', 'cancelled'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: ' + allowed.join(', ') });
  }
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?')
    .run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ message: 'Status updated', status });
});

// GET /api/admin/stats (dashboard ke numbers)
router.get('/stats', (req, res) => {
  res.json({
    total_products: db.prepare('SELECT COUNT(*) AS c FROM products WHERE is_active = 1').get().c,
    total_orders: db.prepare('SELECT COUNT(*) AS c FROM orders').get().c,
    total_customers: db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'").get().c,
    total_sales: db.prepare("SELECT COALESCE(SUM(total_amount), 0) AS s FROM orders WHERE status != 'cancelled'").get().s
  });
});

module.exports = router;