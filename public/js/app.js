const state = {
    category: 'All',
    mode: 'Any',
    location: '',
    query: '',
    maxPrice: '',
    minRating: '',
    sort: 'recommended',
    visibleCount: 4,
    stylists: []
};

const grid = document.querySelector('#stylist-grid');
const resultsCount = document.querySelector('#results-count');
const emptyState = document.querySelector('#empty-state');
const loadMoreButton = document.querySelector('#load-more');
const bookingModal = document.querySelector('#booking-modal');
const bookingForm = document.querySelector('#booking-form');
const bookingError = document.querySelector('#booking-error');
const locationInput = document.querySelector('.location-input');
const toast = document.createElement('div');
toast.className = 'toast';
toast.setAttribute('role', 'status');
toast.setAttribute('aria-live', 'polite');
document.body.append(toast);
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3600);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function buildQuery() {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
        if (['category', 'mode', 'query', 'location', 'maxPrice', 'minRating', 'sort'].includes(key) && value && value !== 'All' && value !== 'Any' && value !== 'recommended') {
            const param = key === 'maxPrice' ? 'maxPrice' : key;
            params.set(param, value);
        }
    });
    if (state.location) params.set('location', state.location);
    return params.toString();
}

async function loadStylists() {
    resultsCount.textContent = 'Finding your people…';
    const response = await fetch(`/api/stylists?${buildQuery()}`);
    if (!response.ok) throw new Error('We couldn’t load the stylists. Please refresh and try again.');
    const { stylists } = await response.json();
    state.stylists = stylists;
    renderStylists();
}

function cardMarkup(stylist) {
    const specialties = stylist.specialties.map((item) => `<span class="specialty-pill">${escapeHtml(item)}</span>`).join('');
    const services = stylist.services.map((service) => `<span>${escapeHtml(service.name)} · $${service.price}</span>`).join('');
    const verification = stylist.category === 'Hair' && stylist.licenseVerified
        ? '<span class="verified-label">✓ State license verified</span>'
        : '';
    return `<article class="stylist-card" data-stylist="${escapeHtml(stylist.id)}">
        <div class="card-photo-wrap">
            <img class="card-photo" src="${escapeHtml(stylist.image)}" alt="${escapeHtml(stylist.name)}’s ${escapeHtml(stylist.category.toLowerCase())} work" loading="lazy">
            <span class="card-tag">${escapeHtml(stylist.category)}${verification ? ' · Licensed' : ''}</span>
            <button class="card-save" type="button" aria-label="Save ${escapeHtml(stylist.name)}" aria-pressed="false">♡</button>
        </div>
        <div class="card-info">
            <div class="card-title-row"><h3 class="card-name">${escapeHtml(stylist.name)}</h3><span class="card-price">$${stylist.price} <small>/ session</small></span></div>
            <p class="card-title">${escapeHtml(stylist.title)}</p>
            <div class="card-meta"><span class="card-rating"><span>★</span> ${Number(stylist.rating).toFixed(2)} <span class="reviews-count">(${stylist.reviews})</span></span><span class="card-meta-divider"></span><span>${escapeHtml(stylist.location)}</span></div>
            <div class="card-specialties">${specialties}</div>
            <div class="card-details" hidden><p>${escapeHtml(stylist.bio)}</p><div class="detail-services">${services}</div><p class="detail-format">${escapeHtml(stylist.modes.join(' · '))}${verification ? ' · State license verified' : ''}</p></div>
            <div class="card-actions"><button class="card-book" type="button" data-stylist="${escapeHtml(stylist.id)}">Book a session <span>↗</span></button><button class="card-view" type="button" aria-expanded="false">View profile</button></div>
        </div>
    </article>`;
}

function renderStylists() {
    const visible = state.stylists.slice(0, state.visibleCount);
    grid.innerHTML = visible.map(cardMarkup).join('');
    const total = state.stylists.length;
    resultsCount.textContent = `${total} ${total === 1 ? 'good person' : 'good people'} to meet`;
    emptyState.hidden = total !== 0;
    grid.hidden = total === 0;
    loadMoreButton.hidden = total <= visible.length;
}

function resetAndSearch() {
    state.visibleCount = 4;
    loadStylists().catch((error) => {
        resultsCount.textContent = 'We couldn’t find your people.';
        showToast(error.message);
    });
}

