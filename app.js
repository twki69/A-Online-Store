const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const state = {
  products: [],
  cart: {},
  coupon: null,
  sliderIndex: 0,
  sliderTimer: null,
  reviews: [],
  reviewsIndex: 0,
  reviewsTimer: null,
  balance: 1000,
  filterSearch: '',
  filterCategory: 'all',
  sortOrder: 'default',
  theme: 'light',
  offersIndex: 0,
  offersTimer: null,
};

function format(n) {
  return `৳${n.toFixed(2)}`;
}

function renderOffers() {
  const track = $('#offersTrack');
  if (!track) return;
  const slides = [
    { title: 'Deal of the Day', text: 'Up to 30% off select items', color: 'from-primary to-blue-400' },
    { title: 'Weekend Flash Sale', text: 'Extra 10% with SMART10', color: 'from-amber-500 to-yellow-400' },
    { title: 'New Arrivals', text: 'Fresh picks just in', color: 'from-emerald-500 to-green-400' },
  ];
  track.innerHTML = '';
  slides.forEach(s => {
    const el = document.createElement('div');
    el.className = 'min-w-full';
    el.innerHTML = `
      <div class="h-40 md:h-56 w-full bg-gradient-to-r ${s.color} text-white rounded-xl flex items-center justify-between px-6">
        <div>
          <div class="text-xl md:text-2xl font-extrabold">${s.title}</div>
          <div class="mt-1">${s.text}</div>
        </div>
        <a href="#products" class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30">Shop Now</a>
      </div>`;
    track.appendChild(el);
  });
}

function initOffersCarousel() {
  const track = $('#offersTrack');
  const prev = $('#offerPrev');
  const next = $('#offerNext');
  if (!track) return;
  const n = track.children.length || 1;
  const show = (i) => {
    state.offersIndex = (i + n) % n;
    track.style.transform = `translateX(${-state.offersIndex * 100}%)`;
  };
  const play = () => { stop(); state.offersTimer = setInterval(() => show(state.offersIndex + 1), 5000); };
  const stop = () => { if (state.offersTimer) clearInterval(state.offersTimer); };
  prev?.addEventListener('click', () => { show(state.offersIndex - 1); play(); });
  next?.addEventListener('click', () => { show(state.offersIndex + 1); play(); });
  $('#offers')?.addEventListener('mouseenter', stop);
  $('#offers')?.addEventListener('mouseleave', play);
  show(0); play();
}

function renderCategoryButtons(cats = []) {
  const wrap = $('#categoryButtons');
  if (!wrap) return;
  wrap.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'px-3 py-1 rounded-full border hover:bg-slate-50 dark:hover:bg-slate-800 ' + (state.filterCategory === 'all' ? 'bg-primary text-white border-primary' : '');
  all.textContent = 'All';
  all.addEventListener('click', () => { state.filterCategory = 'all'; applyFiltersAndRender(); renderCategoryButtons(cats); });
  wrap.appendChild(all);
  cats.forEach(c => {
    const btn = document.createElement('button');
    const active = state.filterCategory === c;
    btn.className = 'px-3 py-1 rounded-full border hover:bg-slate-50 dark:hover:bg-slate-800 ' + (active ? 'bg-primary text-white border-primary' : '');
    btn.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    btn.addEventListener('click', () => { state.filterCategory = c; applyFiltersAndRender(); renderCategoryButtons(cats); });
    wrap.appendChild(btn);
  });
}

function initFAQ() {
  $$('.faq-toggle').forEach(t => {
    t.addEventListener('click', () => {
      const content = t.nextElementSibling;
      if (!(content instanceof HTMLElement)) return;
      content.classList.toggle('hidden');
    });
  });
}

