import { Button, Card, Chip, Link } from "@heroui/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CHECKLISTS } from "@/data/checklists";

interface HomePageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function HomePage({ isDark, onToggleTheme }: HomePageProps) {
  function scrollToActivities() {
    document.getElementById("activities")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="page-frame">
      <section className="page-shell home-layout">
        <Card className="hero-card" variant="tertiary">
          <Card.Header className="hero-header">
            <div className="hero-copy-block">
              <Chip className="hero-chip" variant="soft">
                Trail-ready planning
              </Chip>
              <Card.Title className="hero-title">
                Outdoor packing checklists with a cleaner, field-ready design.
              </Card.Title>
              <Card.Description className="hero-description">
                Each activity saves its own progress, supports custom additions, and stays easy to
                use while you pack from your phone.
              </Card.Description>
            </div>
            <Card className="theme-toggle-card" variant="secondary">
              <Card.Content className="theme-toggle-content">
                <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
              </Card.Content>
            </Card>
          </Card.Header>
          <Card.Content className="hero-metrics">
            <Card className="metric-card" variant="secondary">
              <Card.Title>{CHECKLISTS.length}</Card.Title>
              <Card.Description>Outdoor scenarios</Card.Description>
            </Card>
            <Card className="metric-card" variant="secondary">
              <Card.Title>Persistent</Card.Title>
              <Card.Description>Per-activity saved state</Card.Description>
            </Card>
            <Card className="metric-card" variant="secondary">
              <Card.Title>Customizable</Card.Title>
              <Card.Description>Add personal items section by section</Card.Description>
            </Card>
          </Card.Content>
          <Card.Footer className="hero-actions">
            <Link className="hero-link hero-link-primary" href="#/camping">
              Open camping checklist
            </Link>
            <Button onPress={scrollToActivities} variant="secondary">
              Browse all activities
            </Button>
          </Card.Footer>
        </Card>

        <Card className="library-card" id="activities" variant="default">
          <Card.Header className="section-heading">
            <div>
              <Chip className="section-chip" variant="soft">
                Activity library
              </Chip>
              <Card.Title className="section-title">Choose an activity</Card.Title>
              <Card.Description className="section-description">
                Each list is based on proven outdoor packing workflows and translated into a
                cleaner, mobile-first checklist experience.
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content className="activity-grid">
            {CHECKLISTS.map((list) => (
              <Link className="activity-card-link" href={`#/${list.slug}`} key={list.slug}>
                <Card className="activity-card" variant="secondary">
                  <Card.Header className="activity-card-header">
                    <Chip className="activity-chip" variant="soft">
                      {list.shortLabel}
                    </Chip>
                    <Card.Title>{list.label} checklist</Card.Title>
                    <Card.Description>{list.summary}</Card.Description>
                  </Card.Header>
                  <Card.Footer className="activity-card-footer">
                    <span>Open checklist</span>
                  </Card.Footer>
                </Card>
              </Link>
            ))}
          </Card.Content>
        </Card>

        <div className="feature-grid">
          <Card className="feature-card" variant="secondary">
            <Card.Title>Independent progress</Card.Title>
            <Card.Description>
              Checked items, collapsed sections, and custom additions stay scoped to each activity.
            </Card.Description>
          </Card>
          <Card className="feature-card" variant="secondary">
            <Card.Title>Field-friendly workflow</Card.Title>
            <Card.Description>
              Large targets, sticky controls, and fast section actions reduce packing friction.
            </Card.Description>
          </Card>
          <Card className="feature-card" variant="secondary">
            <Card.Title>Clear visual hierarchy</Card.Title>
            <Card.Description>
              Stronger contrast, calmer surfaces, and easier scanning help you move faster.
            </Card.Description>
          </Card>
        </div>
      </section>
    </main>
  );
}
