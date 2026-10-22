const express = require('express');
const db = require('../db');

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

module.exports = router;