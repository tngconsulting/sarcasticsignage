/* ===============================
   Config
   =============================== */

const PAGE_SIZE = 48;

/* ===============================
   Global State
   =============================== */

let allTotes = [];
let totesById = {};
let modelsById = {};

const appState = {
  view: "browse",     // "browse" | "viewer"
  list: [],
  index: null,
  filters: {
    model: null,
    color: null,
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
    const [totesRes, modelsRes] = await Promise.all([
      fetch(`${DATA_BASE}/totes.json`),
      fetch(`${DATA_BASE}/models/tote-models.json`)
    ]);

    if (!totesRes.ok) throw new Error("Failed to load totes.json");
    if (!modelsRes.ok) throw new Error("Failed to load tote-models.json");

    const totesRoot = await totesRes.json();
    modelsById = await modelsRes.json();

    if (!totesRoot.products) {
      throw new Error("totes.json missing products object");
    }

    allTotes = Object.entries(totesRoot.products).map(([id, tote]) => ({
      id,
      ...tote
    }));

    totesById = Object.fromEntries(allTotes.map(t => [t.id, t]));

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
  return "T-" + String(id).padStart(3, "0");
}

/* ===============================
   Browse View
   =============================== */

function buildBrowseList() {
  let list = allTotes;

  if (appState.filters.model) {
    list = list.filter(t =>
      (t.model_id || t.attributes?.model) === appState.filters.model
    );
  }

  if (appState.filters.color) {
    list = list.filter(t =>
      t.attributes?.color === appState.filters.color
    );
  }

  const q = (appState.filters.q || "").trim().toLowerCase();
  if (q) {
    list = list.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.caption?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q)) ||
      formatSku(t.id).toLowerCase().includes(q) ||
      String(t.id) === q
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
    return `${mLabel} \u2014 ${cLabel}`;
  }
  if (model) return modelsById[model]?.display_name || model;
  if (color) return (color.charAt(0).toUpperCase() + color.slice(1)) + " Tote Bags";
  return "Tote Bags";
}

