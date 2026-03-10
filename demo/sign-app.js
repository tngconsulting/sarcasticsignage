/* ===============================
   Config
   =============================== */

const PAGE_SIZE = 48;

/* ===============================
   Global State
   =============================== */

let allSigns = [];
let signsById = {};
let modelsById = {};

const appState = {
  view: "browse",     // "browse" | "viewer"
  list: [],
  index: null,
  filters: {
    model: "",
    color: "",
    q: "",
    page: 1
  }
};

const DATA_BASE = "../data";

/* ===============================
   Data Loading
   =============================== */

async function loadData() {
  try {
    const [signsRes, modelsRes] = await Promise.all([
      fetch(`${DATA_BASE}/signs.json`),
      fetch(`${DATA_BASE}/models/sign-models.json`)
    ]);

    if (!signsRes.ok) throw new Error("Failed to load signs.json");
    if (!modelsRes.ok) throw new Error("Failed to load sign-models.json");

    const signsRoot = await signsRes.json();
    modelsById = await modelsRes.json();

    if (!signsRoot.products) {
      throw new Error("signs.json missing products object");
    }

    allSigns = Object.entries(signsRoot.products).map(([id, sign]) => ({
      id,
      ...sign
    }));

    signsById = Object.fromEntries(allSigns.map(s => [s.id, s]));

    restoreFromURL();
    populateFilters();
    renderBrowse();
  } catch (err) {
    console.error("loadData failed:", err);
  }
}

/* ===============================
   SKU helper
   =============================== */

function formatSku(id) {
  return "S-" + String(id).padStart(3, "0");
}

/* ===============================
   Browse View
   =============================== */

function buildBrowseList() {
  let list = allSigns;

  const selectedModel = appState.filters.model || "";
  const selectedColor = appState.filters.color || "";

  if (selectedModel) {
    list = list.filter(s => (s.model_id || s.attributes?.model) === selectedModel);
  }

  if (selectedColor) {
    list = list.filter(s => {
      const c = s.attributes?.color || "";
      return c === selectedColor || c === "all";
    });
  }

  const q = (appState.filters.q || "").trim().toLowerCase();
  if (q) {
    list = list.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.caption?.toLowerCase().includes(q) ||
      s.tags?.some(tag => tag.toLowerCase().includes(q)) ||
      formatSku(s.id).toLowerCase().includes(q) ||
      String(s.id) === q
    );
  }

  return list;
}

function buildPageLabel() {
  const model = appState.filters.model;
  const color = appState.filters.color;
  if (model && color) {
    const mLabel = modelsById[model]?.display_name || model;
    const cLabel = color.charAt(0).toUpperCase() + color.slice(1);
    return `${mLabel} — ${cLabel}`;
  }
  if (model) return modelsById[model]?.display_name || model;
  if (color) return (color.charAt(0).toUpperCase() + color.slice(1)) + " Signs";
  return "Signs";
}

function updatePageMeta() {
  const label = buildPageLabel();
  const suffix = " — Sarcastic Signage";
  document.title = label + suffix;

  const h1 = document.querySelector(".gallery-title");
  if (h1) h1.textContent = label;

  const sub = document.querySelector(".gallery-subtitle");
  if (sub) {
    sub.textContent = (appState.filters.model || appState.filters.color || appState.filters.q)
      ? "Filtered view — use the controls above to browse or remove filters."
      : "Bold sayings on quality wood. Two sizes, framed or unframed — filter to find your perfect piece.";
  }
}

function renderBrowse() {
  const container = document.getElementById("thumbnails");
  const countEl   = document.getElementById("result-count");

  container.innerHTML = "";

  updatePageMeta();
  renderFilterTags();

  const all = buildBrowseList();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));

  // Clamp page
  if (appState.filters.page < 1) appState.filters.page = 1;
  if (appState.filters.page > totalPages) appState.filters.page = totalPages;

  const page  = appState.filters.page;
  const start = (page - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);

  if (countEl) {
    const end = Math.min(start + PAGE_SIZE, all.length);
    countEl.textContent = all.length === 0
      ? `No designs found`
      : `Showing ${start + 1}–${end} of ${all.length} designs`;
  }

  if (all.length === 0) {
    container.textContent = "No matching designs found.";
    renderPagination(all.length, page, totalPages);
    return;
  }

  const orderedIds = [];

  items.forEach(sign => {
    if (!sign.image || !sign.image.thumb) return;

    const index = orderedIds.length;
    orderedIds.push(sign.id);

    const wrapper = document.createElement("div");
    wrapper.className = "thumb-wrapper";

    const img = document.createElement("img");
    img.src = sign.image.thumb;
    img.loading = "lazy";
    img.className = "thumb";
    img.alt = sign.title || "";
    img.onclick = () => openViewer(orderedIds, index);

    const badge = document.createElement("div");
    badge.className = "thumb-id";
    badge.textContent = formatSku(sign.id);

    wrapper.appendChild(img);
    wrapper.appendChild(badge);
    container.appendChild(wrapper);
  });

  renderPagination(all.length, page, totalPages);

  appState.view = "browse";
  document.getElementById("viewer").style.display = "none";
}

