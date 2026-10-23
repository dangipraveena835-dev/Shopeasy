const express = require('express');
const db = require('../db');
   const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?search=watch&category=1
router.get('/', (req, res) => {
  const { search, category } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1`;
  const params = [];

  if (search) {
    sql += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category) {
    sql += ' AND p.category_id = ?';
    params.push(category);
  }
  sql += ' ORDER BY p.id';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/products/5
router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.is_active = 1`).get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products (admin)
router.post('/', authenticate, adminOnly, (req, res) => {
  const { category_id, name, description, price, stock, image_url } = req.body;

  if (!category_id || !name || price === undefined || Number(price) < 0) {
    return res.status(400).json({ error: 'category_id, name and a valid price are required' });
  }
  const result = db.prepare(`
    INSERT INTO products (category_id, name, description, price, stock, image_url)
    VALUES (?, ?, ?, ?, ?, ?)`
  ).run(category_id, name, description || '', price, stock || 0, image_url || '');

  res.status(201).json({ message: 'Product created', id: result.lastInsertRowid });
});

// PUT /api/products/:id (admin)
router.put('/:id', authenticate, adminOnly, (req, res) => {
  const { category_id, name, description, price, stock, image_url } = req.body;

  if (!category_id || !name || price === undefined || Number(price) < 0) {
    return res.status(400).json({ error: 'category_id, name and a valid price are required' });
  }
  const result = db.prepare(`
    UPDATE products
    SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ?
    WHERE id = ?`
  ).run(category_id, name, description || '', price, stock || 0, image_url || '', req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product updated' });
});

// DELETE /api/products/:id (admin) - asli delete nahi, sirf chhupa dete hain
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const result = db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product removed' });
});
module.exports = router;