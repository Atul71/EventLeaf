import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OrganizerSidebar } from "../components/organizer/OrganizerSidebar";
import { BackButton } from "../components/BackButton";
import { fetchCurrentUser, fetchMyEvents, type ApiEvent } from "../api/eventleafApi";

function eventDateLabel(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventsTab, setEventsTab] = useState<"live" | "draft">("live");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCurrentUser()
      .then(async () => {
        const all = await fetchMyEvents(500);
        if (cancelled) return;
        setEvents(all);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        if ((e.message || "").toLowerCase().includes("missing auth") || (e.message || "").toLowerCase().includes("unauthorized")) {
          navigate("/login");
          return;
        }
        setError(e.message || "Could not load your events.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, location.key]);

  const liveEvents = useMemo(() => events.filter((e) => e.status === "published"), [events]);
  const draftEvents = useMemo(() => events.filter((e) => e.status !== "published"), [events]);

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

  const searchExcludesAll =
    events.length > 0 && search.trim().length > 0 && filteredDrafts.length === 0 && filteredLive.length === 0;

  const ecoCount = liveEvents.filter((e) => e.is_eco_friendly).length;
  const totalCapacity = liveEvents.reduce((sum, e) => sum + (e.total_capacity ?? 0), 0);

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <OrganizerSidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-green px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BackButton fallbackTo="/events" />
            <h1 className="text-lg font-bold leading-none text-text-leaf dark:text-white">Organizer Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-4 py-2 bg-background-light dark:bg-white/5 border-none rounded-lg focus:ring-2 focus:ring-primary w-64 text-sm text-text-leaf dark:text-white placeholder-subtext-leaf/50"
              placeholder="Search my events..."
              type="text"
              aria-label="Search events"
            />
            <Link
              to="/events"
              className="flex items-center gap-2 border border-border-green bg-white dark:bg-white/5 hover:bg-background-light dark:hover:bg-white/10 text-text-leaf dark:text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">travel_explore</span>
              <span>Discover Events</span>
            </Link>
            <Link to="/organizer/events/create" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm">
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span>Create Event</span>
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-border-green shadow-sm">
              <p className="text-sm font-medium text-subtext-leaf">Live events</p>
              <h3 className="text-3xl font-black text-text-leaf dark:text-white">{liveEvents.length}</h3>
            </div>
            <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-border-green shadow-sm">
              <p className="text-sm font-medium text-subtext-leaf">Drafts</p>
              <h3 className="text-3xl font-black text-text-leaf dark:text-white">{draftEvents.length}</h3>
            </div>
            <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-border-green shadow-sm">
              <p className="text-sm font-medium text-subtext-leaf">Eco-friendly (live)</p>
              <h3 className="text-3xl font-black text-text-leaf dark:text-white">{ecoCount}</h3>
            </div>
            <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-border-green shadow-sm">
              <p className="text-sm font-medium text-subtext-leaf">Total capacity (live)</p>
              <h3 className="text-3xl font-black text-text-leaf dark:text-white">{totalCapacity.toLocaleString()}</h3>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">My events</h2>
              <Link to="/organizer/events" className="text-sm font-bold text-primary hover:underline">
                Open full My Events
              </Link>
            </div>

            {loading ? <p className="text-subtext-leaf">Loading your events...</p> : null}
            {error ? <p className="text-red-700 dark:text-red-300">{error}</p> : null}

            {!loading && !error && events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-green p-8 bg-white dark:bg-[#152a17] text-center">
                <p className="font-semibold text-subtext-leaf">No events yet. Create an event to see it here.</p>
                <Link to="/organizer/events/create" className="inline-flex mt-4 items-center gap-2 bg-primary text-background-dark font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90">
                  <span className="material-symbols-outlined">add_circle</span>
                  Create your first event
                </Link>
              </div>
            ) : null}

            {!loading && !error && searchExcludesAll ? (
              <div className="rounded-xl border border-dashed border-border-green p-8 bg-white dark:bg-[#152a17] text-center">
                <p className="font-semibold text-subtext-leaf">No events match your search. Try another keyword.</p>
              </div>
            ) : null}

            {!loading && !error && events.length > 0 && !searchExcludesAll ? (
              <div className="space-y-4">
                <div
                  className="flex flex-wrap gap-1 rounded-xl border border-border-green bg-background-light p-1 dark:bg-white/5 w-fit"
                  role="tablist"
                  aria-label="Event status"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-dash-events-live"
                    aria-selected={eventsTab === "live"}
                    aria-controls="panel-dash-events-live"
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
                    id="tab-dash-events-draft"
                    aria-selected={eventsTab === "draft"}
                    aria-controls="panel-dash-events-draft"
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
                  <div id="panel-dash-events-live" role="tabpanel" aria-labelledby="tab-dash-events-live" className="space-y-4">
                    {filteredLive.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border-green p-8 bg-white dark:bg-[#152a17] text-center">
                        <p className="font-semibold text-subtext-leaf">No live events{draftEvents.length > 0 ? ". Open Drafts to publish or edit." : "."}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredLive.slice(0, 6).map((e) => {
                          const sold = Math.max(0, (e.total_capacity ?? 0) - (e.available_tickets ?? 0));
                          const soldPct = e.total_capacity > 0 ? Math.min(100, Math.round((sold / e.total_capacity) * 100)) : 0;
                          return (
                            <div key={e.id} className="bg-white dark:bg-[#152a17] rounded-xl border border-border-green overflow-hidden shadow-sm">
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="font-bold text-lg text-text-leaf dark:text-white">{e.title}</h4>
                                  {e.is_eco_friendly ? <span className="rounded-full bg-primary/20 px-2 py-1 text-[10px] font-bold">Eco</span> : null}
                                </div>
                                <p className="text-xs text-subtext-leaf mt-1">{eventDateLabel(e.event_date)}</p>
                                <p className="text-xs text-subtext-leaf">{e.venue_name ?? "Venue TBD"}{e.venue_city ? `, ${e.venue_city}` : ""}</p>
                                <div className="mt-4">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span>Tickets sold</span>
                                    <span>{soldPct}%</span>
                                  </div>
                                  <div className="w-full bg-background-light dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div className="bg-primary h-full" style={{ width: `${soldPct}%` }} />
                                  </div>
                                </div>
                                <Link to={`/events/${e.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                                  View event <span className="material-symbols-outlined text-sm">open_in_new</span>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div id="panel-dash-events-draft" role="tabpanel" aria-labelledby="tab-dash-events-draft" className="space-y-4">
                    {filteredDrafts.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border-green p-8 bg-white dark:bg-[#152a17] text-center">
                        <p className="font-semibold text-subtext-leaf">
                          No drafts{liveEvents.length > 0 ? ". Your published events are under Live." : "."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredDrafts.slice(0, 6).map((e) => (
                          <div key={e.id} className="bg-white dark:bg-[#152a17] rounded-xl border border-dashed border-amber-400/50 overflow-hidden shadow-sm">
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-bold text-lg text-text-leaf dark:text-white">{e.title}</h4>
                                <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-1 text-[10px] font-bold text-amber-950 dark:text-amber-100">Draft</span>
                              </div>
                              <p className="text-xs text-subtext-leaf mt-1">{eventDateLabel(e.event_date)}</p>
                              <p className="text-xs text-subtext-leaf">{e.venue_name ?? "Venue TBD"}{e.venue_city ? `, ${e.venue_city}` : ""}</p>
                              <p className="mt-3 text-xs text-subtext-leaf">Not visible on Discover until you publish.</p>
                              <Link to={`/events/${e.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                                Preview <span className="material-symbols-outlined text-sm">visibility</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
