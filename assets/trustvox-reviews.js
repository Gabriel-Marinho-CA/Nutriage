let arrData = { items: [] };
let sortedItems = [];
let currentIndex = 0;
const REVIEWS_STEP = 4;

async function getReviewsDataReviews() {
  const elements = document.querySelectorAll('.trustvox-fetch');

  const fetchProductOpinions = async (productId) => {
    const endpoint = `http://trustvox.com.br/api/stores/123342/products/${productId}?opinions=true`;
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.trustvox.com; version=1',
          'Content-Type': 'application/json',
          Authorization: 'AuEUeedcE_TH24aqbx4z',
        },
      });
      if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
      const data = await res.json();
      return data.opinions || [];
    } catch (err) {
      console.warn('Erro ao buscar dados do Trustvox:', err);
      return [];
    }
  };

  const allResults = await Promise.all(
    Array.from(elements).map((el) => fetchProductOpinions(el.dataset.code))
  );
  const flattened = allResults.flat();

  if (flattened.length > 0) {
    updateReviewsHeader(flattened);
    arrData.items = flattened;
    sortedItems = [...arrData.items];
    currentIndex = 0;

    document.querySelector('#load-more-btn').addEventListener('click', renderNextBatch);
    renderNextBatch();
  } else {
    document.querySelector('#load-more-reviews').classList.add('hidden');
    document.querySelector('#reviews-sec').classList.add('hidden');
    const fallback = document.querySelector('#reviews-sec-2 .ts-product-reviews');
    if (fallback) fallback.style.display = 'block';
    console.log('Nenhuma avaliação encontrada.');
  }
}

function updateReviewsHeader(data) {
  const rates = data.map(({ rate }) => rate);
  const average = calculateAverageRating(rates);
  const total = rates.length;
  const { percentage, strokeDashoffset, numericPercentage } = calculatePositiveReviewStats(rates);

  document.querySelector('.custom-rating-note--js').textContent = average + ' ';
  document.querySelector('.custom-based-on--js').textContent = total + ' ';
  document.querySelector('.custom-percentage--js-reviews').textContent = percentage;
  document.querySelector('.custom--circle-percentage--js').style.strokeDashoffset = `${strokeDashoffset}px`;
  document.querySelector('.custom-star-bg--js').style.width = `${numericPercentage}%`;
}

function calculateAverageRating(rates) {
  if (!rates.length) return '0.0';
  const total = rates.reduce((acc, r) => acc + r, 0);
  return (total / rates.length).toFixed(1);
}

function calculatePositiveReviewStats(rates) {
  if (!rates.length) return { percentage: '0%', numericPercentage: 0, strokeDashoffset: 176 };
  const avg = rates.reduce((acc, r) => acc + r, 0) / rates.length;
  const pct = (avg / 5) * 100;
  return {
    percentage: `${pct.toFixed(0)}%`,
    numericPercentage: parseFloat(pct.toFixed(1)),
    strokeDashoffset: parseFloat((176 - (pct / 100) * 176).toFixed(2)),
  };
}

function generateStars(rate) {
  const filled = `<img src="https://cdn.shopify.com/s/files/1/0911/4694/4831/files/star-solid.svg?v=1747428918" width="20" height="20" alt="estrela cheia">`;
  const empty = `<img src="https://cdn.shopify.com/s/files/1/0911/4694/4831/files/star-empty.svg?v=1747429027" width="20" height="20" alt="estrela vazia">`;
  return filled.repeat(rate) + empty.repeat(5 - rate);
}

function generateRecommendation(recommends) {
  if (recommends === 'yes') {
    return `
      <i class="material-icons ts-recommendation-icon" style="font-size:20px">sentiment_very_satisfied</i>
      <p class="text-sm text-[#6c6c6c] dark:text-white">Sim, eu recomendo este produto</p>`;
  }
  if (recommends === 'no') {
    return `
      <i class="material-icons ts-recommendation-icon" style="font-size:20px">sentiment_very_dissatisfied</i>
      <p class="text-sm text-[#6c6c6c] dark:text-white">Não, eu não recomendo este produto</p>`;
  }
  return '';
}

function renderReviews(reviews) {
  const container = document.querySelector('#reviews-container');
  reviews.forEach((review) => {
    const fullName = `${review.client.first_name || ''} ${review.client.last_name || ''}`
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join(' ');
    const date = new Date(review.created_at).toLocaleDateString('pt-BR');

    container.insertAdjacentHTML(
      'beforeend',
      `<div class="flex items-center py-8 justify-between gap-5 md:flex-col-reverse border-b border-[#e5e7eb]">
        <div class="flex-1 max-w-[160px] md:flex md:gap-4 md:mr-auto">
          <p class="text-sm text-[#6c6c6c] text-center font-bold dark:text-white">${fullName}</p>
          <p class="text-sm text-[#6c6c6c] text-center dark:text-white">${date}</p>
        </div>
        <div class="flex-1 md:w-full">
          <div class="flex gap-0.5">${generateStars(review.rate)}</div>
          ${review.title ? `<p class="text-[#6c6c6c] mt-3 font-bold dark:text-white">${review.title}</p>` : ''}
          <p class="text-[#6c6c6c] mt-3 dark:text-white">${review.text || 'Cliente não escreveu uma avaliação, apenas deu a nota do produto.'}</p>
          <div class="flex justify-between md:flex-col">
            <div class="flex items-center gap-1 my-4">${generateRecommendation(review.recommends)}</div>
            <div class="flex items-center gap-4 md:justify-start">
              <span class="text-sm text-[#6c6c6c] dark:text-white">Esta avaliação foi útil?</span>
              <button class="ts-thumb-up flex items-center gap-1 text-[#6c6c6c] dark:text-white">
                <i class="material-icons text-lg">thumb_up</i>
                <span class="text-sm">0</span>
              </button>
            </div>
          </div>
        </div>
      </div>`
    );
  });
}

function filterReviews(filterType) {
  if (!arrData.items.length) return;

  sortedItems = [...arrData.items];

  switch (filterType) {
    case 'positive':  sortedItems.sort((a, b) => b.rate - a.rate); break;
    case 'negative':  sortedItems.sort((a, b) => a.rate - b.rate); break;
    case 'worth':     sortedItems.sort((a, b) => b.upvotes_count - a.upvotes_count); break;
    case 'most-recent':
    default:          sortedItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  currentIndex = 0;
  document.querySelector('#reviews-container').innerHTML = '';
  document.querySelector('#load-more-reviews').classList.remove('hidden');
  renderNextBatch();
}

function renderNextBatch() {
  const loadMoreEl = document.querySelector('#load-more-reviews');
  renderReviews(sortedItems.slice(currentIndex, currentIndex + REVIEWS_STEP));
  currentIndex += REVIEWS_STEP;
  loadMoreEl.classList.toggle('hidden', currentIndex >= sortedItems.length);
}
