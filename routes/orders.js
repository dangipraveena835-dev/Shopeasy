const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Transaction: ya to sab kuch hoga, ya kuch bhi nahi
const placeOrder = db.transaction((userId, shipping) => {
  const items = db.prepare(`
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND p.is_active = 1`).all(userId);

  if (items.length === 0) throw new Error('CART_EMPTY');

  for (const item of items) {
    if (item.quantity > item.stock) throw new Error('STOCK:' + item.name);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = db.prepare(`
    INSERT INTO orders (user_id, total_amount, shipping_name, shipping_phone, shipping_address)
    VALUES (?, ?, ?, ?, ?)`
  ).run(userId, total, shipping.name, shipping.phone, shipping.address);
  const orderId = order.lastInsertRowid;

  const addItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
  const reduceStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

  for (const item of items) {
    addItem.run(orderId, item.product_id, item.quantity, item.price);
    reduceStock.run(item.quantity, item.product_id);
  }

  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  return { orderId, total };
});

// POST /api/orders  (checkout)
router.post('/', (req, res) => {
  const { shipping_name, shipping_phone, shipping_address } = req.body;

  if (!shipping_name || !shipping_phone || !shipping_address) {
    return res.status(400).json({ error: 'Name, phone and address are required' });
  }
  if (!/^\d{10}$/.test(shipping_phone)) {
    return res.status(400).json({ error: 'Phone must be 10 digits' });
  }

  try {
    const result = placeOrder(req.user.id, {
      name: shipping_name, phone: shipping_phone, address: shipping_address
    });
    res.status(201).json({ message: 'Order placed (Cash on Delivery)', ...result });
  } catch (err) {
    if (err.message === 'CART_EMPTY') {
      return res.status(400).json({ error: 'Your cart is empty' });
    }
    if (err.message.startsWith('STOCK:')) {
      return res.status(400).json({ error: 'Not enough stock for ' + err.message.slice(6) });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not place order' });
  }
});

// GET /api/orders  (meri saari orders)
router.get('/', (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(orders);
});

// GET /api/orders/:id  (ek order, items ke saath)
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

  if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare(`
    SELECT oi.product_id, p.name, oi.quantity, oi.unit_price,
           (oi.quantity * oi.unit_price) AS subtotal
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?`).all(order.id);

  res.json({ ...order, items });
});

module.exports = router;