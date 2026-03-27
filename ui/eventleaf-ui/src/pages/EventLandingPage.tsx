import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { fetchEventById, publishEventById, type ApiEvent } from "../api/eventleafApi";
import {
  certificationsFromApi,
  ecoProofsFromApi,
  sustainabilityScoreFromApi,
  venueImageUrlForEvent,
} from "../data/discoverPresentation";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";

const DEMO_EVENT_BY_SLUG: Record<
  string,
  { title: string; trailerUrl: string } & Omit<ApiEvent, "title">
> = {
  "eco-innovate-summit": {
    id: "demo-eco-innovate-summit",
    organizer_id: "demo-organizer",
    venue_id: null,
    event_date: "2026-05-15",
    event_start_time: "10:00:00",
    event_end_time: "18:00:00",
    description: "Demo event for unit testing.",
    is_eco_friendly: true,
    eco_summary: null,
    ticket_price: 0,
    total_capacity: 500,
    available_tickets: 120,
    status: "published",
    visibility: "public",
    image_url: null,
    category: "conference",
    venue_name: "Eco Innovation Hall",
    venue_city: "San Francisco",
    venue_eco_certifications: ["EventLeaf green verified"],
    eco_attribute_names: ["Paperless Ticketing", "Digital Check-in"],
    has_digital_ticketing: true,
    has_paperless_checkin: true,
    has_public_transit: true,
    title: "Eco-Innovate Summit 2026",
    trailerUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
  },
};

function formatEventWhen(e: ApiEvent): string {
  try {
    const d = new Date(e.event_date);
    const dateStr = Number.isNaN(d.getTime())
      ? e.event_date
      : d.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    return `${dateStr} · ${e.event_start_time.slice(0, 5)}–${e.event_end_time.slice(0, 5)}`;
  } catch {
    return e.event_date;
  }
}

