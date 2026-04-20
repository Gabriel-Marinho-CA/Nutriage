// Grupos Compre X Leve Y — definidos aqui para estar disponível em todas as páginas
window.bxgyLinkedGroups = window.bxgyLinkedGroups || [
  // CÚRCUMA LIPOSSOMAL
  { mains: [{ id: 51482708181311, factor: 2 }, { id: 51482708148543, factor: 1 }], bonus: 51668670087487 },
  // VMAX
  { mains: [{ id: 49952062308671, factor: 2 }, { id: 49952062079295, factor: 1 }], bonus: 51310042186047 },
  // ThermoCaps
  { mains: [{ id: 49925916754239, factor: 2 }, { id: 49925916950847, factor: 1 }], bonus: 50888322515263 },
  // CREATINA
  { mains: [{ id: 49952080396607, factor: 2 }, { id: 49952080363839, factor: 1 }], bonus: 51668669792575 },
  // POWER MEN
  { mains: [{ id: 49952060932415, factor: 2 }, { id: 49952060834111, factor: 1 }], bonus: 51668670480703 },
  // ÔMEGA 3 FOCUS
  { mains: [{ id: 49952059359551, factor: 2 }, { id: 49952058835263, factor: 1 }], bonus: 51668670120255 },
  // ÔMEGA 3 PREVENT
  { mains: [{ id: 49952057491775, factor: 2 }, { id: 49952057229631, factor: 1 }], bonus: 51668670185791 },
  // MELATONINA
  { mains: [{ id: 49925922259263, factor: 2 }, { id: 49925922029887, factor: 1 }], bonus: 51174591988031 },
  // MAGNESIUM 3 ULTRA
  { mains: [{ id: 49925921734975, factor: 2 }, { id: 49925921374527, factor: 1 }], bonus: 51588511695167 },
  // COMPLEXO B OTIMIZADO
  { mains: [{ id: 49925920194879, factor: 2 }, { id: 49925919736127, factor: 1 }], bonus: 51668669727039 },
  // COENZIMA Q10 PLUS
  { mains: [{ id: 49925917442367, factor: 2 }, { id: 49925917409599, factor: 1 }], bonus: 51668669595967 },
  // ARTRO PLUS
  { mains: [{ id: 49925917114687, factor: 2 }, { id: 49925917016383, factor: 1 }], bonus: 51668669563199 },
  // VITAMINA D3+K2
  { mains: [{ id: 49952073351487, factor: 2 }, { id: 49952073122111, factor: 1 }], bonus: 51241734340927 },
  // Multivitamínico AaZinco
  { mains: [{ id: 50003382731071, factor: 2 }, { id: 50003382698303, factor: 1 }], bonus: 51292515434815 },
  // VITAMINA D3 GOTAS
  { mains: [{ id: 50087558250815, factor: 2 }, { id: 50087558054207, factor: 1 }], bonus: 51310040056127 },
  // VITAMINA C COM ZINCO
  { mains: [{ id: 49952078987583, factor: 2 }, { id: 49952078790975, factor: 1 }], bonus: 51310040449343 },
  // NEURO FOX
  { mains: [{ id: 49952063979839, factor: 2 }, { id: 49952063947071, factor: 1 }], bonus: 51310041170239 },
  // HAIR MAX 5
  { mains: [{ id: 49952077250879, factor: 2 }, { id: 49952077185343, factor: 1 }], bonus: 51310041727295 },
];

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

// ── Compre X Leve Y ───────────────────────────────────────────────────────────
// Escuta o cartUpdate do product-form e adiciona o brinde correspondente.
// Após adicionar, publica cartUpdate para que o CartDrawerItems atualize o drawer.
subscribe(PUB_SUB_EVENTS.cartUpdate, async (event) => {
  if (event.source !== 'product-form') return;
  if (!window.buyXGetYEnabled) { console.log('[bxgy] desabilitado'); return; }

  const addedId = parseInt(event.productVariantId, 10);

  const groups = window.bxgyLinkedGroups || [];

  const group = groups.find((g) => g.mains.some((m) => m.id === addedId));
  if (!group) return;

  const cartItems = await fetch('/cart.js').then((r) => r.json()).then((c) => c.items || []);

  let expectedBonusQty = 0;
  for (const main of group.mains) {
    const mainQty = cartItems.find((i) => i.variant_id === main.id)?.quantity || 0;
    expectedBonusQty += window.bxgyIsCumulative
      ? main.factor * mainQty
      : (mainQty > 0 ? main.factor : 0);
  }

  const currentBonusQty = cartItems.find((i) => i.variant_id === group.bonus)?.quantity || 0;
  const delta = expectedBonusQty - currentBonusQty;
  if (delta <= 0) return;

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: group.bonus, quantity: delta }] }),
    });
    const json = await res.json();
    publish(PUB_SUB_EVENTS.cartUpdate, { source: 'buy-x-get-y' });
  } catch (e) {
    console.error('[bxgy] Erro ao adicionar brinde:', e);
  }
});

