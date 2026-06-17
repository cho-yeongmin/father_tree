import type { MyLibraryItem } from "@/types/database";
import { VisitCard } from "./VisitCard";

interface VisitListProps {
  items: MyLibraryItem[];
}

export function VisitList({ items }: VisitListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.visit_id}>
          <VisitCard item={item} />
        </li>
      ))}
    </ul>
  );
}