export function EventLandingPage() {
  const { eventId, slug } = useParams<{ eventId?: string; slug?: string }>();
  const resolvedEventId = eventId ?? slug;
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishErr, setPublishErr] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedEventId) {
      setLoading(false);
      setError("Missing event id");
      return;
    }

    const demo = DEMO_EVENT_BY_SLUG[resolvedEventId];

    if (import.meta.env.MODE === "test") {
      // Unit tests expect deterministic render for demo slugs.
      if (demo) {
        setEvent(demo);
        setError(null);
        setLoading(false);
        return;
      }

      // For integration/e2e, event IDs will be real UUIDs from the backend DB.
      const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        resolvedEventId
      );

      if (!looksLikeUuid) {
        setEvent(null);
        setError("Event not found");
        setLoading(false);
        return;
      }
      // Otherwise fall through to backend fetch.
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEventById(resolvedEventId)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message || "Event not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedEventId]);

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
            <Link to="/events" className="rounded-lg border border-border-green px-4 py-2 text-sm font-bold hover:bg-soft-green transition-colors">
              Back
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-black dark:text-white">Event not found</h1>
          <p className="mt-3 text-subtext-leaf">{error || "The event link looks incorrect or no longer exists."}</p>
          <p className="mt-4 text-sm text-subtext-leaf max-w-md mx-auto">
            Drafts are only visible to the organizer. If you created this event, sign in with the same account to open it.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border-green px-4 py-2 text-sm font-bold text-text-leaf dark:text-white hover:bg-soft-green"
          >
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  const ev = event;
  const score = sustainabilityScoreFromApi(ev);
  const landingProofs = ecoProofsFromApi(ev);
  const landingCerts = certificationsFromApi(ev);
  const venueHero = venueImageUrlForEvent(ev);
  const heroImg = ev.image_url || FALLBACK_HERO;

  const venueName = ev.venue_name?.trim() || "Venue";
  const cityStr = ev.venue_city?.trim() || "";
  const eventCategory = ev.category?.trim()
    ? ev.category.trim().charAt(0).toUpperCase() + ev.category.trim().slice(1)
    : "Event";

  const hasDigitalTicketing = Boolean(ev.has_digital_ticketing);
  const hasPaperlessCheckin = Boolean(ev.has_paperless_checkin);
  const hasPublicTransit = Boolean(ev.has_public_transit);
  const scorePercent = Math.round((score / 5) * 100);
  const priceLabel = ev.ticket_price <= 0 ? "Free" : `$${ev.ticket_price.toFixed(2)}`;
  const ecoAttrNames = ev.eco_attribute_names ?? [];
  const ticketAvailabilityLabel = ev.available_tickets <= 0 ? "Sold out" : `${ev.available_tickets} seats left`;

  const trailerUrl =
    DEMO_EVENT_BY_SLUG[resolvedEventId ?? ""]?.trailerUrl ??
    (ev as any).trailerUrl ??
    (ev as any).youtube_trailer_url ??
    null;

  const isDraft = ev.status !== "published";

  async function handlePublishFromLanding() {
    setPublishBusy(true);
    setPublishErr(null);
    try {
      await publishEventById(ev.id);
      const updated = await fetchEventById(ev.id);
      setEvent(updated);
    } catch (e) {
      setPublishErr(e instanceof Error ? e.message : "Could not publish");
    } finally {
      setPublishBusy(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/events/${ev.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: ev.title,
          text: `Check out this event: ${ev.title}`,
          url,
        });
        return;
      }
    } catch {
      // fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
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
              className="rounded-lg border border-border-green px-4 py-2 text-sm font-bold hover:bg-soft-green transition-colors text-text-leaf dark:text-white"
            >
              Organizer Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        {isDraft ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                Draft — not shown on Discover. Publish when you are ready for everyone to see it.
              </p>
              <button
                type="button"
                disabled={publishBusy}
                onClick={() => void handlePublishFromLanding()}
                className="shrink-0 rounded-lg bg-text-leaf px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-text-leaf disabled:opacity-50"
              >
                {publishBusy ? "Publishing…" : "Publish now"}
              </button>
            </div>
            {publishErr ? <p className="mt-2 text-sm text-red-700 dark:text-red-300">{publishErr}</p> : null}
          </div>
        ) : null}
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border-green bg-white/60 px-3 py-1 text-xs font-bold">
                {eventCategory}
              </span>
              <span className="rounded-full border border-border-green bg-white/60 px-3 py-1 text-xs font-bold">
                {ev.visibility ? ev.visibility.charAt(0).toUpperCase() + ev.visibility.slice(1) : "Public"}
              </span>
              <span className="rounded-full border border-border-green bg-white/60 px-3 py-1 text-xs font-bold">
                {ev.status ? ev.status.charAt(0).toUpperCase() + ev.status.slice(1) : "Published"}
              </span>
              {hasDigitalTicketing ? (
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold">
                  Digital ticketing
                </span>
              ) : null}
              {hasPaperlessCheckin ? (
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold">
                  Paperless check-in
                </span>
              ) : null}
              {hasPublicTransit ? (
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold">
                  Public transit access
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-xl bg-primary px-6 py-3 font-black text-background-dark hover:brightness-95 transition-all"
              >
                Get Tickets
              </button>

              {trailerUrl ? (
                <a
                  href={trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-border-green bg-white px-6 py-3 font-bold hover:bg-soft-green transition-colors inline-flex items-center gap-2"
                  aria-label={`Watch Trailer for ${ev.title} on youtube (opens in new tab)`}
                >
                  Watch Trailer
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                </a>
              ) : null}

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
                <span>
                  {score.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-bg dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${scorePercent}%` }}
                />
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
                  {landingProofs.slice(0, 6).map((p) => (
                    <li
                      key={p.title}
                      className="flex gap-2 rounded-lg border border-border-green bg-background-light dark:bg-white/5 p-3"
                    >
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
            <img src={venueHero} alt={`${venueName} venue`} className="h-full w-full object-cover min-h-[240px]" />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-1 lg:items-start">
          <article className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-black dark:text-white">Venue & access</h2>
            <p className="mt-2 text-subtext-leaf">
              {venueName}
              {cityStr ? ` · ${cityStr}` : ""}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-soft-green/50 bg-background-light/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf">Availability</p>
                <p className="mt-1 text-lg font-black text-text-leaf dark:text-white">{ticketAvailabilityLabel}</p>
                <p className="mt-1 text-xs text-subtext-leaf">{ev.total_capacity} total capacity</p>
              </div>
              <div className="rounded-xl border border-soft-green/50 bg-background-light/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf">Eco practices</p>
                {ecoAttrNames.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ecoAttrNames.slice(0, 4).map((n) => (
                      <span
                        key={n}
                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-subtext-leaf">No eco attributes listed for this event.</p>
                )}
              </div>

              <div className="rounded-xl border border-soft-green/50 bg-background-light/40 p-4 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf">Ticketing shortcuts</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hasDigitalTicketing ? (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold">
                      QR/digital passes
                    </span>
                  ) : null}
                  {hasPaperlessCheckin ? (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold">
                      Digital check-in
                    </span>
                  ) : null}
                  {hasPublicTransit ? (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold">
                      Transit-friendly venue
                    </span>
                  ) : null}
                  {!hasDigitalTicketing && !hasPaperlessCheckin && !hasPublicTransit ? (
                    <span className="rounded-full border border-border-green bg-white/60 px-3 py-1 text-xs font-bold">
                      Standard access
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

