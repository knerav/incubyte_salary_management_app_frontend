import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <PaginationLink
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>

      {pages.map((p) => (
        <PaginationLink
          key={p}
          onClick={() => onPageChange(p)}
          active={p === page}
          aria-label={`Page ${p}`}
        >
          {p}
        </PaginationLink>
      ))}

      <PaginationLink
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  children,
  onClick,
  disabled,
  active,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      role="link"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
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
