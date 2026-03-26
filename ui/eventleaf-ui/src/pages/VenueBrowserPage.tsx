import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SustainableVenueCard } from "../components/organizer/SustainableVenueCard";
import { fetchVenues, type ApiVenue } from "../api/eventleafApi";
import {
  apiVenueToSustainableVenue,
  compareVenuesByPriceTier,
  matchesPaperlessFilter,
  matchesWasteReductionFilter,
  sustainabilityScoreFromVenue,
  venueSearchBlob,
} from "../data/venuePresentation";

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDs_L3pushL4zjQauvrzIXPxi9FBCxLGReg3oKJzqe88_2RYkm1kyTAwL8Ct0pDRGlcvQco8PFwsL67TcgneGeB1P9zYdu7fiY1DtcGJ7so4mufjYI_QxyXdfzvtndQi0tAMhuKu_C1jws0sxHYWtMlOdCEhxLASvVviJjV5qMeu_Jg2bTZtuyFT-JOWZXWWrfXEt1a8kFxXLm3IQq8nkY9PjIEi9kVdhWP1HunX3pFveEQ7g7PIcTkXFMzo2yC8zpmk9a7n-E7QRk";

type SortOption = "sustainability" | "capacity" | "price";

function CheckboxRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-soft-green/60 dark:hover:bg-white/5 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-soft-green text-primary focus:ring-primary"
      />
      <span className="text-sm font-semibold text-text-leaf dark:text-white">{label}</span>
    </label>
  );
}

