/* ============================================================
   SARCASTIC SIGNAGE — script.js
   Shared across all pages. No frameworks. Vanilla JS.
   ============================================================ */

'use strict';

/* ── Events Data ── */
const EVENTS_2026 = [
  {
    name: "Russel Flea Market",
    date: "2026-03-06",
    day: "Friday",
    timeStart: "9:00 AM",
    timeEnd: "3:00 PM",
    location: "Russel",
    url: "https://www.russellflea.ca/",
    ics: "assets/calendars/russel-flea-march6.ics"
  },
  {
    name: "Carleton University Market",
    date: "2026-03-27",
    day: "Friday",
    timeStart: "9:00 AM",
    timeEnd: "3:00 PM",
    location: "Ottawa",
    url: null,
    ics: "assets/calendars/carleton-university-market.ics"
  },
  {
    name: "Russel Flea Market",
    date: "2026-03-29",
    day: "Sunday",
    timeStart: "9:00 AM",
    timeEnd: "3:00 PM",
    location: "Russel",
    url: "https://www.russellflea.ca/",
    ics: "assets/calendars/russel-flea-march29.ics"
  },
  {
    name: "Christmas Night Market (Kiwans Farms)",
    date: "2026-11-28",
    day: "Saturday",
    timeStart: "4:00 PM",
    timeEnd: "9:00 PM",
    location: "Kiwans Farms",
    url: null,
    ics: "assets/calendars/christmas-night-market.ics"
  },
  {
    name: "Kars CRA Christmas Market",
    date: "2026-11-29",
    day: "Sunday",
    timeStart: "10:00 AM",
    timeEnd: "3:00 PM",
    location: "Kars Community Recreation Center",
    url: null,
    ics: "assets/calendars/kars-cra-christmas.ics"
  },
  {
    name: "Kars Community Recreation Center Event",
    date: "2026-12-13",
    day: "Sunday",
    timeStart: "10:00 AM",
    timeEnd: "3:00 PM",
    location: "Gloucester",
    url: null,
    ics: "assets/calendars/kars-rec-center.ics"
  },
  {
    name: "Gloucester Holiday Night Market",
    date: "2026-12-18",
    day: "Friday",
    timeStart: "4:00 PM",
    timeEnd: "8:00 PM",
    location: "Gloucester",
    url: null,
    ics: "assets/calendars/gloucester-holiday.ics"
  }
];

/* ── Utility: Parse event date string to Date at midnight local ── */
function parseEventDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ── Utility: Format date for display ── */
function formatEventDate(event) {
  const d = parseEventDate(event.date);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-CA', options);
}

