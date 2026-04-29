import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { BackButton } from "../components/BackButton";
import { fetchAttendeeImpact } from "../api/mockAttendeeImpactApi";
import type { AttendeeImpactPayload, PastGreenEvent } from "../mocks/attendeeImpactData";
import { EcoImpactHero } from "../components/attendee/EcoImpactHero";
import { GreenTimeline } from "../components/attendee/GreenTimeline";
import { ImpactTrophyCase } from "../components/attendee/ImpactTrophyCase";
import { TicketStubsGallery } from "../components/attendee/TicketStubsGallery";
import { ShareImpactCardModal } from "../components/attendee/ShareImpactCardModal";
import {
  fetchMyTickets,
  fetchPublishedEvents,
  fetchSavedEvents,
  unsaveEventById,
  type ApiEvent,
  type ApiTicket,
} from "../api/eventleafApi";
import type { TicketStubRecord } from "../mocks/attendeeImpactData";

const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDnOzVJfB7xx40z1WVf-qoPjw7WUXx4Qt82hn5m8o31QBxf9XSxKObGW976MJyh05WZVAxF4nFTES2SQy5ZW6RVELPPHYf9zceW8S4ondIFtViysJ_q6xeonlaDMCM3ov3KNtrvkAG6MTDlJHlQ59H8NDjsE0SbqlH1kSTm6KO6m8rR9GbPyowmBagTxQq_rTiZjTjoi8aK6GqGiHBfm4x6cIyTd2PaNn6_tUEuwsHw6_eyPhgv4GknPeBCM8LS4tzVgiehfVv68g";
const AVATAR_HEADER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1o3grplRRO5eHkBed9M0tQ5sur273hPulAZmZGqd6fcwGTcBwReNNPCv8mnFdHMJ9NiBwLFtKqIsICOAeo3MuL4vDvJ2ypKnaAiQ54FJr3B7gTDal34zbf1UxlCDPI6a6aXkiAPUNW0pNKCkxVxjao2OUFD5ube_IzPWc22lyukb3Ui_8K2pTD9NuFroPP0K4t9JNISrYR0fuPCzzebPEe5tnuVWOZbQp5ubQwN-J4_QkgKz_Se-SDit-ttJOa0e_ewIUpCm47RA";
type ProfileTab = "tickets" | "impact" | "stubs" | "saved";