/* ===============================
   Active Filter Tags
   =============================== */

function renderFilterTags() {
  let tagsEl = document.getElementById("active-filters");
  if (!tagsEl) {
    tagsEl = document.createElement("div");
    tagsEl.id = "active-filters";
    tagsEl.className = "active-filters";
    const controls = document.querySelector(".gallery-controls");
    if (controls) controls.after(tagsEl);
  }

  tagsEl.innerHTML = "";

  const tags = [];

  if (appState.filters.model) {
    const label = modelsById[appState.filters.model]?.display_name || appState.filters.model;
    tags.push({ label: "Type: " + label, clear: () => { appState.filters.model = ""; appState.filters.page = 1; updateModelOptions(); updateColorOptions(); pushURL(); renderBrowse(); } });
  }

  if (appState.filters.color) {
    tags.push({ label: "Colour: " + appState.filters.color, clear: () => { appState.filters.color = ""; appState.filters.page = 1; updateModelOptions(); updateColorOptions(); pushURL(); renderBrowse(); } });
  }

  if (appState.filters.q) {
    tags.push({ label: "Search: \u201c" + appState.filters.q + "\u201d", clear: () => { appState.filters.q = ""; appState.filters.page = 1; const si = document.getElementById("search"); if (si) si.value = ""; pushURL(); renderBrowse(); } });
  }

  if (tags.length === 0) {
    tagsEl.style.display = "none";
    return;
  }

  tagsEl.style.display = "flex";

  const label = document.createElement("span");
  label.className = "filter-tags-label";
  label.textContent = "Filters:";
  tagsEl.appendChild(label);

  tags.forEach(({ label, clear }) => {
    const chip = document.createElement("button");
    chip.className = "filter-tag";
    chip.innerHTML = `${label} <span aria-hidden="true">×</span>`;
    chip.addEventListener("click", clear);
    tagsEl.appendChild(chip);
  });

  if (tags.length > 1) {
    const clearAll = document.createElement("button");
    clearAll.className = "filter-tag filter-tag-clear-all";
    clearAll.textContent = "Clear all";
    clearAll.addEventListener("click", () => {
      appState.filters.model = "";
      appState.filters.color = "";
      appState.filters.q = "";
      appState.filters.page = 1;
      const si = document.getElementById("search");
      if (si) si.value = "";
      updateModelOptions();
      updateColorOptions();
      pushURL();
      renderBrowse();
    });
    tagsEl.appendChild(clearAll);
  }
}

/* ===============================
   Pagination
   =============================== */

function renderPagination(total, page, totalPages) {
  let pagerEl = document.getElementById("pagination");
  if (!pagerEl) {
    pagerEl = document.createElement("nav");
    pagerEl.id = "pagination";
    pagerEl.className = "pagination";
    pagerEl.setAttribute("aria-label", "Page navigation");
    const main = document.getElementById("thumbnails");
    main.after(pagerEl);
  }

  pagerEl.innerHTML = "";

  if (totalPages <= 1) return;

  function pageBtn(n, label, isCurrent) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (isCurrent ? " page-btn-current" : "");
    btn.textContent = label || n;
    if (isCurrent) {
      btn.setAttribute("aria-current", "page");
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => goToPage(n));
    }
    return btn;
  }

  function ellipsis() {
    const span = document.createElement("span");
    span.className = "page-ellipsis";
    span.textContent = "…";
    return span;
  }

  // Prev
  const prev = document.createElement("button");
  prev.className = "page-btn page-btn-prev";
  prev.textContent = "‹ Prev";
  prev.disabled = page === 1;
  if (page > 1) prev.addEventListener("click", () => goToPage(page - 1));
  pagerEl.appendChild(prev);

  // Page numbers: always show first, last, and window around current
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  pages.forEach(p => {
    if (p === "…") {
      pagerEl.appendChild(ellipsis());
    } else {
      pagerEl.appendChild(pageBtn(p, p, p === page));
    }
  });

  // Next
  const next = document.createElement("button");
  next.className = "page-btn page-btn-next";
  next.textContent = "Next ›";
  next.disabled = page === totalPages;
  if (page < totalPages) next.addEventListener("click", () => goToPage(page + 1));
  pagerEl.appendChild(next);
}

