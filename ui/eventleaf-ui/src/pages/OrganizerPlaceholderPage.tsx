import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OrganizerSidebar } from "../components/organizer/OrganizerSidebar";
import { fetchCurrentUser, fetchMyEvents, publishEventById, type ApiEvent } from "../api/eventleafApi";

type CreateEventState = { selectedVenue?: { id: string; name: string; location: string }; editEvent?: ApiEvent };
type WizardReturnState = { draftSaved?: boolean; eventTitle?: string; newEvent?: ApiEvent };

export function OrganizerPlaceholderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CreateEventState | null;
  const selectedVenue = state?.selectedVenue;
  const wizardState = location.state as WizardReturnState | null;
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(location.pathname === "/organizer/events");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [eventsTab, setEventsTab] = useState<"live" | "draft">("live");

  useEffect(() => {
    if (location.pathname !== "/organizer/events") return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchCurrentUser()
      .then(async () => {
        const all = await fetchMyEvents(500);
        if (cancelled) return;
        const st = location.state as WizardReturnState | null;
        if (st?.newEvent) {
          const rest = all.filter((e) => e.id !== st.newEvent!.id);
          setEvents([st.newEvent, ...rest]);
        } else {
          setEvents(all);
        }
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const msg = (e.message || "").toLowerCase();
        if (msg.includes("missing auth") || msg.includes("unauthorized")) {
          navigate("/login");
          return;
        }
        setLoadError(e.message || "Could not load your events.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.key, navigate]);

  useEffect(() => {
    const st = location.state as WizardReturnState | null;
    if (st?.draftSaved) setEventsTab("draft");
  }, [location.state]);

  const liveEvents = useMemo(() => events.filter((e) => e.status === "published"), [events]);
  const draftEvents = useMemo(() => events.filter((e) => e.status !== "published"), [events]);

  const filteredDrafts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return draftEvents;
    return draftEvents.filter((e) => {
      return (
        e.title.toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q) ||
        (e.venue_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [draftEvents, search]);

  const filteredLive = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return liveEvents;
    return liveEvents.filter((e) => {
      return (
        e.title.toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q) ||
        (e.venue_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [liveEvents, search]);

  const searchExcludesAll =
    events.length > 0 && search.trim().length > 0 && filteredDrafts.length === 0 && filteredLive.length === 0;

  async function handlePublish(id: string) {
    setLoadError(null);
    setPublishingId(id);
    try {
      await publishEventById(id);
      const all = await fetchMyEvents(500);
      setEvents(all);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setPublishingId(null);
    }
  }

  if (location.pathname === "/organizer/events") {
    return (
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
        <OrganizerSidebar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-black text-text-leaf dark:text-white">My Events</h1>
              <div className="flex items-center gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search my events"
                  className="rounded-lg border border-border-green bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/10"
                />
                <Link
                  to="/organizer/events/create"
                  className="inline-flex items-center gap-2 bg-primary text-background-dark font-bold px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create Event
                </Link>
              </div>
            </div>

            {wizardState?.draftSaved ? (
              <div
                className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-text-leaf dark:text-white"
                role="status"
              >
                Draft saved{wizardState.eventTitle ? `: “${wizardState.eventTitle}”` : ""}. It stays private until you publish it
                below or from the preview page.
              </div>
            ) : null}

            {loading ? <p className="text-subtext-leaf">Loading your events...</p> : null}
            {loadError ? <p className="text-red-700 dark:text-red-300">{loadError}</p> : null}

            {!loading && !loadError && events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-green bg-white dark:bg-[#152a17] p-8 text-center">
                <p className="font-semibold text-subtext-leaf">No events yet. Create an event to see it here.</p>
                <Link
                  to="/organizer/events/create"
                  className="inline-flex mt-4 items-center gap-2 bg-primary text-background-dark font-bold px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create Event
                </Link>
              </div>
            ) : null}

            {!loading && !loadError && searchExcludesAll ? (
              <div className="rounded-xl border border-dashed border-border-green bg-white dark:bg-[#152a17] p-8 text-center">
                <p className="font-semibold text-subtext-leaf">No events match your search. Try a different keyword.</p>
              </div>
            ) : null}

            {!loading && !loadError && events.length > 0 && !searchExcludesAll ? (
              <div className="space-y-4">
                <div
                  className="flex flex-wrap gap-1 rounded-xl border border-border-green bg-background-light p-1 dark:bg-white/5 w-fit"
                  role="tablist"
                  aria-label="Event status"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-my-events-live"
                    aria-selected={eventsTab === "live"}
                    aria-controls="panel-my-events-live"
                    onClick={() => setEventsTab("live")}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                      eventsTab === "live"
                        ? "bg-white text-text-leaf shadow-sm dark:bg-[#152a17] dark:text-white"
                        : "text-subtext-leaf hover:text-text-leaf dark:hover:text-white"
                    }`}
                  >
                    Live ({filteredLive.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-my-events-draft"
                    aria-selected={eventsTab === "draft"}
                    aria-controls="panel-my-events-draft"
                    onClick={() => setEventsTab("draft")}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                      eventsTab === "draft"
                        ? "bg-white text-text-leaf shadow-sm dark:bg-[#152a17] dark:text-white"
                        : "text-subtext-leaf hover:text-text-leaf dark:hover:text-white"
                    }`}
                  >
                    Drafts ({filteredDrafts.length})
                  </button>
                </div>

                {eventsTab === "live" ? (
                  <div id="panel-my-events-live" role="tabpanel" aria-labelledby="tab-my-events-live" className="space-y-3">
                    {filteredLive.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border-green bg-white dark:bg-[#152a17] p-8 text-center">
                        <p className="font-semibold text-subtext-leaf">No live events{draftEvents.length > 0 ? ". Switch to Drafts to continue editing." : "."}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredLive.map((e) => (
                          <article key={e.id} className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
                            <h3 className="text-lg font-bold text-text-leaf dark:text-white">{e.title}</h3>
                            <p className="mt-1 text-xs text-subtext-leaf">{e.event_date}</p>
                            <p className="text-xs text-subtext-leaf">{e.venue_name ?? "Venue TBD"}{e.venue_city ? `, ${e.venue_city}` : ""}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs">
                              <span className="rounded-full bg-primary/15 px-2 py-1 font-bold uppercase text-primary">live</span>
                              <span className="rounded-full bg-neutral-bg px-2 py-1 font-bold uppercase">{e.category ?? "event"}</span>
                              {e.is_eco_friendly ? <span className="rounded-full bg-primary/20 px-2 py-1 font-bold uppercase">eco</span> : null}
                            </div>
                            <Link to={`/events/${e.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                              Open event <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </Link>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div id="panel-my-events-draft" role="tabpanel" aria-labelledby="tab-my-events-draft" className="space-y-3">
                    {filteredDrafts.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border-green bg-white dark:bg-[#152a17] p-8 text-center">
                        <p className="font-semibold text-subtext-leaf">
                          No drafts{liveEvents.length > 0 ? ". Switch to Live to see published events." : ". Save from the create wizard to add one."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredDrafts.map((e) => (
                          <article
                            key={e.id}
                            className="rounded-xl border border-dashed border-amber-400/50 bg-white dark:bg-[#152a17] p-5 shadow-sm"
                          >
                            <h3 className="text-lg font-bold text-text-leaf dark:text-white">{e.title}</h3>
                            <p className="mt-1 text-xs text-subtext-leaf">{e.event_date}</p>
                            <p className="text-xs text-subtext-leaf">{e.venue_name ?? "Venue TBD"}{e.venue_city ? `, ${e.venue_city}` : ""}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-1 font-bold uppercase text-amber-950 dark:text-amber-100">
                                draft
                              </span>
                              <span className="rounded-full bg-neutral-bg px-2 py-1 font-bold uppercase">{e.category ?? "event"}</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Link
                                to={`/events/${e.id}`}
                                className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                              >
                                Preview <span className="material-symbols-outlined text-sm">visibility</span>
                              </Link>
                              <Link
                                to="/organizer/events/create"
                                state={{ editEvent: e }}
                                className="inline-flex items-center gap-1 rounded-lg border border-border-green px-3 py-1.5 text-sm font-bold hover:bg-soft-green/60 dark:border-white/20 dark:hover:bg-white/10"
                              >
                                Edit <span className="material-symbols-outlined text-sm">edit</span>
                              </Link>
                              <button
                                type="button"
                                disabled={publishingId === e.id}
                                onClick={() => void handlePublish(e.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-text-leaf px-3 py-1.5 text-sm font-bold text-white dark:bg-white dark:text-text-leaf disabled:opacity-50"
                              >
                                {publishingId === e.id ? "Publishing…" : "Publish"}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    );
  }

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
