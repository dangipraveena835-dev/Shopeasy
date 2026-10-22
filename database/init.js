const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// 1. Database file banao (shopeasy.db)
const db = new Database(path.join(__dirname, 'shopeasy.db'));
db.pragma('foreign_keys = ON');

// 2. Tables banao
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// 3. Categories aur products daalo (sirf pehli baar)
const count = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c;
if (count === 0) {
  db.exec(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  console.log('Seed data added');
}

// 4. Admin user banao (password hash karke)
const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@shopeasy.com');
if (!admin) {
  const hash = bcrypt.hashSync('Admin@123', 10);
  db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run('Admin', 'admin@shopeasy.com', hash, 'admin');
  console.log('Admin created: admin@shopeasy.com / Admin@123');
}

console.log('Database ready!');