export function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>("impact");
  const [qrModalTicket, setQrModalTicket] = useState<ApiTicket | null>(null);
  const [impact, setImpact] = useState<AttendeeImpactPayload | null>(null);
  const [impactLoading, setImpactLoading] = useState(true);
  const [impactError, setImpactError] = useState<string | null>(null);
  const [shareEvent, setShareEvent] = useState<PastGreenEvent | null>(null);
  const [viewer, setViewer] = useState<{ user_id: string; email: string; username?: string; is_organizer?: boolean } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<ApiEvent[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [myTickets, setMyTickets] = useState<ApiTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [stubEvents, setStubEvents] = useState<ApiEvent[]>([]);
  const [stubsLoading, setStubsLoading] = useState(false);
  const [stubsError, setStubsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAuthLoading(true);
    fetch("/api/v1/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthorized");
        return (await res.json()) as { user_id: string; email: string; username?: string; is_organizer?: boolean };
      })
      .then((data) => {
        if (!cancelled) setViewer(data);
      })
      .catch(() => {
        if (!cancelled) navigate("/login");
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setImpactLoading(true);
    setImpactError(null);
    fetchAttendeeImpact()
      .then((data) => {
        if (!cancelled) setImpact(data);
      })
      .catch(() => {
        if (!cancelled) setImpactError("We couldn’t load your impact history. Try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) setImpactLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if ((activeTab !== "tickets" && activeTab !== "stubs") || authLoading) return;
    let cancelled = false;
    setTicketsLoading(true);
    setTicketsError(null);
    fetchMyTickets()
      .then((data) => {
        if (!cancelled) setMyTickets(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setTicketsError(e.message || "Could not load tickets");
      })
      .finally(() => {
        if (!cancelled) setTicketsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, authLoading]);

  useEffect(() => {
    if (activeTab !== "stubs" || authLoading) return;
    let cancelled = false;
    setStubsLoading(true);
    setStubsError(null);
    fetchPublishedEvents(500)
      .then((data) => {
        if (!cancelled) setStubEvents(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setStubsError(e.message || "Could not load event sustainability details");
      })
      .finally(() => {
        if (!cancelled) setStubsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, authLoading]);

  const purchasedTicketStubs = useMemo<TicketStubRecord[]>(() => {
    const now = Date.now();
    const eventsById = new Map(stubEvents.map((e) => [e.id, e]));

    return myTickets
      .filter((ticket) => {
        const dateIso = ticket.event_date || ticket.purchase_date;
        const ts = new Date(dateIso).getTime();
        return Number.isFinite(ts) && ts < now;
      })
      .map((ticket) => {
        const eventMeta = eventsById.get(ticket.event_id);
        const sustainabilityBits: string[] = [];
        if (eventMeta?.venue_eco_certifications?.length) {
          sustainabilityBits.push(eventMeta.venue_eco_certifications[0]);
        }
        if (eventMeta?.is_eco_friendly) sustainabilityBits.push("green-verified event");
        if (eventMeta?.has_paperless_checkin || eventMeta?.has_digital_ticketing) sustainabilityBits.push("paperless check-in");
        if (eventMeta?.has_public_transit) sustainabilityBits.push("public transit access");

        return {
          id: ticket.id,
          eventName: ticket.event_title || "Event",
          dateIso: ticket.event_date || ticket.purchase_date,
          venue: ticket.venue_name || "Venue TBD",
          ticketId: ticket.ticket_number,
          qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket.qr_code_value)}`,
          sustainabilityNote:
            sustainabilityBits.length > 0
              ? sustainabilityBits.join(" · ")
              : "Digital ticket archived from your completed purchase",
          co2AvoidedKg: eventMeta?.has_paperless_checkin || eventMeta?.has_digital_ticketing ? 0.2 : undefined,
        };
      });
  }, [myTickets, stubEvents]);

  useEffect(() => {
    if (activeTab !== "saved" || authLoading) return;
    let cancelled = false;
    setSavedLoading(true);
    setSavedError(null);
    fetchSavedEvents()
      .then((data) => {
        if (!cancelled) setSavedEvents(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setSavedError(e.message || "Could not load saved events");
      })
      .finally(() => {
        if (!cancelled) setSavedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, authLoading]);

  const mockLinks = {
    createEvent: "/organizer/events",
    editProfile: "/profile/edit",
    shareImpact: "#/profile/share-impact",
    discover: "/events",
    filter: "#/profile/filter",
  };

  const displayName = impact?.displayName ?? "Vivek Chengannassery";
  const effectiveName = viewer?.username ? `@${viewer.username}` : displayName;
  const homeCity = impact?.homeCity ?? "Portland, Oregon";
  const sustainabilityScore = impact ? Math.round(impact.rankProgressPercent * 10 + 50) : 850;
  const profileSubtitle = viewer?.email ?? homeCity;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-leaf font-display">
      <header className="sticky top-0 z-50 w-full border-b border-border-leaf bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 sm:px-6 md:px-20">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 md:gap-8">
            <BackButton fallbackTo="/events" />
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link to={mockLinks.discover} className="text-sm font-semibold hover:text-primary transition-colors">
                Discover Events
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 justify-end items-center gap-2 sm:gap-3">
            <Link
              to="/organizer"
              className="hidden xl:inline-flex items-center justify-center gap-2 rounded-lg border border-border-leaf bg-neutral-bg px-3 py-2 text-sm font-bold text-text-leaf transition-colors hover:bg-soft-green dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              Organizer Dashboard
            </Link>
            <Link
              to={mockLinks.createEvent}
              className="hidden xl:inline-flex items-center justify-center gap-2 rounded-lg border border-border-leaf bg-neutral-bg px-3 py-2 text-sm font-bold text-text-leaf transition-colors hover:bg-soft-green dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Create Event
            </Link>
            <Link
              to={mockLinks.editProfile}
              className="size-10 shrink-0 rounded-full bg-cover bg-center border-2 border-primary cursor-pointer block"
              style={{ backgroundImage: `url('${AVATAR_HEADER}')` }}
              aria-label="Profile"
            />
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/v1/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
                navigate("/login");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-leaf bg-neutral-bg px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-subtext-leaf transition-colors hover:bg-soft-green dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span className="hidden xl:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 md:px-20 md:py-8">
        <section className="mb-6 rounded-2xl bg-white dark:bg-[#1a2e1c] p-5 shadow-sm border border-border-leaf sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <div
                  className="size-20 sm:size-24 md:size-32 rounded-full border-4 border-primary/20 bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url('${PROFILE_IMAGE}')` }}
                  role="img"
                  aria-label={displayName}
                />
                <div className="absolute bottom-1 right-1 size-8 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                  <span className="material-symbols-outlined text-white text-sm fill">verified</span>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{authLoading ? "Loading..." : effectiveName}</h1>
                <p className="text-subtext-leaf font-medium flex items-center gap-1 text-sm sm:text-base">
                  <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                  <span className="truncate">{profileSubtitle}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-neutral-bg dark:bg-white/5 text-subtext-leaf rounded-full text-xs font-bold uppercase tracking-wider">
                    {impact ? `${impact.rankLabel} member` : "Eco-Enthusiast"}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-text-leaf border border-primary/20 rounded-full text-xs font-bold">
                    Join Date: June 2023
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto">
              <div className="bg-gradient-to-br from-primary to-[#1dbb2b] p-4 rounded-xl text-text-leaf shadow-md flex flex-col items-center w-full md:w-auto min-w-[180px]">
                <span className="text-xs font-bold uppercase tracking-tighter opacity-80">Sustainability score</span>
                <span className="text-4xl font-black">{sustainabilityScore}</span>
                <div className="w-full bg-black/10 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full transition-all"
                    style={{ width: `${impact ? impact.rankProgressPercent : 85}%` }}
                  />
                </div>
                <span className="text-[10px] mt-1 font-bold text-center px-1">
                  {impact
                    ? `${impact.rankProgressPercent}% toward next impact rank`
                    : "92nd percentile of users"}
                </span>
              </div>
              <div className="flex w-full flex-wrap gap-2 justify-center md:justify-end">
                <Link
                  to={mockLinks.createEvent}
                  className="xl:hidden inline-flex items-center justify-center gap-2 rounded-lg border border-border-leaf bg-neutral-bg px-4 py-2 text-sm font-bold text-text-leaf transition-colors hover:bg-soft-green flex-1 sm:flex-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Create Event
                </Link>
                <Link
                  to={mockLinks.editProfile}
                  className="inline-flex items-center justify-center rounded-lg border border-border-leaf bg-neutral-bg px-4 py-2 text-sm font-bold text-text-leaf transition-colors hover:bg-soft-green text-center flex-1 sm:flex-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab("impact")}
                  className="inline-flex items-center justify-center rounded-lg border border-border-leaf bg-neutral-bg px-4 py-2 text-sm font-bold text-text-leaf transition-colors hover:bg-soft-green flex-1 sm:flex-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  View impact
                </button>
              </div>
            </div>
          </div>
        </section>

        {impactLoading && (
          <div className="mb-6 rounded-2xl border border-border-leaf bg-white p-8 text-center text-subtext-leaf dark:bg-[#1a2e1c]">
            <span className="material-symbols-outlined animate-pulse text-3xl text-primary">forest</span>
            <p className="mt-2 text-sm font-semibold">Growing your impact dashboard…</p>
          </div>
        )}
        {impactError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {impactError}
          </div>
        )}
        {impact && !impactLoading && (
          <div className="mb-8">
            <EcoImpactHero
              digitalTicketsUsed={impact.digitalTicketsUsed}
              sheetsAvoided={impact.sheetsAvoided}
              venueCertifiedEventCount={impact.venueCertifiedEventCount}
              homeCity={impact.homeCity}
              showTravelFootprint={impact.locationShared}
              totalCommuteKm={impact.totalCommuteKm}
              travelFootprintKg={impact.travelFootprintKg}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            <div className="flex border-b border-border-leaf overflow-x-auto -mx-1 px-1">
              <button
                type="button"
                onClick={() => setActiveTab("tickets")}
                className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === "tickets"
                    ? "border-primary text-text-leaf dark:text-white"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                My tickets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("impact")}
                className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === "impact"
                    ? "border-primary text-text-leaf dark:text-white"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">eco</span>
                Impact history
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stubs")}
                className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === "stubs"
                    ? "border-primary text-text-leaf dark:text-white"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">collections_bookmark</span>
                Ticket stubs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === "saved"
                    ? "border-primary text-text-leaf dark:text-white"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">favorite</span>
                Saved
              </button>
            </div>

            {activeTab === "tickets" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-bold">Upcoming events</h3>
                  <Link
                    to={mockLinks.filter}
                    className="text-sm font-bold text-subtext-leaf hover:text-primary flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filter
                  </Link>
                </div>
                {ticketsLoading ? (
                  <p className="py-8 text-center text-subtext-leaf">Loading your tickets…</p>
                ) : ticketsError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                  >
                    {ticketsError}
                  </div>
                ) : myTickets.length === 0 ? (
                  <p className="py-8 text-center text-subtext-leaf">No tickets yet. Buy a ticket from an event page first.</p>
                ) : (
                  myTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1a2e1c] p-4 sm:p-5 shadow-sm border border-border-leaf flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md hover:border-primary/40"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-bg dark:bg-white/5 text-subtext-leaf">
                        <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {ticket.event_title || "Event"}
                            </h4>
                            <p className="text-sm text-subtext-leaf flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">calendar_month</span>
                              {ticket.event_date || "Date TBD"}
                            </p>
                            <p className="text-sm text-subtext-leaf flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {ticket.venue_name || "Venue TBD"}
                            </p>
                            <p className="text-xs text-subtext-leaf mt-1 font-mono">{ticket.ticket_number}</p>
                          </div>
                          <span className="bg-neutral-bg dark:bg-white/5 text-[10px] font-bold px-2 py-1 rounded text-subtext-leaf uppercase w-fit">
                            {ticket.ticket_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 sm:pl-4 sm:border-l border-border-leaf border-t sm:border-t-0 pt-4 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => setQrModalTicket(ticket)}
                          className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                          aria-label={`View QR for ${ticket.event_title || "event"}`}
                        >
                          <span className="material-symbols-outlined text-3xl font-light">qr_code_2</span>
                        </button>
                        <span className="text-[10px] font-bold text-subtext-leaf uppercase">View QR</span>
                      </div>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("stubs")}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border-leaf text-subtext-leaf font-semibold text-sm hover:bg-white dark:hover:bg-white/5 hover:border-primary transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">history</span>
                  Open ticket stub archive ({purchasedTicketStubs.length} stubs)
                </button>
              </div>
            )}

            {activeTab === "impact" && impact && (
              <GreenTimeline events={impact.pastEvents} onShareEvent={(ev) => setShareEvent(ev)} />
            )}
            {activeTab === "impact" && !impact && !impactLoading && (
              <p className="py-8 text-center text-subtext-leaf">Impact history will appear once your data loads.</p>
            )}

            {activeTab === "stubs" && (ticketsLoading || stubsLoading) && (
              <p className="py-8 text-center text-subtext-leaf">Loading your purchased ticket stubs…</p>
            )}
            {activeTab === "stubs" && (ticketsError || stubsError) && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
              >
                {ticketsError || stubsError}
              </div>
            )}
            {activeTab === "stubs" && !ticketsLoading && !stubsLoading && !ticketsError && !stubsError && purchasedTicketStubs.length > 0 && (
              <TicketStubsGallery stubs={purchasedTicketStubs} />
            )}
            {activeTab === "stubs" && !ticketsLoading && !stubsLoading && !ticketsError && !stubsError && purchasedTicketStubs.length === 0 && (
              <p className="py-8 text-center text-subtext-leaf">
                No past ticket stubs yet. Completed event purchases will appear here automatically.
              </p>
            )}

            {activeTab === "saved" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-leaf dark:text-white">Saved events</h3>
                    <p className="text-sm text-subtext-leaf">
                      Events you bookmarked from Discover. Save more from{" "}
                      <Link to="/events" className="font-bold text-primary hover:underline">
                        Discover
                      </Link>
                      .
                    </p>
                  </div>
                </div>
                {savedLoading ? (
                  <p className="py-8 text-center text-subtext-leaf">Loading saved events…</p>
                ) : savedError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                  >
                    {savedError}
                  </div>
                ) : savedEvents.length === 0 ? (
                  <p className="py-8 text-center text-subtext-leaf">
                    Nothing saved yet. Open{" "}
                    <Link to="/events" className="font-bold text-primary hover:underline">
                      Discover
                    </Link>{" "}
                    and tap the heart on a card.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {savedEvents.map((ev) => (
                      <li
                        key={ev.id}
                        className="flex flex-col gap-3 rounded-xl border border-border-leaf bg-white p-4 shadow-sm dark:bg-[#1a2e1c] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/events/${ev.id}`}
                            className="font-bold text-text-leaf dark:text-white hover:text-primary transition-colors"
                          >
                            {ev.title}
                          </Link>
                          <p className="text-sm text-subtext-leaf mt-1">
                            {ev.event_date}
                            {ev.venue_city ? ` · ${ev.venue_city}` : ""}
                            {ev.venue_name ? ` · ${ev.venue_name}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Link
                            to={`/events/${ev.id}`}
                            className="inline-flex items-center justify-center rounded-lg border border-border-leaf px-3 py-2 text-sm font-bold hover:bg-soft-green transition-colors"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-900 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                            onClick={async () => {
                              try {
                                await unsaveEventById(ev.id);
                                setSavedEvents((prev) => prev.filter((x) => x.id !== ev.id));
                              } catch {
                                /* ignore */
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            {impact && !impactLoading ? (
              <ImpactTrophyCase
                rank={impact.rank}
                rankProgressPercent={impact.rankProgressPercent}
                pointsToNextRank={impact.pointsToNextRank}
                badges={impact.milestoneBadges}
              />
            ) : (
              <div className="rounded-2xl border border-border-leaf bg-white p-6 shadow-sm dark:bg-[#1a2e1c]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Impact level</h3>
                  <span className="material-symbols-outlined text-subtext-leaf animate-pulse">emoji_events</span>
                </div>
                <p className="text-sm text-subtext-leaf">Loading badges and rank…</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {qrModalTicket && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <div className="bg-white dark:bg-[#1a2e1c] rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-subtext-leaf hover:text-text-leaf"
              onClick={() => setQrModalTicket(null)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 id="qr-modal-title" className="text-xl font-bold mb-1">
              Your digital ticket
            </h3>
            <p className="text-sm text-subtext-leaf mb-6">{qrModalTicket.event_title || "Your event"}</p>
            <div className="bg-neutral-bg dark:bg-white/5 p-6 rounded-xl inline-block mb-6 border-2 border-border-leaf">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  qrModalTicket.qr_code_value
                )}`}
                alt="QR Code for Event Entry"
                className="mx-auto w-40 h-40 object-contain bg-white p-2 rounded"
              />
            </div>
            <div className="text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm gap-2">
                <span className="opacity-60 shrink-0">Attendee</span>
                <span className="font-bold text-right">{displayName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Ticket ID</span>
                <span className="font-bold">{qrModalTicket.ticket_number}</span>
              </div>
              <div className="flex justify-between text-sm gap-2">
                <span className="opacity-60 shrink-0">QR value</span>
                <span className="font-mono text-xs text-right break-all">{qrModalTicket.qr_code_value}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShareImpactCardModal event={shareEvent} attendeeName={displayName} onClose={() => setShareEvent(null)} />
    </div>
  );
}
