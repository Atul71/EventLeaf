import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OrganizerSidebar } from "../components/organizer/OrganizerSidebar";
import { EcoCertifiedBadge } from "../components/organizer/EcoCertifiedBadge";
import {
  createEvent,
  fetchDemoOrganizerId,
  fetchEcoAttributes,
  fetchVenues,
  normalizeTimeForApi,
  type ApiEcoAttribute,
  type ApiVenue,
} from "../api/eventleafApi";
import {
  computeEcoScore,
  getEcoBadgePreviews,
  type WizardDraft,
  type WizardVenueLike,
} from "../components/organizer/create-event/ecoScorePreview";
import { venueImageUrlFromKey } from "../data/discoverPresentation";

type WizardSelectedVenue = WizardVenueLike & {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  certifications: string[];
};

function mapApiVenueToWizard(v: ApiVenue): WizardSelectedVenue {
  const state = v.state?.trim() || "";
  const location = state ? `${v.city}, ${state}` : v.city;
  return {
    id: v.id,
    name: v.name,
    location,
    imageUrl: venueImageUrlFromKey(`${v.id}|${v.city}|${v.name}`),
    isEcoCertified: v.is_eco_certified,
    isGreenAuditorium: false,
    certifications: v.eco_certifications ?? [],
  };
}

function buildEcoAttributeIds(
  attrs: ApiEcoAttribute[],
  toggles: {
    digitalOnlyTicketing: boolean;
    zeroWasteCatering: boolean;
    onSiteRecycling: boolean;
    publicTransportIncentives: boolean;
  }
): string[] {
  const byName = new Map(attrs.map((a) => [a.name, a.id]));
  const want = new Set<string>();
  if (toggles.digitalOnlyTicketing) {
    const a = byName.get("Paperless Ticketing");
    const b = byName.get("Digital Check-in");
    if (a) want.add(a);
    if (b) want.add(b);
  }
  if (toggles.zeroWasteCatering) {
    const a = byName.get("Waste Reduction Program");
    if (a) want.add(a);
  }
  if (toggles.onSiteRecycling) {
    const a = byName.get("Zero Single-Use Plastics");
    if (a) want.add(a);
  }
  if (toggles.publicTransportIncentives) {
    const a = byName.get("Carbon Neutral Transport");
    if (a) want.add(a);
  }
  return [...want];
}

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const EVENT_CATEGORIES = ["Music", "Conference", "Workshop", "Festival", "Sports", "Community", "Food", "Other"] as const;

const STEPS = [
  { id: 1, title: "Core details", subtitle: "Name, category, story, media" },
  { id: 2, title: "Venue", subtitle: "BE-102 green gatekeeper" },
  { id: 3, title: "Sustainability", subtitle: "Eco toggles & paperless" },
  { id: 4, title: "Eco preview", subtitle: "Live score & badges" },
] as const;

type LocationState = { preselectedVenueId?: string; selectedVenue?: { id: string; name: string; location: string } };

function LiveLeafMeter({ percent, label }: { percent: number; label: string }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10"
        aria-hidden
      >
        <span
          className="material-symbols-outlined text-primary text-3xl transition-transform duration-500"
          style={{ transform: `scale(${0.75 + (p / 100) * 0.35})` }}
        >
          energy_savings_leaf
        </span>
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-neutral-bg dark:stroke-white/10" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-primary transition-all duration-500"
            strokeWidth="3"
            strokeDasharray={`${(p / 100) * 100.5} 100`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-subtext-leaf">Live Leaf</p>
        <div className="mt-1 h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${p}%` }} />
        </div>
        <p className="mt-0.5 text-xs font-bold text-text-leaf dark:text-white truncate">{label}</p>
      </div>
    </div>
  );
}

