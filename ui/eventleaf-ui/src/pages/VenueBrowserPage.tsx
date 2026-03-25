import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SustainableVenueCard } from "../components/organizer/SustainableVenueCard";
import { BE102_VENUES } from "../mocks/be102Venues";

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDs_L3pushL4zjQauvrzIXPxi9FBCxLGReg3oKJzqe88_2RYkm1kyTAwL8Ct0pDRGlcvQco8PFwsL67TcgneGeB1P9zYdu7fiY1DtcGJ7so4mufjYI_QxyXdfzvtndQi0tAMhuKu_C1jws0sxHYWtMlOdCEhxLASvVviJjV5qMeu_Jg2bTZtuyFT-JOWZXWWrfXEt1a8kFxXLm3IQq8nkY9PjIEi9kVdhWP1HunX3pFveEQ7g7PIcTkXFMzo2yC8zpmk9a7n-E7QRk";

const QUICK_FILTERS = [
  { id: "solar", icon: "wb_sunny", label: "Solar Powered" },
  { id: "zerowaste", icon: "recycling", label: "Zero Waste" },
  { id: "leed", icon: "verified", label: "LEED Platinum" },
  { id: "water", icon: "water_drop", label: "Water Conscious" },
];

const TOTAL_VENUE_COUNT = 142;

export function VenueBrowserPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(6);

  const filteredVenues = BE102_VENUES.filter((v) => {
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.featureTags.some((t) =>
        t.label.toLowerCase().includes(search.toLowerCase())
      );
    if (!matchesSearch) return false;
    if (activeQuickFilter === "solar")
      return v.featureTags.some((t) => /solar|sun|renewable|wind|bolt/i.test(t.label));
    if (activeQuickFilter === "zerowaste")
      return v.featureTags.some((t) => /zero waste|recycl|compost/i.test(t.label));
    if (activeQuickFilter === "leed")
      return v.featureTags.some((t) => /leed/i.test(t.label));
    if (activeQuickFilter === "water")
      return v.featureTags.some((t) => /water|rain|harvest/i.test(t.label));
    return true;
  });

  const visibleVenues = filteredVenues.slice(0, displayCount);
  const hasMore = displayCount < filteredVenues.length;

  const handleLoadMore = () => {
    setDisplayCount((n) => Math.min(n + 6, filteredVenues.length));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-soft-green dark:border-[#1a3a1d] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <Link
              to="/organizer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-subtext-leaf hover:text-primary hover:bg-soft-green dark:hover:bg-white/5 transition-colors shrink-0"
              aria-label="Back to Organizer Dashboard"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link to="/" className="flex items-center gap-2 text-text-leaf dark:text-white shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">
                energy_savings_leaf
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">EventLeaf</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/organizer/venues"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Venues
              </Link>
              <Link
                to="/organizer/events"
                className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors"
              >
                Events
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/organizer"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-bold border border-soft-green dark:border-[#2a4a2d] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-text-leaf dark:text-white"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span className="hidden sm:inline">Organizer Dashboard</span>
            </Link>
            <Link
              to="/profile"
              className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-primary/30 transition-all"
              aria-label="View profile"
            >
              <img
                src={USER_AVATAR}
                alt="User profile"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Hero Search Section */}
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-text-leaf dark:text-white mb-2 leading-tight">
              Sustainable Venue Browser
            </h2>
            <p className="text-subtext-leaf text-lg">
              Curated eco-certified spaces for carbon-neutral events.
            </p>
          </div>

          {/* Search and Advanced Filters */}
          <div className="bg-white dark:bg-[#1a3a1d] p-4 rounded-2xl shadow-sm border border-soft-green dark:border-[#2a4a2d]">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search venues by name, city, or feature..."
                  className="w-full pl-12 pr-4 py-3 bg-[#f8fcf8] dark:bg-background-dark border-none rounded-xl focus:ring-2 focus:ring-primary text-base text-text-leaf dark:text-white placeholder-gray-500"
                  aria-label="Search venues"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 bg-primary text-text-leaf font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined">tune</span>
                Advanced Eco-Filters
              </button>
            </div>
            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-soft-green dark:border-[#2a4a2d]">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    setActiveQuickFilter(activeQuickFilter === f.id ? null : f.id)
                  }
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                    activeQuickFilter === f.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-soft-green dark:bg-[#2a4a2d] text-text-leaf dark:text-white hover:bg-primary/20 border border-transparent"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Venue Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleVenues.map((venue) => (
            <SustainableVenueCard
              key={venue.id}
              venue={venue}
              onSelect={(v) => {
                navigate("/organizer/events/create", {
                  state: { preselectedVenueId: v.id, selectedVenue: { id: v.id, name: v.name, location: v.location } },
                });
              }}
            />
          ))}
        </section>

        {/* Pagination / Load More */}
        <footer className="mt-16 flex flex-col items-center gap-6">
          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              className="px-8 py-3 bg-white dark:bg-[#1a3a1d] border-2 border-soft-green dark:border-[#2a4a2d] rounded-xl font-bold text-text-leaf dark:text-white hover:border-primary transition-all"
            >
              Load More Venues
            </button>
          ) : null}
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing {visibleVenues.length} of {TOTAL_VENUE_COUNT} sustainable venues
          </div>
        </footer>
      </main>

      {/* Floating Help Button */}
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
