/**
 * quantity-bundle.js
 * Web Component (sem shadow DOM) para seleção de kits/bundles.
 *
 * Quando o cliente seleciona um card:
 *  1. Atualiza visualmente o card selecionado
 *  2. Atualiza o input[name="id"] do product-form com o variant ID escolhido
 *  3. Atualiza a barra de resumo de preço
 *  4. Atualiza o texto de quantidade no heading
 *  5. Dispara evento customizado "quantity-bundle:change" para extensibilidade
 */

/**
 * Mapeamento de grupos Compre X Leve Y.
 * mains: variantes principais com o fator de brindes que cada uma gera.
 * bonus: variante do produto brinde.
 * Exposto via window.bxgyLinkedGroups para ser lido pelo cart-drawer.js.
 */
window.bxgyLinkedGroups = [
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

class QuantityBundle extends HTMLElement {
  connectedCallback() {
    this._cards = Array.from(this.querySelectorAll('.qb-card'));
    this._headingQty = this.querySelector('.qb-heading-qty');
    this._headingTreatment = this.querySelector('.treatment-month');
    this._summaryBadge = this.querySelector('.qb-summary-badge');
    this._summaryCompare = this.querySelector('.qb-summary-compare');
    this._summaryPrice = this.querySelector('.qb-summary-price');
    this._summaryUnit = this.querySelector('.qb-summary-unit');
    this._buyXGetY = this._parseBuyXGetY();
    this._currentBonusQty = 0;

    this._cards.forEach((card) => {
      card.addEventListener('click', () => this._select(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._select(card);
        }
      });
      card.setAttribute('role', 'radio');
      card.setAttribute('tabindex', '0');
    });

    // Seleciona o primeiro card disponível por padrão
    if (this._cards.length > 0) {
      this._select(this._cards[0], { silent: true });
    }

  }

  _select(card, { silent = false } = {}) {
    this._cards.forEach((c) => {
      c.classList.remove('is-selected');
      c.setAttribute('aria-checked', 'false');
    });

    card.classList.add('is-selected');
    card.setAttribute('aria-checked', 'true');

    const variantId = card.dataset.variantId;
    const price = parseInt(card.dataset.price, 10) || 0;
    const compare = parseInt(card.dataset.compare, 10) || 0;
    const installmentCount = parseInt(card.dataset.installmentCount, 10) || 1;
    const installmentLabel = card.dataset.installmentLabel || '';
    const qtyLabel = card.dataset.qtyLabel || '';
    const qtyTotal = card.dataset.qtyNumber || 0;

    // Track bonus qty para este card via linkedGroups
    if (this._buyXGetY) {
      const variantIdNum = parseInt(variantId, 10);
      const rule = this._buyXGetY.rules.find((r) => r.id === variantIdNum);
      this._currentBonusQty = rule ? rule.factor : 0;
    }

    // Heading
    if (this._headingQty) {
      this._headingQty.textContent = qtyLabel;
    }

    if (this._headingTreatment) {
      const treatmentMonth = card.dataset.treatmentMonth || '';
      this._headingTreatment.textContent = treatmentMonth ? `- ${treatmentMonth}` : '';
    }

    // Barra de resumo
    this._updateSummary(price, compare, parseInt(qtyTotal, 10) || 1);

    // Atualiza o form sem disparar eventos do produto (evita conflito com product-info.js)
    const formId = this.dataset.formId;
    const form = document.getElementById(formId);
    if (form) {
      const input = form.querySelector('input[name="id"]');
      if (input) input.value = variantId;
    }

    // Atualiza imagem principal da galeria
    this._updateGalleryImage(card);

    if (!silent) {
      this.dispatchEvent(
        new CustomEvent('quantity-bundle:change', {
          bubbles: true,
          detail: { variantId, price, compare, installmentCount, installmentLabel, qtyTotal  },
        })
      );
    }
  }

  _updateGalleryImage(card) {
    const newSrc = card.dataset.featuredImage;
    const newSrcset = card.dataset.featuredSrcset;
    if (!newSrc) return;

    const sectionId = this.dataset.sectionId;

    // ── Galeria principal ────────────────────────────────────────────────────
    const viewer = document.getElementById('GalleryViewer-' + sectionId);
    if (viewer) {
      const activeSlide = viewer.querySelector('.product__media-item.is-active');
      if (activeSlide) {
        const img = activeSlide.querySelector('.product__media img');
        if (img) {
          if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.src;
            img.dataset.originalSrcset = img.srcset || '';
          }
          img.src = newSrc;
          img.srcset = newSrcset || '';
        }
      }
    }

    // ── Modal de zoom ────────────────────────────────────────────────────────
    const modal = document.getElementById('ProductModal-' + sectionId);
    if (modal) {
      const modalImg = modal.querySelector('.product-media-modal__content img[data-media-id]');
      if (modalImg) {
        if (!modalImg.dataset.originalSrc) {
          modalImg.dataset.originalSrc = modalImg.src;
          modalImg.dataset.originalSrcset = modalImg.srcset || '';
        }
        modalImg.src = newSrc;
        modalImg.srcset = newSrcset || '';
      }
    }
  }

  _updateSummary(price, compare, qtyTotal = 1) {
    const fmt = (cents) => this._fmt(cents);

    // Badge de desconto
    if (compare > price && this._summaryBadge) {
      const pct = Math.round(((compare - price) / compare) * 100);
      this._summaryBadge.textContent = `${pct}% off`;
      this._summaryBadge.hidden = false;
    } else if (this._summaryBadge) {
      this._summaryBadge.hidden = true;
    }

    // Preço riscado (compare_at)
    if (this._summaryCompare) {
      if (compare > price) {
        this._summaryCompare.textContent = fmt(compare);
        this._summaryCompare.hidden = false;
      } else {
        this._summaryCompare.hidden = true;
      }
    }

    // Preço principal (com desconto PIX de 7%, arredondado pra cima no real inteiro)
    const pixPrice = Math.ceil(price * 0.93 / 100) * 100;
    if (this._summaryPrice) {
      this._summaryPrice.textContent = `${this._fmtPix(pixPrice)} no pix`;
    }

    // Preço por unidade — quando promo ativa divide pelo total com brinde, senão divide por qtyTotal
    if (this._summaryUnit) {
      const promoActive = this._buyXGetY && this._currentBonusQty > 0;
      const effectiveQty = promoActive ? qtyTotal + this._currentBonusQty : qtyTotal;
      this._summaryUnit.textContent = effectiveQty > 1
        ? `(${this._fmtPix(Math.ceil(pixPrice / effectiveQty))}/unidade)`
        : '';
    }
  }

  /**
   * Formata centavos em BRL.
   * Exemplo: 14900 → "R$ 149,00"
   */
  _fmt(cents) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(cents / 100);
  }

  /**
   * Formata centavos em BRL sem casas decimais (usado para preço PIX).
   * Exemplo: 59700 → "R$ 597"
   */
  _fmtPix(cents) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }
  _parseBuyXGetY() {
    if (this.dataset.buyXGetYEnabled !== 'true') return null;
    const cardIds = this._cards.map((c) => parseInt(c.dataset.variantId, 10));
    const group = (window.bxgyLinkedGroups || []).find((g) => g.mains.some((m) => cardIds.includes(m.id)));
    return group ? { bonusId: group.bonus, rules: group.mains } : null;
  }
}

if (!customElements.get('quantity-bundle')) {
  customElements.define('quantity-bundle', QuantityBundle);
}