/* ── Google Calendar Link Generator ── */
function buildGoogleCalLink(event) {
  // Date strings in YYYYMMDDTHHMMSS format (local, no Z suffix for all-day-ish events)
  function toGCal(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-');
    // Parse timeStr like "9:00 AM", "4:00 PM"
    const [timePart, ampm] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const pad = n => String(n).padStart(2, '0');
    return `${y}${m}${pad(d)}T${pad(hours)}${pad(minutes)}00`;
  }

  const start = toGCal(event.date, event.timeStart);
  const end   = toGCal(event.date, event.timeEnd);

  const text     = encodeURIComponent(`Sarcastic Signage at ${event.name}`);
  const details  = encodeURIComponent(`Come find Sarcastic Signage! Handmade signs, totes & gifts with zero filter. Signs that say what you're thinking. 📍 ${event.location}`);
  const location = encodeURIComponent(`${event.location}, ON, Canada`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/* ── Next Stop Banner ── */
function initNextStopBanner() {
  const bannerEl = document.getElementById('banner-text');
  if (!bannerEl) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the next upcoming event
  const upcoming = EVENTS_2026
    .filter(e => parseEventDate(e.date) >= today)
    .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

  if (upcoming.length === 0) {
    bannerEl.closest('.next-stop-banner').style.display = 'none';
    return;
  }

  const next = upcoming[0];
  const dateDisplay = formatEventDate(next);

  let html = `📍 Next Stop: <strong>${next.name}</strong> — ${next.day}, ${dateDisplay}, ${next.timeStart}–${next.timeEnd} in ${next.location}`;

  if (next.ics) {
    html += `&nbsp;&nbsp;<a href="${next.ics}" download aria-label="Download calendar file for ${next.name}">→ Add to Calendar</a>`;
  }

  bannerEl.innerHTML = html;
}

/* ── Active Nav Detection ── */
function initActiveNav() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop() || 'index.html';

  document.querySelectorAll('.primary-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop() || 'index.html';

    if (linkFile === filename ||
        (filename === '' && linkFile === 'index.html') ||
        (filename === 'index.html' && linkFile === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ── Mobile Hamburger Menu ── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-nav-close');

  if (!hamburger || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileClose && mobileClose.focus();
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileClose && mobileClose.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close when a nav link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      // Small delay to allow navigation
      setTimeout(closeMenu, 100);
    });
  });
}

/* ── Calendar Dropdowns ── */
function initCalDropdowns() {
  document.querySelectorAll('.cal-dropdown').forEach(wrapper => {
    const btn = wrapper.querySelector('.cal-dropdown-btn');
    const menu = wrapper.querySelector('.cal-dropdown-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('is-open');
      // Close all others
      document.querySelectorAll('.cal-dropdown-menu.is-open').forEach(m => {
        m.classList.remove('is-open');
        m.previousElementSibling && m.previousElementSibling.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        menu.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.cal-dropdown-menu.is-open').forEach(m => {
      m.classList.remove('is-open');
      const btn = m.previousElementSibling;
      btn && btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Shop: Category Filter + Search ── */
function initShopFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  const noResults = document.getElementById('no-results');

  if (!filterBtns.length && !productCards.length) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    productCards.forEach(card => {
      const cat = card.dataset.category || '';
      const name = (card.dataset.name || card.querySelector('.product-name')?.textContent || '').toLowerCase();
      const categoryMatch = activeCategory === 'all' || cat === activeCategory;
      const searchMatch = searchQuery === '' || name.includes(searchQuery) || cat.includes(searchQuery);

      if (categoryMatch && searchMatch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.category === 'adults-only') return; // handled by link
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  // Shop search form on shop page
  const shopSearchInput = document.getElementById('shop-search-input');
  const shopSearchForm = document.getElementById('shop-search-form');

  if (shopSearchInput && shopSearchForm) {
    // Read ?q= from URL
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam) {
      shopSearchInput.value = qParam;
      searchQuery = qParam.toLowerCase().trim();
      applyFilters();
    }

    shopSearchForm.addEventListener('submit', e => {
      e.preventDefault();
      searchQuery = shopSearchInput.value.toLowerCase().trim();
      // Update URL without reload
      const newUrl = new URL(window.location.href);
      if (searchQuery) {
        newUrl.searchParams.set('q', shopSearchInput.value.trim());
      } else {
        newUrl.searchParams.delete('q');
      }
      window.history.replaceState({}, '', newUrl.toString());
      applyFilters();
    });

    // Live filter as user types
    shopSearchInput.addEventListener('input', () => {
      searchQuery = shopSearchInput.value.toLowerCase().trim();
      applyFilters();
    });
  }
}

/* ── Header Search: Submit to shop.html ── */
function initHeaderSearch() {
  document.querySelectorAll('.header-search-form, .mobile-nav-search').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="search"], input[type="text"]');
      if (!input) return;
      const q = input.value.trim();
      if (q) {
        // Resolve relative path to shop.html from current page
        const shopUrl = new URL('shop.html', window.location.href);
        shopUrl.searchParams.set('q', q);
        window.location.href = shopUrl.toString();
      }
    });
  });
}

/* ── Age Gate (adults-only.html) ── */
function initAgeGate() {
  const overlay = document.getElementById('age-gate-overlay');
  if (!overlay) return;

  // Check sessionStorage
  if (sessionStorage.getItem('ageVerified') === 'true') {
    overlay.classList.add('hidden');
    return;
  }

  overlay.classList.remove('hidden');

  const yesBtn = document.getElementById('age-gate-yes');
  const noBtn  = document.getElementById('age-gate-no');

  yesBtn && yesBtn.addEventListener('click', () => {
    sessionStorage.setItem('ageVerified', 'true');
    overlay.classList.add('hidden');
    // Focus main content
    const main = document.querySelector('main');
    if (main) main.focus();
  });

  noBtn && noBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Trap focus inside modal
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const focusable = overlay.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Focus yes button initially
  yesBtn && yesBtn.focus();
}

/* ── Smooth Scroll for anchor links ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 68;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
        // Move focus to target
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
}

/* ── Events Page: Build Event Cards ── */
function initEventsPage() {
  const upcomingContainer = document.getElementById('upcoming-events-grid');
  const pastContainer     = document.getElementById('past-events-grid');

  if (!upcomingContainer) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = [];
  const past     = [];

  EVENTS_2026.forEach(event => {
    const d = parseEventDate(event.date);
    if (d >= today) upcoming.push(event);
    else past.push(event);
  });

  upcoming.forEach(event => {
    upcomingContainer.appendChild(buildEventCard(event, false));
  });

  if (pastContainer) {
    past.reverse().forEach(event => {
      pastContainer.appendChild(buildEventCard(event, true));
    });

    // Show/hide past section
    const pastSection = document.getElementById('past-events-section');
    if (pastSection) {
      pastSection.style.display = past.length > 0 ? 'block' : 'none';
    }
  }

  initCalDropdowns();
}

function buildEventCard(event, isPast) {
  const card = document.createElement('article');
  card.className = 'event-card' + (isPast ? ' is-past' : '');

  const dateDisplay = formatEventDate(event);
  const gcalLink    = buildGoogleCalLink(event);

  let externalLink = '';
  if (event.url) {
    externalLink = `<a href="${event.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-ghost" style="background:transparent;border-color:var(--clr-grey-light);color:var(--clr-grey-dark);">
      🌐 Event Website
    </a>`;
  }

  card.innerHTML = `
    <div class="event-card-accent" aria-hidden="true"></div>
    <div class="event-card-body">
      <div class="event-date-badge">
        <span aria-hidden="true">📅</span>
        <span>${event.day}, ${dateDisplay}</span>
        ${isPast ? '<span class="past-badge">Past</span>' : ''}
      </div>
      <h3 class="event-name">${event.name}</h3>
      <div class="event-meta">
        <span><span aria-hidden="true">🕐</span> ${event.timeStart} – ${event.timeEnd}</span>
        <span><span aria-hidden="true">📍</span> ${event.location}, ON</span>
      </div>
    </div>
    <div class="event-card-footer">
      ${externalLink}
      <div class="cal-dropdown">
        <button class="cal-dropdown-btn" aria-haspopup="true" aria-expanded="false" aria-label="Add ${event.name} to calendar">
          <span aria-hidden="true">🗓</span> Add to Calendar
        </button>
        <div class="cal-dropdown-menu" role="menu">
          <a href="${gcalLink}" target="_blank" rel="noopener noreferrer" role="menuitem">
            <span aria-hidden="true">📅</span> Google Calendar
          </a>
          <a href="${event.ics}" download role="menuitem">
            <span aria-hidden="true">⬇️</span> Download .ics
          </a>
        </div>
      </div>
    </div>
  `;

  return card;
}

/* ── Homepage: Render upcoming events preview ── */
function initHomepageEvents() {
  const container = document.getElementById('homepage-events-grid');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = EVENTS_2026
    .filter(e => parseEventDate(e.date) >= today)
    .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) {
    container.innerHTML = `<p style="color:var(--clr-grey-mid);font-style:italic;">No upcoming events scheduled. Follow us on Facebook for updates!</p>`;
    return;
  }

  upcoming.forEach(event => {
    container.appendChild(buildEventCard(event, false));
  });

  initCalDropdowns();
}

/* ── Shared Components: Header & Footer (DRY — single source of truth) ──
   Each HTML page has a <div id="page-header-mount"> and
   <div id="page-footer-mount"> placeholder. This function injects the
   full HTML so header/footer are maintained in exactly ONE place.        */
function renderSharedComponents() {
  const ICON_SEARCH_SM = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  const ICON_SEARCH_MD = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  const ICON_FB        = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;

  const headerMount = document.getElementById('page-header-mount');
  if (headerMount) {
    headerMount.outerHTML = `
      <a class="skip-link" href="#main-content">Skip to main content</a>

      <div class="next-stop-banner" role="banner" aria-label="Next event announcement">
        <span id="banner-text">Loading next event&hellip;</span>
      </div>

      <header class="site-header" role="banner">
        <div class="container header-inner">
          <a href="index.html" class="site-logo" aria-label="Sarcastic Signage — Home">
            <span class="logo-sarcastic">Sarcastic</span>
            <span class="logo-signage">Signage</span>
          </a>
          <nav class="primary-nav" aria-label="Primary navigation">
            <a href="index.html">Home</a>
            <a href="shop.html">Shop</a>
            <a href="about.html">About</a>
            <a href="events.html">Events</a>
            <a href="contact.html">Contact</a>
            <a href="adults-only.html" class="nav-adults">18+</a>
          </nav>
          <div class="header-search" aria-label="Site search">
            <form class="header-search-form" role="search" action="shop.html" method="get">
              <label for="header-search-input" class="sr-only">Search products</label>
              <input type="search" id="header-search-input" name="q" class="header-search-input" placeholder="Search products&hellip;" autocomplete="off">
              <button type="submit" class="header-search-btn" aria-label="Submit search">${ICON_SEARCH_SM}</button>
            </form>
          </div>
          <button id="hamburger-btn" class="hamburger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">
        <button id="mobile-nav-close" class="mobile-nav-close" aria-label="Close navigation menu">&times;</button>
        <a href="index.html">Home</a>
        <a href="shop.html">Shop</a>
        <a href="about.html">About</a>
        <a href="events.html">Events</a>
        <a href="contact.html">Contact</a>
        <a href="adults-only.html" class="nav-adults">18+ Adults Only</a>
        <form class="mobile-nav-search" role="search" action="shop.html" method="get">
          <label for="mobile-search-input" class="sr-only">Search products</label>
          <input type="search" id="mobile-search-input" name="q" placeholder="Search products&hellip;" autocomplete="off">
          <button type="submit" aria-label="Search">${ICON_SEARCH_MD}</button>
        </form>
      </nav>
    `;
  }

  const footerMount = document.getElementById('page-footer-mount');
  if (footerMount) {
    footerMount.outerHTML = `
      <footer class="site-footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="site-logo" aria-label="Sarcastic Signage Home">
                <span class="logo-sarcastic">Sarcastic</span>
                <span class="logo-signage">Signage</span>
              </a>
              <p>Bold, blunt, unapologetically honest goods for people who say what everyone else is thinking. Handmade in Ontario. Never inspirational. Always relatable.</p>
              <div class="footer-social">
                <a href="https://www.facebook.com/sarcastic.signage" target="_blank" rel="noopener noreferrer" aria-label="Sarcastic Signage on Facebook">${ICON_FB}</a>
              </div>
            </div>
            <div class="footer-col">
              <h3>Shop</h3>
              <ul>
                <li><a href="shop.html">All Products</a></li>
                <li><a href="shop.html?q=signs">Signs</a></li>
                <li><a href="shop.html?q=tote">Tote Bags</a></li>
                <li><a href="shop.html?q=pouches">Pouches</a></li>
                <li><a href="shop.html?q=apparel">Apparel</a></li>
                <li><a href="adults-only.html">18+ Adults Only</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h3>Info</h3>
              <ul>
                <li><a href="about.html">About Patricia</a></li>
                <li><a href="events.html">Events</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="contact.html#how-to-order">How to Order</a></li>
                <li><a href="contact.html#shipping">Shipping Info</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h3>Contact</h3>
              <p>
                <a href="tel:613-700-6677" style="color:rgba(255,255,255,0.65);">613-700-6677</a><br>
                <a href="mailto:patriciapkcjs@hotmail.com" style="color:rgba(255,255,255,0.65);word-break:break-all;">patriciapkcjs@hotmail.com</a>
              </p>
              <p style="margin-top:var(--sp-md);">Ontario, Canada<br>Local pickup &amp; Canada-wide shipping</p>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} Sarcastic Signage. All rights reserved.</span>
            <span>Handmade in Ontario &bull; Zero filter &bull; Always relatable</span>
          </div>
        </div>
      </footer>
    `;
  }
}

/* ── Init: Run everything on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  renderSharedComponents(); // MUST run first — injects header & footer HTML
  initNextStopBanner();
  initActiveNav();
  initMobileMenu();
  initHeaderSearch();
  initSmoothScroll();
  initShopFilters();
  initAgeGate();
  initEventsPage();
  initHomepageEvents();
});
