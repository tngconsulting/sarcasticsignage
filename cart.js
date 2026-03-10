/* ================================================
   Sarcastic Signage — Shopping Cart
   Requires: cart-config.js loaded before this file
   ================================================ */

/* -----------------------------------------------
   CART STATE (localStorage)
----------------------------------------------- */
const SS_CART_KEY = 'ss_cart';

function cartGet() {
  try { return JSON.parse(localStorage.getItem(SS_CART_KEY)) || []; }
  catch(_) { return []; }
}

function cartSave(items) {
  localStorage.setItem(SS_CART_KEY, JSON.stringify(items));
  cartEmit();
}

function cartAdd(item) {
  const items = cartGet();
  const existing = items.find(i => i.cartKey === item.cartKey);
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    items.push({ ...item, qty: item.qty || 1 });
  }
  cartSave(items);
}

function cartRemove(cartKey) {
  cartSave(cartGet().filter(i => i.cartKey !== cartKey));
}

function cartUpdateQty(cartKey, qty) {
  const items = cartGet();
  const item = items.find(i => i.cartKey === cartKey);
  if (item) { item.qty = Math.max(1, qty); }
  cartSave(items);
}

function cartClear() { cartSave([]); }

function cartCount() { return cartGet().reduce((sum, i) => sum + i.qty, 0); }

function cartTotal() { return cartGet().reduce((sum, i) => sum + (i.price * i.qty), 0); }

function cartEmit() {
  document.dispatchEvent(new CustomEvent('ss:cart:updated'));
}

/* -----------------------------------------------
   RESOLVE PHP ENDPOINT
   Works whether script is at root or in /demo/
----------------------------------------------- */
function cartGetEndpoint() {
  if (SS_CART_CONFIG.phpEndpoint) return SS_CART_CONFIG.phpEndpoint;
  const inDemo = window.location.pathname.includes('/demo/');
  return inDemo ? '../order.php' : 'order.php';
}

