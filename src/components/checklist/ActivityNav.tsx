import { NavLink } from "react-router-dom";
import type { Checklist } from "@/types/checklist";

interface ActivityNavProps {
  checklists: Checklist[];
}

export function ActivityNav({ checklists }: ActivityNavProps) {
  return (
    <nav aria-label="Activities" className="activity-nav">
      {checklists.map((item) => (
        <NavLink
          className={({ isActive }) => `activity-pill${isActive ? " active" : ""}`}
          key={item.slug}
          to={`/${item.slug}`}
        >
          {item.shortLabel}
        </NavLink>
      ))}
    </nav>
  );
}