// Ajusta/remove brindes quando qty de produto principal é alterada ou removida do carrinho.
// Escaneia todos os grupos pois remoções via botão não passam variantId no evento.
subscribe(PUB_SUB_EVENTS.cartUpdate, async (event) => {
  if (event.source !== 'cart-items') return;
  if (!window.buyXGetYEnabled) return;

  const cartItems = event.cartData?.items || [];
  const groups = window.bxgyLinkedGroups || [];
  let changed = false;

  for (const group of groups) {
    // Soma contribuição de todos os mains do grupo presentes no carrinho
    let expectedBonusQty = 0;
    for (const main of group.mains) {
      const mainQty = cartItems.find((i) => i.variant_id === main.id)?.quantity || 0;
      expectedBonusQty += window.bxgyIsCumulative
        ? main.factor * mainQty
        : (mainQty > 0 ? main.factor : 0);
    }

    const bonusItem = cartItems.find((i) => i.variant_id === group.bonus);
    const currentBonusQty = bonusItem?.quantity || 0;
    if (expectedBonusQty === currentBonusQty) continue;

    try {
      if (bonusItem) {
        // Usa o item key (variantId:hash) que o /cart/change.js requer
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bonusItem.key, quantity: expectedBonusQty }),
        });
      } else if (expectedBonusQty > 0) {
        // Brinde não está no carrinho ainda — adiciona
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: group.bonus, quantity: expectedBonusQty }] }),
        });
      }
      changed = true;
    } catch (e) {
      console.error('[bxgy] Erro ao ajustar brinde:', e);
    }
  }

  if (!changed) return;

  // Atualiza drawer + bubble + is-empty explicitamente.
  // onCartUpdate() não atualiza o bubble nem cobre o estado vazio do drawer.
  try {
    const [drawerText, bubbleText, cartJson] = await Promise.all([
      fetch(`${routes.cart_url}?section_id=cart-drawer`).then((r) => r.text()),
      fetch(`${routes.cart_url}?section_id=cart-icon-bubble`).then((r) => r.text()),
      fetch('/cart.js').then((r) => r.json()),
    ]);

    // Substitui o conteúdo de #CartDrawer (cobre estado vazio e não-vazio)
    const drawerDoc = new DOMParser().parseFromString(drawerText, 'text/html');
    const cartDrawerContent = document.querySelector('#CartDrawer');
    const newCartDrawerContent = drawerDoc.querySelector('#CartDrawer');
    if (cartDrawerContent && newCartDrawerContent) {
      cartDrawerContent.innerHTML = newCartDrawerContent.innerHTML;
      // Re-attach overlay listener perdido após innerHTML replace
      const overlay = cartDrawerContent.querySelector('#CartDrawer-Overlay');
      const cartDrawerEl = document.querySelector('cart-drawer');
      if (overlay && cartDrawerEl) overlay.addEventListener('click', cartDrawerEl.close.bind(cartDrawerEl));
    }

    // Sincroniza classe is-empty no <cart-drawer>
    const cartDrawerEl = document.querySelector('cart-drawer');
    if (cartDrawerEl) cartDrawerEl.classList.toggle('is-empty', cartJson.item_count === 0);

    // Atualiza contador no header
    const bubble = document.getElementById('cart-icon-bubble');
    const newBubble = new DOMParser().parseFromString(bubbleText, 'text/html').querySelector('.shopify-section');
    if (bubble && newBubble) bubble.innerHTML = newBubble.innerHTML;
  } catch (e) {
    console.error('[bxgy] Erro ao atualizar drawer:', e);
  }
});

// Ao carregar a página, remove brindes órfãos (cujo produto principal não está no carrinho).
// Cobre o caso onde o produto principal é removido fora do drawer (ex: refresh, navegação).
document.addEventListener('DOMContentLoaded', async () => {
  if (!window.buyXGetYEnabled) return;

  try {
    const cart = await fetch('/cart.js').then((r) => r.json());
    const cartItems = cart.items || [];
    const groups = window.bxgyLinkedGroups || [];

    for (const group of groups) {
      let expectedBonusQty = 0;
      for (const main of group.mains) {
        const mainQty = cartItems.find((i) => i.variant_id === main.id)?.quantity || 0;
        expectedBonusQty += window.bxgyIsCumulative
          ? main.factor * mainQty
          : (mainQty > 0 ? main.factor : 0);
      }

      const bonusItem = cartItems.find((i) => i.variant_id === group.bonus);
      const currentBonusQty = bonusItem?.quantity || 0;

      if (bonusItem && expectedBonusQty !== currentBonusQty) {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bonusItem.key, quantity: expectedBonusQty }),
        });
      }
    }
  } catch (e) {
    console.error('[bxgy] Erro ao validar brindes no carregamento:', e);
  }
});

class OrderBumpSlider extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initSwiper();
  }

  initSwiper() {
    const swiperEl = this.querySelector('.order-bump__swiper');

    if (!swiperEl) return;

    this.swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 12,
      loop: false,

      navigation: {
        nextEl: this.querySelector('.order-bump__next'),
        prevEl: this.querySelector('.order-bump__prev'),
      },

      breakpoints: {
        750: {
          slidesPerView: 1
        }
      }
    });
  }
}

customElements.define('order-bump-slider', OrderBumpSlider);