/* -----------------------------------------------
   DOM HELPERS
----------------------------------------------- */
function cartInject() {
  // Cart drawer
  const drawer = document.createElement('div');
  drawer.id = 'ss-cart-drawer';
  drawer.className = 'ss-cart-drawer';
  drawer.setAttribute('aria-label', 'Shopping cart');
  drawer.innerHTML = `
    <div class="ss-cart-header">
      <h2 class="ss-cart-title">Your Cart</h2>
      <button class="ss-cart-close" id="ss-cart-close" aria-label="Close cart">✕</button>
    </div>
    <div class="ss-cart-items" id="ss-cart-items"></div>
    <div class="ss-cart-footer" id="ss-cart-footer"></div>
  `;
  document.body.appendChild(drawer);

  // Cart overlay
  const overlay = document.createElement('div');
  overlay.id = 'ss-cart-overlay';
  overlay.className = 'ss-cart-overlay';
  document.body.appendChild(overlay);

  // Checkout modal
  const modal = document.createElement('div');
  modal.id = 'ss-checkout-modal';
  modal.className = 'ss-checkout-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Checkout');
  modal.innerHTML = `
    <div class="ss-checkout-inner">
      <button class="ss-checkout-close" id="ss-checkout-close" aria-label="Close checkout">✕</button>
      <div id="ss-checkout-content"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* -----------------------------------------------
   BADGE UPDATE
----------------------------------------------- */
function cartUpdateBadge() {
  document.querySelectorAll('.ss-cart-count').forEach(el => {
    const n = cartCount();
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

/* -----------------------------------------------
   DRAWER RENDER
----------------------------------------------- */
function cartRenderDrawer() {
  const items = cartGet();
  const itemsEl  = document.getElementById('ss-cart-items');
  const footerEl = document.getElementById('ss-cart-footer');
  if (!itemsEl || !footerEl) return;

  if (items.length === 0) {
    itemsEl.innerHTML = '<p class="ss-cart-empty">Your cart is empty.</p>';
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = items.map(item => `
    <div class="ss-cart-item" data-key="${item.cartKey}">
      <img class="ss-cart-item-thumb" src="${item.thumb}" alt="${item.title}" loading="lazy">
      <div class="ss-cart-item-info">
        <p class="ss-cart-item-title">${item.title}</p>
        <p class="ss-cart-item-meta">${[item.model, item.color].filter(Boolean).join(' · ')}</p>
        <p class="ss-cart-item-price">$${(item.price * item.qty).toFixed(2)}</p>
      </div>
      <div class="ss-cart-item-controls">
        <button class="ss-qty-btn" data-action="dec" data-key="${item.cartKey}" aria-label="Decrease quantity">−</button>
        <span class="ss-qty-val">${item.qty}</span>
        <button class="ss-qty-btn" data-action="inc" data-key="${item.cartKey}" aria-label="Increase quantity">+</button>
        <button class="ss-cart-remove" data-key="${item.cartKey}" aria-label="Remove ${item.title}">🗑</button>
      </div>
    </div>
  `).join('');

  footerEl.innerHTML = `
    <div class="ss-cart-total">
      <span>Total</span>
      <strong>$${cartTotal().toFixed(2)}</strong>
    </div>
    <p class="ss-cart-note">Final total confirmed when Patricia processes your order.</p>
    <button class="ss-checkout-btn" id="ss-checkout-open">Proceed to Checkout</button>
    <button class="ss-continue-btn" id="ss-cart-continue">Continue Browsing</button>
  `;

  // Wire qty and remove buttons
  itemsEl.querySelectorAll('.ss-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const item = cartGet().find(i => i.cartKey === key);
      if (!item) return;
      if (btn.dataset.action === 'inc') cartUpdateQty(key, item.qty + 1);
      else if (item.qty > 1) cartUpdateQty(key, item.qty - 1);
      else cartRemove(key);
    });
  });

  itemsEl.querySelectorAll('.ss-cart-remove').forEach(btn => {
    btn.addEventListener('click', () => cartRemove(btn.dataset.key));
  });

  document.getElementById('ss-checkout-open')?.addEventListener('click', cartOpenCheckout);
  document.getElementById('ss-cart-continue')?.addEventListener('click', cartCloseDrawer);
}

/* -----------------------------------------------
   DRAWER OPEN / CLOSE
----------------------------------------------- */
function cartOpenDrawer() {
  cartRenderDrawer();
  document.getElementById('ss-cart-drawer')?.classList.add('open');
  document.getElementById('ss-cart-overlay')?.classList.add('open');
  document.body.classList.add('ss-cart-body-lock');
}

function cartCloseDrawer() {
  document.getElementById('ss-cart-drawer')?.classList.remove('open');
  document.getElementById('ss-cart-overlay')?.classList.remove('open');
  document.body.classList.remove('ss-cart-body-lock');
}

/* -----------------------------------------------
   CHECKOUT MODAL
----------------------------------------------- */

function cartRenderCheckoutSummary() {
  const items = cartGet();
  const tbody = document.getElementById('ss-co-tbody');
  const totalEl = document.getElementById('ss-co-total');
  if (!tbody) return;

  if (items.length === 0) {
    cartCloseCheckout();
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr data-key="${item.cartKey}">
      <td class="ss-co-item-title">${item.title}<br><span class="ss-co-item-meta">${[item.model, item.color].filter(Boolean).join(' · ')}</span></td>
      <td class="ss-co-qty-cell">
        <div class="ss-co-qty-ctrl">
          <button type="button" class="ss-co-qty-btn" data-action="dec" data-key="${item.cartKey}" aria-label="Decrease quantity">−</button>
          <span class="ss-co-qty-num">${item.qty}</span>
          <button type="button" class="ss-co-qty-btn" data-action="inc" data-key="${item.cartKey}" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td class="ss-co-price">$${(item.price * item.qty).toFixed(2)}</td>
      <td class="ss-co-remove-cell">
        <button type="button" class="ss-co-remove-btn" data-key="${item.cartKey}" aria-label="Remove ${item.title}">×</button>
      </td>
    </tr>
  `).join('');

  if (totalEl) totalEl.textContent = `$${cartTotal().toFixed(2)}`;

  // Wire controls
  tbody.querySelectorAll('.ss-co-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key  = btn.dataset.key;
      const item = cartGet().find(i => i.cartKey === key);
      if (!item) return;
      if (btn.dataset.action === 'inc') cartUpdateQty(key, item.qty + 1);
      else if (item.qty > 1)            cartUpdateQty(key, item.qty - 1);
      else                              cartRemove(key);
      cartRenderCheckoutSummary();
    });
  });

  tbody.querySelectorAll('.ss-co-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cartRemove(btn.dataset.key);
      cartRenderCheckoutSummary();
    });
  });
}