export function VenueBrowserPage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [verifiedGreenOnly, setVerifiedGreenOnly] = useState(false);
  const [paperlessOnly, setPaperlessOnly] = useState(false);
  const [wasteOnly, setWasteOnly] = useState(false);
  const [transitOnly, setTransitOnly] = useState(false);
  const [minLeaves, setMinLeaves] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("sustainability");
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchVenues(500)
      .then((data) => {
        if (!cancelled) setVenues(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || "Failed to load venues");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setDisplayCount(6);
  }, [
    search,
    verifiedGreenOnly,
    paperlessOnly,
    wasteOnly,
    transitOnly,
    minLeaves,
    sortBy,
  ]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = venues.filter((v) => {
      if (q && !venueSearchBlob(v).includes(q)) return false;
      if (verifiedGreenOnly && !v.is_eco_certified) return false;
      if (paperlessOnly && !matchesPaperlessFilter(v)) return false;
      if (wasteOnly && !matchesWasteReductionFilter(v)) return false;
      if (transitOnly && !v.has_public_transit) return false;
      const score = sustainabilityScoreFromVenue(v);
      if (score + 1e-6 < minLeaves) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "capacity") return (b.capacity ?? 0) - (a.capacity ?? 0);
      if (sortBy === "price") return compareVenuesByPriceTier(a, b);
      return sustainabilityScoreFromVenue(b) - sustainabilityScoreFromVenue(a);
    });
    return list;
  }, [
    venues,
    search,
    verifiedGreenOnly,
    paperlessOnly,
    wasteOnly,
    transitOnly,
    minLeaves,
    sortBy,
  ]);

  const visibleApi = filteredSorted.slice(0, displayCount);
  const hasMore = displayCount < filteredSorted.length;
  const ecoListedCount = useMemo(
    () => venues.filter((v) => v.is_eco_certified).length,
    [venues]
  );

  function clearAllFilters() {
    setSearch("");
    setVerifiedGreenOnly(false);
    setPaperlessOnly(false);
    setWasteOnly(false);
    setTransitOnly(false);
    setMinLeaves(1);
    setSortBy("sustainability");
    setDisplayCount(6);
  }

  function handleViewMap() {
    const list = filteredSorted;
    if (list.length === 0) return;
    const withGeo = list.filter(
      (v) =>
        v.latitude != null &&
        v.longitude != null &&
        typeof v.latitude === "number" &&
        typeof v.longitude === "number"
    );
    if (withGeo.length > 0) {
      const lat = withGeo.reduce((s, v) => s + (v.latitude as number), 0) / withGeo.length;
      const lng = withGeo.reduce((s, v) => s + (v.longitude as number), 0) / withGeo.length;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      const first = list[0]!;
      const q = [first.city, first.state ?? ""].filter(Boolean).join(" ");
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${q} sustainable venue`)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  const handleLoadMore = () => {
    setDisplayCount((n) => Math.min(n + 6, filteredSorted.length));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-soft-green dark:border-[#1a3a1d] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-2 text-text-leaf dark:text-white shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">
                energy_savings_leaf
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">EventLeaf</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-sm font-bold text-primary border-b-2 border-primary pb-0.5">Venues</span>
              <Link
                to="/events"
                className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link
                to="/organizer"
                className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors"
              >
                Impact Reports
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/organizer"
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-bold border border-soft-green dark:border-[#2a4a2d] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-text-leaf dark:text-white"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span className="hidden lg:inline">Organizer Dashboard</span>
            </Link>
            <Link
              to="/profile"
              className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-primary/30 transition-all"
              aria-label="View profile"
            >
              <img src={USER_AVATAR} alt="User profile" className="w-full h-full object-cover" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <section className="mb-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-text-leaf dark:text-white mb-2 leading-tight">
                Sustainable Venue Browser
              </h2>
              <p className="text-subtext-leaf text-lg">
                Curated eco-certified spaces for carbon-neutral events — live from your EventLeaf directory.
              </p>
            </div>
            <Link
              to="/organizer"
              className="text-sm font-bold text-subtext-leaf hover:text-primary sm:mb-1"
            >
              ← Organizer home
            </Link>
          </div>

          <div className="relative bg-white dark:bg-[#1a3a1d] p-5 sm:p-6 rounded-2xl shadow-sm border border-soft-green dark:border-[#2a4a2d]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Eco-priority search</p>
              <button
                type="button"
                onClick={handleViewMap}
                disabled={filteredSorted.length === 0}
                className="mt-2 sm:mt-0 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-40 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-lg">map</span>
                View map
              </button>
            </div>

            <div className="relative mb-5">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try 'Green Auditoriums' or 'LEED Platinum' venues…"
                className="w-full pl-12 pr-4 py-3.5 bg-[#f8fcf8] dark:bg-background-dark border border-soft-green/40 dark:border-[#2a4a2d] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-base text-text-leaf dark:text-white placeholder:text-gray-500"
                aria-label="Search venues"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5 space-y-1 rounded-xl border border-soft-green/50 dark:border-[#2a4a2d] bg-[#f8fcf8]/80 dark:bg-black/20 p-2">
                <CheckboxRow
                  id="vf-green"
                  label="Verified green venues only"
                  checked={verifiedGreenOnly}
                  onChange={setVerifiedGreenOnly}
                />
                <CheckboxRow
                  id="vf-paperless"
                  label="Paperless operations"
                  checked={paperlessOnly}
                  onChange={setPaperlessOnly}
                />
                <CheckboxRow
                  id="vf-waste"
                  label="Waste reduction"
                  checked={wasteOnly}
                  onChange={setWasteOnly}
                />
                <CheckboxRow
                  id="vf-transit"
                  label="Public transit accessible (max 500m)"
                  checked={transitOnly}
                  onChange={setTransitOnly}
                />
              </div>

              <div className="lg:col-span-7 flex flex-col justify-center gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-2">
                    <span>Sustainability score</span>
                    <span>
                      {minLeaves} to 5 leaves (min.)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={minLeaves}
                    onChange={(e) => setMinLeaves(Number(e.target.value))}
                    className="w-full accent-primary h-2 rounded-full"
                    aria-label="Minimum sustainability leaves"
                  />
                  <div className="flex justify-between text-[10px] text-subtext-leaf mt-1 font-medium">
                    <span>1</span>
                    <span>5</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-2">Sort</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: "sustainability" as const, label: "Sustainability first" },
                        { id: "capacity" as const, label: "Capacity" },
                        { id: "price" as const, label: "Price" },
                      ] as const
                    ).map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setSortBy(chip.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          sortBy === chip.id
                            ? "bg-primary text-text-leaf shadow-md"
                            : "bg-soft-green dark:bg-[#224425] text-text-leaf dark:text-white border border-soft-green dark:border-[#2a4a2d] hover:border-primary/40"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-soft-green dark:border-[#2a4a2d] pt-4">
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm font-bold text-subtext-leaf hover:text-primary underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-center py-20 text-subtext-leaf font-semibold">Loading venues…</p>
        ) : loadError ? (
          <p className="text-center py-20 text-red-600 dark:text-red-400 font-semibold">{loadError}</p>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleApi.map((v) => (
                <SustainableVenueCard
                  key={v.id}
                  venue={apiVenueToSustainableVenue(v)}
                  onSelect={(card) => {
                    navigate("/organizer/events/create", {
                      state: {
                        preselectedVenueId: card.id,
                        selectedVenue: { id: card.id, name: card.name, location: card.location },
                      },
                    });
                  }}
                />
              ))}
            </section>

            {visibleApi.length === 0 ? (
              <p className="text-center py-16 text-subtext-leaf">
                No venues match these filters. Try clearing filters or broadening your search.
              </p>
            ) : null}

            <footer className="mt-16 flex flex-col items-center gap-6">
              {hasMore ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-white dark:bg-[#1a3a1d] border-2 border-soft-green dark:border-[#2a4a2d] rounded-xl font-bold text-text-leaf dark:text-white hover:border-primary transition-all"
                >
                  Load more venues
                </button>
              ) : null}
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">
                Showing {visibleApi.length} of {filteredSorted.length} matching venues
                {ecoListedCount > 0 ? (
                  <span className="block mt-1 text-xs">
                    {ecoListedCount} eco-certified in directory ({venues.length} total listed)
                  </span>
                ) : (
                  <span className="block mt-1 text-xs">{venues.length} venues in directory</span>
                )}
              </div>
            </footer>
          </>
        )}
      </main>

      <button
        type="button"
        className="fixed bottom-8 right-8 h-14 w-14 bg-text-leaf dark:bg-white text-white dark:text-background-dark rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-40"
        aria-label="Help / Support"
      >
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
}