function updatePageMeta() {
  const label = buildPageLabel();
  document.title = label + " \u2014 Sarcastic Signage";

  const h1 = document.querySelector(".gallery-title");
  if (h1) h1.textContent = label;

  const sub = document.querySelector(".gallery-subtitle");
  if (sub) {
    sub.textContent = (appState.filters.model || appState.filters.color || appState.filters.q)
      ? "Filtered view \u2014 use the controls above to browse or remove filters."
      : "200+ designs across five canvas colours. Filter by bag type or colour, or browse the full collection.";
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

  items.forEach(tote => {
    if (!tote.image || !tote.image.thumb) return;

    const index = orderedIds.length;
    orderedIds.push(tote.id);

    const wrapper = document.createElement("div");
    wrapper.className = "thumb-wrapper";

    const img = document.createElement("img");
    img.src = tote.image.thumb;
    img.loading = "lazy";
    img.className = "thumb";
    img.alt = tote.title || "";
    img.onclick = () => openViewer(orderedIds, index);

    const badge = document.createElement("div");
    badge.className = "thumb-id";
    badge.textContent = formatSku(tote.id);

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
    tags.push({ label: "Type: " + label, clear: () => { appState.filters.model = null; appState.filters.page = 1; updateModelOptions(); updateColorOptions(); pushURL(); renderBrowse(); } });
  }

  if (appState.filters.color) {
    tags.push({ label: "Colour: " + appState.filters.color, clear: () => { appState.filters.color = null; appState.filters.page = 1; updateModelOptions(); updateColorOptions(); pushURL(); renderBrowse(); } });
  }

  if (appState.filters.q) {
    tags.push({ label: "Search: \u201c" + appState.filters.q + "\u201d", clear: () => { appState.filters.q = ""; appState.filters.page = 1; const si = document.getElementById("search"); if (si) si.value = ""; pushURL(); renderBrowse(); } });
  }

  if (tags.length === 0) {
    tagsEl.style.display = "none";
    return;
  }

  tagsEl.style.display = "flex";

  const labelEl = document.createElement("span");
  labelEl.className = "filter-tags-label";
  labelEl.textContent = "Filters:";
  tagsEl.appendChild(labelEl);

  tags.forEach(({ label, clear }) => {
    const chip = document.createElement("button");
    chip.className = "filter-tag";
    chip.innerHTML = `${label} <span aria-hidden="true">\u00d7</span>`;
    chip.addEventListener("click", clear);
    tagsEl.appendChild(chip);
  });

  if (tags.length > 1) {
    const clearAll = document.createElement("button");
    clearAll.className = "filter-tag filter-tag-clear-all";
    clearAll.textContent = "Clear all";
    clearAll.addEventListener("click", () => {
      appState.filters.model = null;
      appState.filters.color = null;
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
    span.textContent = "\u2026";
    return span;
  }

  const prev = document.createElement("button");
  prev.className = "page-btn page-btn-prev";
  prev.textContent = "\u2039 Prev";
  prev.disabled = page === 1;
  if (page > 1) prev.addEventListener("click", () => goToPage(page - 1));
  pagerEl.appendChild(prev);

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

  const next = document.createElement("button");
  next.className = "page-btn page-btn-next";
  next.textContent = "Next \u203a";
  next.disabled = page === totalPages;
  if (page < totalPages) next.addEventListener("click", () => goToPage(page + 1));
  pagerEl.appendChild(next);
}

function goToPage(n) {
  appState.filters.page = n;
  pushURL();
  renderBrowse();
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
  appState.filters.model = params.get("model") || null;
  appState.filters.color = params.get("color") || null;
  appState.filters.page  = parseInt(params.get("page"), 10) || 1;

  const searchInput = document.getElementById("search");
  if (searchInput) searchInput.value = appState.filters.q;

  // Check for direct product link
  const idParam = params.get("id");
  if (idParam !== null && totesById[idParam]) {
    setTimeout(() => {
      const all = buildBrowseList();
      const idx = all.findIndex(t => t.id === idParam);
      if (idx !== -1) {
        openViewer(all.map(t => t.id), idx);
      } else {
        appState.filters.model = null;
        appState.filters.color = null;
        appState.filters.q = "";
        appState.filters.page = 1;
        updateModelOptions();
        updateColorOptions();
        renderBrowse();
        const all2 = buildBrowseList();
        const idx2 = all2.findIndex(t => t.id === idParam);
        if (idx2 !== -1) openViewer(all2.map(t => t.id), idx2);
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
  const toteId = appState.list[appState.index];
  const tote   = totesById[toteId];

  if (!tote) {
    console.error("Viewer could not find tote:", toteId);
    return;
  }

  const modelKey = tote.model_id || tote.attributes?.model;
  const model    = modelsById[modelKey];

  if (!model) {
    console.warn("Missing model:", modelKey, "for tote:", tote.id);
  }

  const price = model?.base_price_cad ?? model?.price_cad ?? null;

  const viewer = document.getElementById("viewer");

  viewer.querySelector(".image").src           = tote.image.master;
  viewer.querySelector(".image").alt           = tote.title || "";
  viewer.querySelector(".title").textContent   = tote.title || "";
  viewer.querySelector(".description").textContent = tote.description || "";
  viewer.querySelector(".caption").textContent = tote.caption ||
    "This original design is part of our Sarcastic Signage collection.";
  viewer.querySelector(".sku").textContent     = formatSku(tote.id);
  viewer.querySelector(".model").textContent   = model?.display_name || "Canvas Tote";
  viewer.querySelector(".price").textContent   = price ? `$${price.toFixed(2)} CAD` : "";

  viewer.querySelector(".features").innerHTML =
    (model?.feature_list || []).map(f => `<li>${f}</li>`).join("");

  window.SS_CURRENT_ITEM = {
    cartKey:     tote.id,
    id:          tote.id,
    title:       tote.title || "",
    model:       model?.display_name || modelKey || "",
    modelKey:    modelKey || "",
    color:       tote.attributes?.color || "",
    price:       price || 0,
    thumb:       tote.image.thumb,
    productType: "tote",
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

  prevBtn.style.visibility = appState.index === 0                         ? "hidden" : "visible";
  nextBtn.style.visibility = appState.index === appState.list.length - 1  ? "hidden" : "visible";
}

function closeViewer() {
  appState.view = "browse";
  document.getElementById("viewer").style.display = "none";
}

/* ===============================
   Filter Helpers
   =============================== */

function getFilteredTotes({ model = null, color = null } = {}) {
  return allTotes.filter(t => {
    const tModel = t.model_id || t.attributes?.model;
    const tColor = t.attributes?.color;
    if (model && tModel !== model) return false;
    if (color && tColor !== color) return false;
    return true;
  });
}

function updateModelOptions() {
  const select = document.getElementById("filter-model");
  if (!select) return;
  const current     = appState.filters.model;
  const activeColor = appState.filters.color;

  select.innerHTML = `<option value="">All bag types</option>`;

  const validModels = [...new Set(
    getFilteredTotes({ color: activeColor })
      .map(t => t.model_id || t.attributes?.model)
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
    appState.filters.model = null;
    select.value = "";
  }
}

function updateColorOptions() {
  const select = document.getElementById("filter-color");
  if (!select) return;
  const current      = appState.filters.color;
  const activeModel  = appState.filters.model;

  select.innerHTML = `<option value="">All colours</option>`;

  const validColors = [...new Set(
    getFilteredTotes({ model: activeModel })
      .map(t => t.attributes?.color)
      .filter(Boolean)
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
    appState.filters.color = null;
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

document.getElementById("filter-model")?.addEventListener("change", e => {
  appState.filters.model = e.target.value || null;
  appState.filters.page  = 1;
  updateColorOptions();
  pushURL();
  renderBrowse();
});

document.getElementById("filter-color")?.addEventListener("change", e => {
  appState.filters.color = e.target.value || null;
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
