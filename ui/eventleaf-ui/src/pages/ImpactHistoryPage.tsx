import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { Logo } from "../components/Logo";
import { fetchCurrentUser, fetchMyEvents, type ApiEvent } from "../api/eventleafApi";

/*
 * Unit tests for this page currently verify:
 * 1) Organizer flow renders Impact History with summary cards and event rows.
 * 2) Derived values (including estimated paper saved) are shown for loaded data.
 * 3) Table structure includes the "Indicators" column.
 * 4) Empty organizer history shows the no-events CTA state.
 */
function formatDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function estimatedScoreOutOf100(event: ApiEvent): number {
  let score = 20;
  if (event.is_eco_friendly) score += 35;
  if (event.has_digital_ticketing) score += 15;
  if (event.has_paperless_checkin) score += 15;
  if (event.has_public_transit) score += 10;
  if ((event.eco_attribute_names?.length ?? 0) >= 2) score += 5;
  return Math.min(100, score);
}

export function ImpactHistoryPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCurrentUser()
      .then(async (user) => {
        if (!user.is_organizer) {
          navigate("/profile");
          return;
        }
        const rows = await fetchMyEvents(500);
        if (!cancelled) setEvents(rows);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const msg = (e.message || "").toLowerCase();
        if (msg.includes("missing auth") || msg.includes("unauthorized")) {
          navigate("/login");
          return;
        }
        setError(e.message || "Could not load impact history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const publishedEvents = useMemo(() => events.filter((e) => e.status === "published"), [events]);

  const totals = useMemo(() => {
    const totalEvents = events.length;
    const ecoEvents = events.filter((e) => e.is_eco_friendly).length;
    const transitEnabled = events.filter((e) => e.has_public_transit).length;
    const digitalFlows = events.filter((e) => e.has_digital_ticketing || e.has_paperless_checkin).length;
    const totalCapacity = publishedEvents.reduce((sum, e) => sum + (e.total_capacity ?? 0), 0);

    // Simple impact estimator for demo visibility.
    const estimatedPaperSheetsAvoided = events.reduce((sum, e) => {
      const perAttendeeSheets = e.has_digital_ticketing ? 1.2 : e.has_paperless_checkin ? 0.6 : 0;
      return sum + (e.total_capacity ?? 0) * perAttendeeSheets;
    }, 0);

    return {
      totalEvents,
      ecoEvents,
      transitEnabled,
      digitalFlows,
      totalCapacity,
      estimatedPaperSheetsAvoided: Math.round(estimatedPaperSheetsAvoided),
    };
  }, [events, publishedEvents]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-background-dark/80 sm:px-6 md:px-20">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/profile" />
            <Logo />
          </div>
          <Link
            to="/organizer/events/create"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark transition hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Event
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 md:px-20">
        <section className="mb-6 rounded-2xl border border-border-green bg-white p-6 shadow-sm dark:bg-[#152a17]">
          <h1 className="text-2xl font-black sm:text-3xl">Impact History</h1>
          <p className="mt-2 text-sm text-subtext-leaf">
            Sustainability footprint across events you created as an organizer.
          </p>
        </section>

        {loading ? <p className="text-subtext-leaf">Loading impact history...</p> : null}
        {error ? <p className="text-red-700 dark:text-red-300">{error}</p> : null}

        {!loading && !error ? (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-border-green bg-white p-5 shadow-sm dark:bg-[#152a17]">
                <p className="text-xs font-bold uppercase text-subtext-leaf">Events created</p>
                <p className="mt-1 text-3xl font-black">{totals.totalEvents}</p>
              </div>
              <div className="rounded-xl border border-border-green bg-white p-5 shadow-sm dark:bg-[#152a17]">
                <p className="text-xs font-bold uppercase text-subtext-leaf">Eco-friendly events</p>
                <p className="mt-1 text-3xl font-black">{totals.ecoEvents}</p>
              </div>
              <div className="rounded-xl border border-border-green bg-white p-5 shadow-sm dark:bg-[#152a17]">
                <p className="text-xs font-bold uppercase text-subtext-leaf">Transit-enabled venues</p>
                <p className="mt-1 text-3xl font-black">{totals.transitEnabled}</p>
              </div>
              <div className="rounded-xl border border-border-green bg-white p-5 shadow-sm dark:bg-[#152a17]">
                <p className="text-xs font-bold uppercase text-subtext-leaf">Digital ticketing/check-in</p>
                <p className="mt-1 text-3xl font-black">{totals.digitalFlows}</p>
              </div>
              <div className="rounded-xl border border-border-green bg-white p-5 shadow-sm dark:bg-[#152a17]">
                <p className="text-xs font-bold uppercase text-subtext-leaf">Estimated paper saved</p>
                <p className="mt-1 text-3xl font-black">{totals.estimatedPaperSheetsAvoided}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border-green bg-white shadow-sm dark:bg-[#152a17]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-background-light text-subtext-leaf dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Event</th>
                      <th className="px-4 py-3 text-left font-bold">Date</th>
                      <th className="px-4 py-3 text-left font-bold">Status</th>
                      <th className="px-4 py-3 text-right font-bold">Capacity</th>
                      <th className="px-4 py-3 text-right font-bold">Impact score</th>
                      <th className="px-4 py-3 text-left font-bold">Indicators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => {
                      const score = estimatedScoreOutOf100(e);
                      const signals = [
                        e.is_eco_friendly ? "eco-certified" : null,
                        e.has_digital_ticketing ? "digital tickets" : null,
                        e.has_paperless_checkin ? "paperless check-in" : null,
                        e.has_public_transit ? "public transit" : null,
                      ].filter(Boolean) as string[];

                      return (
                        <tr key={e.id} className="border-t border-border-green/70">
                          <td className="px-4 py-3 font-semibold">
                            <Link to={`/events/${e.id}`} className="hover:text-primary">
                              {e.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-subtext-leaf">{formatDate(e.event_date)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-neutral-bg px-2 py-1 text-xs font-bold uppercase dark:bg-white/10">
                              {e.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{(e.total_capacity ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold">{score}/100</td>
                          <td className="px-4 py-3 text-subtext-leaf">
                            {signals.length > 0 ? signals.join(" · ") : "standard setup"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {events.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border-green bg-white p-8 text-center dark:bg-[#152a17]">
                <p className="font-semibold text-subtext-leaf">No created events yet. Create one to begin tracking impact.</p>
                <Link
                  to="/organizer/events/create"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-background-dark hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Create your first event
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
