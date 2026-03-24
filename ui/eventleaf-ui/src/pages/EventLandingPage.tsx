import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import { getEventBySlug } from "../data/events";

export function EventLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const event = getEventBySlug(slug);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

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

  const scorePercent = Math.round((event.sustainabilityScore / 5) * 100);
  const eventUrl = `${window.location.origin}/events/${event.slug}`;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: `Check out this eco-certified event: ${event.name}`,
          url: eventUrl,
        });
        setShareState("copied");
      } else {
        await navigator.clipboard.writeText(eventUrl);
        setShareState("copied");
      }
    } catch {
      // Fallback path when Web Share is unavailable/blocked.
      try {
        await navigator.clipboard.writeText(eventUrl);
        setShareState("copied");
      } catch {
        setShareState("error");
      }
    }

    setTimeout(() => setShareState("idle"), 2000);
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
              {event.name}
            </h1>
            <p className="text-lg text-subtext-leaf">
              A public event page that clearly shows why this event earned a green badge and how the venue backs it with
              verified sustainability credentials.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                Date: {event.dateLabel}
              </p>
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                Venue: {event.venueName}, {event.city}
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
                {shareState === "copied" ? "Link Copied" : shareState === "error" ? "Copy Failed" : "Share Event"}
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-green shadow-lg">
            <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-black dark:text-white">Why this event is green</h2>
          <p className="mt-2 text-subtext-leaf">
            This badge is based on concrete venue standards and operational practices, not just branding.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {event.ecoProofs.map((proof) => (
              <article
                key={proof.title}
                className="rounded-xl border border-border-green bg-background-light dark:bg-background-dark/40 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">{proof.icon}</span>
                  <h3 className="font-bold dark:text-white">{proof.title}</h3>
                </div>
                <p className="mt-2 text-sm text-subtext-leaf">{proof.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-black dark:text-white">Venue sustainability profile</h2>
            <p className="mt-2 text-subtext-leaf">
              {event.venueName} is independently audited and maintains long-term sustainability certifications.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Sustainability Index</span>
                <span>{event.sustainabilityScore.toFixed(1)} / 5.0</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-bg dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${scorePercent}%` }} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {event.certifications.map((cert) => (
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
              <p className="mt-1 text-sm text-subtext-leaf">
                Verification source: Third-party audit report (updated Jan 2026) + organizer operations checklist.
              </p>
            </div>
          </article>
          <div className="overflow-hidden rounded-2xl border border-border-green shadow-lg">
            <img src={event.venueImageUrl} alt={`${event.venueName} eco-certified venue`} className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-black dark:text-white">Agenda highlights</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {event.agenda.map((item) => (
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
