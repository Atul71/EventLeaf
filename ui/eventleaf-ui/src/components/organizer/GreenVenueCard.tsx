import { Link } from "react-router-dom";
import { EcoCertifiedBadge } from "./EcoCertifiedBadge";

export type VenueItem = {
  id: string;
  name: string;
  location: string;
  certification?: string; // e.g. "LEED Platinum", "100% Renewable Energy"
  imageUrl?: string;
  isEcoCertified: boolean;
  highlight?: "green-auditorium" | "eco-venue" | "standard";
};

type GreenVenueCardProps = {
  venue: VenueItem;
  to?: string;
};

/** Card for the venue browser: shows Eco-Certified badge and green-auditorium highlight */
export function GreenVenueCard({ venue, to = "#" }: GreenVenueCardProps) {
  const isGreenAuditorium = venue.highlight === "green-auditorium" || venue.isEcoCertified;

  return (
    <Link
      to={to}
      className={`block rounded-xl border overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/40 text-left ${
        isGreenAuditorium
          ? "border-primary/30 bg-soft-green/30 dark:bg-primary/5"
          : "border-border-green dark:border-white/10 bg-white dark:bg-[#152a17]"
      }`}
    >
      <div className="relative h-36 bg-neutral-bg dark:bg-white/5">
        {venue.imageUrl ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${venue.imageUrl}')` }}
            role="img"
            aria-label={venue.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/40">
            <span className="material-symbols-outlined text-5xl">location_on</span>
          </div>
        )}
        {venue.isEcoCertified && (
          <div className="absolute top-3 right-3">
            <EcoCertifiedBadge variant="compact" />
          </div>
        )}
        {venue.highlight === "green-auditorium" && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
            <span className="px-2 py-0.5 rounded-md bg-primary text-background-dark text-[10px] font-black uppercase tracking-tighter">
              Green Auditorium
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-text-leaf dark:text-white mb-1">{venue.name}</h3>
        <p className="text-xs text-subtext-leaf flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {venue.location}
        </p>
        {venue.certification && (
          <p className="text-xs font-semibold text-primary">{venue.certification}</p>
        )}
      </div>
    </Link>
  );
}