function goToPage(n) {
  appState.filters.page = n;
  pushURL();
  renderBrowse();
  // Scroll to top of gallery
  const hero = document.querySelector(".gallery-hero");
  if (hero) hero.scrollIntoView({ behavior: "smooth" });
}

/* ===============================
   URL Management
   =============================== */

function buildURLParams() {
  const p = new URLSearchParams();
  if (appState.filters.q)     p.set("q",     appState.filters.q);
  if (appState.filters.model) p.set("model", appState.filters.model);
  if (appState.filters.color) p.set("color", appState.filters.color);
  if (appState.filters.page > 1) p.set("page", appState.filters.page);
  return p;
}

function pushURL() {
  const p = buildURLParams();
  const qs = p.toString() ? "?" + p.toString() : location.pathname;
  history.pushState(null, "", qs || location.pathname);
}

function restoreFromURL() {
  const params = new URLSearchParams(window.location.search);

  appState.filters.q     = params.get("q")     || "";
  appState.filters.model = params.get("model") || "";
  appState.filters.color = params.get("color") || "";
  appState.filters.page  = parseInt(params.get("page"), 10) || 1;

  const searchInput = document.getElementById("search");
  if (searchInput) searchInput.value = appState.filters.q;

  // Check for direct product link
  const idParam = params.get("id");
  if (idParam !== null && signsById[idParam]) {
    // Open viewer after browse renders
    setTimeout(() => {
      const all = buildBrowseList();
      const idx = all.findIndex(s => s.id === idParam);
      if (idx !== -1) {
        openViewer(all.map(s => s.id), idx);
      } else {
        // Product exists but not in current filter — clear filters and open
        appState.filters.model = "";
        appState.filters.color = "";
        appState.filters.q = "";
        appState.filters.page = 1;
        updateModelOptions();
        updateColorOptions();
        renderBrowse();
        const allSigns2 = buildBrowseList();
        const idx2 = allSigns2.findIndex(s => s.id === idParam);
        if (idx2 !== -1) openViewer(allSigns2.map(s => s.id), idx2);
      }
    }, 0);
  }
}

window.addEventListener("popstate", () => {
  restoreFromURL();
  updateModelOptions();
  updateColorOptions();
  renderBrowse();
});

/* ===============================
   Viewer
   =============================== */

function openViewer(list, index) {
  appState.view = "viewer";
  appState.list = list;
  appState.index = index;

  document.getElementById("viewer").style.display = "flex";
  renderViewer();
}

function renderViewer() {
  const signId = appState.list[appState.index];
  const sign   = signsById[signId];

  if (!sign) {
    console.error("Viewer could not find sign:", signId);
    return;
  }

  const modelKey = sign.model_id || sign.attributes?.model;
  const model    = modelsById[modelKey];

  if (!model) {
    console.warn("Missing model:", modelKey, "for sign:", sign.id);
  }

  const price = model?.base_price_cad ?? model?.price_cad ?? null;

  const viewer = document.getElementById("viewer");

  viewer.querySelector(".image").src           = sign.image.master;
  viewer.querySelector(".image").alt           = sign.title || "";
  viewer.querySelector(".title").textContent   = sign.title || "";
  viewer.querySelector(".description").textContent = sign.description || "";
  viewer.querySelector(".caption").textContent = sign.caption ||
    "This original design is part of our Sarcastic Signage collection.";
  viewer.querySelector(".sku").textContent     = formatSku(sign.id);
  viewer.querySelector(".model").textContent   = model?.display_name || "Sign";
  viewer.querySelector(".price").textContent   = price ? `$${price.toFixed(2)} CAD` : "";

  viewer.querySelector(".features").innerHTML =
    (model?.feature_list || []).map(f => `<li>${f}</li>`).join("");

  window.SS_CURRENT_ITEM = {
    cartKey:     sign.id,
    id:          sign.id,
    title:       sign.title || "",
    model:       model?.display_name || modelKey || "",
    modelKey:    modelKey || "",
    color:       sign.attributes?.color || "",
    price:       price || 0,
    thumb:       sign.image.thumb,
    productType: "sign",
  };

  updateNavButtons();
}

