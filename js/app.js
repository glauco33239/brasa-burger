/**
 * Brasa Burger — lógica da aplicação
 * Depende de: config.js (APP_CONFIG) e products.js (PRODUCTS)
 */
(() => {
  'use strict';

  const { store, hours, order, categories, storageKey, images } = APP_CONFIG;

  /* =========================================================
     Utilitários
     ========================================================= */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const currency = new Intl.NumberFormat(order.locale, { style: 'currency', currency: order.currency });
  const formatCents = (cents) => currency.format(cents / 100).replace(/ /g, ' ');
  const formatPrice = (value) => formatCents(toCents(value));
  const toCents = (value) => Math.round(value * 100);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const escapeHTML = (text) =>
    String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  // Minúsculas e sem acentos, para busca tolerante ("pao" encontra "Pão")
  const normalize = (text) => String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  const storage = {
    read(key, fallback) {
      try {
        const raw = localStorage.getItem(`${storageKey}:${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(`${storageKey}:${key}`, JSON.stringify(value));
      } catch {
        /* armazenamento indisponível (modo privado, cheio...) — o app segue funcionando */
      }
    },
  };

  /* =========================================================
     Ícones (SVG inline, estilo traço)
     ========================================================= */
  const ICONS = {
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    timer: '<path d="M10 2h4"/><path d="m12 14 3-3"/><circle cx="12" cy="14" r="8"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  };

  const svg = (name, size = 20) =>
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

  function hydrateIcons(root = document) {
    $$('[data-icon]', root).forEach((el) => {
      el.innerHTML = svg(el.dataset.icon, Number(el.dataset.size) || 20);
    });
  }

  /* =========================================================
     Imagens
     ========================================================= */
  const isUnsplash = (src) => src.includes('images.unsplash.com');

  function imageUrl(src, width) {
    if (!isUnsplash(src)) return src;
    const url = new URL(src);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('w', width);
    url.searchParams.set('q', '75');
    return url.toString();
  }

  // Atributos src/srcset: Unsplash recebe tamanhos responsivos; caminhos locais usam src simples.
  function imageAttrs(src, sizes, width = 800) {
    if (!isUnsplash(src)) return `src="${escapeHTML(src)}"`;
    const set = [480, 800, 1200].map((w) => `${escapeHTML(imageUrl(src, w))} ${w}w`).join(', ');
    return `src="${escapeHTML(imageUrl(src, width))}" srcset="${set}" sizes="${sizes}"`;
  }

  // Fade-in ao carregar e fallback caso a imagem falhe (eventos não "borbulham", por isso captura)
  document.addEventListener('load', (event) => {
    if (event.target.tagName === 'IMG') event.target.classList.add('is-loaded');
  }, true);

  document.addEventListener('error', (event) => {
    const img = event.target;
    if (img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.removeAttribute('srcset');
    img.src = images.fallback;
  }, true);

  /* =========================================================
     Estado
     ========================================================= */
  const productById = new Map(PRODUCTS.map((product) => [product.id, product]));

  const state = {
    category: 'all',
    query: '',
    cart: [], // [{ id, qty, note }]
    generalNote: '',
    customer: { name: '', mode: 'delivery', street: '', number: '', district: '', complement: '' },
    layer: null, // 'cart' | 'product' | 'checkout' | null
    modalProduct: null,
    lastFocus: null,
  };

  /* =========================================================
     Elementos
     ========================================================= */
  const el = {
    header: $('#header'),
    status: $('#storeStatus'),
    statusText: $('#storeStatusText'),
    cartButton: $('#cartButton'),
    cartCount: $('#cartCount'),
    heroImage: $('#heroImage'),
    infoGrid: $('#infoGrid'),
    searchInput: $('#searchInput'),
    clearSearch: $('#clearSearch'),
    categories: $('#categories'),
    grid: $('#productGrid'),
    empty: $('#emptyState'),
    emptyMessage: $('#emptyMessage'),
    emptyClear: $('#emptyClear'),
    resultsCount: $('#resultsCount'),
    backdrop: $('#backdrop'),
    cartDrawer: $('#cartDrawer'),
    cartTitleCount: $('#cartTitleCount'),
    cartEmpty: $('#cartEmpty'),
    cartList: $('#cartList'),
    cartFooter: $('#cartFooter'),
    generalNote: $('#generalNote'),
    cartSubtotal: $('#cartSubtotal'),
    cartFeeHint: $('#cartFeeHint'),
    checkoutButton: $('#checkoutButton'),
    productModal: $('#productModal'),
    productContent: $('#productContent'),
    productFooter: $('#productFooter'),
    checkoutModal: $('#checkoutModal'),
    checkoutForm: $('#checkoutForm'),
    addressFields: $('#addressFields'),
    checkoutSummary: $('#checkoutSummary'),
    cartBar: $('#cartBar'),
    cartBarCount: $('#cartBarCount'),
    cartBarTotal: $('#cartBarTotal'),
    toast: $('#toast'),
    footerAddress: $('#footerAddress'),
    footerWhatsapp: $('#footerWhatsapp'),
  };

  const layers = {
    cart: el.cartDrawer,
    product: el.productModal,
    checkout: el.checkoutModal,
  };

  /* =========================================================
     Informações da loja e status
     ========================================================= */
  function renderStoreInfo() {
    $$('[data-store-name]').forEach((node) => { node.textContent = store.name; });

    const items = [
      { icon: 'clock', label: 'Horário de funcionamento', value: store.hoursLabel },
      { icon: 'timer', label: 'Tempo de preparo', value: store.prepTime },
      { icon: 'truck', label: 'Como receber', value: store.fulfillment },
      { icon: 'pin', label: 'Endereço', value: store.address },
    ];

    el.infoGrid.innerHTML = items.map((item) => `
      <li class="info__item">
        <span class="info__icon" data-icon="${item.icon}" data-size="20"></span>
        <span class="info__text">
          <span class="info__label">${escapeHTML(item.label)}</span>
          <span class="info__value">${escapeHTML(item.value)}</span>
        </span>
      </li>`).join('');

    el.footerAddress.textContent = `${store.address} · ${store.hoursLabel}`;
    el.footerWhatsapp.href = `https://wa.me/${whatsappNumber()}`;

    el.heroImage.src = imageUrl(images.hero, 1000);
    el.heroImage.srcset = [600, 1000, 1400].map((w) => `${imageUrl(images.hero, w)} ${w}w`).join(', ');
    el.heroImage.sizes = '(min-width: 900px) 560px, 100vw';
  }

  const whatsappNumber = () => String(store.whatsapp).replace(/\D/g, '');

  function isOpenNow(now = new Date()) {
    if (hours.statusMode === 'open') return true;
    if (hours.statusMode === 'closed') return false;
    if (!hours.openDays.includes(now.getDay())) return false;
    const toMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
    const current = now.getHours() * 60 + now.getMinutes();
    return current >= toMinutes(hours.opensAt) && current < toMinutes(hours.closesAt);
  }

  function renderStatus() {
    const open = isOpenNow();
    el.status.classList.toggle('is-closed', !open);
    el.statusText.textContent = open ? 'Aberto agora' : 'Fechado agora';
  }

  /* =========================================================
     Categorias, busca e lista de produtos
     ========================================================= */
  function renderCategories() {
    el.categories.innerHTML = categories.map((category) => `
      <button class="chip" type="button" data-category="${escapeHTML(category.id)}" aria-pressed="${category.id === state.category}">
        <span class="chip__emoji" aria-hidden="true">${category.emoji}</span>${escapeHTML(category.label)}
      </button>`).join('');
  }

  function updateCategoryButtons() {
    $$('.chip', el.categories).forEach((chip) => {
      const active = chip.dataset.category === state.category;
      chip.setAttribute('aria-pressed', String(active));
      if (active) {
        // Centraliza o chip ativo no scroll horizontal (sem mexer na rolagem vertical da página)
        const target = chip.offsetLeft - (el.categories.clientWidth - chip.offsetWidth) / 2;
        el.categories.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      }
    });
  }

  function getVisibleProducts() {
    const query = normalize(state.query);
    return PRODUCTS.filter((product) => {
      const inCategory = state.category === 'all' || product.category === state.category;
      const matchesQuery = !query || normalize(product.name).includes(query) || normalize(product.description).includes(query);
      return inCategory && matchesQuery;
    });
  }

  function productCardHTML(product, index) {
    const unavailable = product.available === false;
    const badge = unavailable
      ? '<span class="badge badge--off">Indisponível</span>'
      : product.badge ? `<span class="badge">${escapeHTML(product.badge)}</span>` : '';
    const sizes = '(min-width: 1120px) 280px, (min-width: 900px) 360px, (min-width: 600px) 45vw, 100vw';

    return `
      <article class="card${unavailable ? ' is-unavailable' : ''}" data-id="${escapeHTML(product.id)}" style="--i:${Math.min(index, 8)}">
        <div class="card__media">
          <img ${imageAttrs(product.image, sizes)} alt="${escapeHTML(product.name)}" loading="lazy" decoding="async">
          ${badge}
        </div>
        <div class="card__body">
          <h3 class="card__title"><button type="button" class="card__open" data-action="open">${escapeHTML(product.name)}</button></h3>
          <p class="card__desc">${escapeHTML(product.description)}</p>
          <div class="card__footer">
            <span class="price">${formatPrice(product.price)}</span>
            <button class="btn btn--add" type="button" data-action="add" ${unavailable ? 'disabled' : ''} aria-label="${unavailable ? 'Indisponível' : `Adicionar ${escapeHTML(product.name)} ao carrinho`}">
              ${unavailable ? 'Indisponível' : `${svg('plus', 18)}<span>Adicionar</span>`}
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts({ animate = false } = {}) {
    const list = getVisibleProducts();
    el.grid.innerHTML = list.map(productCardHTML).join('');
    el.grid.classList.toggle('is-entering', animate);

    const hasResults = list.length > 0;
    el.empty.hidden = hasResults;
    el.resultsCount.textContent = hasResults ? `${list.length} ${list.length === 1 ? 'item' : 'itens'}` : '';

    if (!hasResults) {
      el.emptyMessage.textContent = state.query
        ? `Não encontramos nada para “${state.query.trim()}”. Tente outro nome ou ingrediente.`
        : 'Nenhum item disponível nesta categoria no momento.';
      el.emptyClear.hidden = !state.query;
    }
  }

  let fadeTimer;
  function setCategory(categoryId) {
    if (categoryId === state.category) return;
    state.category = categoryId;
    updateCategoryButtons();
    el.grid.classList.add('is-fading');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      renderProducts({ animate: true });
      el.grid.classList.remove('is-fading');
    }, 140);
  }

  function setQuery(value) {
    state.query = value;
    el.clearSearch.hidden = value === '';
    renderProducts();
  }

  function clearSearch() {
    el.searchInput.value = '';
    setQuery('');
    el.searchInput.focus();
  }

  /* =========================================================
     Carrinho
     ========================================================= */
  const maxQty = order.maxQtyPerItem;
  const sameNote = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

  function loadCart() {
    const saved = storage.read('cart', { items: [], note: '' });
    const items = Array.isArray(saved.items) ? saved.items : [];

    // Descarta itens de produtos que não existem mais ou ficaram indisponíveis
    state.cart = items
      .filter((item) => {
        const product = productById.get(item.id);
        return product && product.available !== false && Number.isInteger(item.qty) && item.qty > 0;
      })
      .map((item) => ({
        id: item.id,
        qty: Math.min(item.qty, maxQty),
        note: String(item.note || '').slice(0, order.noteMaxLength),
      }));
    state.generalNote = String(saved.note || '');
  }

  const saveCart = () => storage.write('cart', { items: state.cart, note: state.generalNote });

  function getTotals(mode = null) {
    const subtotal = state.cart.reduce((sum, item) => sum + toCents(productById.get(item.id).price) * item.qty, 0);
    const itemCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const fee = mode === 'delivery' ? toCents(order.deliveryFee) : 0;
    return { itemCount, subtotal, fee, total: subtotal + fee };
  }

  function commitCart() {
    saveCart();
    renderCart();
    renderCartIndicators();
  }

  function addToCart(productId, qty = 1, note = '') {
    const product = productById.get(productId);
    if (!product || product.available === false) return false;

    const cleanNote = note.trim();
    const existing = state.cart.find((item) => item.id === productId && sameNote(item.note, cleanNote));

    if (existing) existing.qty = Math.min(existing.qty + qty, maxQty);
    else state.cart.push({ id: productId, qty: Math.min(qty, maxQty), note: cleanNote });

    commitCart();
    bumpCartButton();
    showToast(`${product.name} adicionado ao pedido`);
    return true;
  }

  function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    const next = item.qty + delta;
    if (next <= 0) return removeItem(index);
    item.qty = Math.min(next, maxQty);
    commitCart();
  }

  function removeItem(index) {
    const row = $(`.cart-item[data-index="${index}"]`, el.cartList);
    const finish = () => {
      state.cart.splice(index, 1);
      commitCart();
    };
    if (row) {
      row.classList.add('is-removing');
      setTimeout(finish, 180);
    } else {
      finish();
    }
  }

  function renderCartIndicators() {
    const { itemCount, subtotal } = getTotals();
    el.cartCount.textContent = itemCount;
    el.cartCount.dataset.count = itemCount;
    el.cartButton.setAttribute('aria-label', itemCount ? `Abrir carrinho, ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : 'Abrir carrinho');

    el.cartBarCount.textContent = itemCount;
    el.cartBarTotal.textContent = formatCents(subtotal);
    const showBar = itemCount > 0;
    el.cartBar.classList.toggle('is-visible', showBar);
    el.cartBar.inert = !showBar;
    document.body.classList.toggle('has-cart-bar', showBar);
  }

  function bumpCartButton() {
    el.cartButton.classList.remove('is-bump');
    void el.cartButton.offsetWidth; // reinicia a animação
    el.cartButton.classList.add('is-bump');
  }

  function cartItemHTML(item, index) {
    const product = productById.get(item.id);
    const unit = toCents(product.price);
    return `
      <li class="cart-item" data-index="${index}">
        <img class="cart-item__img" src="${escapeHTML(imageUrl(product.image, 200))}" alt="${escapeHTML(product.name)}" loading="lazy">
        <div>
          <h3 class="cart-item__name">${escapeHTML(product.name)}</h3>
          <p class="cart-item__unit">${formatCents(unit)} cada</p>
          ${item.note ? `<p class="cart-item__note">Obs.: ${escapeHTML(item.note)}</p>` : ''}
          <div class="cart-item__row">
            <div class="stepper" role="group" aria-label="Quantidade de ${escapeHTML(product.name)}">
              <button class="stepper__btn" type="button" data-action="dec" aria-label="Diminuir quantidade">${svg('minus', 16)}</button>
              <span class="stepper__value" aria-live="polite">${item.qty}</span>
              <button class="stepper__btn" type="button" data-action="inc" aria-label="Aumentar quantidade" ${item.qty >= maxQty ? 'disabled' : ''}>${svg('plus', 16)}</button>
            </div>
            <strong class="cart-item__total">${formatCents(unit * item.qty)}</strong>
          </div>
        </div>
        <button class="icon-btn cart-item__remove" type="button" data-action="remove" aria-label="Remover ${escapeHTML(product.name)}">${svg('trash', 18)}</button>
      </li>`;
  }

  function renderCart() {
    const { itemCount, subtotal } = getTotals();
    const isEmpty = itemCount === 0;

    el.cartEmpty.hidden = !isEmpty;
    el.cartList.hidden = isEmpty;
    el.cartFooter.hidden = isEmpty;
    el.cartTitleCount.textContent = isEmpty ? '' : `(${itemCount} ${itemCount === 1 ? 'item' : 'itens'})`;

    el.cartList.innerHTML = state.cart.map(cartItemHTML).join('');
    el.cartSubtotal.textContent = formatCents(subtotal);
    el.cartFeeHint.textContent = order.deliveryFee > 0
      ? `Taxa de entrega de ${formatPrice(order.deliveryFee)} é adicionada na finalização (somente entrega).`
      : '';
    el.cartFeeHint.hidden = order.deliveryFee <= 0;
    if (document.activeElement !== el.generalNote) el.generalNote.value = state.generalNote;
  }

  /* =========================================================
     Camadas (carrinho, modal de produto, finalização)
     ========================================================= */
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  function openLayer(name) {
    if (state.layer === name) return;

    if (state.layer) {
      closeLayerElement(state.layer);
    } else {
      state.lastFocus = document.activeElement;
      document.body.style.setProperty('--scrollbar-w', `${getScrollbarWidth()}px`);
      document.body.classList.add('no-scroll');
    }

    state.layer = name;
    el.toast.classList.remove('is-visible'); // o toast não deve cobrir botões das camadas
    const node = layers[name];
    node.inert = false;
    node.setAttribute('aria-hidden', 'false');
    // força o reflow para a transição disparar quando a camada acabou de ser exibida
    void node.offsetWidth;
    node.classList.add('is-open');
    el.backdrop.classList.add('is-open');

    setTimeout(() => {
      const target = $('[data-autofocus]', node) || $('[data-close]', node);
      target?.focus({ preventScroll: true });
    }, 60);
  }

  function closeLayerElement(name) {
    const node = layers[name];
    node.classList.remove('is-open');
    node.inert = true;
    node.setAttribute('aria-hidden', 'true');
  }

  function closeLayer({ restoreFocus = true } = {}) {
    if (!state.layer) return;
    closeLayerElement(state.layer);
    state.layer = null;
    el.backdrop.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    document.body.style.removeProperty('--scrollbar-w');
    if (restoreFocus && state.lastFocus && document.contains(state.lastFocus)) {
      state.lastFocus.focus({ preventScroll: true });
    }
    state.lastFocus = null;
  }

  // Mantém o foco do teclado dentro da camada aberta
  function trapFocus(event) {
    if (event.key !== 'Tab' || !state.layer) return;
    const focusable = $$('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', layers[state.layer])
      .filter((node) => node.offsetParent !== null && !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  /* =========================================================
     Modal de produto
     ========================================================= */
  function openProductModal(productId) {
    const product = productById.get(productId);
    if (!product) return;
    state.modalProduct = product;
    renderProductModal(product);
    el.productContent.scrollTop = 0;
    openLayer('product');
  }

  function renderProductModal(product) {
    const unavailable = product.available === false;
    const badge = !unavailable && product.badge ? `<span class="badge">${escapeHTML(product.badge)}</span>` : '';

    el.productContent.innerHTML = `
      <div class="pm__media">
        <img ${imageAttrs(product.image, '(min-width: 600px) 560px, 100vw', 1000)} alt="${escapeHTML(product.name)}">
        ${badge}
      </div>
      <div class="pm__info">
        <div class="pm__head">
          <h2 id="productModalTitle">${escapeHTML(product.name)}</h2>
          <span class="price price--lg">${formatPrice(product.price)}</span>
        </div>
        <p class="pm__desc">${escapeHTML(product.description)}</p>
        ${unavailable
          ? '<p class="notice">Este item está indisponível no momento.</p>'
          : `<div class="field">
               <label for="modalNote">Observações do item <span class="muted">(opcional)</span></label>
               <textarea id="modalNote" rows="3" maxlength="${order.noteMaxLength}" placeholder="Ex.: Sem cebola, por favor."></textarea>
             </div>`}
      </div>`;

    el.productFooter.innerHTML = unavailable
      ? '<button class="btn btn--primary btn--block btn--lg" type="button" disabled>Indisponível</button>'
      : `<div class="pm__row">
           <div class="stepper stepper--lg" role="group" aria-label="Quantidade">
             <button class="stepper__btn" type="button" data-action="modal-dec" aria-label="Diminuir quantidade">${svg('minus', 18)}</button>
             <input class="stepper__input" id="modalQty" type="number" inputmode="numeric" min="1" max="${maxQty}" value="1" aria-label="Quantidade">
             <button class="stepper__btn" type="button" data-action="modal-inc" aria-label="Aumentar quantidade">${svg('plus', 18)}</button>
           </div>
           <div class="pm__total"><span>Total</span><strong id="modalTotal"></strong></div>
         </div>
         <button class="btn btn--primary btn--block btn--lg" type="button" data-action="modal-add">Adicionar ao pedido</button>`;

    updateModalTotal();
  }

  const getModalQty = () => {
    const input = $('#modalQty');
    return input ? clamp(parseInt(input.value, 10) || 1, 1, maxQty) : 1;
  };

  function setModalQty(value) {
    const input = $('#modalQty');
    if (!input) return;
    input.value = clamp(value, 1, maxQty);
    updateModalTotal();
  }

  function updateModalTotal() {
    const total = $('#modalTotal');
    if (total && state.modalProduct) total.textContent = formatCents(toCents(state.modalProduct.price) * getModalQty());
    const dec = $('[data-action="modal-dec"]');
    const inc = $('[data-action="modal-inc"]');
    if (dec) dec.disabled = getModalQty() <= 1;
    if (inc) inc.disabled = getModalQty() >= maxQty;
  }

  function addFromModal() {
    const product = state.modalProduct;
    if (!product) return;
    const note = $('#modalNote')?.value ?? '';
    if (addToCart(product.id, getModalQty(), note)) closeLayer();
  }

  /* =========================================================
     Finalização (formulário + WhatsApp)
     ========================================================= */
  function loadCustomer() {
    state.customer = { ...state.customer, ...storage.read('customer', {}) };
    if (!['delivery', 'pickup'].includes(state.customer.mode)) state.customer.mode = 'delivery';
  }

  function fillCheckoutForm() {
    const form = el.checkoutForm.elements;
    const c = state.customer;
    form.customerName.value = c.name;
    form.mode.value = c.mode;
    form.street.value = c.street;
    form.number.value = c.number;
    form.district.value = c.district;
    form.complement.value = c.complement;
    clearErrors();
    updateCheckoutMode();
  }

  function readCheckoutForm() {
    const data = Object.fromEntries(new FormData(el.checkoutForm));
    state.customer = {
      name: (data.customerName || '').trim(),
      mode: data.mode === 'pickup' ? 'pickup' : 'delivery',
      street: (data.street || '').trim(),
      number: (data.number || '').trim(),
      district: (data.district || '').trim(),
      complement: (data.complement || '').trim(),
    };
    storage.write('customer', state.customer);
  }

  function updateCheckoutMode() {
    const isDelivery = el.checkoutForm.elements.mode.value === 'delivery';
    el.addressFields.hidden = !isDelivery;
    renderCheckoutSummary(isDelivery ? 'delivery' : 'pickup');
  }

  function renderCheckoutSummary(mode) {
    const { itemCount, subtotal, fee, total } = getTotals(mode);
    el.checkoutSummary.innerHTML = `
      <div><dt>Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'itens'})</dt><dd>${formatCents(subtotal)}</dd></div>
      ${mode === 'delivery' && order.deliveryFee > 0 ? `<div><dt>Taxa de entrega</dt><dd>${formatCents(fee)}</dd></div>` : ''}
      <div class="summary__total"><dt>Total</dt><dd>${formatCents(total)}</dd></div>`;
  }

  const FIELD_ERRORS = { street: 'Informe o endereço.', number: 'Informe o número.', district: 'Informe o bairro.' };

  function clearErrors() {
    Object.keys(FIELD_ERRORS).forEach((field) => setFieldError(field, ''));
  }

  function setFieldError(field, message) {
    const input = el.checkoutForm.elements[field];
    const error = $(`#err-${field}`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
    error.hidden = !message;
  }

  function validateCheckout() {
    clearErrors();
    if (state.customer.mode !== 'delivery') return true;
    const missing = Object.keys(FIELD_ERRORS).filter((field) => !state.customer[field]);
    missing.forEach((field) => setFieldError(field, FIELD_ERRORS[field]));
    if (missing.length) el.checkoutForm.elements[missing[0]].focus();
    return missing.length === 0;
  }

  function openCheckout() {
    if (state.cart.length === 0) return;
    fillCheckoutForm();
    openLayer('checkout');
  }

  function buildWhatsAppMessage() {
    const c = state.customer;
    const isDelivery = c.mode === 'delivery';
    const { subtotal, fee, total } = getTotals(c.mode);
    const lines = [`*Novo pedido — ${store.name}*`, ''];

    if (c.name) lines.push(`*Cliente:* ${c.name}`);
    lines.push(`*Modalidade:* ${isDelivery ? 'Entrega' : 'Retirada no estabelecimento'}`);
    if (isDelivery) {
      lines.push(`*Endereço:* ${c.street}, ${c.number} — ${c.district}${c.complement ? ` (${c.complement})` : ''}`);
    }

    lines.push('', '*Itens do pedido*');
    state.cart.forEach((item) => {
      const product = productById.get(item.id);
      const lineTotal = toCents(product.price) * item.qty;
      lines.push(`${item.qty}x ${product.name} — ${formatPrice(product.price)} cada = ${formatCents(lineTotal)}`);
      if (item.note) lines.push(`   Obs.: ${item.note}`);
    });

    if (state.generalNote.trim()) lines.push('', `*Observações gerais:* ${state.generalNote.trim()}`);

    lines.push('', `Subtotal: ${formatCents(subtotal)}`);
    if (isDelivery && fee > 0) lines.push(`Taxa de entrega: ${formatCents(fee)}`);
    lines.push(`*Total: ${formatCents(total)}*`);

    return lines.join('\n');
  }

  function sendToWhatsApp() {
    const url = `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    // Um link real clicado dentro do gesto do usuário evita bloqueio de pop-up (inclusive no mobile)
    const link = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener noreferrer' });
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    readCheckoutForm();
    if (!validateCheckout()) return;
    sendToWhatsApp();
    closeLayer({ restoreFocus: false });
    showToast('Abrindo o WhatsApp… confirme o envio por lá.');
  }

  /* =========================================================
     Toast
     ========================================================= */
  let toastTimer;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2600);
  }

  /* =========================================================
     Header discreto: some ao rolar para baixo, volta ao rolar para cima
     ========================================================= */
  function initHeaderBehavior() {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking || state.layer) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY + 6 && y > 140) document.body.classList.add('header-hidden');
        else if (y < lastY - 6 || y <= 140) document.body.classList.remove('header-hidden');
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* =========================================================
     Eventos
     ========================================================= */
  function bindEvents() {
    // Busca
    el.searchInput.addEventListener('input', (e) => setQuery(e.target.value));
    el.searchInput.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.searchInput.value) { e.stopPropagation(); clearSearch(); } });
    el.clearSearch.addEventListener('click', clearSearch);
    el.emptyClear.addEventListener('click', clearSearch);

    // Categorias
    el.categories.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-category]');
      if (chip) setCategory(chip.dataset.category);
    });

    // Lista de produtos
    el.grid.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const id = card.dataset.id;
      if (e.target.closest('[data-action="add"]')) {
        const button = e.target.closest('[data-action="add"]');
        if (addToCart(id)) flashAddButton(button);
        return;
      }
      openProductModal(id);
    });

    // Carrinho
    el.cartButton.addEventListener('click', () => openLayer('cart'));
    el.cartBar.addEventListener('click', () => openLayer('cart'));
    el.checkoutButton.addEventListener('click', openCheckout);
    el.generalNote.addEventListener('input', (e) => { state.generalNote = e.target.value; saveCart(); });
    el.cartList.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      const row = e.target.closest('.cart-item');
      if (!button || !row) return;
      const index = Number(row.dataset.index);
      if (button.dataset.action === 'inc') changeQty(index, 1);
      if (button.dataset.action === 'dec') changeQty(index, -1);
      if (button.dataset.action === 'remove') removeItem(index);
    });

    // Modal de produto
    el.productModal.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'modal-inc') setModalQty(getModalQty() + 1);
      if (action === 'modal-dec') setModalQty(getModalQty() - 1);
      if (action === 'modal-add') addFromModal();
    });
    el.productModal.addEventListener('input', (e) => { if (e.target.id === 'modalQty') updateModalTotal(); });
    el.productModal.addEventListener('change', (e) => { if (e.target.id === 'modalQty') setModalQty(getModalQty()); });

    // Finalização
    el.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    el.checkoutForm.addEventListener('input', (e) => {
      readCheckoutForm();
      if (FIELD_ERRORS[e.target.name]) setFieldError(e.target.name, '');
    });
    el.checkoutForm.addEventListener('change', (e) => {
      if (e.target.name === 'mode') { readCheckoutForm(); updateCheckoutMode(); }
    });
    el.checkoutForm.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="back-to-cart"]')) openLayer('cart');
    });

    // Fechar camadas: botão X / "Continuar comprando" / clique fora / Esc
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]') && state.layer) closeLayer();
    });
    el.backdrop.addEventListener('click', () => closeLayer());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.layer) closeLayer();
      trapFocus(e);
    });

    // Sincroniza o carrinho entre abas abertas
    window.addEventListener('storage', (e) => {
      if (e.key === `${storageKey}:cart`) { loadCart(); renderCart(); renderCartIndicators(); }
    });
  }

  function flashAddButton(button) {
    const label = $('span', button);
    button.classList.add('is-added');
    if (label) label.textContent = 'Adicionado';
    setTimeout(() => {
      button.classList.remove('is-added');
      if (label) label.textContent = 'Adicionar';
    }, 1100);
  }

  /* =========================================================
     Inicialização
     ========================================================= */
  function init() {
    loadCart();
    loadCustomer();

    renderStoreInfo();
    renderStatus();
    setInterval(renderStatus, 60_000);

    renderCategories();
    renderProducts({ animate: true });
    renderCart();
    renderCartIndicators();

    hydrateIcons();
    bindEvents();
    initHeaderBehavior();
  }

  init();
})();
