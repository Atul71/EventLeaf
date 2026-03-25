import { Link, useLocation } from "react-router-dom";
import { OrganizerSidebar } from "../components/organizer/OrganizerSidebar";

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
        : location.pathname === "/organizer/settings"
          ? "Account Settings"
          : "Page";

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <OrganizerSidebar />
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
            {location.pathname === "/organizer/events"
              ? "Create and manage events from the guided wizard."
              : "This section is not built yet. Use the sidebar to open Overview or Browse Sustainable Venues."}
          </p>
          {location.pathname === "/organizer/events" && (
            <Link
              to="/organizer/events/create"
              className="inline-flex items-center gap-2 bg-primary text-background-dark font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90 mb-4"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Create event (wizard)
            </Link>
          )}
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
