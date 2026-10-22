require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test route: check karta hai ki server aur database chal rahe hain
app.get('/api/health', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS total FROM products').get();
  res.json({ status: 'ok', products: row.total });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/categories', require('./routes/categories'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});