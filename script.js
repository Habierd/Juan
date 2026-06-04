/* ==================== PRODUCTOS ==================== */
const products = [
  { id: 'featured', name: 'JR Velocity Green', price: 359900, img: 'featured', category: 'shoe' },
  { id: 1, name: 'JR Street Pulse', price: 289900, img: 'p1', category: 'shoe' },
  { id: 2, name: 'Nacional Runner Pro', price: 319900, img: 'p2', category: 'shoe' },
  { id: 3, name: 'Medallo Night Ride', price: 349900, img: 'p3', category: 'shoe' },
  { id: 4, name: 'JR Minimal Core', price: 229900, img: 'p4', category: 'shoe' },
  { id: 5, name: 'Buzo Oversize “Nacional Mindset”', price: 199900, img: 'b1', category: 'cloth' },
  { id: 6, name: 'Camiseta “Bogotá Nights”', price: 89900, img: 'c1', category: 'cloth' },
  { id: 7, name: 'Jogger Tech Fabric', price: 149900, img: 'j1', category: 'cloth' },
  { id: 8, name: 'Combo camiseta + jogger', price: 259900, img: 'set1', category: 'cloth' },
  { id: 9, name: 'Gorra Snapback JR', price: 59900, img: 'g1', category: 'cloth' },
  { id: 10, name: 'Camiseta training “Focus”', price: 74900, img: 'c2', category: 'cloth' }
];

let cart = [];

/* ==================== ELEMENTOS DOM ==================== */
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartPanel = document.getElementById('cartPanel');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTag = document.getElementById('cartTag');
const cartShipping = document.getElementById('cartShipping');
const checkoutBtn = document.getElementById('checkoutBtn');

/* ==================== FUNCIONES DE UTILIDAD ==================== */
function formatCOP(value) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

function openCart() {
  cartBackdrop.classList.add('open');
  cartPanel.classList.add('open');
}
function closeCart() {
  cartBackdrop.classList.remove('open');
  cartPanel.classList.remove('open');
}
openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

/* ==================== CARRITO ==================== */
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty">Aún no has agregado productos.</div>';
    cartSubtotal.textContent = '$0';
    cartTag.textContent = 'Carrito vacío';
    cartShipping.textContent = 'Calculado en checkout';
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartSubtotal.textContent = formatCOP(subtotal);
  cartTag.textContent = `Tienes ${cart.length} producto(s)`;
  cartShipping.textContent = subtotal >= 250000 ? 'Envío GRATIS' : 'Desde $9.900';

  cartItemsContainer.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🟢</div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name} ${item.size ? `(Talla: ${item.size})` : ''}</div>
        <div class="cart-item-meta">
          <span>${formatCOP(item.price)}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" data-size="${item.size || ''}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" data-size="${item.size || ''}">+</button>
          </div>
          <span>${formatCOP(item.price * item.quantity)}</span>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size || ''}">Quitar</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });
}

function addToCart(id, size = null) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;

  const existing = cart.find(item => item.id === product.id && item.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, size });
  }

  // animación del icono del carrito
  const cartIcon = document.querySelector('.cart-icon');
  cartIcon.animate(
    [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.2)', offset: 0.4 },
      { transform: 'scale(0.95)', offset: 0.7 },
      { transform: 'scale(1)', offset: 1 }
    ],
    { duration: 320, easing: 'ease-out' }
  );

  updateCartUI();
}

function addFeaturedToCart() {
  const heroSizeSelect = document.getElementById('heroSize');
  const size = heroSizeSelect ? heroSizeSelect.value : null;
  addToCart('featured', size);
  openCart();
}

/* ==================== EVENTOS DE PRODUCTOS ==================== */
document.getElementById('productGrid').addEventListener('click', e => {
  const btn = e.target.closest('.btn-add-cart');
  if (!btn) return;
  const card = btn.closest('.product-card');
  const id = card.getAttribute('data-id');
  const sizeSelect = card.querySelector('.size-select');
  const size = sizeSelect ? sizeSelect.value : null;
  addToCart(id, size);
});

document.querySelectorAll('#ropa .btn-add-cart, #ofertas .btn-add-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const id = card.getAttribute('data-id');
    const sizeSelect = card.querySelector('.size-select');
    const size = sizeSelect ? sizeSelect.value : null;
    addToCart(id, size);
  });
});

/* ==================== MANEJO DE CANTIDAD Y ELIMINACIÓN ==================== */
cartItemsContainer.addEventListener('click', e => {
  const removeBtn = e.target.closest('.cart-item-remove');
  const qtyBtn = e.target.closest('.qty-btn');

  if (removeBtn) {
    const id = removeBtn.getAttribute('data-id');
    const size = removeBtn.getAttribute('data-size') || null;
    cart = cart.filter(item => !(String(item.id) === String(id) && item.size === size));
    updateCartUI();
  }

  if (qtyBtn) {
    const id = qtyBtn.getAttribute('data-id');
    const size = qtyBtn.getAttribute('data-size') || null;
    const action = qtyBtn.getAttribute('data-action');
    const item = cart.find(i => String(i.id) === String(id) && i.size === size);
    if (!item) return;

    if (action === 'inc') {
      item.quantity += 1;
    } else if (action === 'dec') {
      item.quantity = Math.max(1, item.quantity - 1);
    }
    updateCartUI();
  }
});

/* ==================== CHECKOUT ==================== */
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío. Agrega algún producto para continuar.');
    return;
  }
  alert('Este es un checkout de demo. Aquí podrías integrar tu pasarela de pago real (e.g. MercadoPago, Wompi, etc.).');
});

/* ==================== SCROLL SUAVE ==================== */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ==================== EFECTO SCROLL EN HERO CARD ==================== */
window.addEventListener('scroll', () => {
  const heroCard = document.querySelector('.hero-card');
  if (!heroCard) return;
  const rect = heroCard.getBoundingClientRect();
  const visible = rect.top < window.innerHeight && rect.bottom > 0;
  heroCard.style.transform = visible ? 'translateY(0)' : 'translateY(10px)';
  heroCard.style.opacity = visible ? '1' : '0.4';
  heroCard.style.transition = 'all 0.3s ease-out';
});