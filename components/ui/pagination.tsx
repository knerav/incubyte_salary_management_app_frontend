import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageWindow(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const rangeStart = Math.max(2, page - 2);
  const rangeEnd = Math.min(totalPages - 1, page + 2);

  const pages: (number | "ellipsis")[] = [1];
  if (rangeStart > 2) pages.push("ellipsis");
  for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
  if (rangeEnd < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const items = getPageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 flex-wrap py-4">
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <PageButton
            key={item}
            onClick={() => onPageChange(item)}
            active={item === page}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </PageButton>
        )
      )}

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  "aria-label": ariaLabel,
  "aria-current": ariaCurrent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      {children}
    </button>
  );
}