function cartOpenCheckout() {
  cartCloseDrawer();
  const items = cartGet();
  if (items.length === 0) return;

  const cfg = SS_CART_CONFIG;
  const hasMarkets = cfg.upcomingMarkets && cfg.upcomingMarkets.length > 0;

  const marketOptions = hasMarkets
    ? cfg.upcomingMarkets.map(m => `<option value="${m.id}">${m.label}</option>`).join('')
    : '';

  document.getElementById('ss-checkout-content').innerHTML = `
    <h2 class="ss-co-title">Place Your Order</h2>
    <p class="ss-co-intro">Fill in your details below. Patricia will contact you to confirm and arrange payment — no payment is taken now.</p>

    <div class="ss-co-summary">
      <h3 class="ss-co-section-label">Order Summary</h3>
      <table class="ss-co-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr></thead>
        <tbody id="ss-co-tbody"></tbody>
        <tfoot>
          <tr class="ss-co-total-row">
            <td colspan="2">Subtotal</td>
            <td id="ss-co-total"></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <p class="ss-co-tax-note">Prices shown are before applicable taxes. Final total confirmed when Patricia processes your order.</p>
    </div>

    <form id="ss-checkout-form" novalidate>
      <h3 class="ss-co-section-label">Your Details</h3>
      <div class="ss-co-row">
        <label class="ss-co-label" for="co-name">Full name <span aria-hidden="true">*</span></label>
        <input class="ss-co-input" id="co-name" name="name" type="text" required autocomplete="name" placeholder="Jane Smith">
      </div>
      <div class="ss-co-row">
        <label class="ss-co-label" for="co-email">Email address <span aria-hidden="true">*</span></label>
        <input class="ss-co-input" id="co-email" name="email" type="email" required autocomplete="email" placeholder="jane@example.com">
      </div>
      <div class="ss-co-row">
        <label class="ss-co-label" for="co-phone">Phone number <span aria-hidden="true">*</span></label>
        <input class="ss-co-input" id="co-phone" name="phone" type="tel" required autocomplete="tel" placeholder="613-555-1234">
      </div>

      <h3 class="ss-co-section-label">Delivery</h3>
      <div class="ss-co-row">
        <label class="ss-co-label">How would you like to receive your order? <span aria-hidden="true">*</span></label>
        <div class="ss-co-radios">
          ${hasMarkets ? `
          <label class="ss-co-radio">
            <input type="radio" name="delivery" value="pickup" checked> Market pickup
          </label>` : ''}
          <label class="ss-co-radio">
            <input type="radio" name="delivery" value="shipping" ${!hasMarkets ? 'checked' : ''}> Ship to me <span class="ss-co-radio-note">(shipping &amp; handling extra)</span>
          </label>
        </div>
      </div>

      ${hasMarkets ? `
      <div class="ss-co-row" id="co-market-row">
        <label class="ss-co-label" for="co-market">Pick up at which market?</label>
        <select class="ss-co-input" id="co-market" name="market">${marketOptions}</select>
      </div>` : ''}

      <div class="ss-co-row" id="co-address-row" style="display:none;">
        <label class="ss-co-label" for="co-address">Shipping address <span aria-hidden="true">*</span></label>
        <input class="ss-co-input" id="co-address" name="address" type="text" placeholder="Street address">
        <input class="ss-co-input" id="co-city" name="city" type="text" placeholder="City" style="margin-top:8px;">
        <div class="ss-co-inline" style="margin-top:8px;">
          <input class="ss-co-input" id="co-province" name="province" type="text" placeholder="Province" style="flex:1;">
          <input class="ss-co-input" id="co-postal" name="postal" type="text" placeholder="Postal code" style="flex:1;">
        </div>
      </div>

      <div class="ss-co-row">
        <label class="ss-co-label" for="co-notes">Notes (optional)</label>
        <textarea class="ss-co-input" id="co-notes" name="notes" rows="3" placeholder="Any special requests or questions…"></textarea>
      </div>

      <div class="ss-co-error" id="ss-co-error" role="alert" style="display:none;"></div>

      <button type="submit" class="ss-co-submit" id="ss-co-submit">Send Order Enquiry</button>
    </form>
  `;

  // Populate interactive order summary
  cartRenderCheckoutSummary();

  // Show/hide address vs market based on delivery selection
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const shipping = document.querySelector('input[name="delivery"]:checked')?.value === 'shipping';
      const addrRow   = document.getElementById('co-address-row');
      const marketRow = document.getElementById('co-market-row');
      if (addrRow)   addrRow.style.display   = shipping ? 'flex' : 'none';
      if (marketRow) marketRow.style.display  = shipping ? 'none' : 'flex';
    });
  });

  document.getElementById('ss-checkout-form')?.addEventListener('submit', cartSubmitOrder);

  document.getElementById('ss-checkout-modal')?.classList.add('open');
  document.body.classList.add('ss-cart-body-lock');
}

function cartCloseCheckout() {
  document.getElementById('ss-checkout-modal')?.classList.remove('open');
  document.body.classList.remove('ss-cart-body-lock');
}

