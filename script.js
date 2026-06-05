const PRODUCTS = {
  1: { id: 1, name: 'JR Shadow One', price: 389900, emoji: '👟' },
  2: { id: 2, name: 'Pulse Motion', price: 429900, emoji: '👟' },
  3: { id: 3, name: 'Noir Velocity', price: 459900, emoji: '👟' },
  4: { id: 4, name: 'Mono Layer Jacket', price: 299900, emoji: '🧥' },
  5: { id: 5, name: 'City Form Tee', price: 119900, emoji: '👕' },
  6: { id: 6, name: 'Graphite Jogger', price: 169900, emoji: '👖' }
};

const STORAGE_KEY = 'juan_ramirez_radical_cart_v1';
let cart = [];

const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartPanel = document.getElementById('cartPanel');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('No se pudo guardar el carrito.', error);
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (error) {
    cart = [];
  }
}

function openCart() {
  cartPanel.classList.add('open');
  cartBackdrop.classList.add('open');
}

function closeCart() {
  cartPanel.classList.remove('open');
  cartBackdrop.classList.remove('open');
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartSubtotal.textContent = formatCOP(subtotal);

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Todavía no has agregado nada.</p>';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <article class="cart-item">
      <div class="cart-thumb">${item.emoji}</div>
      <div>
        <h4>${item.name}</h4>
        <p>Talla: ${item.size}</p>
        <p>${formatCOP(item.price)}</p>
        <div class="qty-row">
          <button class="qty-btn" type="button" data-action="dec" data-key="${item.key}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" type="button" data-action="inc" data-key="${item.key}">+</button>
          <button class="remove-btn" type="button" data-action="remove" data-key="${item.key}">Quitar</button>
        </div>
      </div>
    </article>
  `).join('');
}

function addToCart(productId, size) {
  const product = PRODUCTS[productId];
  if (!product) return;

  const key = `${productId}-${size}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      size,
      quantity: 1
    });
  }

  saveCart();
  updateCart();
  openCart();
}

function changeItem(key, action) {
  const item = cart.find(entry => entry.key === key);
  if (!item) return;

  if (action === 'inc') item.quantity += 1;
  if (action === 'dec') item.quantity -= 1;

  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter(entry => entry.key !== key);
  }

  saveCart();
  updateCart();
}

function bindProducts() {
  document.querySelectorAll('.product-card').forEach(card => {
    const button = card.querySelector('.btn-add-cart');
    const select = card.querySelector('.size-select');

    if (!button) return;

    button.addEventListener('click', () => {
      const id = Number(card.dataset.id);
      const size = select ? select.value : 'Única';
      addToCart(id, size);
    });
  });
}

function bindReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  elements.forEach(element => observer.observe(element));
}

if (openCartBtn) openCartBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
}

if (cartItemsContainer) {
  cartItemsContainer.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    changeItem(button.dataset.key, button.dataset.action);
  });
}

loadCart();
updateCart();
bindProducts();
bindReveal();