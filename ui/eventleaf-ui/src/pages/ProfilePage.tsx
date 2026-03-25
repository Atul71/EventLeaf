import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { fetchAttendeeImpact } from "../api/mockAttendeeImpactApi";
import type { AttendeeImpactPayload, PastGreenEvent } from "../mocks/attendeeImpactData";
import { EcoImpactHero } from "../components/attendee/EcoImpactHero";
import { GreenTimeline } from "../components/attendee/GreenTimeline";
import { ImpactTrophyCase } from "../components/attendee/ImpactTrophyCase";
import { TicketStubsGallery } from "../components/attendee/TicketStubsGallery";
import { ShareImpactCardModal } from "../components/attendee/ShareImpactCardModal";

const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDnOzVJfB7xx40z1WVf-qoPjw7WUXx4Qt82hn5m8o31QBxf9XSxKObGW976MJyh05WZVAxF4nFTES2SQy5ZW6RVELPPHYf9zceW8S4ondIFtViysJ_q6xeonlaDMCM3ov3KNtrvkAG6MTDlJHlQ59H8NDjsE0SbqlH1kSTm6KO6m8rR9GbPyowmBagTxQq_rTiZjTjoi8aK6GqGiHBfm4x6cIyTd2PaNn6_tUEuwsHw6_eyPhgv4GknPeBCM8LS4tzVgiehfVv68g";
const AVATAR_HEADER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1o3grplRRO5eHkBed9M0tQ5sur273hPulAZmZGqd6fcwGTcBwReNNPCv8mnFdHMJ9NiBwLFtKqIsICOAeo3MuL4vDvJ2ypKnaAiQ54FJr3B7gTDal34zbf1UxlCDPI6a6aXkiAPUNW0pNKCkxVxjao2OUFD5ube_IzPWc22lyukb3Ui_8K2pTD9NuFroPP0K4t9JNISrYR0fuPCzzebPEe5tnuVWOZbQp5ubQwN-J4_QkgKz_Se-SDit-ttJOa0e_ewIUpCm47RA";
const EVENT_IMAGE_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXaf7r5E82omvGNLSFSsKstOAPPdjuGdb3tpCzVwSGEEyNwmdJdg97wKlrlIOFArmIR6UkbzeeZIQ2ryHZcm5zKMNsbgYfKYzlXwAA2T7QZ_A53D8tvGh9Fg-9Ou3GvIhL8E5eK7UkyYiMqA5JK8BohK3qnzcXM3UWgSH8AXeWPvWMWt0mM5wcHAdo69mMtL15SBikFxS7aolm3dRytp6G8A-crgK3pHOl1z0Aj9HNzhDpE-KUmj8PFiJmY5eorX_l1N0kFQNNHg";
const EVENT_IMAGE_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAI0lRqLsSz2FJaw5YB6CrMLPzpvdHolIt9N-arrgNnWrnaYgygcHQCT23A6w30wFTP45TQqbmc64j9MrCtwU3L3BVokhU_SHW-E0H3tMgVrRtcTkH8_P21dCgOpC9mcWMI21FFw0Jgho8vErlwjEcibhASugfMTB1jsTY6Mk5JDWLD98-lyedhnlo-PbUonQ_ySSFZ_pHxs2XC0k8u1L8r6MMRhEIqX5jG0tHGPPqN2-5pmhsJePyvDb5UD_IXkKAynmuNdJy_-g";
const QR_CODE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDWtW5ZKqOExTNPyI1rhkfCxtgxo-b-6j2naSx60wvoA6KB5Kk61hx3ZGsb_bi0Ah6XjSA-C7mtc_Rsl7q26sbPjDQFb_LmAgDmNFVgDjSg8oMp73I-dWn5ZoloSUxRc8RysmkkQLWxkXUspbXTejWKzddwOx8aNOA_K0LdLcEg58PUac0CtGdc_YMIKiUZwHkIB7Fhms56dW6dI7bu7D8VMyqEvKkiaaZ2dhTkj97muGImoqNIqXA3Kssut41usUd9hbEaIyh7bw";