/* -----------------------------------------------
   ORDER SUBMISSION
----------------------------------------------- */
async function cartSubmitOrder(e) {
  e.preventDefault();
  const form    = document.getElementById('ss-checkout-form');
  const errorEl = document.getElementById('ss-co-error');
  const submitBtn = document.getElementById('ss-co-submit');
  const cfg     = SS_CART_CONFIG;

  // Basic validation
  const name     = form.querySelector('#co-name')?.value.trim();
  const email    = form.querySelector('#co-email')?.value.trim();
  const phone    = form.querySelector('#co-phone')?.value.trim();
  const delivery = form.querySelector('input[name="delivery"]:checked')?.value;

  if (!name || !email || !phone || !delivery) {
    errorEl.textContent = 'Please fill in all required fields.';
    errorEl.style.display = 'block';
    return;
  }

  const shipping = delivery === 'shipping';
  if (shipping) {
    const addr = form.querySelector('#co-address')?.value.trim();
    const city = form.querySelector('#co-city')?.value.trim();
    if (!addr || !city) {
      errorEl.textContent = 'Please enter your shipping address.';
      errorEl.style.display = 'block';
      return;
    }
  }

  errorEl.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  const payload = {
    name,
    email,
    phone,
    delivery,
    market:   form.querySelector('#co-market')?.value || '',
    address:  form.querySelector('#co-address')?.value.trim() || '',
    city:     form.querySelector('#co-city')?.value.trim() || '',
    province: form.querySelector('#co-province')?.value.trim() || '',
    postal:   form.querySelector('#co-postal')?.value.trim() || '',
    notes:    form.querySelector('#co-notes')?.value.trim() || '',
    cart:     cartGet(),
    total:    cartTotal().toFixed(2),
  };

  try {
    let success = false;

    if (cfg.provider === 'php') {
      const res = await fetch(cartGetEndpoint(), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      success = data.ok === true;
      if (!success) throw new Error(data.error || 'Server error');

    } else if (cfg.provider === 'formspree') {
      const res = await fetch(cfg.formspreeEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify({
          name, email, phone, delivery,
          market:   payload.market,
          address:  [payload.address, payload.city, payload.province, payload.postal].filter(Boolean).join(', '),
          notes:    payload.notes,
          order:    cartGet().map(i => `${i.qty}x ${i.title} (${i.model}, ${i.color}) — $${(i.price * i.qty).toFixed(2)}`).join('\n'),
          total:    `$${payload.total}`,
        }),
      });
      const data = await res.json();
      success = !data.errors;
      if (!success) throw new Error('Formspree error');

    } else if (cfg.provider === 'emailjs') {
      // EmailJS requires its SDK to be loaded separately
      if (typeof emailjs === 'undefined') throw new Error('EmailJS SDK not loaded');
      const result = await emailjs.send(
        cfg.emailjs.serviceId,
        cfg.emailjs.templateId,
        { ...payload, order_text: cartGet().map(i => `${i.qty}x ${i.title} — $${(i.price * i.qty).toFixed(2)}`).join('\n') },
        cfg.emailjs.publicKey
      );
      success = result.status === 200;
    }

    if (success) {
      cartClear();
      document.getElementById('ss-checkout-content').innerHTML = `
        <div class="ss-co-success">
          <div class="ss-co-success-icon">✓</div>
          <h2>Order enquiry sent!</h2>
          <p>Thank you, <strong>${name}</strong>. Patricia will be in touch at <strong>${email}</strong> to confirm your order and arrange payment.</p>
          <p class="ss-co-success-note">Check your inbox — a confirmation has been sent to you.</p>
          <button class="ss-co-submit" onclick="cartCloseCheckout()">Close</button>
        </div>
      `;
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Order Enquiry';
    errorEl.textContent = 'Something went wrong. Please try again or email ' + SS_CART_CONFIG.storeEmail + ' directly.';
    errorEl.style.display = 'block';
  }
}

/* -----------------------------------------------
   INIT
----------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  cartInject();
  cartUpdateBadge();

  // Cart button(s) open drawer
  document.addEventListener('click', e => {
    if (e.target.closest('#ss-cart-btn, .ss-cart-btn')) cartOpenDrawer();
  });

  // Close drawer
  document.getElementById('ss-cart-close')?.addEventListener('click', cartCloseDrawer);
  document.getElementById('ss-cart-overlay')?.addEventListener('click', cartCloseDrawer);

  // Close checkout
  document.getElementById('ss-checkout-close')?.addEventListener('click', cartCloseCheckout);

  // Re-render on cart changes
  document.addEventListener('ss:cart:updated', () => {
    cartUpdateBadge();
    if (document.getElementById('ss-cart-drawer')?.classList.contains('open')) {
      cartRenderDrawer();
    }
  });

  // Keyboard: Escape closes open panels
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('ss-checkout-modal')?.classList.contains('open')) {
      cartCloseCheckout();
    } else if (document.getElementById('ss-cart-drawer')?.classList.contains('open')) {
      cartCloseDrawer();
    }
  });
});
