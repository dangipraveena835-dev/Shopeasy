# ShopEasy - E-Commerce Web Application

ShopEasy is a simplified online shopping web application built as an internship project.
Customers can browse products, add them to a cart and place orders (Cash on Delivery).
An administrator can manage products, categories and orders.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (Fetch API) |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Security | bcryptjs (password hashing), JSON Web Tokens (JWT) |

## Features

**Customer**
- Register, login and logout
- Browse products, search by name, filter by category
- Shopping cart (add, change quantity, remove) with stock check
- Checkout with shipping details (Cash on Delivery)
- Order history with status

**Admin**
- Dashboard with total products, orders, customers and sales
- Add, edit and delete products (low stock highlighted)
- Add, rename and delete categories
- View all orders and update order status

## Setup and Run

1. Install [Node.js](https://nodejs.org) (LTS version).
2. Clone the repository and open the folder:
   ```
   git clone https://github.com/dangipraveena835-dev/shopeasy.git
   cd shopeasy
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file (copy `.env.example`) and set values:
   ```
   PORT=3000
   JWT_SECRET=your_secret_key
   ```
5. Create the database (tables, sample data and admin user):
   ```
   node database/init.js
   ```
6. Start the server:
   ```
   node server.js
   ```
7. Open http://localhost:3000 in the browser.

## Admin Login

| Email | Password |
|-------|----------|
| admin@shopeasy.com | Admin@123 |

Customers can create their own account from the Register page.

## Folder Structure

```
shopeasy/
├── database/
│   ├── schema.sql      # table definitions
│   ├── seed.sql        # 3 categories and 15 products
│   └── init.js         # creates database, seed data and admin user
├── middleware/
│   └── auth.js         # authenticate (JWT) and adminOnly
├── routes/
│   ├── auth.js         # register, login, me
│   ├── products.js     # product list/detail + admin CRUD
│   ├── categories.js   # category list + admin CRUD
│   ├── cart.js         # cart APIs
│   ├── orders.js       # checkout (transaction) and order history
│   └── admin.js        # all orders, status update, stats
├── public/             # frontend pages (HTML, CSS, JS)
├── db.js               # database connection
├── server.js           # Express app
└── README.md
```

## Database Design

Six tables: `users`, `categories`, `products`, `cart_items`, `orders`, `order_items`.
See `docs/ShopEasy_ER_Diagram.png` and `database/schema.sql`.

- A category has many products.
- A user has many cart items and many orders.
- An order has many order items; each order item refers to one product.
- `order_items.unit_price` stores the price at the time of ordering.

## REST API

All APIs return JSON. Status codes used: 200/201 success, 400 validation error,
401 not logged in, 403 forbidden, 404 not found, 409 conflict, 500 server error.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login, returns JWT | Public |
| GET | /api/auth/me | Current user info | Logged in |
| GET | /api/products?search=&category= | List products | Public |
| GET | /api/products/:id | Product details | Public |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Remove (deactivate) product | Admin |
| GET | /api/categories | List categories | Public |
| POST | /api/categories | Create category | Admin |
| PUT | /api/categories/:id | Rename category | Admin |
| DELETE | /api/categories/:id | Delete category (if empty) | Admin |
| GET | /api/cart | Get my cart with total | Customer |
| POST | /api/cart | Add item `{product_id, quantity}` | Customer |
| PUT | /api/cart/:productId | Update quantity | Customer |
| DELETE | /api/cart/:productId | Remove item | Customer |
| POST | /api/orders | Place order from cart (checkout) | Customer |
| GET | /api/orders | My orders | Customer |
| GET | /api/orders/:id | Order detail with items | Customer/Admin |
| GET | /api/admin/orders | All orders | Admin |
| PATCH | /api/admin/orders/:id/status | Update order status | Admin |
| GET | /api/admin/stats | Dashboard counts | Admin |

A Postman collection with all endpoints is in `docs/ShopEasy.postman_collection.json`.

## Security

- Passwords are stored as bcrypt hashes, never as plain text.
- Protected APIs need a JWT token (`Authorization: Bearer <token>`).
- Admin APIs check the role on the server and return 403 for customers.
- All SQL queries are parameterized (prevents SQL injection).
- User content is escaped before being shown on the page (prevents XSS).
- Checkout runs inside a database transaction: order creation, stock reduction
  and cart clearing either all succeed or all fail.

## Screenshots

| Home | Cart |
|------|------|
| ![Home](screenshots/home.png) | ![Cart](screenshots/cart.png) |

| My Orders | Admin Panel |
|-----------|-------------|
| ![Orders](screenshots/orders.png) | ![Admin](screenshots/admin.png) |

## Author

Praveena