function nextItem() {
  if (appState.index < appState.list.length - 1) {
    appState.index++;
    renderViewer();
  }
}

function prevItem() {
  if (appState.index > 0) {
    appState.index--;
    renderViewer();
  }
}

function updateNavButtons() {
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  prevBtn.style.visibility = appState.index === 0                          ? "hidden" : "visible";
  nextBtn.style.visibility = appState.index === appState.list.length - 1   ? "hidden" : "visible";
}

function closeViewer() {
  appState.view = "browse";
  document.getElementById("viewer").style.display = "none";
}

/* ===============================
   Filter Helpers
   =============================== */

function getFilteredSigns({ model = "", color = "" } = {}) {
  return allSigns.filter(s => {
    const sModel = s.model_id || s.attributes?.model;
    const sColor = s.attributes?.color || "";
    if (model && sModel !== model) return false;
    if (color && sColor !== color && sColor !== "all") return false;
    return true;
  });
}

function updateModelOptions() {
  const select = document.getElementById("model-filter");
  if (!select) return;
  const current      = appState.filters.model;
  const activeColor  = appState.filters.color;

  select.innerHTML = `<option value="">All sign types</option>`;

  const validModels = [...new Set(
    getFilteredSigns({ color: activeColor })
      .map(s => s.model_id || s.attributes?.model)
      .filter(Boolean)
  )].sort();

  validModels.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = modelsById[m]?.display_name || m;
    select.appendChild(opt);
  });

  if (validModels.length === 1) {
    appState.filters.model = validModels[0];
    select.value = validModels[0];
  } else if (current && validModels.includes(current)) {
    select.value = current;
  } else {
    appState.filters.model = "";
    select.value = "";
  }
}

function updateColorOptions() {
  const select = document.getElementById("color-filter");
  if (!select) return;
  const current      = appState.filters.color;
  const activeModel  = appState.filters.model;

  select.innerHTML = `<option value="">All colours</option>`;

  const validColors = [...new Set(
    getFilteredSigns({ model: activeModel })
      .map(s => s.attributes?.color)
      .filter(c => c && c !== "all")
  )].sort();

  validColors.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    select.appendChild(opt);
  });

  if (validColors.length === 1) {
    appState.filters.color = validColors[0];
    select.value = validColors[0];
  } else if (current && validColors.includes(current)) {
    select.value = current;
  } else {
    appState.filters.color = "";
    select.value = "";
  }
}

function populateFilters() {
  updateModelOptions();
  updateColorOptions();
}

/* ===============================
   Input Handling
   =============================== */

document.addEventListener("keydown", e => {
  if (appState.view !== "viewer") return;
  if (e.key === "ArrowRight") nextItem();
  if (e.key === "ArrowLeft")  prevItem();
  if (e.key === "Escape")     closeViewer();
});

const viewerEl = document.getElementById("viewer");
let startX = null;

if (viewerEl) {
  viewerEl.addEventListener("touchstart", e => (startX = e.touches[0].clientX), { passive: true });
  viewerEl.addEventListener("touchend", e => {
    if (startX === null) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (delta > 50)  prevItem();
    if (delta < -50) nextItem();
    startX = null;
  }, { passive: true });
}

document.getElementById("model-filter")?.addEventListener("change", e => {
  appState.filters.model = e.target.value || "";
  appState.filters.page  = 1;
  updateColorOptions();
  pushURL();
  renderBrowse();
});

document.getElementById("color-filter")?.addEventListener("change", e => {
  appState.filters.color = e.target.value || "";
  appState.filters.page  = 1;
  updateModelOptions();
  pushURL();
  renderBrowse();
});

const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    appState.filters.q    = e.target.value;
    appState.filters.page = 1;
    pushURL();
    renderBrowse();
  });
}

/* ===============================
   Button Wiring
   =============================== */

document.getElementById("next").onclick  = nextItem;
document.getElementById("prev").onclick  = prevItem;
document.querySelector(".close").onclick = closeViewer;

/* ===============================
   Start App
   =============================== */

loadData();