function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function openBooking(stylistId) {
    const stylist = state.stylists.find((item) => item.id === stylistId);
    if (!stylist) return;

    bookingError.textContent = '';
    bookingForm.reset();
    bookingForm.elements.stylistId.value = stylist.id;
    document.querySelector('#booking-stylist').textContent = `A little time with ${stylist.name}, starting at $${stylist.price}.`;
    bookingForm.elements.serviceName.innerHTML = stylist.services.map((service) =>
        `<option value="${escapeHtml(service.name)}">${escapeHtml(service.name)} — $${service.price} / ${service.duration} min</option>`
    ).join('');

    const today = new Date();
    const minimumDate = toLocalDateString(today);
    const dateInput = bookingForm.elements.date;
    dateInput.min = minimumDate;
    const nextAvailable = new Date(today);
    for (let day = 0; day < 14 && !stylist.availability.includes(nextAvailable.getDay()); day += 1) {
        nextAvailable.setDate(nextAvailable.getDate() + 1);
    }
    dateInput.value = toLocalDateString(nextAvailable);

    const modeLabels = [...bookingForm.querySelectorAll('.mode-options label')];
    modeLabels.forEach((label) => {
        const radio = label.querySelector('input');
        label.hidden = !stylist.modes.includes(radio.value);
        radio.checked = radio.value === (stylist.modes.includes('In person') ? 'In person' : 'Video');
    });
    updateLocationInput();
    bookingModal.showModal();
}

function updateLocationInput() {
    const mode = bookingForm.querySelector('input[name="mode"]:checked')?.value;
    locationInput.hidden = mode !== 'In person';
    bookingForm.elements.location.required = mode === 'In person';
}

document.querySelector('#search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = document.querySelector('#search-query').value.trim();
    state.location = document.querySelector('#search-location').value.trim();
    document.querySelector('#discover').scrollIntoView({ behavior: 'smooth' });
    resetAndSearch();
});

document.querySelectorAll('.category-chip').forEach((button) => {
    button.addEventListener('click', () => {
        document.querySelector('.category-chip.selected')?.classList.remove('selected');
        button.classList.add('selected');
        state.category = button.dataset.category;
        resetAndSearch();
    });
});

document.querySelector('#mode-filter').addEventListener('change', (event) => {
    state.mode = event.target.value;
    resetAndSearch();
});
document.querySelector('#price-filter').addEventListener('change', (event) => {
    state.sort = event.target.value;
    resetAndSearch();
});
document.querySelector('#max-price-filter').addEventListener('change', (event) => {
    state.maxPrice = event.target.value;
    resetAndSearch();
});
document.querySelector('#rating-filter').addEventListener('change', (event) => {
    state.minRating = event.target.value;
    resetAndSearch();
});

document.querySelector('#clear-filters').addEventListener('click', () => {
    state.category = 'All';
    state.mode = 'Any';
    state.location = '';
    state.query = '';
    state.maxPrice = '';
    state.minRating = '';
    state.sort = 'recommended';
    document.querySelector('#search-query').value = '';
    document.querySelector('#search-location').value = '';
    document.querySelector('#mode-filter').value = 'Any';
    document.querySelector('#price-filter').value = 'recommended';
    document.querySelector('#max-price-filter').value = '';
    document.querySelector('#rating-filter').value = '';
    document.querySelector('.category-chip.selected')?.classList.remove('selected');
    document.querySelector('[data-category="All"]').classList.add('selected');
    resetAndSearch();
});
document.querySelector('#empty-reset').addEventListener('click', () => document.querySelector('#clear-filters').click());
loadMoreButton.addEventListener('click', () => {
    state.visibleCount += 3;
    renderStylists();
});
document.querySelector('#mobile-menu').addEventListener('click', () => {
    document.querySelector('.main-nav').classList.toggle('open');
});

grid.addEventListener('click', (event) => {
    const saveButton = event.target.closest('.card-save');
    if (saveButton) {
        const isSaved = saveButton.getAttribute('aria-pressed') !== 'true';
        saveButton.setAttribute('aria-pressed', String(isSaved));
        saveButton.classList.toggle('saved', isSaved);
        saveButton.textContent = isSaved ? '♥' : '♡';
        showToast(isSaved ? 'Stylist saved to your favorites.' : 'Stylist removed from your favorites.');
        return;
    }
    const bookButton = event.target.closest('.card-book');
    if (bookButton) {
        openBooking(bookButton.dataset.stylist);
        return;
    }
    const viewButton = event.target.closest('.card-view');
    if (viewButton) {
        const details = viewButton.closest('.stylist-card').querySelector('.card-details');
        const expanded = viewButton.getAttribute('aria-expanded') === 'true';
        viewButton.setAttribute('aria-expanded', String(!expanded));
        viewButton.textContent = expanded ? 'View profile' : 'Close profile';
        details.hidden = expanded;
        if (!expanded && details.dataset.loaded !== 'true') {
            const stylist = state.stylists.find((item) => item.id === viewButton.closest('.stylist-card').dataset.stylist);
            if (stylist) {
                details.dataset.loaded = 'true';
                loadProfileDetails(stylist, details);
            }
        }
    }
});

