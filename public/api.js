// Login token browser me save hota hai
function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location = '/index.html';
}

// Server se baat karne ka common function
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (getToken()) headers.Authorization = 'Bearer ' + getToken();

  const res = await fetch('/api' + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// User ka text page par safe tarike se dikhane ke liye (XSS se bachav)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : text;
  return div.innerHTML;
}

// Message box dikhana
function showMessage(text, type) {
  const box = document.getElementById('msg');
  box.textContent = text;
  box.className = 'msg ' + type;
}

// Upar ka navbar banana
function renderNav() {
  const user = getUser();
  let html = '<a class="brand" href="/index.html">ShopEasy</a>';
  html += '<a href="/index.html">Home</a>';
  if (user) {
    html += '<a href="/cart.html">Cart</a>';
    html += '<a href="/orders.html">My Orders</a>';
    if (user.role === 'admin') html += '<a href="/admin.html">Admin</a>';
    html += '<span>Hi, ' + escapeHtml(user.name) + '</span>';
    html += '<button onclick="logout()">Logout</button>';
  } else {
    html += '<a href="/login.html">Login</a>';
    html += '<a href="/register.html">Register</a>';
  }
  document.getElementById('nav').innerHTML = html;
}