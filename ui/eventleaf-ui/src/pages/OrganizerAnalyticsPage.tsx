import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrganizerSidebar } from "../components/organizer/OrganizerSidebar";
import { fetchCurrentUser, fetchOrganizerAnalytics, type OrganizerEventAnalytics } from "../api/eventleafApi";

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function OrganizerAnalyticsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OrganizerEventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCurrentUser()
      .then(async () => {
        const data = await fetchOrganizerAnalytics(500);
        if (!cancelled) setRows(data);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const msg = (e.message || "").toLowerCase();
        if (msg.includes("missing auth") || msg.includes("unauthorized")) {
          navigate("/login");
          return;
        }
        setError(e.message || "Could not load organizer analytics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredRows = useMemo(() => {
    const q = eventFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.title.toLowerCase().includes(q));
  }, [rows, eventFilter]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.ticketsSold += row.tickets_sold || 0;
        acc.checkedIn += row.checked_in_count || 0;
        acc.revenue += row.revenue || 0;
        return acc;
      },
      { ticketsSold: 0, checkedIn: 0, revenue: 0 }
    );
  }, [filteredRows]);
  const totalCapacity = useMemo(() => filteredRows.reduce((sum, row) => sum + (row.total_capacity || 0), 0), [filteredRows]);
  const totalRemaining = useMemo(
    () => filteredRows.reduce((sum, row) => sum + Math.max(0, row.available_tickets || 0), 0),
    [filteredRows]
  );
  const soldSeatPct = totalCapacity > 0 ? Math.round((totals.ticketsSold / totalCapacity) * 100) : 0;

  const chartRows = useMemo(() => filteredRows.slice(0, 6), [filteredRows]);
  const maxSold = useMemo(() => Math.max(1, ...chartRows.map((r) => r.tickets_sold || 0)), [chartRows]);
  const maxRevenue = useMemo(() => Math.max(1, ...chartRows.map((r) => r.revenue || 0)), [chartRows]);
  const withDerived = useMemo(() => {
    return chartRows.map((r) => {
      const soldPct = r.total_capacity > 0 ? Math.round((r.tickets_sold / r.total_capacity) * 100) : 0;
      const attendancePct = r.tickets_sold > 0 ? Math.round((r.checked_in_count / r.tickets_sold) * 100) : 0;
      const greenImpactScore = Math.min(
        100,
        Math.round((r.is_eco_friendly ? 55 : 25) + soldPct * 0.25 + attendancePct * 0.2)
      );
      return { ...r, soldPct, attendancePct, greenImpactScore };
    });
  }, [chartRows]);

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <OrganizerSidebar />
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-text-leaf dark:text-white">Event Analytics</h1>
              <p className="text-sm text-subtext-leaf">Attendance and sales snapshot across your events.</p>
            </div>
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-2 rounded-lg border border-border-green px-4 py-2 text-sm font-bold hover:bg-soft-green"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to My Events
            </Link>
          </div>

          <div className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-4 shadow-sm">
            <label htmlFor="analytics-event-filter" className="text-xs font-bold uppercase tracking-wide text-subtext-leaf">
              Filter by event name
            </label>
            <input
              id="analytics-event-filter"
              type="text"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              placeholder="Type event title..."
              className="mt-2 w-full rounded-lg border border-border-green bg-background-light px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-primary/40 dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-subtext-leaf">Tickets sold</p>
              <p className="mt-1 text-3xl font-black">{totals.ticketsSold.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-subtext-leaf">Checked in</p>
              <p className="mt-1 text-3xl font-black">{totals.checkedIn.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-subtext-leaf">Revenue</p>
              <p className="mt-1 text-3xl font-black">${totals.revenue.toFixed(2)}</p>
            </div>
          </div>

          {!loading && !error && filteredRows.length > 0 ? (
            <section className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wide text-subtext-leaf">Seat distribution</h2>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="relative size-28 rounded-full border border-border-green"
                    style={{
                      background: `conic-gradient(#22c55e ${soldSeatPct}%, #d1d5db ${soldSeatPct}% 100%)`,
                    }}
                    aria-label={`Sold ${soldSeatPct}% of total capacity`}
                  >
                    <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-sm font-black dark:bg-[#152a17]">
                      {soldSeatPct}%
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">Sold: {totals.ticketsSold.toLocaleString()}</p>
                    <p className="text-subtext-leaf">Remaining: {totalRemaining.toLocaleString()}</p>
                    <p className="text-subtext-leaf">Capacity: {totalCapacity.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase text-subtext-leaf">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block size-2.5 rounded-full bg-green-500" /> Sold seats
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block size-2.5 rounded-full bg-gray-300" /> Remaining seats
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          {loading ? <p className="text-subtext-leaf">Loading analytics...</p> : null}
          {error ? <p className="text-red-700 dark:text-red-300">{error}</p> : null}

          {!loading && !error && filteredRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-green bg-white dark:bg-[#152a17] p-8 text-center">
              <p className="font-semibold text-subtext-leaf">
                {rows.length === 0
                  ? "No event analytics yet. Create and publish events to see performance."
                  : "No events match this filter. Try another event name."}
              </p>
            </div>
          ) : null}

          {!loading && !error && filteredRows.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-wide text-subtext-leaf">Sold vs checked-in</h2>
                  <div className="mt-4 space-y-3">
                    {withDerived.map((r) => {
                      const soldPct = Math.round(((r.tickets_sold || 0) / maxSold) * 100);
                      const checkedPct = Math.round(((r.checked_in_count || 0) / maxSold) * 100);
                      return (
                        <div key={`sold-${r.event_id}`}>
                          <p className="truncate text-sm font-semibold">{r.title}</p>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
                            <div className="h-full bg-primary" style={{ width: `${soldPct}%` }} />
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
                            <div className="h-full bg-emerald-500" style={{ width: `${checkedPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-subtext-leaf">Top bar: sold tickets. Bottom bar: checked-in attendees.</p>
                </section>

                <section className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-wide text-subtext-leaf">Revenue by event</h2>
                  <div className="mt-4 space-y-3">
                    {withDerived.map((r) => {
                      const revenuePct = Math.round(((r.revenue || 0) / maxRevenue) * 100);
                      return (
                        <div key={`rev-${r.event_id}`}>
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <p className="truncate font-semibold">{r.title}</p>
                            <p className="shrink-0 font-bold">${r.revenue.toFixed(2)}</p>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
                            <div className="h-full bg-indigo-500" style={{ width: `${revenuePct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-xl border border-border-green bg-white dark:bg-[#152a17] p-5 shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-wide text-subtext-leaf">% Sold + Green impact</h2>
                  <div className="mt-4 space-y-3">
                    {withDerived.map((r) => (
                      <div key={`impact-${r.event_id}`}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <p className="truncate font-semibold">{r.title}</p>
                          <p className="shrink-0 font-bold">{r.soldPct}% sold</p>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
                          <div className="h-full bg-cyan-500" style={{ width: `${Math.max(0, Math.min(100, r.soldPct))}%` }} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-subtext-leaf">
                          <span>{r.is_eco_friendly ? "Eco event" : "Standard event"}</span>
                          <span>Impact score {r.greenImpactScore}/100</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
                          <div className="h-full bg-emerald-500" style={{ width: `${r.greenImpactScore}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="overflow-hidden rounded-xl border border-border-green bg-white dark:bg-[#152a17] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-background-light dark:bg-white/5 text-subtext-leaf">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold">Event</th>
                        <th className="px-4 py-3 text-left font-bold">Date</th>
                        <th className="px-4 py-3 text-left font-bold">Status</th>
                        <th className="px-4 py-3 text-right font-bold">Capacity</th>
                        <th className="px-4 py-3 text-right font-bold">Sold</th>
                        <th className="px-4 py-3 text-right font-bold">Checked-in</th>
                        <th className="px-4 py-3 text-right font-bold">Attendance %</th>
                        <th className="px-4 py-3 text-right font-bold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => {
                        const attendancePct = r.tickets_sold > 0 ? Math.round((r.checked_in_count / r.tickets_sold) * 100) : 0;
                        return (
                          <tr key={r.event_id} className="border-t border-border-green/70">
                            <td className="px-4 py-3 font-semibold">{r.title}</td>
                            <td className="px-4 py-3 text-subtext-leaf">{formatDate(r.event_date)}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-neutral-bg px-2 py-1 text-xs font-bold uppercase">{r.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right">{r.total_capacity.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{r.tickets_sold.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{r.checked_in_count.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{attendancePct}%</td>
                            <td className="px-4 py-3 text-right font-bold">${r.revenue.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

