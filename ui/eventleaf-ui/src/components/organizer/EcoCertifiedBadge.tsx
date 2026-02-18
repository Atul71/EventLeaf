import type { ReactNode } from "react";

type EcoCertifiedBadgeProps = {
  variant?: "default" | "compact" | "inline" | "card";
  children?: ReactNode;
  className?: string;
};

/** Badge indicating a venue or event is Eco-Certified / green-auditorium verified */
export function EcoCertifiedBadge({
  variant = "default",
  children = "Eco-Certified",
  className = "",
}: EcoCertifiedBadgeProps) {
  const base =
    "inline-flex items-center gap-1.5 font-semibold text-primary uppercase tracking-wider";

  if (variant === "card") {
    return (
      <span
        className={`bg-primary/90 backdrop-blur-sm text-text-leaf text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm ${className}`}
        aria-label="Eco-Certified"
      >
        <span className="material-symbols-outlined text-sm fill">eco</span>
        {children}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span
        className={`${base} text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 ${className}`}
        aria-label="Eco-Certified"
      >
        <span className="material-symbols-outlined fill text-sm">eco</span>
        {children}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span className={`${base} text-xs ${className}`} aria-label="Eco-Certified">
        <span className="material-symbols-outlined fill">verified</span>
        {children}
      </span>
    );
  }

  return (
    <span
      className={`${base} text-xs bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 ${className}`}
      aria-label="Eco-Certified"
    >
      <span className="material-symbols-outlined fill">eco</span>
      {children}
    </span>
  );
}