function initNewsletter() {
  const form = $('#newsletterForm');
  const email = $('#newsletterEmail');
  const msg = $('#newsletterMsg');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (email?.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      if (msg) { msg.textContent = 'Please enter a valid email.'; msg.className = 'mt-2 text-sm text-red-600'; }
      return;
    }
    if (msg) { msg.textContent = 'Thanks for subscribing!'; msg.className = 'mt-2 text-sm text-green-600'; }
    form.reset();
  });
}

function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  const toggleVisibility = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.style.opacity = y > 400 ? '1' : '0.6';
  };
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

function initYear() {
  const y = new Date().getFullYear();
  const el = $('#year');
  if (el) el.textContent = y;
}

function initNav() {
  const toggle = $('#navToggle');
  const mobile = $('#mobileMenu');
  const navMenu = $('#navMenu');
  const links = $$('[data-link]');

  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      mobile.classList.toggle('hidden');
    });
  }

  function setActive(hash) {
    [...links, ...$$('#navMenu [data-link]')].forEach(a => a.classList.remove('text-primary', 'font-semibold', 'border-primary'));
    const active = links.find(a => a.getAttribute('href') === hash) || links[0];
    if (active) {
      active.classList.add('text-primary', 'font-semibold');
      const desktop = $(`#navMenu [href='${hash}']`);
      if (desktop) desktop.classList.add('text-primary', 'font-semibold', 'border-primary');
    }
  }

  links.forEach(a => a.addEventListener('click', () => {
    mobile?.classList.add('hidden');
  }));

  const sections = ['#home', '#products', '#reviews', '#about', '#contact']
    .map(id => ({ id, el: $(id) }))
    .filter(s => s.el);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) setActive(`#${e.target.id}`);
    });
  }, { threshold: 0.6 });

  sections.forEach(s => obs.observe(s.el));
  setActive('#home');
}

function initSlider() {
  const imgs = $$('#slider .slider-img');
  const prev = $('#prevSlide');
  const next = $('#nextSlide');
  if (!imgs.length) return;

  function show(i) {
    state.sliderIndex = (i + imgs.length) % imgs.length;
    imgs.forEach((img, idx) => {
      img.style.transition = 'opacity 400ms ease';
      img.style.opacity = idx === state.sliderIndex ? '1' : '0';
    });
  }

  function play() {
    stop();
    state.sliderTimer = setInterval(() => show(state.sliderIndex + 1), 4000);
  }
  function stop() {
    if (state.sliderTimer) clearInterval(state.sliderTimer);
  }

  prev?.addEventListener('click', () => { show(state.sliderIndex - 1); play(); });
  next?.addEventListener('click', () => { show(state.sliderIndex + 1); play(); });

  const slider = $('#slider');
  slider?.addEventListener('mouseenter', stop);
  slider?.addEventListener('mouseleave', play);

  show(0);
  play();
}

async function fetchProducts() {
  const res = await fetch('https://fakestoreapi.com/products');
  const data = await res.json();
  state.products = data.map(p => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    image: p.image,
    rating: p.rating?.rate || 0,
    count: p.rating?.count || 0,
  }));
}

