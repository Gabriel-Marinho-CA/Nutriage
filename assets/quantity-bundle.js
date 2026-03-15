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

class QuantityBundle extends HTMLElement {
  connectedCallback() {
    this._cards = Array.from(this.querySelectorAll('.qb-card'));
    this._headingQty = this.querySelector('.qb-heading-qty');
    this._summaryBadge = this.querySelector('.qb-summary-badge');
    this._summaryCompare = this.querySelector('.qb-summary-compare');
    this._summaryPrice = this.querySelector('.qb-summary-price');
    this._summaryUnit = this.querySelector('.qb-summary-unit');

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
    const qtyTotal = card.dataset.qtyNumber || null;

    // Heading
    if (this._headingQty) {
      this._headingQty.textContent = qtyLabel;
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

    if (!silent) {
      this.dispatchEvent(
        new CustomEvent('quantity-bundle:change', {
          bubbles: true,
          detail: { variantId, price, compare, installmentCount, installmentLabel, qtyTotal  },
        })
      );
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

    // Preço principal
    if (this._summaryPrice) {
      this._summaryPrice.textContent = fmt(price);
    }
    if (this._summaryUnit) {
      const unitPrice = Math.round(price / qtyTotal);
      this._summaryUnit.textContent = `(${this._fmt(unitPrice)}/unidade)`;
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
}

if (!customElements.get('quantity-bundle')) {
  customElements.define('quantity-bundle', QuantityBundle);
}
