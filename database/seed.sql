INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Books');

INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
  (1, 'Wireless Earbuds', 'Bluetooth earbuds with charging case', 1499, 50, 'https://placehold.co/300x300?text=Earbuds'),
  (1, 'Smart Watch', 'Fitness tracker with heart rate monitor', 2999, 30, 'https://placehold.co/300x300?text=Smart+Watch'),
  (1, 'Power Bank 10000mAh', 'Fast charging portable power bank', 999, 80, 'https://placehold.co/300x300?text=Power+Bank'),
  (1, 'Bluetooth Speaker', 'Portable waterproof speaker', 1799, 40, 'https://placehold.co/300x300?text=Speaker'),
  (1, 'USB Keyboard', 'Full size wired keyboard', 599, 60, 'https://placehold.co/300x300?text=Keyboard'),
  (2, 'Cotton T-Shirt', 'Soft round neck t-shirt', 399, 100, 'https://placehold.co/300x300?text=T-Shirt'),
  (2, 'Denim Jeans', 'Slim fit blue jeans', 1299, 70, 'https://placehold.co/300x300?text=Jeans'),
  (2, 'Hooded Sweatshirt', 'Warm fleece hoodie', 1199, 45, 'https://placehold.co/300x300?text=Hoodie'),
  (2, 'Running Shoes', 'Lightweight sports shoes', 1999, 35, 'https://placehold.co/300x300?text=Shoes'),
  (2, 'Cap', 'Adjustable cotton cap', 249, 120, 'https://placehold.co/300x300?text=Cap'),
  (3, 'Atomic Habits', 'Self improvement book by James Clear', 499, 55, 'https://placehold.co/300x300?text=Atomic+Habits'),
  (3, 'The Alchemist', 'Novel by Paulo Coelho', 299, 65, 'https://placehold.co/300x300?text=The+Alchemist'),
  (3, 'Rich Dad Poor Dad', 'Personal finance classic', 349, 50, 'https://placehold.co/300x300?text=Rich+Dad'),
  (3, 'Wings of Fire', 'Autobiography of Dr. A.P.J. Abdul Kalam', 279, 60, 'https://placehold.co/300x300?text=Wings+of+Fire'),
  (3, 'Python Crash Course', 'Beginner programming book', 699, 40, 'https://placehold.co/300x300?text=Python');