export function CreateEventWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [venue, setVenue] = useState<WizardSelectedVenue | null>(null);
  const [venueQuery, setVenueQuery] = useState("");
  const [allVenues, setAllVenues] = useState<ApiVenue[]>([]);
  const [ecoAttributes, setEcoAttributes] = useState<ApiEcoAttribute[]>([]);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [eventDate, setEventDate] = useState(tomorrowISODate);
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndTime, setEventEndTime] = useState("18:00");
  const [ticketPrice, setTicketPrice] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [venueOpen, setVenueOpen] = useState(false);
  const [digitalOnlyTicketing, setDigitalOnlyTicketing] = useState(true);
  const [zeroWasteCatering, setZeroWasteCatering] = useState(false);
  const [onSiteRecycling, setOnSiteRecycling] = useState(false);
  const [publicTransportIncentives, setPublicTransportIncentives] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    setApiLoading(true);
    setApiLoadError(null);
    Promise.all([fetchDemoOrganizerId(), fetchVenues(100), fetchEcoAttributes()])
      .then(([orgId, venues, eco]) => {
        if (cancelled) return;
        setOrganizerId(orgId);
        setAllVenues(venues);
        setEcoAttributes(eco);
      })
      .catch((e: Error) => {
        if (!cancelled) setApiLoadError(e.message || "Could not load API data");
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = state?.preselectedVenueId ?? state?.selectedVenue?.id;
    if (!id || allVenues.length === 0) return;
    const match = allVenues.find((v) => v.id === id);
    if (match) {
      const w = mapApiVenueToWizard(match);
      setVenue(w);
      setVenueQuery(w.name);
    }
  }, [state?.preselectedVenueId, state?.selectedVenue?.id, allVenues]);

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [bannerPreviewUrl]);

  const venueResults = useMemo(() => {
    const q = venueQuery.trim().toLowerCase();
    if (!q) return allVenues.slice(0, 24);
    return allVenues
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          (v.state && v.state.toLowerCase().includes(q))
      )
      .slice(0, 40);
  }, [allVenues, venueQuery]);

  useEffect(() => {
    if (!venueOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVenueOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [venueOpen]);

  useEffect(() => {
    const el = mainRef.current;
    if (el) el.scrollTop = 0;
  }, [step]);

  const draft: WizardDraft = useMemo(
    () => ({
      eventName,
      category,
      description,
      hasBanner: !!(bannerFile || bannerPreviewUrl),
      venue,
      digitalOnlyTicketing,
      zeroWasteCatering,
      onSiteRecycling,
      publicTransportIncentives,
    }),
    [
      eventName,
      category,
      description,
      bannerFile,
      bannerPreviewUrl,
      venue,
      digitalOnlyTicketing,
      zeroWasteCatering,
      onSiteRecycling,
      publicTransportIncentives,
    ]
  );

  const ecoScore = useMemo(() => computeEcoScore(draft), [draft]);
  const badges = useMemo(() => getEcoBadgePreviews(draft, ecoScore), [draft, ecoScore]);

  const scoreLabel =
    ecoScore >= 85 ? "Forest-tier draft" : ecoScore >= 65 ? "Strong eco line-up" : ecoScore >= 40 ? "Growing greener" : "Just sprouting";

  function setFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setBannerFile(f);
    setBannerPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }

  function clearBanner() {
    setBannerFile(null);
    setBannerPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  const step1Complete =
    eventName.trim().length > 0 &&
    category.length > 0 &&
    description.trim().length > 0 &&
    !!organizerId &&
    !!eventDate &&
    eventStartTime.trim().length > 0 &&
    eventEndTime.trim().length > 0 &&
    totalCapacity > 0 &&
    ticketPrice >= 0;

  const canGoNext =
    step === 1 ? step1Complete : step === 2 ? venue != null : true;

  function goNext() {
    if (step >= 4) return;
    if (step === 3) {
      setStep(4);
      return;
    }
    if (!canGoNext) return;
    setStep((s) => s + 1);
  }
  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function publishEvent() {
    if (!organizerId || !venue) {
      setSubmitError("Missing organizer or venue.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const ecoIds = buildEcoAttributeIds(ecoAttributes, {
        digitalOnlyTicketing,
        zeroWasteCatering,
        onSiteRecycling,
        publicTransportIncentives,
      });
      const ecoSummary =
        description.trim().slice(0, 800) ||
        "Event created with EventLeaf sustainability checklist.";

      const res = await createEvent({
        title: eventName.trim(),
        description: description.trim(),
        organizer_id: organizerId,
        venue_id: venue.id,
        event_date: eventDate,
        event_start_time: normalizeTimeForApi(eventStartTime),
        event_end_time: normalizeTimeForApi(eventEndTime),
        eco_summary: ecoSummary,
        ticket_price: ticketPrice,
        total_capacity: totalCapacity,
        status: "published",
        visibility: "public",
        category,
        eco_attribute_ids: ecoIds,
      });
      navigate(`/events/${res.event.id}`, { state: { created: true, isGreen: res.is_green } });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not publish event");
    } finally {
      setSubmitting(false);
    }
  }

  const canPublish = step1Complete && venue != null;

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <OrganizerSidebar />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 border-b border-border-green bg-white/90 dark:bg-[#152a17]/95 backdrop-blur-md px-4 py-3 sm:px-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/organizer"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-subtext-leaf hover:bg-background-light dark:hover:bg-white/5"
                aria-label="Back to dashboard"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-text-leaf dark:text-white truncate">Create event</h1>
                <p className="text-xs text-subtext-leaf truncate">Guided setup · green venues · eco badges</p>
              </div>
            </div>
            <LiveLeafMeter percent={ecoScore} label={`${ecoScore}/100 · ${scoreLabel}`} />
          </div>
          <ol className="max-w-3xl mx-auto mt-4 flex gap-1 overflow-x-auto pb-1" aria-label="Steps">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.id <= step) setStep(s.id);
                    }}
                    className={`flex w-full flex-col rounded-lg px-2 py-2 text-left transition-colors ${
                      active
                        ? "bg-primary/15 ring-1 ring-primary/30"
                        : done
                          ? "bg-soft-green/50 dark:bg-white/5"
                          : "opacity-60"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-subtext-leaf">Step {s.id}</span>
                    <span className="text-xs font-bold text-text-leaf dark:text-white truncate">{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className="material-symbols-outlined text-subtext-leaf text-sm shrink-0 hidden sm:block">chevron_right</span>
                  )}
                </li>
              );
            })}
          </ol>
        </header>

        <main ref={mainRef} className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto space-y-8 pb-24">
            {step === 1 && (
              <section className="rounded-2xl border border-border-green bg-white dark:bg-[#152a17] p-5 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-text-leaf dark:text-white">Core event details</h2>
                  <p className="text-sm text-subtext-leaf mt-1">Basics attendees see first on your public page.</p>
                </div>
                {apiLoading && (
                  <p className="text-sm font-semibold text-subtext-leaf">Connecting to EventLeaf API (organizer, venues)…</p>
                )}
                {apiLoadError && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                    role="alert"
                  >
                    <strong className="font-bold">API error:</strong> {apiLoadError}. Run the API on{" "}
                    <code className="rounded bg-black/5 px-1">localhost:3000</code> with a seeded database; Vite proxies{" "}
                    <code className="rounded bg-black/5 px-1">/api</code> to it.
                  </div>
                )}
                <div>
                  <label htmlFor="evt-name" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-1">
                    Event name
                  </label>
                  <input
                    id="evt-name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. Cascadia Clean Energy Forum"
                  />
                </div>
                <div>
                  <label htmlFor="evt-cat" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-1">
                    Category
                  </label>
                  <select
                    id="evt-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="evt-desc" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-1">
                    Description
                  </label>
                  <textarea
                    id="evt-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 resize-y min-h-[120px]"
                    placeholder="What makes this event special? Mention sustainability themes if you like."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label htmlFor="evt-date" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf">
                    Event date
                    <input
                      id="evt-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label htmlFor="evt-start" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf">
                      Start
                      <input
                        id="evt-start"
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-3 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                      />
                    </label>
                    <label htmlFor="evt-end" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf">
                      End
                      <input
                        id="evt-end"
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-3 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                      />
                    </label>
                  </div>
                  <label htmlFor="evt-price" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf">
                    Ticket price (USD)
                    <input
                      id="evt-price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                    />
                  </label>
                  <label htmlFor="evt-cap" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf">
                    Total capacity
                    <input
                      id="evt-cap"
                      type="number"
                      min={1}
                      step={1}
                      value={totalCapacity}
                      onChange={(e) => setTotalCapacity(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-2">Banner / thumbnail</p>
                  <div
                    ref={dropRef}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        document.getElementById("banner-input")?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setFiles(e.dataTransfer.files);
                    }}
                    className="rounded-2xl border-2 border-dashed border-border-green dark:border-white/15 bg-soft-green/30 dark:bg-white/5 p-6 text-center transition-colors hover:border-primary/50"
                  >
                    <input
                      id="banner-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFiles(e.target.files)}
                    />
                    {bannerPreviewUrl ? (
                      <div className="space-y-3">
                        <img src={bannerPreviewUrl} alt="" className="mx-auto max-h-40 rounded-lg object-cover shadow-md" />
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById("banner-input")?.click()}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            Replace image
                          </button>
                          <button type="button" onClick={clearBanner} className="text-sm font-bold text-subtext-leaf hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl text-primary mb-2 block">upload_file</span>
                        <p className="font-bold text-text-leaf dark:text-white">Drag &amp; drop an image here</p>
                        <p className="text-sm text-subtext-leaf mt-1">or click to browse — JPG, PNG, WebP</p>
                        <button
                          type="button"
                          onClick={() => document.getElementById("banner-input")?.click()}
                          className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-text-leaf"
                        >
                          Choose file
                        </button>
                      </>
                    )}
                  </div>
                  <p className="mt-2 flex items-start gap-2 text-xs text-subtext-leaf">
                    <span className="material-symbols-outlined text-base text-primary shrink-0">bolt</span>
                    <span>
                      Smaller files use less bandwidth and storage energy. Aim for{" "}
                      <strong className="text-text-leaf dark:text-white">under ~500 KB</strong> when you can — wide hero images
                      rarely need more than 1600px on the long edge.
                    </span>
                  </p>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="rounded-2xl border border-border-green bg-white dark:bg-[#152a17] p-5 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-text-leaf dark:text-white">Venue selection</h2>
                  <p className="text-sm text-subtext-leaf mt-1">
                    Choose a venue from your <span className="font-semibold text-text-leaf dark:text-white">EventLeaf</span>{" "}
                    database. Eco-certified venues help your event meet green criteria.
                  </p>
                </div>

                <div className="relative z-10">
                  <label htmlFor="venue-search" className="block text-xs font-bold uppercase tracking-wide text-subtext-leaf mb-1">
                    Venue
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtext-leaf">search</span>
                    <input
                      id="venue-search"
                      value={venueQuery}
                      onChange={(e) => {
                        setVenueQuery(e.target.value);
                        setVenueOpen(true);
                      }}
                      onFocus={() => setVenueOpen(true)}
                      autoComplete="off"
                      placeholder="Type a venue name, city, or certification…"
                      className="w-full rounded-xl border border-border-green dark:border-white/10 bg-background-light dark:bg-white/5 py-3 pl-11 pr-10 text-sm font-semibold focus:ring-2 focus:ring-primary/50"
                      aria-expanded={venueOpen}
                      aria-controls="venue-listbox"
                      aria-autocomplete="list"
                    />
                    {apiLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subtext-leaf">Loading…</span>
                    )}
                  </div>
                  {venueOpen && (
                    <ul
                      id="venue-listbox"
                      role="listbox"
                      className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border-green bg-white py-1 shadow-lg dark:bg-[#1a2e1c] dark:border-white/10"
                    >
                      {venueResults.map((v) => {
                        const w = mapApiVenueToWizard(v);
                        return (
                          <li key={v.id} role="option" aria-selected={venue?.id === v.id}>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-soft-green dark:hover:bg-white/10"
                              onClick={() => {
                                setVenue(w);
                                setVenueQuery(w.name);
                                setVenueOpen(false);
                              }}
                            >
                              <img src={w.imageUrl} alt="" className="size-10 rounded-lg object-cover shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold truncate text-text-leaf dark:text-white">{v.name}</p>
                                <p className="text-xs text-subtext-leaf truncate">{w.location}</p>
                              </div>
                              {v.is_eco_certified && <EcoCertifiedBadge variant="compact">Green</EcoCertifiedBadge>}
                            </button>
                          </li>
                        );
                      })}
                      {venueResults.length === 0 && !apiLoading && (
                        <li className="px-3 py-4 text-sm text-subtext-leaf text-center">
                          {allVenues.length === 0
                            ? "No venues in the database yet. Seed venues or create one via the API."
                            : "No venues match that search."}
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {venue && (
                  <div className="rounded-xl border border-border-green dark:border-white/10 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-soft-green/40 dark:bg-white/5">
                      <img src={venue.imageUrl} alt="" className="h-32 w-full sm:w-40 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-text-leaf dark:text-white">{venue.name}</h3>
                          {venue.isGreenAuditorium && <EcoCertifiedBadge variant="default">Green Auditorium</EcoCertifiedBadge>}
                        </div>
                        <p className="text-sm text-subtext-leaf mt-1">{venue.location}</p>
                        {venue.isGreenAuditorium || venue.certifications.length > 0 ? (
                          <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-subtext-leaf mb-2">Certifications</p>
                            <ul className="flex flex-wrap gap-2">
                              {venue.certifications.map((c) => (
                                <li
                                  key={c}
                                  className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-bold text-text-leaf dark:text-white border border-primary/25"
                                >
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {venue && !venue.isGreenAuditorium && !venue.isEcoCertified && (
                  <div
                    className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100"
                    role="status"
                  >
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">lightbulb</span>
                    <p>
                      <strong className="font-bold">Tip:</strong> Choosing a{" "}
                      <strong>green-certified venue increases your Eco-Score by 40%</strong> in this wizard — and helps your
                      event qualify for the public <strong>Eco-Friendly</strong> badge faster.
                    </p>
                  </div>
                )}
              </section>
            )}

            {step === 3 && (
              <section className="rounded-2xl border border-border-green bg-white dark:bg-[#152a17] p-5 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-text-leaf dark:text-white">Sustainability checklist</h2>
                  <p className="text-sm text-subtext-leaf mt-1">Opt in to practices that appear as badges on your public page.</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-text-leaf dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">smartphone</span>
                          Digital-only ticketing (Paperless)
                        </p>
                        <p className="text-sm text-subtext-leaf mt-1">
                          Required to earn the <strong>Paperless</strong> badge. When on, printed ticket fulfillment is disabled for
                          this event.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={digitalOnlyTicketing}
                        onClick={() => setDigitalOnlyTicketing(!digitalOnlyTicketing)}
                        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                          digitalOnlyTicketing ? "bg-primary" : "bg-neutral-bg dark:bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-1 size-6 rounded-full bg-white shadow transition-transform ${
                            digitalOnlyTicketing ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                    {!digitalOnlyTicketing && (
                      <p className="mt-3 text-xs font-semibold text-subtext-leaf border-t border-primary/20 pt-3">
                        Printed tickets and will-call slips can be enabled — the Paperless badge will stay hidden on the public
                        page.
                      </p>
                    )}
                  </div>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-border-green dark:border-white/10 p-4 cursor-pointer hover:bg-soft-green/30 dark:hover:bg-white/5">
                    <div>
                      <p className="font-bold text-text-leaf dark:text-white">Zero-waste catering</p>
                      <p className="text-sm text-subtext-leaf">Compostable serviceware &amp; waste diversion plan.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={zeroWasteCatering}
                      onChange={(e) => setZeroWasteCatering(e.target.checked)}
                      className="size-5 accent-primary rounded border-border-green"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-border-green dark:border-white/10 p-4 cursor-pointer hover:bg-soft-green/30 dark:hover:bg-white/5">
                    <div>
                      <p className="font-bold text-text-leaf dark:text-white">On-site recycling</p>
                      <p className="text-sm text-subtext-leaf">Clearly labeled streams for attendees during the event.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={onSiteRecycling}
                      onChange={(e) => setOnSiteRecycling(e.target.checked)}
                      className="size-5 accent-primary rounded border-border-green"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-border-green dark:border-white/10 p-4 cursor-pointer hover:bg-soft-green/30 dark:hover:bg-white/5">
                    <div>
                      <p className="font-bold text-text-leaf dark:text-white">Public transport incentives</p>
                      <p className="text-sm text-subtext-leaf">
                        You&apos;ll provide metro / bus directions or perks (mock toggle — copy in step 4).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicTransportIncentives}
                      onChange={(e) => setPublicTransportIncentives(e.target.checked)}
                      className="size-5 accent-primary rounded border-border-green"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-dashed border-border-green p-4 opacity-60">
                  <p className="text-xs font-bold uppercase text-subtext-leaf mb-2">Physical ticket printing</p>
                  <label className="flex items-center gap-3 cursor-not-allowed">
                    <input type="checkbox" disabled={digitalOnlyTicketing} checked={false} readOnly className="size-5 opacity-50" />
                    <span className="text-sm text-subtext-leaf">
                      {digitalOnlyTicketing
                        ? "Disabled while digital-only ticketing is on."
                        : "Optional add-on when digital-only is off (mock)."}
                    </span>
                  </label>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-border-green bg-white dark:bg-[#152a17] p-5 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-black text-text-leaf dark:text-white">Real-time Eco-Score</h2>
                  <p className="text-sm text-subtext-leaf mt-1">What attendees will roughly see after you publish (mock preview).</p>
                  <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-5xl font-black text-primary">{ecoScore}</p>
                      <p className="text-sm font-semibold text-subtext-leaf">of 100 · {scoreLabel}</p>
                    </div>
                    <LiveLeafMeter percent={ecoScore} label="Draft eco strength" />
                  </div>
                  <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#1dbb2b] transition-all duration-500" style={{ width: `${ecoScore}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl border border-border-green bg-white dark:bg-[#152a17] p-5 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-text-leaf dark:text-white">Badge preview</h3>
                  <p className="text-sm text-subtext-leaf mt-1">These badges light up on the public event page when conditions are met.</p>
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {badges.map((b) => (
                      <li
                        key={b.id}
                        className={`flex gap-3 rounded-xl border p-3 transition-opacity ${
                          b.active
                            ? "border-primary/40 bg-primary/10 opacity-100"
                            : "border-border-leaf dark:border-white/10 bg-neutral-bg/50 dark:bg-white/5 opacity-50"
                        }`}
                      >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            b.active ? "bg-primary/25 text-text-leaf" : "bg-black/5 text-subtext-leaf"
                          }`}
                        >
                          <span className="material-symbols-outlined">{b.icon}</span>
                        </span>
                        <div>
                          <p className="font-bold text-sm text-text-leaf dark:text-white">{b.label}</p>
                          <p className="text-xs text-subtext-leaf mt-0.5">{b.description}</p>
                          {b.active ? (
                            <span className="mt-1 inline-block text-[10px] font-black uppercase text-primary">Live on publish</span>
                          ) : (
                            <span className="mt-1 inline-block text-[10px] font-bold uppercase text-subtext-leaf">Not yet</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {submitError && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                    role="alert"
                  >
                    {submitError}
                  </div>
                )}
                <div className="rounded-xl border border-border-green bg-soft-green/30 dark:bg-white/5 p-4 text-sm text-subtext-leaf">
                  <strong className="text-text-leaf dark:text-white">Summary:</strong> {eventName || "Untitled"} · {category}
                  {venue && ` · ${venue.name}`}
                </div>
              </section>
            )}
          </div>
        </main>

        <footer className="sticky bottom-0 z-40 border-t border-border-green bg-white/95 dark:bg-[#152a17]/95 backdrop-blur px-4 py-3 sm:px-8">
          <div className="max-w-3xl mx-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="rounded-xl border border-border-green px-5 py-2.5 text-sm font-bold text-text-leaf disabled:opacity-40 dark:text-white dark:border-white/15"
            >
              Back
            </button>
            <div className="flex gap-2 justify-end">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-text-leaf disabled:opacity-40 hover:brightness-105"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canPublish || submitting}
                  onClick={() => void publishEvent()}
                  className="rounded-xl bg-text-leaf px-6 py-2.5 text-sm font-black text-white dark:bg-white dark:text-text-leaf hover:opacity-90 disabled:opacity-40"
                >
                  {submitting ? "Publishing…" : "Publish event"}
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
