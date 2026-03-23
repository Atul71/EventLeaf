import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";

const EVENT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";
const VENUE_IMAGE =
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80";

const ECO_PROOFS = [
  { icon: "verified", title: "LEED Platinum Venue", detail: "Certified by U.S. Green Building Council" },
  { icon: "bolt", title: "100% Renewable Energy", detail: "Solar + wind-powered operations for event hours" },
  { icon: "recycling", title: "Zero-Waste Plan", detail: "92% diversion from landfill through reuse and composting" },
  { icon: "water_drop", title: "Water Conservation", detail: "Rainwater harvesting + low-flow infrastructure" },
] as const;

const VENUE_CERTIFICATIONS = [
  "LEED Platinum",
  "TRUE Zero Waste",
  "ISO 14001",
  "Green Key Global",
] as const;

const AGENDA_ITEMS = [
  { time: "09:00", title: "Registration & Green Welcome Kit" },
  { time: "10:00", title: "Opening Keynote: Climate-Positive Events" },
  { time: "12:30", title: "Plant-Based Networking Lunch" },
  { time: "15:00", title: "Venue Sustainability Walkthrough" },
] as const;

export function EventLandingPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <header className="sticky top-0 z-40 border-b border-border-green bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors">
              Home
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
              Eco-Innovate Summit 2026
            </h1>
            <p className="text-lg text-subtext-leaf">
              A public event page that clearly shows why this event earned a green badge and how the venue backs it with
              verified sustainability credentials.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                Date: April 21, 2026
              </p>
              <p className="rounded-xl bg-white dark:bg-white/5 border border-border-green px-4 py-3 text-sm font-semibold">
                Venue: Green Canopy Hall, Portland
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
                className="rounded-xl border border-border-green bg-white px-6 py-3 font-bold hover:bg-soft-green transition-colors"
              >
                Share Event
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-green shadow-lg">
            <img src={EVENT_IMAGE} alt="Crowd at a sustainability conference event" className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-black dark:text-white">Why this event is green</h2>
          <p className="mt-2 text-subtext-leaf">
            This badge is based on concrete venue standards and operational practices, not just branding.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {ECO_PROOFS.map((proof) => (
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
              Green Canopy Hall is independently audited and maintains long-term sustainability certifications.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Sustainability Index</span>
                <span>4.7 / 5.0</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-bg dark:bg-white/10 overflow-hidden">
                <div className="h-full w-[94%] bg-primary rounded-full" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {VENUE_CERTIFICATIONS.map((cert) => (
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
            <img src={VENUE_IMAGE} alt="Eco-certified venue with indoor plants and natural light" className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="rounded-2xl border border-border-green bg-white dark:bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-black dark:text-white">Agenda highlights</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {AGENDA_ITEMS.map((item) => (
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
