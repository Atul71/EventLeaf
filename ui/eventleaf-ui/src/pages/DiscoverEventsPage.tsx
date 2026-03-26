import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { fetchEventById, type ApiEvent } from "../api/eventleafApi";
import {
  certificationsFromApi,
  ecoProofsFromApi,
  sustainabilityScoreFromApi,
  venueImageUrlForEvent,
} from "../data/discoverPresentation";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";

function formatEventWhen(e: ApiEvent): string {
  try {
    const d = new Date(e.event_date);
    const dateStr = Number.isNaN(d.getTime())
      ? e.event_date
      : d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return `${dateStr} · ${e.event_start_time.slice(0, 5)}–${e.event_end_time.slice(0, 5)}`;
  } catch {
    return e.event_date;
  }
}

export function EventLandingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError("Missing event id");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchEventById(eventId)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || "Event not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf flex items-center justify-center px-6">
        <p className="text-subtext-leaf font-semibold">Loading event…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
        <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Logo />
            <Link
              to="/events"
              className="rounded-lg border border-border-green px-4 py-2 text-sm font-bold hover:bg-soft-green transition-colors"
            >
              Back to Discover Events
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-black dark:text-white">Event not found</h1>
          <p className="mt-3 text-subtext-leaf">{error || "The event link looks incorrect or no longer exists."}</p>
        </main>
      </div>
    );
  }

  const ev = event;
  const score = sustainabilityScoreFromApi(ev);
  const scorePercent = Math.round((score / 5) * 100);
  const landingProofs = ecoProofsFromApi(ev);
  const landingCerts = certificationsFromApi(ev);
  const venueHero = venueImageUrlForEvent(ev);
  const eventUrl = `${window.location.origin}/events/${ev.id}`;
  const venueName = ev.venue_name?.trim() || "Venue";
  const cityStr = ev.venue_city?.trim() || "";
  const heroImg = ev.image_url || FALLBACK_HERO;
  const priceLabel = ev.ticket_price <= 0 ? "Free" : `$${ev.ticket_price.toFixed(2)}`;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: ev.title,
          text: `Check out this event: ${ev.title}`,
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(eventUrl);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-lg border border-border-green px-3 py-2 text-sm font-bold hover:bg-soft-green transition-colors text-text-leaf dark:text-white"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link
              to="/organizer"
              className="rounded-lg border border-border-green px-4 py-2 text-sm font-bold hover:bg-soft-green transition-colors"
            >
              Organizer Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            {ev.is_eco_friendly ? (
              <EcoCertifiedBadge variant="default">Eco-friendly event</EcoCertifiedBadge>
            ) : (
              <span className="inline-flex rounded-full border border-border-green px-3 py-1 text-xs font-bold text-subtext-leaf">
                Standard listing
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-black leading-tight dark:text-white">{ev.title}</h1>
            <p className="text-lg text-subtext-leaf whitespace-pre-wrap">{ev.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                When: {formatEventWhen(ev)}
              </p>
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                {venueName}
                {cityStr ? ` · ${cityStr}` : ""}
              </p>
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold sm:col-span-2">
                Tickets from {priceLabel} · {ev.available_tickets} seats available
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-xl bg-primary px-6 py-3 font-black text-background-dark hover:brightness-95 transition-all"
              >
                Get Tickets
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="rounded-xl border border-border-green bg-white px-6 py-3 font-bold hover:bg-soft-green transition-colors"
              >
                Share Event
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-green shadow-lg min-h-[280px]">
            <img src={heroImg} alt={ev.title} className="h-full w-full object-cover min-h-[280px]" />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-black dark:text-white">Sustainability</h2>
            <p className="mt-2 text-subtext-leaf">
              {ev.eco_summary?.trim() ||
                "The organizer registered this event through EventLeaf. Eco attributes and venue certification inform the platform green badge."}
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Sustainability index</span>
                <span>{score.toFixed(1)} / 5.0</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-bg dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${scorePercent}%` }} />
              </div>
            </div>
            {landingCerts.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-2">Venue certifications</p>
                <div className="flex flex-wrap gap-2">
                  {landingCerts.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {landingProofs.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-2">Sustainability flags</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {landingProofs.map((p) => (
                    <li key={p.title} className="flex gap-2 rounded-lg border border-border-green bg-background-light dark:bg-white/5 p-3">
                      <span className="material-symbols-outlined text-primary shrink-0">{p.icon}</span>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{p.title}</p>
                        <p className="text-xs text-subtext-leaf mt-0.5">{p.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-6 rounded-xl border border-border-green bg-background-light dark:bg-background-dark/40 p-4">
              <p className="text-sm font-bold">Transparency</p>
              <p className="mt-1 text-sm text-subtext-leaf">
                Data is read live from the EventLeaf API. Full auth and audit trails can be layered on in production.
              </p>
            </div>
          </article>
          <div className="overflow-hidden rounded-2xl border border-border-green shadow-lg min-h-[240px]">
            <img
              src={venueHero}
              alt={`${venueName} venue`}
              className="h-full w-full object-cover min-h-[240px]"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
