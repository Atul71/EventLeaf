import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDnOzVJfB7xx40z1WVf-qoPjw7WUXx4Qt82hn5m8o31QBxf9XSxKObGW976MJyh05WZVAxF4nFTES2SQy5ZW6RVELPPHYf9zceW8S4ondIFtViysJ_q6xeonlaDMCM3ov3KNtrvkAG6MTDlJHlQ59H8NDjsE0SbqlH1kSTm6KO6m8rR9GbPyowmBagTxQq_rTiZjTjoi8aK6GqGiHBfm4x6cIyTd2PaNn6_tUEuwsHw6_eyPhgv4GknPeBCM8LS4tzVgiehfVv68g";
const AVATAR_HEADER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1o3grplRRO5eHkBed9M0tQ5sur273hPulAZmZGqd6fcwGTcBwReNNPCv8mnFdHMJ9NiBwLFtKqIsICOAeo3MuL4vDvJ2ypKnaAiQ54FJr3B7gTDal34zbf1UxlCDPIa6aXkiAPUNW0pNKCkxVxjao2OUFD5ube_IzPWc22lyukb3Ui_8K2pTD9NuFroPP0K4t9JNISrYR0fuPCzzebPEe5tnuVWOZbQp5ubQwN-J4_QkgKz_Se-SDit-ttJOa0e_ewIUpCm47RA";
const EVENT_IMAGE_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXaf7r5E82omvGNLSFSsKstOAPPdjuGdb3tpCzVwSGEEyNwmdJdg97wKlrlIOFArmIR6UkbzeeZIQ2ryHZcm5zKMNsbgYfKYzlXwAA2T7QZ_A53D8tvGh9Fg-9Ou3GvIhL8E5eK7UkyYiMqA5JK8BohK3qnzcXM3UWgSH8AXeWPvWMWt0mM5wcHAdo69mMtL15SBikFxS7aolm3dRytp6G8A-crgK3pHOl1z0Aj9HNzhDpE-KUmj8PFiJmY5eorX_l1N0kFQNNHg";
const EVENT_IMAGE_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAI0lRqLsSz2FJaw5YB6CrMLPzpvdHolIt9N-arrgNnWrnaYgygcHQCT23A6w30wFTP45TQqbmc64j9MrCtwU3L3BVokhU_SHW-E0H3tMgVrRtcTkH8_P21dCgOpC9mcWMI21FFw0Jgho8vErlwjEcibhASugfMTB1jsTY6Mk5JDWLD98-lyedhnlo-PbUonQ_ySSFZ_pHxs2XC0k8u1L8r6MMRhEIqX5jG0tHGPPqN2-5pmhsJePyvDb5UD_IXkKAynmuNdJy_-g";
const QR_CODE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDWtW5ZKqOExTNPyI1rhkfCxtgxo-b-6j2naSx60wvoA6KB5Kk61hx3ZGsb_bi0Ah6XjSAeC7mtc_Rsl7q26sbPjDQFb_LmAgDmNFVgDjSg8oMp73I-dWn5ZoloSUxRc8RysmkkQLWxkXUspbXTejWKzddwOx8aNOA_K0LdLcEg58PUac0CtGdc_YMIKiUZwHkIB7Fhms56dW6dI7bu7D8VMyqEvKkiaaZ2dhTkj97muGImoqNIqXA3Kssut41usUd9hbEaIyh7bw";

