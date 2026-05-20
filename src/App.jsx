import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import { CHECKLISTS, CHECKLIST_MAP } from "./data.js";

const FILTERS = [
  { value: "all", label: "Show all" },
  { value: "unchecked", label: "Unchecked only" },
  { value: "core", label: "Core only" },
  { value: "optional", label: "Optional only" },
  { value: "custom", label: "Custom only" },
];

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

function buildCustomItemId(sectionId = "section") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `custom-${sectionId}-${crypto.randomUUID()}`;
  }

  return `custom-${sectionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCustomItems(parsedItems) {
  if (!Array.isArray(parsedItems)) return [];

  return parsedItems
    .filter((item) => item && typeof item.label === "string" && item.label.trim())
    .map((item) => ({
      id: typeof item.id === "string" && item.id.trim() ? item.id : buildCustomItemId(),
      label: item.label.trim(),
      kind: "custom",
      note: "",
      source: "custom",
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
      const items = normalizeCustomItems(parsed.customItems?.[section.id]);
      if (items.length > 0) customItems[section.id] = items;
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

function itemMatchesFilter(item, filter, checkedIds) {
  if (filter === "all") return true;
  if (filter === "unchecked") return !checkedIds.has(item.id);
  return item.kind === filter;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:slug" element={<ChecklistRoute />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

function HomePage() {
  function scrollToActivities() {
    document.getElementById("activities")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="hub-shell hero">
        <p className="eyebrow">Adventure Checklist Hub</p>
        <h1>Interactive REI-inspired checklists built for real packing.</h1>
        <p className="hero-copy">
          Each activity keeps its own saved progress and still leaves room for your
          own ad-hoc items.
        </p>
        <div className="hero-actions">
          <Link className="primary-link" to="/camping">
            Open camping checklist
          </Link>
          <button className="secondary-link" onClick={scrollToActivities} type="button">
            Browse all activities
          </button>
        </div>
      </header>

      <main className="hub-shell" id="activities">
        <section className="hub-section">
          <div className="section-copy">
            <p className="eyebrow">Included lists</p>
            <h2>Choose an activity</h2>
            <p>
              Lists are adapted from REI checklist guides, preserved in roughly
              the same order, and converted into a persistent interactive
              experience.
            </p>
          </div>
          <div className="activity-grid">
            {CHECKLISTS.map((list) => (
              <Link className="activity-card" key={list.slug} to={`/${list.slug}`}>
                <span className="card-kicker">{list.shortLabel}</span>
                <strong>{list.label} checklist</strong>
                <span>{getChecklistSummary(list.slug)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hub-section compact">
          <div className="feature-grid">
            <article className="feature-card">
              <strong>Independent progress</strong>
              <span>
                Each checklist stores checked items, collapsed sections and custom
                additions separately.
              </span>
            </article>
            <article className="feature-card">
              <strong>Mobile-first workflow</strong>
              <span>
                Large tap targets, sticky progress controls and scrollable activity
                navigation.
              </span>
            </article>
            <article className="feature-card">
              <strong>Personal extensions</strong>
              <span>
                Add and remove your own items without losing the base REI-inspired
                structure.
              </span>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

function ChecklistRoute() {
  const { slug = "" } = useParams();
  return <ChecklistPage key={slug} slug={slug} />;
}

function ChecklistPage({ slug }) {
  const list = CHECKLIST_MAP[slug];

  if (!list) {
    return (
      <main className="page-shell page-main">
        <p>Unknown checklist.</p>
        <Link className="home-link" to="/">
          Back to checklist hub
        </Link>
      </main>
    );
  }

  const sections = useMemo(() => cloneSections(list.sections), [list.sections]);
  const storedState = useMemo(() => loadState(list.slug, sections), [list.slug, sections]);
  const [checkedIds, setCheckedIds] = useState(() => new Set(storedState.checkedIds));
  const [collapsedSections, setCollapsedSections] = useState(
    () => new Set(storedState.collapsedSections),
  );
  const [customItems, setCustomItems] = useState(() => storedState.customItems);
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState({});
  const [openForms, setOpenForms] = useState(() => new Set());

  useEffect(() => {
    setCheckedIds(new Set(storedState.checkedIds));
    setCollapsedSections(new Set(storedState.collapsedSections));
    setCustomItems(storedState.customItems);
    setFilter("all");
    setDrafts({});
    setOpenForms(new Set());
    window.scrollTo(0, 0);
  }, [storedState]);

  useEffect(() => {
    try {
      const serializableCustomItems = Object.fromEntries(
        Object.entries(customItems).map(([sectionId, items]) => [
          sectionId,
          items.map(({ id, label }) => ({ id, label })),
        ]),
      );

      localStorage.setItem(
        getStorageKey(list.slug),
        JSON.stringify({
          checkedIds: [...checkedIds],
          collapsedSections: [...collapsedSections],
          customItems: serializableCustomItems,
        }),
      );
    } catch {
      return;
    }
  }, [checkedIds, collapsedSections, customItems, list.slug]);

  const sectionState = useMemo(
    () =>
      sections.map((section) => {
        const items = [...section.items, ...(customItems[section.id] || [])];
        const visibleItems = items.filter((item) => itemMatchesFilter(item, filter, checkedIds));
        const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;

        return {
          ...section,
          items,
          visibleItems,
          checkedCount,
          isCollapsed: collapsedSections.has(section.id),
        };
      }),
    [sections, customItems, filter, checkedIds, collapsedSections],
  );

  const totals = useMemo(() => {
    const items = sectionState.flatMap((section) => section.items);
    const total = items.length;
    const checked = items.filter((item) => checkedIds.has(item.id)).length;
    const percent = total ? Math.round((checked / total) * 100) : 0;

    return { total, checked, percent };
  }, [sectionState, checkedIds]);

  const hasVisibleOpenSection = sectionState.some(
    (section) => section.visibleItems.length > 0 && !section.isCollapsed,
  );

  function updateChecked(itemId, nextChecked) {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (nextChecked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  function toggleSection(sectionId) {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function setSectionChecked(sectionId, nextChecked) {
    const items = sectionState.find((section) => section.id === sectionId)?.items ?? [];
    setCheckedIds((current) => {
      const next = new Set(current);
      for (const item of items) {
        if (nextChecked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  }

  function toggleAddForm(sectionId) {
    setOpenForms((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function addCustomItem(sectionId) {
    const label = drafts[sectionId]?.trim();
    if (!label) return;

    setCustomItems((current) => ({
      ...current,
      [sectionId]: [
        ...(current[sectionId] || []),
        {
          id: buildCustomItemId(sectionId),
          label,
          kind: "custom",
          note: "",
          source: "custom",
        },
      ],
    }));

    setDrafts((current) => ({ ...current, [sectionId]: "" }));
    setOpenForms((current) => {
      const next = new Set(current);
      next.delete(sectionId);
      return next;
    });
  }

  function deleteCustomItem(sectionId, itemId) {
    setCustomItems((current) => ({
      ...current,
      [sectionId]: (current[sectionId] || []).filter((item) => item.id !== itemId),
    }));

    setCheckedIds((current) => {
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
  }

  function toggleAllSections() {
    setCollapsedSections(() => {
      if (hasVisibleOpenSection) {
        return new Set(sectionState.map((section) => section.id));
      }

      return new Set();
    });
  }

  return (
    <>
      <header className="page-shell page-header">
        <Link className="home-link" to="/">
          Adventure Checklist Hub
        </Link>
        <p className="eyebrow">REI-inspired checklist</p>
        <h1>{list.label}</h1>
        <p className="page-subtitle">{list.subtitle}</p>
        <nav aria-label="Activities" className="activity-nav">
          {CHECKLISTS.map((item) => (
            <NavLink
              className={({ isActive }) => `activity-pill${isActive ? " active" : ""}`}
              key={item.slug}
              to={`/${item.slug}`}
            >
              {item.shortLabel}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="sticky-bar">
        <div className="page-shell sticky-inner">
          <div className="progress-panel">
            <div className="progress-track">
              <div id="progress-fill" style={{ width: `${totals.percent}%` }} />
            </div>
            <div className="progress-copy">
              {totals.checked} / {totals.total} complete ({totals.percent}%)
            </div>
          </div>
          <div className="toolbar">
            <label className="select-wrap">
              <span className="sr-only">Filter items</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                {FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={toggleAllSections} type="button">
              {hasVisibleOpenSection ? "Collapse all" : "Expand all"}
            </button>
            <button onClick={() => setCheckedIds(new Set())} type="button">
              Reset checks
            </button>
          </div>
        </div>
      </div>

      <main className="page-shell page-main">
        <section className="summary-grid">
          <article className="summary-card">
            <strong>How it works</strong>
            <span>Check items as you pack. Progress saves only for this activity.</span>
          </article>
          <article className="summary-card">
            <strong>Make it yours</strong>
            <span>
              Add section-specific custom items without disturbing the base list order.
            </span>
          </article>
          <article className="summary-card">
            <strong>Source</strong>
            <span>
              Adapted from{" "}
              <a href={list.sourceUrl} rel="noreferrer" target="_blank">
                {list.sourceLabel}
              </a>
              .
            </span>
          </article>
        </section>

        <div className="sections-wrap">
          {sectionState.map((section) => {
            const isFormOpen = openForms.has(section.id);
            const isFilteredOut = section.visibleItems.length === 0;

            return (
              <section
                className={`list-section${section.isCollapsed ? " collapsed" : ""}${
                  isFilteredOut ? " filtered-out" : ""
                }`}
                key={section.id}
              >
                <button
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                  type="button"
                >
                  <span className="section-heading">
                    <span className="chevron">{section.isCollapsed ? "▸" : "▾"}</span>
                    <span>
                      <strong>{section.title}</strong>
                    </span>
                  </span>
                  <span className="section-count">
                    {section.checkedCount}/{section.items.length}
                  </span>
                </button>

                <div className="section-tools">
                  <button
                    className="mini-btn"
                    onClick={() => setSectionChecked(section.id, true)}
                    type="button"
                  >
                    Select all
                  </button>
                  <button
                    className="mini-btn"
                    onClick={() => setSectionChecked(section.id, false)}
                    type="button"
                  >
                    Clear
                  </button>
                  <button
                    className="mini-btn"
                    onClick={() => toggleAddForm(section.id)}
                    type="button"
                  >
                    Add item
                  </button>
                </div>

                <form
                  className={`add-item-form${isFormOpen ? "" : " hidden"}`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    addCustomItem(section.id);
                  }}
                >
                  <input
                    aria-label={`Add custom item to ${section.title}`}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [section.id]: event.target.value,
                      }))
                    }
                    placeholder={`Add your own item to ${section.title}`}
                    type="text"
                    value={drafts[section.id] || ""}
                  />
                  <button type="submit">Save</button>
                </form>

                <div className="items">
                  {section.visibleItems.map((item) => {
                    const checked = checkedIds.has(item.id);
                    const inputId = `${section.id}-${item.id}`;

                    return (
                      <div className={`item-card${checked ? " checked" : ""}`} key={item.id}>
                        <input
                          checked={checked}
                          id={inputId}
                          onChange={(event) => updateChecked(item.id, event.target.checked)}
                          type="checkbox"
                        />
                        <label className="item-body" htmlFor={inputId}>
                          <span className="item-label">{item.label}</span>
                          {item.note ? <small>{item.note}</small> : null}
                        </label>
                        <div className="item-meta">
                          <span className={`tag ${item.kind}`}>
                            {item.kind === "core"
                              ? "Core"
                              : item.kind === "optional"
                                ? "Optional"
                                : "Custom"}
                          </span>
                          {item.source === "custom" ? (
                            <button
                              aria-label={`Delete ${item.label}`}
                              className="icon-btn"
                              onClick={() => deleteCustomItem(section.id, item.id)}
                              type="button"
                            >
                              &times;
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}

function getChecklistSummary(slug) {
  switch (slug) {
    case "camping":
      return "Campsite, kitchen, clothing, hygiene, repairs and personal items.";
    case "trail-running":
      return "Clothing, navigation, hydration, electronics, first aid and misc gear.";
    case "travel-preparation":
      return "Chronological trip-prep workflow from 30 days out through departure day.";
    case "backpacking":
      return "Backpacking gear, food and water, emergency items, repairs and extras.";
    case "basic-cycling":
      return "Ride essentials, repair gear, comfort items and pre-ride inspection.";
    case "mountain-biking":
      return "Trail-focused gear, repair tools, clothing, personal items and protection.";
    default:
      return "Interactive checklist";
  }
}

export default App;
