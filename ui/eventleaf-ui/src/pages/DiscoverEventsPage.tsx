import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { EVENTS } from "../data/events";

const CITIES = ["All Cities", ...Array.from(new Set(EVENTS.map((event) => event.city)))] as const;
const CATEGORIES = ["All Categories", ...Array.from(new Set(EVENTS.map((event) => event.category)))] as const;

type SortOption = "date" | "score" | "name";

export function DiscoverEventsPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<(typeof CITIES)[number]>("All Cities");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All Categories");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = EVENTS.filter((event) => {
      const matchesQuery =
        query.length === 0 ||
        event.name.toLowerCase().includes(query) ||
        event.venueName.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query);
      const matchesCity = city === "All Cities" || event.city === city;
      const matchesCategory = category === "All Categories" || event.category === category;
      return matchesQuery && matchesCity && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === "score") return b.sustainabilityScore - a.sustainabilityScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.dateLabel.localeCompare(b.dateLabel);
    });
  }, [search, city, category, sortBy]);

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

        <section className="mb-8 rounded-2xl border border-border-green bg-white dark:bg-white/5 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold">
              Search
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Event, city, venue..."
                className="mt-1 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <label className="text-sm font-semibold">
              City
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as (typeof CITIES)[number])}
                className="mt-1 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CITIES.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                className="mt-1 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CATEGORIES.map((categoryOption) => (
                  <option key={categoryOption} value={categoryOption}>
                    {categoryOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold">
              Sort by
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="mt-1 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="date">Date</option>
                <option value="score">Sustainability Score</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-subtext-leaf">
            Showing {filtered.length} event{filtered.length === 1 ? "" : "s"}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <article
              key={event.slug}
              className="overflow-hidden rounded-2xl border border-border-green bg-white dark:bg-white/5 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <div className="relative h-48">
                <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover" />
                <EcoCertifiedBadge variant="card" className="absolute top-3 left-3">
                  Eco-Certified Event
                </EcoCertifiedBadge>
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
                <Link
                  to={`/events/${event.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-background-dark hover:brightness-95 transition-all mt-auto self-start"
                >
                  View Event
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
