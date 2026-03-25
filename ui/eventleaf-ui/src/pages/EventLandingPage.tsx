import { Link, useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { getEventBySlug } from "../data/events";

export function EventLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const event = getEventBySlug(slug);

  if (!event) {
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
          <p className="mt-3 text-subtext-leaf">The event link looks incorrect or no longer exists.</p>
        </main>
      </div>
    );
  }

  const currentEvent = event;
  const scorePercent = Math.round((currentEvent.sustainabilityScore / 5) * 100);
  const eventUrl = `${window.location.origin}/events/${currentEvent.slug}`;
  const trailerWatchUrl = `https://www.youtube.com/watch?v=${currentEvent.trailerYoutubeId}`;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentEvent.name,
          text: `Check out this eco-certified event: ${currentEvent.name}`,
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(eventUrl);
      } catch {
        return;
      }
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link to="/events" className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors">
              Discover Events
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
            <EcoCertifiedBadge variant="default">Eco-Certified Event</EcoCertifiedBadge>
            <h1 className="text-4xl md:text-5xl font-black leading-tight dark:text-white">
              {currentEvent.name}
            </h1>
            <p className="text-lg text-subtext-leaf">
              A public event page that clearly shows why this event earned a green badge and how the venue backs it with
              verified sustainability credentials.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                Date: {currentEvent.dateLabel}
              </p>
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                Venue: {currentEvent.venueName}, {currentEvent.city}
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
                onClick={handleShare}
                className="rounded-xl border border-border-green bg-white px-6 py-3 font-bold hover:bg-soft-green transition-colors"
              >
                Share Event
              </button>
              <a
                href={trailerWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border-green bg-white px-4 py-3 font-bold text-text-leaf hover:bg-soft-green transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
                aria-label={`Watch trailer for ${currentEvent.name} on YouTube (opens in new tab)`}
              >
                <svg className="size-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#FF0000"
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                <span>Trailer</span>
                <span className="material-symbols-outlined text-subtext-leaf text-lg" aria-hidden>
                  open_in_new
                </span>
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-green shadow-lg">
            <img
              src={currentEvent.imageUrl}
              alt={currentEvent.name}
              className="h-full w-full object-cover"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-black dark:text-white">Venue sustainability profile</h2>
            <p className="mt-2 text-subtext-leaf">
              {currentEvent.venueName} is independently audited and maintains long-term sustainability certifications.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Sustainability Index</span>
                <span>{currentEvent.sustainabilityScore.toFixed(1)} / 5.0</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-bg dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${scorePercent}%` }} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {currentEvent.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide"
                >
                  {cert}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-border-green bg-background-light dark:bg-background-dark/40 p-4">
              <p className="text-sm font-bold">Transparency</p>
              <div className="mt-1 text-sm text-subtext-leaf space-y-1">
                <p>Verification source: Third-party audit report (updated Jan 2026) + organizer operations checklist.</p>
                <p>
                  Transit distance: {currentEvent.publicTransitDistanceMeters}m from nearest major transit hub (500m threshold for
                  transit accessibility).
                </p>
              </div>
            </div>
          </article>
          <div className="overflow-hidden rounded-2xl border border-border-green shadow-lg">
            <img
              src={currentEvent.venueImageUrl}
              alt={`${currentEvent.venueName} eco-certified venue`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-black dark:text-white">Agenda highlights</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {currentEvent.agenda.map((item) => (
              <div key={item.time} className="rounded-xl border border-border-green bg-background-light dark:bg-background-dark/40 p-4">
                <p className="text-xs font-black text-primary">{item.time}</p>
                <p className="mt-1 font-semibold dark:text-white">{item.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
