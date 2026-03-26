import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { fetchPublishedEvents, type ApiEvent } from "../api/eventleafApi";
import {
  certificationsFromApi,
  compactAgenda,
  ecoProofsFromApi,
  eventSearchBlob,
  matchesMinSustainabilityLeaves,
  matchesPaperlessOperations,
  matchesPublicTransitAccessible,
  matchesVerifiedGreenOnly,
  matchesWasteReductionFilter,
  sustainabilityScoreFromApi,
  venueImageUrlForEvent,
} from "../data/discoverPresentation";

const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function categoryLabel(c: string | null | undefined): string {
  if (!c) return "Event";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

type SortOption = "sustainability" | "capacity" | "price";

type DateRangeOption = "any" | "next7" | "next30" | "thisMonth";

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
      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 hover:bg-soft-green/60 dark:hover:bg-white/5 transition-colors"
    >
      <span className="pr-3 text-sm font-semibold text-text-leaf dark:text-white">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border border-soft-green/60 bg-white/50 accent-primary focus:ring-primary"
      />
    </label>
  );
}

export function DiscoverEventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [dateFilter, setDateFilter] = useState<DateRangeOption>("any");
  const [verifiedGreenOnly, setVerifiedGreenOnly] = useState(false);
  const [paperlessOnly, setPaperlessOnly] = useState(false);
  const [wasteOnly, setWasteOnly] = useState(false);
  const [transitOnly, setTransitOnly] = useState(false);
  const [minLeaves, setMinLeaves] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("sustainability");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublishedEvents(200)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || "Failed to load events");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      const raw = e.category?.trim();
      if (!raw) continue;
      set.add(categoryLabel(raw));
    }
    return ["All Types", ...Array.from(set).sort()];
  }, [events]);

  function startOfLocalDay(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  function isEventInDateRange(e: ApiEvent, range: DateRangeOption): boolean {
    if (range === "any") return true;
    const eventDayMs = parseEventDateToLocalDayMs(e.event_date);
    if (eventDayMs == null) return true;
    const now = new Date();
    const today = startOfLocalDay(now);
    const dayMs = 24 * 60 * 60 * 1000;

    if (range === "next7") {
      const end = today + 6 * dayMs;
      return eventDayMs >= today && eventDayMs <= end;
    }
    if (range === "next30") {
      const end = today + 29 * dayMs;
      return eventDayMs >= today && eventDayMs <= end;
    }
    // thisMonth
    const eventDate = new Date(eventDayMs);
    return (
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth()
    );
  }

  function parseEventDateToLocalDayMs(dateStr: string): number | null {
    // `event_date` is DATE-only in DB; treat "YYYY-MM-DD" as local date to avoid UTC off-by-one.
    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      const dt = new Date(y, mo, d);
      if (Number.isNaN(dt.getTime())) return null;
      return startOfLocalDay(dt);
    }
    const dt = new Date(dateStr);
    if (Number.isNaN(dt.getTime())) return null;
    return startOfLocalDay(dt);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = events.filter((event) => {
      const matchesQuery = query.length === 0 || eventSearchBlob(event).includes(query);

      if (!matchesQuery) return false;
      const eventType = categoryLabel(event.category);
      if (typeFilter !== "All Types" && eventType !== typeFilter) return false;
      if (!isEventInDateRange(event, dateFilter)) return false;
      if (verifiedGreenOnly && !matchesVerifiedGreenOnly(event)) return false;
      if (paperlessOnly && !matchesPaperlessOperations(event)) return false;
      if (wasteOnly && !matchesWasteReductionFilter(event)) return false;
      if (transitOnly && !matchesPublicTransitAccessible(event)) return false;
      if (minLeaves > 1 && !matchesMinSustainabilityLeaves(event, minLeaves)) return false;

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "capacity") return (b.total_capacity ?? 0) - (a.total_capacity ?? 0);
      if (sortBy === "price") return a.ticket_price - b.ticket_price;
      return sustainabilityScoreFromApi(b) - sustainabilityScoreFromApi(a);
    });
    return result;
  }, [
    events,
    search,
    typeFilter,
    dateFilter,
    verifiedGreenOnly,
    paperlessOnly,
    wasteOnly,
    transitOnly,
    minLeaves,
    sortBy,
  ]);

  function clearAllFilters() {
    setSearch("");
    setTypeFilter("All Types");
    setDateFilter("any");
    setVerifiedGreenOnly(false);
    setPaperlessOnly(false);
    setWasteOnly(false);
    setTransitOnly(false);
    setMinLeaves(1);
    setSortBy("sustainability");
    setAdvancedOpen(false);
  }

  const activeAdvancedCount = useMemo(() => {
    return (
      (paperlessOnly ? 1 : 0) +
      (wasteOnly ? 1 : 0) +
      (transitOnly ? 1 : 0) +
      (minLeaves > 1 ? 1 : 0)
    );
  }, [minLeaves, paperlessOnly, transitOnly, wasteOnly]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border-green px-3 py-2 text-sm font-bold hover:bg-soft-green transition-colors text-text-leaf dark:text-white"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors">
              Profile
            </Link>
            <Link
              to="/organizer/events/create"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark hover:brightness-95 transition-all"
            >
              Create Event
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
            Browse eco-focused events from the EventLeaf database — venue certifications, sustainability flags, and
            agenda-style highlights on every card.
          </p>
        </section>

        {loadError && (
          <div
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-100"
            role="alert"
          >
            <strong className="font-bold">Could not load events:</strong> {loadError}. Ensure the API is running on{" "}
            <code className="rounded bg-black/5 px-1">localhost:3000</code> and the database is seeded.
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-border-green bg-white dark:bg-white/5 p-5 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Eco-priority search</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Try LEED platinum venues…"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#f8fcf8] dark:bg-background-dark border border-soft-green/40 dark:border-[#2a4a2d] rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-base text-text-leaf dark:text-white placeholder:text-gray-500"
                    aria-label="Search events"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto">
                <label className="text-sm font-semibold">
                  Type
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Date
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateRangeOption)}
                    className="mt-1 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="any">Any time</option>
                    <option value="next7">Next 7 days</option>
                    <option value="next30">Next 30 days</option>
                    <option value="thisMonth">This month</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => setVerifiedGreenOnly((v) => !v)}
                  aria-pressed={verifiedGreenOnly}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    verifiedGreenOnly
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-soft-green/40 bg-[#f8fcf8]/70 dark:bg-black/20 text-text-leaf dark:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined">eco</span>
                  <span className="text-sm font-semibold">Eco-friendly only</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { id: "sustainability" as const, label: "Sustainability" },
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
                          ? "bg-primary text-background-dark shadow-sm"
                          : "bg-white/80 text-text-leaf dark:text-white border border-soft-green/50 hover:border-primary/40"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-sm font-bold text-subtext-leaf hover:text-primary underline-offset-2 hover:underline"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg border border-soft-green/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm font-bold text-text-leaf dark:text-white hover:border-primary/60 transition-colors"
                    aria-expanded={advancedOpen}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {advancedOpen ? "expand_less" : "expand_more"}
                    </span>
                    {activeAdvancedCount > 0 ? `Advanced (${activeAdvancedCount})` : "Advanced"}
                  </button>
                </div>
              </div>

              {advancedOpen ? (
                <div className="rounded-xl border border-soft-green/50 dark:border-[#2a4a2d] bg-[#f8fcf8]/80 dark:bg-black/20 p-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      <CheckboxRow
                        id="ev-vf-paperless"
                        label="Paperless tickets & check-in"
                        checked={paperlessOnly}
                        onChange={setPaperlessOnly}
                      />
                      <CheckboxRow
                        id="ev-vf-waste"
                        label="Waste reduction"
                        checked={wasteOnly}
                        onChange={setWasteOnly}
                      />
                      <CheckboxRow
                        id="ev-vf-transit"
                        label="Public transit access"
                        checked={transitOnly}
                        onChange={setTransitOnly}
                      />

                      <div className="rounded-xl border border-soft-green/50 dark:border-[#2a4a2d] bg-background-light/50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-subtext-leaf mb-2">
                          <span>Minimum leaves</span>
                          <span className="font-black text-primary">{minLeaves}/5</span>
                        </div>
                        <div className="rounded-xl border border-soft-green/50 bg-soft-green/10 p-3">
                          <div className="flex items-center justify-between gap-2">
                            {[1, 2, 3, 4, 5].map((n) => {
                              const filled = n <= minLeaves;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setMinLeaves(n)}
                                  aria-label={`Set minimum leaves to ${n}/5`}
                                  aria-pressed={minLeaves === n}
                                  className={`flex flex-1 items-center justify-center rounded-lg border px-1 py-2 transition-all ${
                                    filled
                                      ? "bg-primary border-primary text-text-leaf"
                                      : "bg-white/70 dark:bg-white/5 border-soft-green/60 text-subtext-leaf dark:text-subtext-leaf"
                                  }`}
                                >
                                  <span
                                    className={`material-symbols-outlined text-base ${
                                      filled ? "" : "opacity-90"
                                    }`}
                                  >
                                    eco
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-subtext-leaf">
                          Higher leaves = greener listings.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-soft-green/50 dark:border-[#2a4a2d] bg-background-light/50 dark:bg-white/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-2">Quick guidance</p>
                        <ul className="space-y-2 text-sm text-subtext-leaf">
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-base shrink-0">eco</span>
                            <span>Use “Eco-friendly only” if you want strictly green criteria.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-base shrink-0">bolt</span>
                            <span>Increase leaves for events with richer sustainability flags.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-subtext-leaf">
            {loading ? "Loading…" : `Showing ${filtered.length} event${filtered.length === 1 ? "" : "s"}`}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((event) => {
            const hero = event.image_url || FALLBACK_EVENT_IMAGE;
            const venueImg = venueImageUrlForEvent(event);
            const venueName = event.venue_name?.trim() || "Venue TBA";
            const cityStr = event.venue_city?.trim() || "";
            const priceLabel = event.ticket_price <= 0 ? "Free" : `$${event.ticket_price.toFixed(0)}`;
            const score = sustainabilityScoreFromApi(event);
            const certs = certificationsFromApi(event);
            const proofs = ecoProofsFromApi(event);
            const agenda = compactAgenda(event);

            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-border-green bg-white dark:bg-white/5 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                <div className="relative h-52 shrink-0">
                  <img src={hero} alt={event.title} className="h-full w-full object-cover" />
                  {event.is_eco_friendly ? (
                    <EcoCertifiedBadge variant="card" className="absolute top-3 left-3">
                      Eco-Certified Event
                    </EcoCertifiedBadge>
                  ) : (
                    <span className="absolute top-3 left-3 rounded-full border border-white/40 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                      Standard listing
                    </span>
                  )}
                </div>

                <div className="flex gap-2 border-b border-border-green bg-soft-green/20 dark:bg-white/5 px-3 py-2">
                  <img
                    src={venueImg}
                    alt=""
                    className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-border-green"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-subtext-leaf">Venue</p>
                    <p className="text-sm font-bold text-text-leaf dark:text-white truncate">{venueName}</p>
                    {certs.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {certs.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="inline-block max-w-[140px] truncate rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-leaf dark:text-white"
                            title={c}
                          >
                            {c}
                          </span>
                        ))}
                        {certs.length > 3 ? (
                          <span className="text-[9px] font-bold text-subtext-leaf">+{certs.length - 3}</span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-0.5 text-[10px] text-subtext-leaf">Certifications on file at venue</p>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex flex-col flex-1 min-h-0">
                  <h2 className="text-xl font-black dark:text-white leading-tight">{event.title}</h2>
                  <p className="text-sm text-subtext-leaf">
                    {formatEventDate(event.event_date)}
                    {cityStr ? ` · ${cityStr}` : ""}
                  </p>

                  {proofs.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-subtext-leaf mb-2">
                        Sustainability flags
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {proofs.slice(0, 3).map((p) => (
                          <li
                            key={p.title}
                            className="flex gap-2 rounded-lg border border-border-green/60 bg-background-light/80 dark:bg-white/5 p-2"
                          >
                            <span className="material-symbols-outlined text-primary text-lg shrink-0">{p.icon}</span>
                            <div className="min-w-0">
                              <p
                                className="text-xs font-bold text-text-leaf dark:text-white leading-tight"
                                title={p.detail}
                              >
                                {p.title}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-dashed border-border-green bg-neutral-bg/40 dark:bg-white/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-subtext-leaf mb-2">Day outline</p>
                    <ul className="space-y-1.5">
                      {agenda
                        .filter((_, i) => i === 0 || i === agenda.length - 1)
                        .map((row, i) => (
                          <li key={`${row.time}-${row.title}-${i}`} className="flex gap-2 text-xs">
                            <span className="w-12 shrink-0 font-mono font-bold text-primary">{row.time}</span>
                            <span className="text-subtext-leaf font-medium">{row.title}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-soft-green px-2.5 py-1 text-xs font-bold">
                      {categoryLabel(event.category)}
                    </span>
                    <span className="rounded-full border border-border-green px-2.5 py-1 text-xs font-bold">{priceLabel}</span>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold">
                      Score {score.toFixed(1)}/5
                    </span>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-background-dark hover:brightness-95 transition-all mt-auto self-start"
                  >
                    View Event
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
