import { Link } from "react-router-dom";
import { CHECKLISTS } from "@/data/checklists";

export function HomePage() {
  function scrollToActivities() {
    document.getElementById("activities")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="hub-shell hero">
        <p className="eyebrow">Adventure Checklist Hub</p>
        <h1>Interactive REI-inspired checklists built for real packing.</h1>
        <p className="hero-copy">
          Each activity keeps its own saved progress and still leaves room for your own ad-hoc items.
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
              Lists are adapted from REI checklist guides, preserved in roughly the same order, and
              converted into a persistent interactive experience.
            </p>
          </div>
          <div className="activity-grid">
            {CHECKLISTS.map((list) => (
              <Link className="activity-card" key={list.slug} to={`/${list.slug}`}>
                <span className="card-kicker">{list.shortLabel}</span>
                <strong>{list.label} checklist</strong>
                <span>{list.summary}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hub-section compact">
          <div className="feature-grid">
            <article className="feature-card">
              <strong>Independent progress</strong>
              <span>
                Each checklist stores checked items, collapsed sections and custom additions
                separately.
              </span>
            </article>
            <article className="feature-card">
              <strong>Mobile-first workflow</strong>
              <span>
                Large tap targets, sticky progress controls and scrollable activity navigation.
              </span>
            </article>
            <article className="feature-card">
              <strong>Personal extensions</strong>
              <span>
                Add and remove your own items without losing the base REI-inspired structure.
              </span>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