async function loadProfileDetails(stylist, details) {
    try {
        const response = await fetch(`/api/stylists/${encodeURIComponent(stylist.id)}`);
        if (!response.ok) throw new Error('This profile could not be loaded.');
        const { reviews } = await response.json();
        const reviewsMarkup = reviews.length
            ? `<div class="profile-reviews">${reviews.map((review) => `<blockquote><span>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span><p>${escapeHtml(review.comment)}</p></blockquote>`).join('')}</div>`
            : '<p class="review-empty">No reviews yet. Be the first to share the love after your session.</p>';
        details.insertAdjacentHTML('beforeend', reviewsMarkup);
    } catch (error) {
        details.insertAdjacentHTML('beforeend', `<p class="review-empty">${escapeHtml(error.message)}</p>`);
    }
}

bookingForm.querySelectorAll('input[name="mode"]').forEach((radio) => radio.addEventListener('change', updateLocationInput));
document.querySelector('.modal-close').addEventListener('click', () => bookingModal.close());
bookingModal.addEventListener('click', (event) => {
    if (event.target === bookingModal) bookingModal.close();
});

bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    bookingError.textContent = '';
    const submitButton = bookingForm.querySelector('.modal-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Requesting…';

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());
    let historySaved = true;
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'We couldn’t request that time.');
        try {
            const savedBookings = JSON.parse(localStorage.getItem('dapper-bookings') || '[]');
            savedBookings.push({
                id: result.booking.id,
                stylistName: result.booking.stylistName,
                serviceName: result.booking.serviceName,
                date: result.booking.date,
                time: result.booking.time,
                mode: result.booking.mode,
                location: result.booking.location,
                price: result.booking.price
            });
            localStorage.setItem('dapper-bookings', JSON.stringify(savedBookings));
        } catch {
            historySaved = false;
        }
        bookingModal.close();
        document.querySelector('#booking-confirmation').textContent =
            `${result.booking.stylistName} · ${result.booking.serviceName} · ${new Date(`${result.booking.date}T${result.booking.time}`).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}. We’ll be in touch at ${result.booking.clientEmail}.`;
        if (!historySaved) {
            successModal.addEventListener('close', () => showToast('Booking confirmed, but your browser could not save a local booking history.'), { once: true });
        }
        document.querySelector('#success-modal').showModal();
    } catch (error) {
        bookingError.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Request this time <span>↗</span>';
    }
});

const successModal = document.querySelector('#success-modal');
successModal.querySelector('.modal-close').addEventListener('click', () => successModal.close());
successModal.addEventListener('click', (event) => {
    if (event.target === successModal) successModal.close();
});
document.querySelector('#success-done').addEventListener('click', () => successModal.close());

document.querySelector('#my-bookings').addEventListener('click', async () => {
    try {
        const bookings = JSON.parse(localStorage.getItem('dapper-bookings') || '[]');
        if (!bookings.length) {
            showToast('No bookings just yet. Your next good thing is out there.');
            return;
        }
        document.querySelector('#bookings-list').innerHTML = bookings.map((booking) => {
            const appointmentTime = new Date(`${booking.date}T${booking.time}`);
            const completed = appointmentTime < new Date();
            return `<article class="booking-item"><div><strong>${escapeHtml(booking.stylistName)}</strong><span>${escapeHtml(booking.serviceName)} · ${appointmentTime.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span><small>${escapeHtml(booking.mode)}${booking.location ? ` · ${escapeHtml(booking.location)}` : ''} · $${booking.price}</small></div>${completed ? `<button class="review-booking" type="button" data-booking="${escapeHtml(booking.id)}">Leave a review ↗</button>` : '<span class="booking-status">Requested</span>'}</article>`;
        }).join('');
        document.querySelector('#bookings-modal').showModal();
    } catch {
        showToast('Your bookings could not be loaded. Please try again.');
    }
});

document.querySelector('#bookings-list').addEventListener('click', (event) => {
    const button = event.target.closest('.review-booking');
    if (!button) return;
    const reviewForm = document.querySelector('#review-form');
    reviewForm.elements.bookingId.value = button.dataset.booking;
    reviewForm.hidden = false;
    reviewForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.querySelector('#review-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.rating = Number(payload.rating);
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Your review could not be submitted.');
        form.reset();
        form.hidden = true;
        document.querySelector('#bookings-modal').close();
        showToast('Thanks for sharing the love. Your review is live.');
        resetAndSearch();
    } catch (error) {
        document.querySelector('#review-error').textContent = error.message;
    }
});
document.querySelector('#bookings-close').addEventListener('click', () => document.querySelector('#bookings-modal').close());

loadStylists().catch((error) => {
    resultsCount.textContent = 'We couldn’t find your people.';
    showToast(error.message);
});