function renderProducts(list = state.products) {
  const grid = $('#productsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'group rounded-xl border bg-white p-3 md:p-4 shadow-sm hover:shadow transition';
    card.innerHTML = `
      <div class="aspect-square overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
        <img src="${p.image}" alt="${p.title}" class="h-full object-contain group-hover:scale-105 transition" />
      </div>
      <div class="mt-3 space-y-1">
        <h3 title="${p.title}" class="font-semibold line-clamp-2 min-h-[3rem]">${p.title}</h3>
        <div class="flex items-center justify-between">
          <span class="text-primary font-bold">${format(p.price)}</span>
          <span class="text-sm text-slate-600">⭐ ${p.rating.toFixed(1)}</span>
        </div>
        <button data-add="${p.id}" class="w-full mt-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });

  $$('#productsGrid [data-add]').forEach(btn => btn.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.getAttribute('data-add'));
    addToCart(id);
  }));
}

function getFilteredAndSortedProducts() {
  let arr = [...state.products];
  if (state.filterCategory !== 'all') {
    arr = arr.filter(p => (p.category || '').toLowerCase() === state.filterCategory.toLowerCase());
  }
  if (state.filterSearch) {
    const q = state.filterSearch.toLowerCase();
    arr = arr.filter(p => p.title.toLowerCase().includes(q));
  }
  const v = state.sortOrder;
  if (v === 'price-asc') arr.sort((a,b) => a.price - b.price);
  else if (v === 'price-desc') arr.sort((a,b) => b.price - a.price);
  else if (v === 'rating-desc') arr.sort((a,b) => b.rating - a.rating);
  return arr;
}

function applyFiltersAndRender() {
  renderProducts(getFilteredAndSortedProducts());
}

function initSearchAndFilter() {
  const sortSel = $('#sortSelect');
  const catSel = $('#categorySelect');
  const searchInp = $('#searchInput');

  sortSel?.addEventListener('change', () => {
    state.sortOrder = sortSel.value;
    applyFiltersAndRender();
  });

  catSel?.addEventListener('change', () => {
    state.filterCategory = catSel.value;
    applyFiltersAndRender();
  });

  let t;
  searchInp?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.filterSearch = searchInp.value.trim();
      applyFiltersAndRender();
    }, 300);
  });
}

async function fetchCategories() {
  try {
    const res = await fetch('https://fakestoreapi.com/products/categories');
    const cats = await res.json();
    const sel = $('#categorySelect');
    if (sel) {
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
        sel.appendChild(opt);
      });
    }
    renderCategoryButtons(cats);
  } catch {}
}

function openCart() {
  $('#cartDrawer')?.classList.remove('hidden');
}
function closeCart() {
  $('#cartDrawer')?.classList.add('hidden');
}

function attachCartToggles() {
  $('#openCart')?.addEventListener('click', openCart);
  $('#closeCart')?.addEventListener('click', closeCart);
  $('#cartBackdrop')?.addEventListener('click', closeCart);
}

function addToCart(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  // affordability check with proposed +1
  if (!canAffordChange(id, 1)) {
    showBalanceWarning();
    openCart();
    return;
  }
  const existing = state.cart[id];
  const qty = existing ? existing.qty + 1 : 1;
  state.cart[id] = { ...p, qty };
  persistCart();
  renderCart();
  $('#cartCount').textContent = totalQty();
}

function removeFromCart(id) {
  delete state.cart[id];
  persistCart();
  renderCart();
  $('#cartCount').textContent = totalQty();
}

function changeQty(id, delta) {
  const item = state.cart[id];
  if (!item) return;
  if (delta > 0 && !canAffordChange(id, delta)) {
    showBalanceWarning();
    return;
  }
  item.qty = Math.max(1, item.qty + delta);
  persistCart();
  renderCart();
  $('#cartCount').textContent = totalQty();
}

function totalQty() {
  return Object.values(state.cart).reduce((s, i) => s + i.qty, 0);
}

function computeTotals() {
  const subtotal = Object.values(state.cart).reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 ? 5 : 0;
  const shipping = subtotal >= 100 ? 0 : (subtotal > 0 ? 7 : 0);
  let discount = 0;
  if (state.coupon === 'SMART10') discount = 0.10 * (subtotal + delivery + shipping);
  const total = Math.max(0, subtotal + delivery + shipping - discount);
  return { subtotal, delivery, shipping, discount, total };
}

function computeTotalsFromCart(tempCart) {
  const subtotal = Object.values(tempCart).reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 ? 5 : 0;
  const shipping = subtotal >= 100 ? 0 : (subtotal > 0 ? 7 : 0);
  let discount = 0;
  if (state.coupon === 'SMART10') discount = 0.10 * (subtotal + delivery + shipping);
  const total = Math.max(0, subtotal + delivery + shipping - discount);
  return { subtotal, delivery, shipping, discount, total };
}

function canAffordChange(productId, deltaQty) {
  const temp = JSON.parse(JSON.stringify(state.cart));
  const p = state.products.find(x => x.id === productId);
  if (!p) return true;
  const cur = temp[productId];
  const nextQty = (cur ? cur.qty : 0) + deltaQty;
  if (nextQty <= 0) return true;
  temp[productId] = { ...(cur || p), qty: nextQty };
  const t = computeTotalsFromCart(temp);
  return t.total <= state.balance;
}

function showBalanceWarning() {
  const t = computeTotals();
  const warn = $('#balanceWarn');
  if (warn) warn.textContent = `Insufficient balance. Add money to complete your purchase.`;
  const remaining = $('#remaining');
  if (remaining) remaining.textContent = format(Math.max(0, state.balance - t.total));
}

function renderCart() {
  const wrap = $('#cartItems');
  if (!wrap) return;
  wrap.innerHTML = '';
  const items = Object.values(state.cart);
  if (!items.length) {
    wrap.innerHTML = '<div class="text-center text-slate-600 py-20">Your cart is empty.</div>';
  } else {
    items.forEach(i => {
      const row = document.createElement('div');
      row.className = 'flex gap-3 border rounded-lg p-3';
      row.innerHTML = `
        <img src="${i.image}" alt="${i.title}" class="h-16 w-16 object-contain rounded bg-slate-50" />
        <div class="flex-1">
          <div class="font-semibold line-clamp-1" title="${i.title}">${i.title}</div>
          <div class="text-sm text-slate-600">${format(i.price)} • ⭐ ${i.rating.toFixed(1)}</div>
          <div class="mt-2 flex items-center justify-between">
            <div class="inline-flex items-center border rounded-lg">
              <button data-dec="${i.id}" class="px-2 py-1">-</button>
              <span class="px-3">${i.qty}</span>
              <button data-inc="${i.id}" class="px-2 py-1">+</button>
            </div>
            <div class="font-semibold">${format(i.price * i.qty)}</div>
          </div>
        </div>
        <button data-remove="${i.id}" class="self-start p-2 rounded hover:bg-slate-100">✕</button>
      `;
      wrap.appendChild(row);
    });
  }

  $$('#cartItems [data-inc]').forEach(b => b.addEventListener('click', e => changeQty(Number(e.currentTarget.getAttribute('data-inc')), 1)));
  $$('#cartItems [data-dec]').forEach(b => b.addEventListener('click', e => changeQty(Number(e.currentTarget.getAttribute('data-dec')), -1)));
  $$('#cartItems [data-remove]').forEach(b => b.addEventListener('click', e => removeFromCart(Number(e.currentTarget.getAttribute('data-remove')))));

  const t = computeTotals();
  $('#subtotal').textContent = format(t.subtotal);
  $('#delivery').textContent = format(t.delivery);
  $('#shipping').textContent = format(t.shipping);
  $('#discount').textContent = `-${format(t.discount).slice(1)}`;
  $('#total').textContent = format(t.total);
  // balance block
  $('#balanceInline').textContent = format(state.balance);
  const remaining = Math.max(0, state.balance - t.total);
  $('#remaining').textContent = format(remaining);
  const warn = $('#balanceWarn');
  if (warn) warn.textContent = t.total > state.balance ? 'Total exceeds your current balance.' : '';
}

function persistCart() {
  try {
    localStorage.setItem('smartshop_cart', JSON.stringify({ cart: state.cart, coupon: state.coupon }));
  } catch {}
}

function restoreCart() {
  try {
    const raw = localStorage.getItem('smartshop_cart');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.cart = parsed.cart || {};
    state.coupon = parsed.coupon || null;
  } catch {}
}

function loadBalance() {
  try {
    const raw = localStorage.getItem('smartshop_balance');
    state.balance = raw ? Number(raw) : 1000;
    if (!isFinite(state.balance)) state.balance = 1000;
  } catch { state.balance = 1000; }
}

function saveBalance() {
  try { localStorage.setItem('smartshop_balance', String(state.balance)); } catch {}
}

function renderBalance() {
  const v = format(state.balance);
  const el1 = $('#balanceAmount'); if (el1) el1.textContent = v;
  const el2 = $('#balanceAmountMobile'); if (el2) el2.textContent = v;
  const el3 = $('#balanceInline'); if (el3) el3.textContent = v;
  const t = computeTotals();
  const rem = Math.max(0, state.balance - t.total);
  const el4 = $('#remaining'); if (el4) el4.textContent = format(rem);
  const warn = $('#balanceWarn'); if (warn) warn.textContent = t.total > state.balance ? 'Total exceeds your current balance.' : '';
}

function attachAddMoneyButtons() {
  const inc = () => { state.balance += 1000; saveBalance(); renderBalance(); };
  $('#addMoney')?.addEventListener('click', inc);
  $('#addMoneyMobile')?.addEventListener('click', inc);
}

function loadTheme() {
  try {
    const raw = localStorage.getItem('smartshop_theme');
    if (raw === 'dark' || raw === 'light') state.theme = raw; else state.theme = 'light';
  } catch { state.theme = 'light'; }
}

function saveTheme() {
  try { localStorage.setItem('smartshop_theme', state.theme); } catch {}
}

function applyTheme() {
  const root = document.documentElement; // apply on <html>
  if (state.theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  const btn = $('#themeToggle'); if (btn) btn.textContent = state.theme === 'dark' ? 'Light' : 'Dark';
  const btnM = $('#themeToggleMobile'); if (btnM) btnM.textContent = state.theme === 'dark' ? 'Toggle Light' : 'Toggle Dark';
}

function attachThemeToggle() {
  const toggle = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; saveTheme(); applyTheme(); };
  $('#themeToggle')?.addEventListener('click', toggle);
  $('#themeToggleMobile')?.addEventListener('click', toggle);
}

function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;
  const nameEl = $('#contactName');
  const emailEl = $('#contactEmail');
  const msgEl = $('#contactMessage');
  const feedback = $('#contactFeedback');

  const setFeedback = (text, ok = false) => {
    if (!feedback) return;
    feedback.textContent = text;
    feedback.className = 'md:col-span-2 text-sm ' + (ok ? 'text-green-600' : 'text-red-600');
  };

  const setInvalid = (el, invalid) => {
    if (!el) return;
    el.classList.toggle('border-red-500', invalid);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = (nameEl?.value || '').trim();
    const emailVal = (emailEl?.value || '').trim();
    const messageVal = (msgEl?.value || '').trim();

    let valid = true;
    const errors = [];

    if (nameVal.length < 2) { valid = false; errors.push('Name must be at least 2 characters.'); }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) { valid = false; errors.push('Enter a valid email address.'); }
    if (messageVal.length < 10) { valid = false; errors.push('Message must be at least 10 characters.'); }

    setInvalid(nameEl, nameVal.length < 2);
    setInvalid(emailEl, !emailOk);
    setInvalid(msgEl, messageVal.length < 10);

    if (!valid) {
      setFeedback(errors.join(' '), false);
      return;
    }

    setFeedback('Thank you! Your message has been received. We will contact you soon.', true);
    form.reset();
  });
}

function initCoupon() {
  const input = $('#couponInput');
  const btn = $('#applyCoupon');
  const msg = $('#couponMsg');
  btn?.addEventListener('click', () => {
    const code = (input?.value || '').trim().toUpperCase();
    if (!code) {
      state.coupon = null;
      if (msg) msg.textContent = 'Coupon cleared';
    } else if (code === 'SMART10') {
      state.coupon = 'SMART10';
      if (msg) msg.textContent = '10% discount applied';
    } else {
      state.coupon = null;
      if (msg) msg.textContent = 'Invalid coupon';
    }
    persistCart();
    renderCart();
  });
  if (state.coupon && input) {
    input.value = state.coupon;
  }
}

async function bootstrap() {
  initYear();
  initNav();
  initSlider();
  restoreCart();
  loadBalance();
  attachCartToggles();
  await fetchProducts();
  await fetchCategories();
  initSearchAndFilter();
  applyFiltersAndRender();
  renderCart();
  initCoupon();
  $('#cartCount').textContent = totalQty();
  await fetchReviews();
  renderReviews();
  initReviewsCarousel();
  renderBalance();
  attachAddMoneyButtons();
  loadTheme();
  applyTheme();
  attachThemeToggle();
  initContactForm();
  initBackToTop();
  renderOffers();
  initOffersCarousel();
  initFAQ();
  initNewsletter();
}

document.addEventListener('DOMContentLoaded', bootstrap);

async function fetchReviews() {
  try {
    const res = await fetch('./reviews.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('failed');
    state.reviews = await res.json();
  } catch {
    state.reviews = [
      { name: 'Fallback User 1', comment: 'Great shop and fast shipping.', rating: 4.6, date: '2025-07-01' },
      { name: 'Fallback User 2', comment: 'Nice selection and prices.', rating: 4.5, date: '2025-07-10' },
      { name: 'Fallback User 3', comment: 'Checkout was smooth.', rating: 4.7, date: '2025-07-20' }
    ];
  }
}

function renderReviews() {
  const track = $('#reviewsTrack');
  const dots = $('#reviewsDots');
  if (!track || !dots) return;
  track.innerHTML = '';
  dots.innerHTML = '';

  state.reviews.forEach((r, i) => {
    const slide = document.createElement('div');
    slide.className = 'min-w-full px-1';
    slide.innerHTML = `
      <div class="rounded-xl border bg-white p-5 shadow-sm h-full">
        <div class="flex items-center justify-between">
          <div class="font-semibold">${r.name}</div>
          <div class="text-sm text-slate-600">${new Date(r.date).toLocaleDateString()}</div>
        </div>
        <p class="mt-3 text-slate-700">${r.comment}</p>
        <div class="mt-3 text-sm text-slate-600">⭐ ${Number(r.rating).toFixed(1)}</div>
      </div>`;
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'h-2.5 w-2.5 rounded-full bg-slate-300 data-[active=true]:bg-primary';
    dot.setAttribute('data-idx', String(i));
    dots.appendChild(dot);
  });
}

function initReviewsCarousel() {
  const track = $('#reviewsTrack');
  const prev = $('#revPrev');
  const next = $('#revNext');
  const dots = $$('#reviewsDots button');
  if (!track) return;

  function show(i) {
    const n = state.reviews.length || 1;
    state.reviewsIndex = (i + n) % n;
    const offset = -state.reviewsIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    $$('#reviewsDots button').forEach((d, idx) => d.setAttribute('data-active', idx === state.reviewsIndex ? 'true' : 'false'));
  }

  function play() {
    stop();
    state.reviewsTimer = setInterval(() => show(state.reviewsIndex + 1), 5000);
  }
  function stop() {
    if (state.reviewsTimer) clearInterval(state.reviewsTimer);
  }

  prev?.addEventListener('click', () => { show(state.reviewsIndex - 1); play(); });
  next?.addEventListener('click', () => { show(state.reviewsIndex + 1); play(); });
  dots.forEach(d => d.addEventListener('click', (e) => {
    const idx = Number(e.currentTarget.getAttribute('data-idx'));
    show(idx);
    play();
  }));

  const wrapper = $('#reviews');
  wrapper?.addEventListener('mouseenter', stop);
  wrapper?.addEventListener('mouseleave', play);

  show(0);
  play();
}
