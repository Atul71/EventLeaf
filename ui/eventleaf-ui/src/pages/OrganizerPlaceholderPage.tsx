import { Link, useLocation } from "react-router-dom";
import { Logo } from "../components/Logo";

const navItems = [
  { path: "/organizer", icon: "dashboard", label: "Overview" },
  { path: "/organizer/events", icon: "event", label: "My Events" },
  { path: "/organizer/venues", icon: "location_on", label: "Browse Sustainable Venues" },
  { path: "/organizer/vendors", icon: "storefront", label: "Eco-Vendors" },
  { path: "/organizer/impact", icon: "analytics", label: "Impact Reports" },
];

type CreateEventState = { selectedVenue?: { id: string; name: string; location: string } };

export function OrganizerPlaceholderPage() {
  const location = useLocation();
  const state = location.state as CreateEventState | null;
  const selectedVenue = state?.selectedVenue;

  const title =
    location.pathname === "/organizer/events/create"
      ? "Create eco-friendly event"
      : location.pathname === "/organizer/events"
        ? "My Events"
        : location.pathname === "/organizer/vendors"
          ? "Eco-Vendors"
          : location.pathname === "/organizer/impact"
            ? "Impact Reports"
            : location.pathname === "/organizer/settings"
              ? "Account Settings"
              : "Page";

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <aside className="w-72 border-r border-border-green bg-white dark:bg-[#152a17] hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Logo />
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-text-leaf font-semibold border-l-4 border-primary"
                    : "text-subtext-leaf hover:bg-background-light dark:hover:bg-white/5"
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? "fill" : ""}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border-green">
          <Link
            to="/organizer/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-subtext-leaf hover:bg-background-light dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Account Settings</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-primary/50 mb-4 block">
            construction
          </span>
          <h1 className="text-2xl font-bold text-text-leaf dark:text-white mb-2">{title}</h1>
          {selectedVenue && (
            <p className="text-primary font-semibold mb-2">
              Venue: {selectedVenue.name} · {selectedVenue.location}
            </p>
          )}
          <p className="text-subtext-leaf mb-6">
            {location.pathname === "/organizer/events/create"
              ? "The full create-event form will go here. You selected a sustainable venue from the browser."
              : "This section is not built yet. Use the sidebar to open Overview or Browse Sustainable Venues."}
          </p>
          <Link
            to="/organizer"
            className="inline-flex items-center gap-2 bg-primary text-background-dark font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
