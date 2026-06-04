const PRODUCTS = {
  1: { id: 1, name: 'JR Street Pulse', price: 289900, emoji: '👟' },
  2: { id: 2, name: 'Nacional Runner Pro', price: 319900, emoji: '👟' },
  3: { id: 3, name: 'Medallo Night Ride', price: 349900, emoji: '👟' },
  4: { id: 4, name: 'Buzo Nacional Mindset', price: 199900, emoji: '🧥' },
  5: { id: 5, name: 'Camiseta Bogotá Nights', price: 89900, emoji: '👕' },
  6: { id: 6, name: 'Jogger Tech Fabric', price: 149900, emoji: '👖' },
  7: { id: 7, name: 'Gorra Snapback JR', price: 59900, emoji: '🧢' },
  8: { id: 8, name: 'Camiseta Focus Training', price: 74900, emoji: '👕' }
};

const STORAGE_KEY = 'juan_ramirez_cart_v1';
let cart = [];

const cartPanel = document.getElementById('cartPanel');
const cartBackdrop = document.getElementById('cartBackdrop');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartShipping = document.getElementById('cartShipping');
const checkoutBtn = document.getElementById('checkoutBtn');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) {
      cart = [];
    }
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

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartSubtotal.textContent = formatCOP(subtotal);
  cartShipping.textContent = subtotal >= 250000 ? 'Gratis' : 'Desde $9.900';

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<div class="cart-empty">No has agregado productos todavía.</div>';
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <div class="cart-thumb">${item.emoji}</div>
      <div>
        <h4>${item.name}</h4>
        <p>Talla: ${item.size}</p>
        <p>${formatCOP(item.price)}</p>
        <div class="cart-qty">
          <button class="qty-btn" type="button" data-action="dec" data-key="${item.key}">−</button>
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
  const existing = cart.find((item) => item.key === key);

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
  updateCartUI();
  openCart();
}

function changeQuantity(key, action) {
  const item = cart.find((entry) => entry.key === key);
  if (!item) return;

  if (action === 'inc') {
    item.quantity += 1;
  }

  if (action === 'dec') {
    item.quantity -= 1;
  }

  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter((entry) => entry.key !== key);
  }

  saveCart();
  updateCartUI();
}

function bindProductButtons() {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach((card) => {
    const button = card.querySelector('.btn-add-cart');
    const select = card.querySelector('.size-select');

    if (!button) return;

    button.addEventListener('click', () => {
      const productId = Number(card.dataset.id);
      const size = select ? select.value : 'Única';
      addToCart(productId, size);
    });
  });
}

function bindReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12
  });

  revealElements.forEach((element) => observer.observe(element));
}

if (openCartBtn) {
  openCartBtn.addEventListener('click', openCart);
}

if (closeCartBtn) {
  closeCartBtn.addEventListener('click', closeCart);
}

if (cartBackdrop) {
  cartBackdrop.addEventListener('click', closeCart);
}

if (cartItemsContainer) {
  cartItemsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const key = button.dataset.key;
    changeQuantity(key, action);
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (!cart.length) {
      alert('Tu carrito está vacío.');
      return;
    }

    alert('Demo funcional: aquí puedes integrar Wompi, Mercado Pago o tu backend.');
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  const navAnchors = navLinks.querySelectorAll('a');
  navAnchors.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

loadCart();
updateCartUI();
bindProductButtons();
bindReveal();