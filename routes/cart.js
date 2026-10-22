const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Is file ke saare routes ke liye login zaroori hai
router.use(authenticate);

// Helper: user ka poora cart aur total nikalta hai
function getCart(userId) {
  const items = db.prepare(`
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.stock,
           (p.price * ci.quantity) AS subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.id`).all(userId);
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  return { items, total };
}

// GET /api/cart
router.get('/', (req, res) => {
  res.json(getCart(req.user.id));
});

// POST /api/cart  { "product_id": 1, "quantity": 2 }
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const qty = Number(quantity);

  if (!product_id || !Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'Valid product_id and quantity are required' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.prepare(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, product_id);

  const newQty = (existing ? existing.quantity : 0) + qty;
  if (newQty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} items in stock` });
  }

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
    ).run(req.user.id, product_id, qty);
  }

  res.status(201).json(getCart(req.user.id));
});

// PUT /api/cart/:productId  { "quantity": 3 }
router.put('/:productId', (req, res) => {
  const qty = Number(req.body.quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (qty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} items in stock` });
  }

  const result = db.prepare(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?'
  ).run(qty, req.user.id, req.params.productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not in cart' });
  }
  res.json(getCart(req.user.id));
});

// DELETE /api/cart/:productId
router.delete('/:productId', (req, res) => {
  db.prepare(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).run(req.user.id, req.params.productId);
  res.json(getCart(req.user.id));
});

module.exports = router;