type ProfileTab = "tickets" | "impact" | "stubs" | "saved" | "settings";

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("impact");
  const [qrModalEvent, setQrModalEvent] = useState<string | null>(null);
  const [impact, setImpact] = useState<AttendeeImpactPayload | null>(null);
  const [impactLoading, setImpactLoading] = useState(true);
  const [impactError, setImpactError] = useState<string | null>(null);
  const [shareEvent, setShareEvent] = useState<PastGreenEvent | null>(null);

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

  const mockLinks = {
    createEvent: "/organizer/events",
    editProfile: "#/profile/edit",
    shareImpact: "#/profile/share-impact",
    discover: "#/discover",
    impact: "#/impact",
    filter: "#/profile/filter",
    downloadWallet: "#/download-wallet",
  };

  const displayName = impact?.displayName ?? "Vivek Chengannassery";
  const homeCity = impact?.homeCity ?? "Portland, Oregon";
  const sustainabilityScore = impact ? Math.round(impact.rankProgressPercent * 10 + 50) : 850;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-leaf font-display">
      <header className="sticky top-0 z-50 w-full border-b border-border-leaf bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 sm:px-6 md:px-20">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3 md:gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link to={mockLinks.discover} className="text-sm font-semibold hover:text-primary transition-colors">
                Discover
              </Link>
              <Link to={mockLinks.impact} className="text-sm font-semibold hover:text-primary transition-colors">
                Impact
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-2 items-center sm:gap-4">
            <Link
              to="/organizer"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-soft-green dark:bg-white/10 font-bold text-sm text-text-leaf dark:text-white border border-border-leaf dark:border-white/10 hover:bg-primary hover:text-background-dark hover:border-primary transition-all"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              Organizer Dashboard
            </Link>
            <Link
              to={mockLinks.createEvent}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary font-bold text-sm text-text-leaf shadow-sm hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Create Event
            </Link>
            <div className="hidden sm:flex max-w-xs w-full lg:max-w-[200px]">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtext-leaf text-xl">
                  search
                </span>
                <input
                  className="w-full rounded-lg border-none bg-neutral-bg dark:bg-white/5 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                  placeholder="Search..."
                  type="text"
                />
              </div>
            </div>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg bg-neutral-bg dark:bg-white/5 text-text-leaf hover:bg-primary/20 transition-colors"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link
              to={mockLinks.editProfile}
              className="size-10 shrink-0 rounded-full bg-cover bg-center border-2 border-primary cursor-pointer block"
              style={{ backgroundImage: `url('${AVATAR_HEADER}')` }}
              aria-label="Profile"
            />
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
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{displayName}</h1>
                <p className="text-subtext-leaf font-medium flex items-center gap-1 text-sm sm:text-base">
                  <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                  <span className="truncate">{homeCity}</span>
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
              <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                <Link
                  to={mockLinks.createEvent}
                  className="lg:hidden flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary font-bold text-sm text-text-leaf shadow-md hover:brightness-105 transition-all flex-1 sm:flex-none"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Create Event
                </Link>
                <Link
                  to={mockLinks.editProfile}
                  className="px-4 py-2 rounded-lg bg-neutral-bg dark:bg-white/5 font-bold text-sm hover:bg-border-leaf transition-colors text-center"
                >
                  Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab("impact")}
                  className="px-4 py-2 rounded-lg border-2 border-primary/30 font-bold text-sm hover:bg-primary/5 transition-all"
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
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === "settings"
                    ? "border-primary text-text-leaf dark:text-white"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                Settings
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

                <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1a2e1c] p-4 sm:p-5 shadow-sm border border-border-leaf flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md hover:border-primary/40">
                  <div
                    className="h-40 sm:h-20 sm:w-20 w-full rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${EVENT_IMAGE_1}')` }}
                    role="img"
                    aria-label="Event"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                          Global Green Summit 2024
                        </h4>
                        <p className="text-sm text-subtext-leaf flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_month</span>
                          Oct 12, 2024 • 09:00 AM
                        </p>
                        <p className="text-sm text-subtext-leaf flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          Oregon Convention Center
                        </p>
                      </div>
                      <span className="bg-neutral-bg dark:bg-white/5 text-[10px] font-bold px-2 py-1 rounded text-subtext-leaf uppercase w-fit">
                        Standard Pass
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 sm:pl-4 sm:border-l border-border-leaf border-t sm:border-t-0 pt-4 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setQrModalEvent("Global Green Summit 2024")}
                      className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                      aria-label="View QR for Global Green Summit 2024"
                    >
                      <span className="material-symbols-outlined text-3xl font-light">qr_code_2</span>
                    </button>
                    <span className="text-[10px] font-bold text-subtext-leaf uppercase">View QR</span>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1a2e1c] p-4 sm:p-5 shadow-sm border border-border-leaf flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md hover:border-primary/40">
                  <div
                    className="h-40 sm:h-20 sm:w-20 w-full rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${EVENT_IMAGE_2}')` }}
                    role="img"
                    aria-label="Event"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                          Urban Permaculture Workshop
                        </h4>
                        <p className="text-sm text-subtext-leaf flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_month</span>
                          Nov 05, 2024 • 02:00 PM
                        </p>
                        <p className="text-sm text-subtext-leaf flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          Community Garden Annex
                        </p>
                      </div>
                      <span className="bg-neutral-bg dark:bg-white/5 text-[10px] font-bold px-2 py-1 rounded text-subtext-leaf uppercase w-fit">
                        VIP Guest
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 sm:pl-4 sm:border-l border-border-leaf border-t sm:border-t-0 pt-4 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setQrModalEvent("Urban Permaculture Workshop")}
                      className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                      aria-label="View QR for Urban Permaculture Workshop"
                    >
                      <span className="material-symbols-outlined text-3xl font-light">qr_code_2</span>
                    </button>
                    <span className="text-[10px] font-bold text-subtext-leaf uppercase">View QR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("stubs")}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border-leaf text-subtext-leaf font-semibold text-sm hover:bg-white dark:hover:bg-white/5 hover:border-primary transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">history</span>
                  Open ticket stub archive ({impact?.ticketStubs.length ?? 3} saved)
                </button>
              </div>
            )}

            {activeTab === "impact" && impact && (
              <GreenTimeline events={impact.pastEvents} onShareEvent={(ev) => setShareEvent(ev)} />
            )}
            {activeTab === "impact" && !impact && !impactLoading && (
              <p className="py-8 text-center text-subtext-leaf">Impact history will appear once your data loads.</p>
            )}

            {activeTab === "stubs" && impact && <TicketStubsGallery stubs={impact.ticketStubs} />}
            {activeTab === "stubs" && !impact && !impactLoading && (
              <p className="py-8 text-center text-subtext-leaf">Ticket stubs will appear once your data loads.</p>
            )}

            {activeTab === "saved" && (
              <div className="py-8 text-center text-subtext-leaf">Saved content (mock)</div>
            )}
            {activeTab === "settings" && (
              <div className="py-8 text-center text-subtext-leaf">Settings content (mock)</div>
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

      {qrModalEvent && (
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
              onClick={() => setQrModalEvent(null)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 id="qr-modal-title" className="text-xl font-bold mb-1">
              Your digital ticket
            </h3>
            <p className="text-sm text-subtext-leaf mb-6">{qrModalEvent}</p>
            <div className="bg-neutral-bg dark:bg-white/5 p-6 rounded-xl inline-block mb-6 border-2 border-border-leaf">
              <img src={QR_CODE_IMAGE} alt="QR Code for Event Entry" className="mx-auto w-40 h-40 object-contain" />
            </div>
            <div className="text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm gap-2">
                <span className="opacity-60 shrink-0">Attendee</span>
                <span className="font-bold text-right">{displayName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Ticket ID</span>
                <span className="font-bold">#EF-88921-X</span>
              </div>
            </div>
            <Link
              to={mockLinks.downloadWallet}
              className="w-full bg-primary py-3 rounded-xl font-bold text-text-leaf shadow-md block text-center"
            >
              Download to Wallet
            </Link>
          </div>
        </div>
      )}

      <ShareImpactCardModal event={shareEvent} attendeeName={displayName} onClose={() => setShareEvent(null)} />
    </div>
  );
}