type ProfileTab = "tickets" | "events" | "saved" | "settings";

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("tickets");
  const [qrModalEvent, setQrModalEvent] = useState<string | null>(null);

  // Mock link handlers – replace with real navigation or API calls later
  const mockLinks = {
    createEvent: "#/create-event",
    editProfile: "#/profile/edit",
    shareImpact: "#/profile/share-impact",
    discover: "#/discover",
    events: "#/events",
    impact: "#/impact",
    filter: "#/profile/filter",
    viewPastTickets: "#/profile/past-tickets",
    fullReport: "#/sustainability-report",
    downloadWallet: "#/download-wallet",
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-leaf font-display">
      <header className="sticky top-0 z-50 w-full border-b border-border-leaf bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-3">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link to={mockLinks.discover} className="text-sm font-semibold hover:text-primary transition-colors">
                Discover
              </Link>
              <Link to={mockLinks.events} className="text-sm font-semibold hover:text-primary transition-colors">
                Events
              </Link>
              <Link to={mockLinks.impact} className="text-sm font-semibold hover:text-primary transition-colors">
                Impact
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-4 items-center">
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
              className="size-10 rounded-full bg-cover bg-center border-2 border-primary cursor-pointer block"
              style={{ backgroundImage: `url('${AVATAR_HEADER}')` }}
              aria-label="Profile"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-6 md:px-20 py-8">
        <section className="mb-8 rounded-2xl bg-white dark:bg-[#1a2e1c] p-6 shadow-sm border border-border-leaf">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className="size-24 md:size-32 rounded-full border-4 border-primary/20 bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url('${PROFILE_IMAGE}')` }}
                  role="img"
                  aria-label="Alex Greenwood"
                />
                <div className="absolute bottom-1 right-1 size-8 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                  <span className="material-symbols-outlined text-white text-sm fill">verified</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Alex Greenwood</h1>
                <p className="text-subtext-leaf font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Portland, Oregon
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-neutral-bg dark:bg-white/5 text-subtext-leaf rounded-full text-xs font-bold uppercase tracking-wider">
                    Eco-Enthusiast
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-text-leaf border border-primary/20 rounded-full text-xs font-bold">
                    Join Date: June 2023
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="bg-gradient-to-br from-primary to-[#1dbb2b] p-4 rounded-xl text-text-leaf shadow-md flex flex-col items-center w-full md:w-auto min-w-[180px]">
                <span className="text-xs font-bold uppercase tracking-tighter opacity-80">Sustainability Score</span>
                <span className="text-4xl font-black">850</span>
                <div className="w-full bg-black/10 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[85%]" />
                </div>
                <span className="text-[10px] mt-1 font-bold">92nd Percentile of Users</span>
              </div>
              <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                <Link
                  to={mockLinks.createEvent}
                  className="lg:hidden flex items-center gap-2 px-6 py-2 rounded-lg bg-primary font-bold text-sm text-text-leaf shadow-md hover:brightness-105 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Create Event
                </Link>
                <Link
                  to={mockLinks.editProfile}
                  className="px-4 py-2 rounded-lg bg-neutral-bg dark:bg-white/5 font-bold text-sm hover:bg-border-leaf transition-colors"
                >
                  Edit Profile
                </Link>
                <Link
                  to={mockLinks.shareImpact}
                  className="px-4 py-2 rounded-lg border-2 border-primary/30 font-bold text-sm hover:bg-primary/5 transition-all"
                >
                  Share Impact
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex border-b border-border-leaf overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("tickets")}
                className={`whitespace-nowrap px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "tickets"
                    ? "border-primary text-text-leaf"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                My Tickets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`whitespace-nowrap px-6 py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "events"
                    ? "border-primary text-text-leaf"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">event_available</span>
                My Events
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`whitespace-nowrap px-6 py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "saved"
                    ? "border-primary text-text-leaf"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">favorite</span>
                Saved
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`whitespace-nowrap px-6 py-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "settings"
                    ? "border-primary text-text-leaf"
                    : "border-transparent text-subtext-leaf hover:text-text-leaf"
                }`}
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                Settings
              </button>
            </div>

            {activeTab === "tickets" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Upcoming Events</h3>
                  <Link
                    to={mockLinks.filter}
                    className="text-sm font-bold text-subtext-leaf hover:text-primary flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filter
                  </Link>
                </div>

                <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1a2e1c] p-5 shadow-sm border border-border-leaf flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/40">
                  <div
                    className="size-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${EVENT_IMAGE_1}')` }}
                    role="img"
                    aria-label="Event"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
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
                      <span className="bg-neutral-bg dark:bg-white/5 text-[10px] font-bold px-2 py-1 rounded text-subtext-leaf uppercase flex-shrink-0">
                        Standard Pass
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 pl-4 border-l border-border-leaf flex-shrink-0">
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

                <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1a2e1c] p-5 shadow-sm border border-border-leaf flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/40">
                  <div
                    className="size-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${EVENT_IMAGE_2}')` }}
                    role="img"
                    aria-label="Event"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
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
                      <span className="bg-neutral-bg dark:bg-white/5 text-[10px] font-bold px-2 py-1 rounded text-subtext-leaf uppercase flex-shrink-0">
                        VIP Guest
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 pl-4 border-l border-border-leaf flex-shrink-0">
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
              </div>
            )}

            {activeTab === "events" && (
              <div className="py-8 text-center text-subtext-leaf">My Events content (mock)</div>
            )}
            {activeTab === "saved" && (
              <div className="py-8 text-center text-subtext-leaf">Saved content (mock)</div>
            )}
            {activeTab === "settings" && (
              <div className="py-8 text-center text-subtext-leaf">Settings content (mock)</div>
            )}

            {activeTab === "tickets" && (
              <div className="pt-4">
                <Link
                  to={mockLinks.viewPastTickets}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border-leaf text-subtext-leaf font-semibold text-sm hover:bg-white dark:hover:bg-white/5 hover:border-primary transition-all flex items-center justify-center"
                >
                  View 12 Past Digital Tickets
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#1a2e1c] rounded-2xl p-6 shadow-sm border border-border-leaf">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">My Eco Impact</h3>
                <span className="material-symbols-outlined text-primary fill">auto_awesome</span>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-neutral-bg dark:bg-white/5 p-4 border border-primary/10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-tight">Paper Saved</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black">124</span>
                    <span className="text-sm font-bold text-subtext-leaf pb-1">Sheets</span>
                    <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                      +12%
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-neutral-bg dark:bg-white/5 p-4 border border-primary/10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">co2</span>
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-tight">Carbon Offset</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black">45.2</span>
                    <span className="text-sm font-bold text-subtext-leaf pb-1">kg CO₂</span>
                    <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                      +5.1%
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-neutral-bg dark:bg-white/5 p-4 border border-primary/10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">forest</span>
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-tight">Trees Planted</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black">12</span>
                    <span className="text-sm font-bold text-subtext-leaf pb-1">Saplings</span>
                    <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      New Milestone
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border-leaf">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-text-leaf">military_tech</span>
                  <h4 className="font-bold">Eco-Rank: Oak</h4>
                </div>
                <div className="w-full bg-neutral-bg dark:bg-white/5 h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-3/4" />
                </div>
                <p className="text-[11px] font-semibold text-subtext-leaf mt-2">
                  1,250 points until 'Giant Sequoia' rank
                </p>
              </div>
            </div>

            <div className="bg-background-dark text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -top-4 -right-4 size-24 bg-primary/20 rounded-full blur-2xl" />
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative">
                <span className="material-symbols-outlined text-primary">cloud</span>
                Footprint Detail
              </h3>
              <div className="space-y-3 relative">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Travel Impact</span>
                  <span className="font-bold">Low (12kg)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Event Dining</span>
                  <span className="font-bold">Vegan Opted</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Merch Impact</span>
                  <span className="font-bold">Digital Only</span>
                </div>
              </div>
              <Link
                to={mockLinks.fullReport}
                className="w-full mt-6 py-2.5 rounded-lg bg-primary text-text-leaf font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform block text-center"
              >
                Full Sustainability Report
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {qrModalEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <div className="bg-white dark:bg-[#1a2e1c] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-subtext-leaf hover:text-text-leaf"
              onClick={() => setQrModalEvent(null)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 id="qr-modal-title" className="text-xl font-bold mb-1">Your Digital Ticket</h3>
            <p className="text-sm text-subtext-leaf mb-6">{qrModalEvent}</p>
            <div className="bg-neutral-bg dark:bg-white/5 p-6 rounded-xl inline-block mb-6 border-2 border-border-leaf">
              <img
                src={QR_CODE_IMAGE}
                alt="QR Code for Event Entry"
                className="mx-auto w-40 h-40 object-contain"
              />
            </div>
            <div className="text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Attendee</span>
                <span className="font-bold">Alex Greenwood</span>
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
    </div>
  );
}
