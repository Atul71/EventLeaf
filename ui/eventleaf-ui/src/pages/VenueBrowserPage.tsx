import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  SustainableVenueCard,
  type SustainableVenue,
} from "../components/organizer/SustainableVenueCard";

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDs_L3pushL4zjQauvrzIXPxi9FBCxLGReg3oKJzqe88_2RYkm1kyTAwL8Ct0pDRGlcvQco8PFwsL67TcgneGeB1P9zYdu7fiY1DtcGJ7so4mufjYI_QxyXdfzvtndQi0tAMhuKu_C1jws0sxHYWtMlOdCEhxLASvVviJjV5qMeu_Jg2bTZtuyFT-JOWZXWWrfXEt1a8kFxXLm3IQq8nkY9PjIEi9kVdhWP1HunX3pFveEQ7g7PIcTkXFMzo2yC8zpmk9a7n-E7QRk";

const SUSTAINABLE_VENUES: SustainableVenue[] = [
  {
    id: "1",
    name: "The Solar Atrium",
    location: "San Francisco, CA",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUgZyAF6_kz7YAFvp-Bb-k3gVyjjyzrYTuCA9VHstWph8Wb4JbIcpx82Y0jubQ8AT_aZEQrXu8CRNomu4-772Ti9jync7r-VNNHC67wobeQ8t9qU7rkybGSAvUit84L6TIu56NJQJToJCgPacH6e-LH5gno1AwWJwyhJJOd9lw8LoIRmXYRxvvzsNVYBuca-R3J19zDvLxkvsTa7whSGEiXtneTcXoB1VigmyTpAvqBge8JxmGdBv21tuQFpwgmQCNNS_gKq_8m0c",
    imageAlt: "Modern glass building atrium with lush indoor plants",
    rating: 4.8,
    sustainabilityIndex: 4.8,
    capacity: "500 cap",
    isEcoCertified: true,
    featureTags: [
      { icon: "meeting_room", label: "Green Auditorium" },
      { icon: "bolt", label: "100% Solar" },
    ],
  },
  {
    id: "2",
    name: "Green Canopy Hall",
    location: "Portland, OR",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGDBAz27shXp6Z18jaL8qQTwf2HB7yngyvulwqIl511G5garKONhBhzIm4Lzef8AgVFGziHtskGnXeuBqSJp7NVPcYwG3QlK0gKdOutllKzAPn1IvF0QhPEGScGqxbRy3ViSHh8xDa5H_tvmP6PngtryucMCTHvZY8HRfsBwlNm_DdZlczOZHB6o1z2VynrR318LEkZJsf8I16vbyMVzvTQQgJTU4MFbt-vB6-jU7GYtp-3PtiUN5sckd60ZyqkcQTkicQbjCyqSU",
    imageAlt: "Industrial chic event space with hanging plants and natural light",
    rating: 4.5,
    sustainabilityIndex: 4.5,
    capacity: "1200 cap",
    isEcoCertified: true,
    featureTags: [
      { icon: "delete_sweep", label: "Zero Waste" },
      { icon: "verified", label: "LEED Gold" },
    ],
  },
  {
    id: "3",
    name: "Eco-Vista Center",
    location: "Seattle, WA",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrEq-ZEKATUnd5lJojsM_eW8VcSjz7PPpp0xOUliAZI1ChhRhgxrcFAi3-daQsfwGUOUYZxl-U0a-nMpalltepVVbJ4OF23zFvDjVg0j197nN3TZ66KLKteSsbeYeK_Aoq0se0L6PbLnixNOcLJRuKZkXyvL1dWPHqRHBP_yPay0NKn41AAcGWm9vi1pNhrzFUXTOXAVl9dTg9-KQVbKESuotZX76YF7mNQnkdmSV3TheNi4KKA1PhpPvnJMQhUro_QI90LN821Ds",
    imageAlt: "Futuristic sustainable conference center with wood and glass architecture",
    rating: 4.9,
    sustainabilityIndex: 4.9,
    capacity: "350 cap",
    isEcoCertified: true,
    featureTags: [
      { icon: "compost", label: "Bio-Garden" },
      { icon: "water_drop", label: "Rain Harvest" },
    ],
  },
  {
    id: "4",
    name: "Renewable Roots Pavilion",
    location: "Austin, TX",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1rtHAMrSm8ECACxlIE8NdpXTQpIDEJLWThS3dAdb1ngz0dy_NzyjTF-6lXkzATWcMDkJqSH_b0RRdfTfKWNNj_HcissS7UL6hjwAaNnvRrkvB-yZGXPgYWFAR7Nsyoz1EiVpAaVr9eAvAoitvB5qXazuawGuo5mNCOSGHkwfpiVrX5c0NWBQa0SkeZPYfiDTSUDxlumnnSuvosLlaA1b4aGjzJjHI6R-jU4Y_rB8f1Z9qdJVuIUzq86Gvd4mhPrUIfIHccX9FLmc",
    imageAlt: "Rustic modern space with vertical gardens and reclaimed wood",
    rating: 4.2,
    sustainabilityIndex: 4.2,
    capacity: "200 cap",
    isEcoCertified: true,
    featureTags: [
      { icon: "forest", label: "Urban Garden" },
      { icon: "lightbulb", label: "Low Energy" },
    ],
  },
  {
    id: "5",
    name: "Earth-First Ballroom",
    location: "Chicago, IL",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMR_fVwizOG-OxDMFrhNdDxOdeLA2iPM2hXgmBHwgjJxXj_Yq4WIYXDhHSedxMkZak7pJpM5LSC8bl-gEGtgiroAYkCfTv-d1gdTUfq5thk6Hre1X_RwCugghsuY5iF2fRA3LkVM9kdd_s3aVtHf5C-qxLNJVK3UQGwbwZ1KNCV8F6oyL5oXogHrZAu2CoYZTXvHe0O5TC-lQCXc1JQDz0OTZUGm71-3VCA1X_b84FC24J8n_R6TthwkrB0TWx2QlClEwYzLl0br0",
    imageAlt: "Grand elegant ballroom with modern energy-efficient lighting",
    rating: 4.7,
    sustainabilityIndex: 4.7,
    capacity: "2500 cap",
    isEcoCertified: true,
    featureTags: [
      { icon: "energy_savings_leaf", label: "Carbon Neutral" },
      { icon: "wind_power", label: "Wind Energy" },
    ],
  },
  {
    id: "6",
    name: "Sustainable Skies Lounge",
    location: "New York, NY",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxW2_MBXE7Kjt9RehcaSo8PgEuUHoLUFQZdHqgNS5-QjN2pZczLjlmeIMd5XURmIePzEd20kmH4j_K4_nfWDnvxk_CkxfWYxVDU-R8Qq6Fm4ZcIMNtkHByduJDHhNfd2-sxenBJYKGHHibTg8TJjxHg4fDtqpaX5ktFqDFQDsCleG9OxQBHHw-KJoZZRz8u7BIwRLEPMplpeXiQzKLxXIsLqTyJAHDSbiC7jQoxT7zBvgH5OsjPvFOU5qR0oCGJyjDOQSI8Uopp2Y",
    imageAlt: "Rooftop event lounge with solar panels and panoramic city views",
    rating: 4.6,
    sustainabilityIndex: 4.6,
    capacity: "150 cap",
    isEcoCertified: true,
    featureTags: [
      { icon: "wb_sunny", label: "Solar Roof" },
      { icon: "local_dining", label: "Organic F&B" },
    ],
  },
];

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

  const filteredVenues = SUSTAINABLE_VENUES.filter((v) => {
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
                navigate("/organizer/events", {
                  state: { selectedVenue: { id: v.id, name: v.name, location: v.location } },
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
