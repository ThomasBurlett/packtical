import { Link } from "@heroui/react";
import type { Checklist } from "@/types/checklist";

interface ActivityNavProps {
  checklists: Checklist[];
  activeSlug: string;
}

export function ActivityNav({ checklists, activeSlug }: ActivityNavProps) {
  return (
    <nav aria-label="Activities" className="activity-nav">
      {checklists.map((item) => (
        <Link
          className={`activity-pill${activeSlug === item.slug ? " active" : ""}`}
          data-active={activeSlug === item.slug}
          href={`#/${item.slug}`}
          key={item.slug}
        >
          {item.shortLabel}
        </Link>
      ))}
    </nav>
  );
}
