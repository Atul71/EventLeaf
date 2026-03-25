import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { EVENTS, type EventItem } from "../data/events";

function EventDiscoverCard({ event }: { event: EventItem }) {
  const partnerGreenAuditorium = event.leedCertified || event.solarPowered;

  return (
    <article className="overflow-hidden rounded-2xl border border-border-green bg-white dark:bg-white/5 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative h-48">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <EcoCertifiedBadge variant="card" className="absolute top-3 left-3">
          Eco-Certified Event
        </EcoCertifiedBadge>
        <div className="absolute bottom-3 left-3 flex gap-1">
          {event.leedCertified ? (
            <span
              className="size-7 rounded-full bg-white/90 border border-border-green flex items-center justify-center"
              title="LEED-certified venue"
            >
              <span className="material-symbols-outlined text-sm fill text-primary">eco</span>
            </span>
          ) : null}
          {event.solarPowered ? (
            <span
              className="size-7 rounded-full bg-white/90 border border-border-green flex items-center justify-center"
              title="Solar-powered venue"
            >
              <span className="material-symbols-outlined text-sm text-primary">wb_sunny</span>
            </span>
          ) : null}
          {event.wasteReduction ? (
            <span
              className="size-7 rounded-full bg-white/90 border border-border-green flex items-center justify-center"
              title="Waste reduction initiatives"
            >
              <span className="material-symbols-outlined text-sm text-primary">recycling</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-5 space-y-3 flex flex-col flex-1">
        <h2 className="text-xl font-black dark:text-white">{event.name}</h2>
        <p className="text-sm text-subtext-leaf">
          {event.dateLabel} · {event.city}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-soft-green px-2.5 py-1 text-xs font-bold">{event.category}</span>
          <span className="rounded-full border border-border-green px-2.5 py-1 text-xs font-bold">{event.priceLabel}</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold">
            Score {event.sustainabilityScore.toFixed(1)}/5
          </span>
        </div>
        {partnerGreenAuditorium ? (
          <span className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold">
            Partner Green Auditorium
          </span>
        ) : null}
        <p className="text-xs font-semibold text-subtext-leaf" title="Estimated paper savings for choosing this event.">
          Trees Saved Preview: {event.treesSavedEstimate}
        </p>
        <Link
          to={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-background-dark hover:brightness-95 transition-all mt-auto self-start"
        >
          View Event
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}

type SortOption = "green" | "date" | "price";

const EVENT_QUICK_FILTERS = [
  { key: "verified" as const, icon: "verified", label: "Verified Green" },
  { key: "paperless" as const, icon: "smartphone", label: "Paperless" },
  { key: "waste" as const, icon: "recycling", label: "Zero Waste" },
  { key: "transit" as const, icon: "directions_bus", label: "Near Transit" },
];

const LEAF_TIERS = [1, 2, 3, 4, 5] as const;

export function DiscoverEventsPage() {
  const transitLimit = 500;
  const [search, setSearch] = useState("");
  const [verifiedGreenOnly, setVerifiedGreenOnly] = useState(false);
  const [paperlessOnly, setPaperlessOnly] = useState(false);
  const [wasteReductionOnly, setWasteReductionOnly] = useState(false);
  const [transitAccessibleOnly, setTransitAccessibleOnly] = useState(false);
  const [leafTierFilter, setLeafTierFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("green");
  const [showSuggest, setShowSuggest] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const activeFilterCount =
    Number(verifiedGreenOnly) +
    Number(paperlessOnly) +
    Number(wasteReductionOnly) +
    Number(transitAccessibleOnly) +
    Number(leafTierFilter !== null) +
    Number(search.trim().length > 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = EVENTS.filter((event) => {
      const matchesQuery =
        query.length === 0 ||
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.venueName.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query) ||
        event.certifications.some((cert) => cert.toLowerCase().includes(query));

      const partnerGreenAuditorium = event.leedCertified || event.solarPowered;

      const matchesVerified = !verifiedGreenOnly || partnerGreenAuditorium;
      const matchesPaperless = !paperlessOnly || event.paperlessTicketing;
      const matchesWaste = !wasteReductionOnly || event.wasteReduction;
      const matchesTransit = !transitAccessibleOnly || event.publicTransitDistanceMeters <= transitLimit;
      const matchesLeafTier = leafTierFilter === null || event.sustainabilityScore >= leafTierFilter;

      return (
        matchesQuery &&
        matchesVerified &&
        matchesPaperless &&
        matchesWaste &&
        matchesTransit &&
        matchesLeafTier
      );
    });

    return result.sort((a, b) => {
      const aGreen = a.leedCertified || a.solarPowered ? 1 : 0;
      const bGreen = b.leedCertified || b.solarPowered ? 1 : 0;

      if (sortBy === "date") return a.dateISO.localeCompare(b.dateISO);
      if (sortBy === "price") return a.priceValue - b.priceValue;

      if (aGreen !== bGreen) return bGreen - aGreen;
      if (a.sustainabilityScore !== b.sustainabilityScore) return b.sustainabilityScore - a.sustainabilityScore;
      return a.dateISO.localeCompare(b.dateISO);
    });
  }, [search, verifiedGreenOnly, paperlessOnly, wasteReductionOnly, transitAccessibleOnly, leafTierFilter, sortBy]);

  function clearAllFilters() {
    setSearch("");
    setVerifiedGreenOnly(false);
    setPaperlessOnly(false);
    setWasteReductionOnly(false);
    setTransitAccessibleOnly(false);
    setLeafTierFilter(null);
    setSortBy("green");
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/profile" className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors">
              Profile
            </Link>
            <Link
              to="/organizer"
              className="rounded-lg border border-border-green px-4 py-2 text-sm font-bold hover:bg-soft-green transition-colors"
            >
              Organizer Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black dark:text-white">Discover Events</h1>
          <p className="mt-3 text-subtext-leaf text-lg">
            Browse eco-focused events, compare sustainability standards, and open each event page to see the full
            green-badge proof.
          </p>
        </section>

        <section className="mb-8 bg-white dark:bg-[#1a3a1d] p-4 rounded-2xl shadow-sm border border-soft-green dark:border-[#2a4a2d]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={search}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title, venue, city, or certification..."
                className="w-full pl-12 pr-10 py-3 bg-[#f8fcf8] dark:bg-background-dark border-none rounded-xl focus:ring-2 focus:ring-primary text-sm text-text-leaf dark:text-white placeholder-gray-500"
                aria-label="Search events"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-leaf dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              ) : null}
              {showSuggest && search.trim().length > 0 ? (
                <div className="absolute z-20 left-0 right-0 top-full mt-2 rounded-xl border border-soft-green dark:border-[#2a4a2d] bg-white dark:bg-[#1a3a1d] shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedGreenOnly(true);
                      setSortBy("green");
                      setSearch("");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-soft-green dark:hover:bg-white/10 transition-colors"
                  >
                    Green Auditoriums
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaperlessOnly(true);
                      setSearch("");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-soft-green dark:hover:bg-white/10 transition-colors border-t border-soft-green dark:border-[#2a4a2d]"
                  >
                    Paperless Events
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((open) => !open)}
              aria-expanded={showAdvancedFilters}
              className={`flex items-center justify-center gap-2 px-4 py-3 bg-primary text-text-leaf font-bold rounded-xl hover:bg-primary/90 transition-all shrink-0 ${
                showAdvancedFilters ? "ring-2 ring-text-leaf/30 ring-offset-2 ring-offset-white dark:ring-offset-[#1a3a1d]" : ""
              }`}
            >
              <span className="material-symbols-outlined">tune</span>
              Advanced Eco-Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-soft-green dark:border-[#2a4a2d]">
            {EVENT_QUICK_FILTERS.map((f) => {
              const active =
                (f.key === "verified" && verifiedGreenOnly) ||
                (f.key === "paperless" && paperlessOnly) ||
                (f.key === "waste" && wasteReductionOnly) ||
                (f.key === "transit" && transitAccessibleOnly);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    if (f.key === "verified") setVerifiedGreenOnly((v) => !v);
                    if (f.key === "paperless") setPaperlessOnly((v) => !v);
                    if (f.key === "waste") setWasteReductionOnly((v) => !v);
                    if (f.key === "transit") setTransitAccessibleOnly((v) => !v);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                    active
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-soft-green dark:bg-[#2a4a2d] text-text-leaf dark:text-white hover:bg-primary/20 border border-transparent"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>

          {showAdvancedFilters ? (
            <div className="mt-4 pt-4 border-t border-soft-green dark:border-[#2a4a2d] space-y-4">
              <div>
                <p className="text-sm font-semibold text-text-leaf dark:text-white">Sustainability rating (leaves)</p>
                <p className="mt-0.5 text-xs text-subtext-leaf dark:text-gray-400">
                  Select a minimum leaf level. Choosing 4 shows 4.0 and above.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by leaf rating">
                  <button
                    type="button"
                    onClick={() => setLeafTierFilter(null)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-colors ${
                      leafTierFilter === null
                        ? "bg-primary text-text-leaf border-primary"
                        : "border-soft-green dark:border-[#2a4a2d] hover:bg-soft-green dark:hover:bg-white/10"
                    }`}
                  >
                    Any
                  </button>
                  <div className="inline-flex items-center rounded-lg border border-soft-green dark:border-[#2a4a2d] bg-white dark:bg-transparent px-2 py-1.5">
                    {LEAF_TIERS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setLeafTierFilter(n)}
                        aria-label={`Set minimum rating to ${n} leaves`}
                        aria-pressed={leafTierFilter === n}
                        className="inline-flex items-center justify-center px-0.5"
                      >
                        <span
                          className={`material-symbols-outlined text-xl leading-none transition-colors ${
                            (leafTierFilter ?? 0) >= n ? "fill text-primary" : "text-subtext-leaf"
                          }`}
                        >
                          eco
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy("green")}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-colors ${
                    sortBy === "green"
                      ? "bg-primary text-text-leaf border-primary"
                      : "border-soft-green dark:border-[#2a4a2d] hover:bg-soft-green dark:hover:bg-white/10"
                  }`}
                >
                  Sustainability First
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("date")}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-colors ${
                    sortBy === "date"
                      ? "bg-primary text-text-leaf border-primary"
                      : "border-soft-green dark:border-[#2a4a2d] hover:bg-soft-green dark:hover:bg-white/10"
                  }`}
                >
                  Date
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("price")}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-colors ${
                    sortBy === "price"
                      ? "bg-primary text-text-leaf border-primary"
                      : "border-soft-green dark:border-[#2a4a2d] hover:bg-soft-green dark:hover:bg-white/10"
                  }`}
                >
                  Price
                </button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-lg border border-soft-green dark:border-[#2a4a2d] text-sm font-bold text-subtext-leaf hover:text-text-leaf hover:bg-soft-green dark:hover:bg-white/10 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-subtext-leaf">
            Showing {filtered.length} event{filtered.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs font-bold text-subtext-leaf">
            {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventDiscoverCard key={event.slug} event={event} />
          ))}
        </section>

        {filtered.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-border-green bg-white p-6 text-center">
            <h3 className="text-xl font-black">No events matched these filters</h3>
            <p className="mt-2 text-subtext-leaf">Try relaxing one or two filters to widen your search.</p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 font-bold text-background-dark"
            >
              Reset Filters
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
