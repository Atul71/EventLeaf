import { EcoCertifiedBadge } from "./EcoCertifiedBadge";

/** Scalable venue card: Eco-Certified badge, capacity, sustainability index, feature tags, Select Venue */
export type SustainableVenue = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  imageAlt?: string;
  rating: number;
  sustainabilityIndex: number; // out of 5
  capacity: string; // e.g. "500 cap"
  featureTags: { icon: string; label: string }[];
  isEcoCertified: boolean;
};

type SustainableVenueCardProps = {
  venue: SustainableVenue;
  onSelect?: (venue: SustainableVenue) => void;
};

export function SustainableVenueCard({ venue, onSelect }: SustainableVenueCardProps) {
  const percent = Math.round((venue.sustainabilityIndex / 5) * 100);

  return (
    <article className="bg-white dark:bg-[#1a3a1d] rounded-2xl overflow-hidden border border-soft-green dark:border-[#2a4a2d] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        <img
          alt={venue.imageAlt ?? venue.name}
          src={venue.imageUrl}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {venue.isEcoCertified && <EcoCertifiedBadge variant="card" />}
        </div>
        <div className="absolute bottom-4 right-4">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            {venue.capacity}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-text-leaf dark:text-white">{venue.name}</h3>
          <div className="flex items-center gap-1 text-primary">
            <span className="text-sm font-bold">{venue.rating}</span>
            <span className="material-symbols-outlined text-sm fill">star</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {venue.location}
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-subtext-leaf">
            <span>Sustainability Index</span>
            <span>{venue.sustainabilityIndex}/5.0</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {venue.featureTags.map((tag) => (
              <span
                key={tag.label}
                className="text-xs bg-soft-green dark:bg-[#224425] text-subtext-leaf px-2 py-1 rounded border border-soft-green dark:border-[#2a4a2d] flex items-center gap-1 w-fit"
              >
                <span className="material-symbols-outlined text-[14px]">{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect?.(venue)}
          className="w-full py-3 bg-primary text-text-leaf font-black rounded-xl hover:shadow-[0_4px_20px_rgba(43,238,59,0.4)] transition-all"
        >
          Select Venue
        </button>
      </div>
    </article>
  );
}
