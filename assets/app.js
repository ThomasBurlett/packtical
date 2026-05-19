import { CHECKLISTS, CHECKLIST_MAP } from "./data.js";

const FILTERS = [
  { value: "all", label: "Show all" },
  { value: "unchecked", label: "Unchecked only" },
  { value: "core", label: "Core only" },
  { value: "optional", label: "Optional only" },
  { value: "custom", label: "Custom only" },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStorageKey(slug) {
  return `adventure-checklist:v2:${slug}`;
}

function cloneSections(sections) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map(([id, label, kind, note = ""]) => ({
      id,
      label,
      kind,
      note,
      source: "base",
    })),
  }));
}

function loadState(slug, sections) {
  const fallback = {
    checkedIds: [],
    collapsedSections: [],
    customItems: {},
  };

  try {
    const parsed = JSON.parse(localStorage.getItem(getStorageKey(slug)) || "null");
    if (!parsed || typeof parsed !== "object") return fallback;

    const customItems = {};
    for (const section of sections) {
      const sectionItems = parsed.customItems?.[section.id];
      if (!Array.isArray(sectionItems)) continue;

      customItems[section.id] = sectionItems
        .filter((item) => item && typeof item.label === "string" && item.label.trim())
        .map((item) => ({
          id: item.id,
          label: item.label.trim(),
          kind: "custom",
          note: "",
          source: "custom",
        }));
    }

    return {
      checkedIds: Array.isArray(parsed.checkedIds) ? parsed.checkedIds : [],
      collapsedSections: Array.isArray(parsed.collapsedSections)
        ? parsed.collapsedSections
        : [],
      customItems,
    };
  } catch {
    return fallback;
  }
}

function saveState(slug, state) {
  localStorage.setItem(
    getStorageKey(slug),
    JSON.stringify({
      checkedIds: [...state.checkedIds],
      collapsedSections: [...state.collapsedSections],
      customItems: state.customItems,
    }),
  );
}

