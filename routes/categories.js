const express = require('express');
const db = require('../db');
   const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

// POST /api/categories (admin)
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ message: 'Category created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(409).json({ error: 'Category already exists' });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const result = db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category updated' });
});

// DELETE /api/categories/:id (admin) - products hon to delete nahi hoga
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const used = db.prepare('SELECT COUNT(*) AS c FROM products WHERE category_id = ?').get(req.params.id).c;
  if (used > 0) {
    return res.status(400).json({ error: 'Category has products, cannot delete' });
  }
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category deleted' });
});
module.exports = router;