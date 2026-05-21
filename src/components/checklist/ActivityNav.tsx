import { Link } from "@heroui/react";
import { ActivityIcon } from "@/lib/activity-icons";
import type { Checklist } from "@/types/checklist";

interface ActivityNavProps {
  checklists: Checklist[];
  activeSlug: string;
}

export function ActivityNav({ checklists, activeSlug }: ActivityNavProps) {
  return (
    <nav aria-label="Activities" className="activity-nav">
      {checklists.map((item) => {
        return (
          <Link
            className={`activity-pill${activeSlug === item.slug ? " active" : ""}`}
            data-active={activeSlug === item.slug}
            href={`#/${item.slug}`}
            key={item.slug}
          >
            <span className="activity-pill-icon" aria-hidden="true">
              <ActivityIcon slug={item.slug} size={15} strokeWidth={2.05} />
            </span>
            <span>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