function buildSectionMarkup(section, state) {
  const items = [...section.items, ...(state.customItems[section.id] || [])];
  const isCollapsed = state.collapsedSections.has(section.id);

  return `
    <section class="list-section ${isCollapsed ? "collapsed" : ""}" data-section-id="${section.id}">
      <button class="section-header" type="button" data-toggle-section="${section.id}">
        <span class="section-heading">
          <span class="chevron">${isCollapsed ? "&#9656;" : "&#9662;"}</span>
          <span>
            <strong>${escapeHtml(section.title)}</strong>
          </span>
        </span>
        <span class="section-count" data-section-count="${section.id}"></span>
      </button>
      <div class="section-tools">
        <button type="button" class="mini-btn" data-select-section="${section.id}">Select all</button>
        <button type="button" class="mini-btn" data-clear-section="${section.id}">Clear</button>
        <button type="button" class="mini-btn" data-toggle-add="${section.id}">Add item</button>
      </div>
      <form class="add-item-form hidden" data-add-form="${section.id}">
        <input
          type="text"
          name="label"
          placeholder="Add your own item to ${escapeHtml(section.title)}"
          aria-label="Add custom item"
        />
        <button type="submit">Save</button>
      </form>
      <div class="items" data-items="${section.id}">
        ${items
          .map((item) => {
            const checked = state.checkedIds.has(item.id);
            return `
              <label
                class="item-card ${checked ? "checked" : ""}"
                data-item-id="${item.id}"
                data-section-id="${section.id}"
                data-kind="${item.kind}"
              >
                <input type="checkbox" ${checked ? "checked" : ""} />
                <span class="item-body">
                  <span class="item-label">${escapeHtml(item.label)}</span>
                  ${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}
                </span>
                <span class="item-meta">
                  <span class="tag ${item.kind}">${
                    item.kind === "core"
                      ? "Core"
                      : item.kind === "optional"
                        ? "Optional"
                        : "Custom"
                  }</span>
                  ${
                    item.source === "custom"
                      ? `<button class="icon-btn" type="button" data-delete-item="${item.id}" aria-label="Delete item">&times;</button>`
                      : ""
                  }
                </span>
              </label>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderApp(list) {
  const root = document.getElementById("app");
  const sections = cloneSections(list.sections);
  const stored = loadState(list.slug, sections);
  const state = {
    checkedIds: new Set(stored.checkedIds),
    collapsedSections: new Set(stored.collapsedSections),
    customItems: stored.customItems,
    filter: "all",
    sections,
  };

  const navHtml = CHECKLISTS.map(
    (item) => `
      <a class="activity-pill ${item.slug === list.slug ? "active" : ""}" href="../${item.slug}/">
        ${escapeHtml(item.shortLabel)}
      </a>
    `,
  ).join("");

  root.innerHTML = `
    <header class="page-shell page-header">
      <a class="home-link" href="../">Adventure Checklist Hub</a>
      <p class="eyebrow">REI-inspired checklist</p>
      <h1>${escapeHtml(list.label)}</h1>
      <p class="page-subtitle">${escapeHtml(list.subtitle)}</p>
      <nav class="activity-nav" aria-label="Activities">
        ${navHtml}
      </nav>
    </header>

    <div class="sticky-bar">
      <div class="page-shell sticky-inner">
        <div class="progress-panel">
          <div class="progress-track"><div id="progress-fill"></div></div>
          <div class="progress-copy" id="progress-copy"></div>
        </div>
        <div class="toolbar">
          <label class="select-wrap">
            <span class="sr-only">Filter items</span>
            <select id="filter-select">
              ${FILTERS.map(
                (filter) =>
                  `<option value="${filter.value}">${escapeHtml(filter.label)}</option>`,
              ).join("")}
            </select>
          </label>
          <button type="button" id="toggle-all">Collapse all</button>
          <button type="button" id="reset-all">Reset checks</button>
        </div>
      </div>
    </div>

    <main class="page-shell page-main">
      <section class="summary-grid">
        <article class="summary-card">
          <strong>How it works</strong>
          <span>Check items as you pack. Progress saves only for this activity.</span>
        </article>
        <article class="summary-card">
          <strong>Make it yours</strong>
          <span>Add section-specific custom items without disturbing the base list order.</span>
        </article>
        <article class="summary-card">
          <strong>Source</strong>
          <span>Adapted from <a href="${list.sourceUrl}" target="_blank" rel="noreferrer">${escapeHtml(
            list.sourceLabel,
          )}</a>.</span>
        </article>
      </section>

      <div class="sections-wrap" id="sections-wrap">
        ${sections.map((section) => buildSectionMarkup(section, state)).join("")}
      </div>
    </main>
  `;

  const sectionsWrap = document.getElementById("sections-wrap");
  const progressFill = document.getElementById("progress-fill");
  const progressCopy = document.getElementById("progress-copy");
  const filterSelect = document.getElementById("filter-select");
  const toggleAllButton = document.getElementById("toggle-all");
  const resetAllButton = document.getElementById("reset-all");

  function persist() {
    saveState(list.slug, {
      checkedIds: [...state.checkedIds],
      collapsedSections: [...state.collapsedSections],
      customItems: state.customItems,
    });
  }

  function getAllItems() {
    return state.sections.flatMap((section) => [
      ...section.items.map((item) => ({ ...item, sectionId: section.id })),
      ...(state.customItems[section.id] || []).map((item) => ({
        ...item,
        sectionId: section.id,
      })),
    ]);
  }

  function getVisible(itemElement) {
    if (state.filter === "all") return true;
    if (state.filter === "unchecked") return !itemElement.classList.contains("checked");
    return itemElement.dataset.kind === state.filter;
  }

  function updateCountsAndFilters() {
    const allItems = [...sectionsWrap.querySelectorAll(".item-card")];

    for (const itemElement of allItems) {
      itemElement.classList.toggle("hidden", !getVisible(itemElement));
    }

    for (const sectionElement of sectionsWrap.querySelectorAll(".list-section")) {
      const visibleItems = sectionElement.querySelectorAll(".item-card:not(.hidden)");
      sectionElement.classList.toggle("filtered-out", visibleItems.length === 0);

      const sectionId = sectionElement.dataset.sectionId;
      const sectionItems = sectionElement.querySelectorAll(".item-card");
      const sectionChecked = sectionElement.querySelectorAll(".item-card.checked");
      const countNode = sectionElement.querySelector(`[data-section-count="${sectionId}"]`);
      countNode.textContent = `${sectionChecked.length}/${sectionItems.length}`;
      const chevron = sectionElement.querySelector(".chevron");
      chevron.innerHTML = sectionElement.classList.contains("collapsed")
        ? "&#9656;"
        : "&#9662;";
    }

    const total = allItems.length;
    const checked = sectionsWrap.querySelectorAll(".item-card.checked").length;
    const percent = total ? Math.round((checked / total) * 100) : 0;
    progressFill.style.width = `${percent}%`;
    progressCopy.textContent = `${checked} / ${total} complete (${percent}%)`;
  }

  function rerenderSections() {
    sectionsWrap.innerHTML = state.sections
      .map((section) => buildSectionMarkup(section, state))
      .join("");
    bindSectionEvents();
    updateCountsAndFilters();
  }

  function addCustomItem(sectionId, label) {
    const trimmed = label.trim();
    if (!trimmed) return;

    const customItem = {
      id: `custom-${sectionId}-${Date.now()}`,
      label: trimmed,
      kind: "custom",
      note: "",
      source: "custom",
    };

    state.customItems[sectionId] = [...(state.customItems[sectionId] || []), customItem];
    persist();
    rerenderSections();
  }

  function deleteCustomItem(itemId) {
    for (const [sectionId, items] of Object.entries(state.customItems)) {
      const nextItems = items.filter((item) => item.id !== itemId);
      if (nextItems.length !== items.length) {
        state.customItems[sectionId] = nextItems;
        state.checkedIds.delete(itemId);
        persist();
        rerenderSections();
        return;
      }
    }
  }

  function setSectionChecked(sectionId, checked) {
    const allItems = getAllItems().filter((item) => item.sectionId === sectionId);
    for (const item of allItems) {
      if (checked) state.checkedIds.add(item.id);
      else state.checkedIds.delete(item.id);
    }
    persist();
    rerenderSections();
  }

  function bindSectionEvents() {
    sectionsWrap.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        const card = event.target.closest(".item-card");
        const { itemId } = card.dataset;
        if (event.target.checked) state.checkedIds.add(itemId);
        else state.checkedIds.delete(itemId);
        persist();
        card.classList.toggle("checked", event.target.checked);
        updateCountsAndFilters();
      });
    });

    sectionsWrap.querySelectorAll("[data-toggle-section]").forEach((button) => {
      button.addEventListener("click", () => {
        const sectionId = button.dataset.toggleSection;
        if (state.collapsedSections.has(sectionId)) state.collapsedSections.delete(sectionId);
        else state.collapsedSections.add(sectionId);
        persist();
        button.closest(".list-section").classList.toggle("collapsed");
        updateCountsAndFilters();
      });
    });

    sectionsWrap.querySelectorAll("[data-select-section]").forEach((button) => {
      button.addEventListener("click", () => setSectionChecked(button.dataset.selectSection, true));
    });

    sectionsWrap.querySelectorAll("[data-clear-section]").forEach((button) => {
      button.addEventListener("click", () => setSectionChecked(button.dataset.clearSection, false));
    });

    sectionsWrap.querySelectorAll("[data-toggle-add]").forEach((button) => {
      button.addEventListener("click", () => {
        const form = sectionsWrap.querySelector(`[data-add-form="${button.dataset.toggleAdd}"]`);
        form.classList.toggle("hidden");
        if (!form.classList.contains("hidden")) form.querySelector("input").focus();
      });
    });

    sectionsWrap.querySelectorAll("[data-add-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const sectionId = form.dataset.addForm;
        const input = form.querySelector("input");
        addCustomItem(sectionId, input.value);
        input.value = "";
        form.classList.add("hidden");
      });
    });

    sectionsWrap.querySelectorAll("[data-delete-item]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteCustomItem(button.dataset.deleteItem);
      });
    });
  }

  filterSelect.addEventListener("change", () => {
    state.filter = filterSelect.value;
    updateCountsAndFilters();
  });

  toggleAllButton.addEventListener("click", () => {
    const visibleOpenSection = [...sectionsWrap.querySelectorAll(".list-section:not(.collapsed)")].find(
      (section) => !section.classList.contains("filtered-out"),
    );
    const collapseAll = Boolean(visibleOpenSection);

    for (const section of state.sections) {
      if (collapseAll) state.collapsedSections.add(section.id);
      else state.collapsedSections.delete(section.id);
    }
    persist();
    rerenderSections();
  });

  resetAllButton.addEventListener("click", () => {
    state.checkedIds.clear();
    persist();
    rerenderSections();
  });

  bindSectionEvents();
  updateCountsAndFilters();
}

const appRoot = document.getElementById("app");
if (appRoot) {
  const slug = appRoot.dataset.activity;
  const list = CHECKLIST_MAP[slug];

  if (!list) {
    appRoot.innerHTML = `
      <div class="page-shell page-main">
        <p>Unknown checklist.</p>
      </div>
    `;
  } else {
    renderApp(list);
  }
}
