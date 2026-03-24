import { Link } from "react-router-dom";
import { OrganizerSidebar } from "../components/organizer/OrganizerSidebar";

const EVENT_IMG_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTTO7SGQsfjzjFSjGtNfMDVM50HT6iuUwgPG2BrviA582MRrWlJjjpi9i8j1ZdXDNzWlwvVqNp0ylZ4j5tGbh-TIasvlQmREKzcm0YQKUFcb8nH1aZGekirij50Sdf9YyKBbzkIC1Y1hVM0psT43TBaAqvBKyj6dIE-jnZUz1py3f4L5NcRLAF2wsCIWVcZBzNmaRcCf9auacWqKaseQQH6FpPPgmSwo0CMJ1AaAMI9HzDvhQndGUyAss81QONqQeOE_YKKbJ51yY";
const EVENT_IMG_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVBlrdKcajr2htV8AzHTzfsGPwreu9S0-Aj7--vXLvglhtbDswXRpM6WGR4CXGG8x39etZsKOlrdIOfWv7h7tCrC3BxCS_iFAU7iRuYAVPP7TbusYRo8SLZzVpgOniKwxCZOARLHFY7k2bcrhhbUM50AcmH0aTvvAXg_Z0YmuEPk9s_X0JdjfbJ6HUkWtgZJUdJJU3gCt4b3z2oQuf910hV4wAXOe3DFTQlOrdgWGRy9StEM2Pq3sY5IdLnvpLHnz8OtqEheHuE9Q";
const VENUE_IMG_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAsiaNb_a9VGaXE2u39g7n_7nPjmdB56YY5Q1hLIXybpjmJb9NO2wrZ9oJTmoLwUb3bg6BKmmdZh8ezJH1C13BvPdlfxTA3rsulJpMVoO3ZpY4jF3jdKtiNMu_LUZl7G9ss722nyuhwJrR48L_T5XUnR6mlca-Y4EqK5pKIghciblfApJsBCFm4xHi6OLiTY3mwYEP6NIEvg5mzLgOAQR9IZRpXkvEGWnm8T7MzdyeSrB_6IOd1H_f-SdBuaW2i4YEK3HKHhU2juRQ";
const VENUE_IMG_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCxVbgm5qZMcd4DQSNgKApfOvSw67jmMmBsR7KKNAb3GrwNPO97cRT3-nxb0HjAnxwPDx4aSm4uS38cSUJKrfZOgSMkKk4rBS_MIFf6KfsfRJYrFpaNBtgjkCX3KFgpCKbix3uhHDgaZq2lntxbkI4CGrSiSJFN8Uxhrvbe7DjmjBENpW7MFuBysnthCAS0icQk1l8IV96bpRZBLMKFiUhoQQeFczCo4tbIpR6luJlodEjDYefQrI9JIxk-wB073kI7oDDP8fUcXMU";
const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBXIgz5X-84UHDodC3kQx2gU3EEFt5zJaRALaJ3kvqV5Sj2eQwDuKW_LOXpjEJSr3xN2bQgwRePykeqfO3Knn7lAfF6luJzkY9LqUjhLhAG8PJSI1ePnMUNB-nssyIhGXPtLMhcDKMWD3zxBrPsKStTAAOQtWIBt_TM5yEhwtguY0Inw_hslU5hDfvrua_sZt6V7VG_Rw8jVj4EfR7KcHMMmbsXR7dHBcNuUp3zyvRQadTfqtJzAvDwu3rezAxxSkHDqn0vOtU5WDA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKxRySe8auO9lqQmwhsa2aDssP_F66bQrhClkOkN2Eu-nKdGC4u7kDIKYG3KVTC7f0dc0RFkA_nuMQi9D3Elm-kKWPCdJgBD-YJTx6v4WsKEiL3JyWA4Du1SIkQgJDhxPeP_iioeCwq3UPIr11O4shqcT4ktysXucNuWHf2RTUKlDewESK-y2qM6-hhtNOD-EYAGqRMUCrTCATHevYUsXcaJ3ENiN4v-CR9bNzuqS7sSoRoDR6v5gdMhDXAFTUCFd9L_voK51xpsQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYg-8_IEjrNbxqO0nh3el-FtDLmPO_dATVPzchn_TKVHZPBalI77FxuY0s93EsQXI6JEslL7KfcIofw3UNsqgSeAb-r2NJSxqxpQIQmxBbjb95MqvNRF5uSylKNzRp6GPnpFaNhhkdr8NJO9ufRLAMl47LLyQ9AEuk2H4pN_nKqPXrYpsyHAYGbSC_qHTLHGsq2fThtuaqiLVeTyPgyN1DNFrCTnNCmzXCsBNCrQ4RZCQfO16qJfr5w-fpGUjotVU27sTwQF79JJQ",
];

export function OrganizerDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-leaf">
      <OrganizerSidebar />

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto min-h-screen"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(43,238,59,0.08) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-green px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold leading-none text-text-leaf dark:text-white">
              Green Horizon Events
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtext-leaf text-xl">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-background-light dark:bg-white/5 border-none rounded-lg focus:ring-2 focus:ring-primary w-64 text-sm text-text-leaf dark:text-white placeholder-subtext-leaf/50"
                placeholder="Search events..."
                type="text"
                aria-label="Search events"
              />
            </div>
            <Link
              to="/organizer/venues"
              className="flex items-center gap-2 bg-soft-green dark:bg-white/10 text-text-leaf dark:text-white font-bold px-5 py-2.5 rounded-lg border border-border-green dark:border-white/10 hover:bg-primary hover:text-background-dark hover:border-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">location_on</span>
              <span>Browse Sustainable Venues</span>
            </Link>
            <Link
              to="/organizer/events"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span>Create Event</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-subtext-leaf hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">person</span>
              Profile
            </Link>
            <button
              type="button"
              className="p-2 text-subtext-leaf hover:bg-background-light dark:hover:bg-white/5 rounded-lg relative"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Browse Sustainable Venues CTA - ideal flow entry point */}
          <Link
            to="/organizer/venues"
            className="block rounded-2xl border-2 border-primary/30 bg-soft-green/50 dark:bg-primary/10 p-6 hover:border-primary hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-3xl fill">eco</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-leaf dark:text-white group-hover:text-primary transition-colors">
                    Browse Sustainable Venues
                  </h2>
                  <p className="text-sm text-subtext-leaf mt-0.5">
                    Find eco-certified spaces and green auditoriums for your next event
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                Browse venues
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Impact metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Events Hosted", value: "128", icon: "calendar_today" },
              { label: "Attendees Reached", value: "45,200", icon: "groups" },
              { label: "Eco-Events Hosted", value: "98", icon: "eco" },
            ].map((m) => (
              <div
                key={m.icon}
                className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-border-green flex flex-col gap-1 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">{m.icon}</span>
                </div>
                <p className="text-sm font-medium text-subtext-leaf">{m.label}</p>
                <h3 className="text-3xl font-black text-text-leaf dark:text-white">{m.value}</h3>
              </div>
            ))}
          </div>

          {/* Event management */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-6 border-b border-border-green w-full max-w-md">
                <button
                  type="button"
                  className="pb-3 px-1 border-b-2 border-primary text-sm font-bold text-text-leaf dark:text-white"
                >
                  Active Events (4)
                </button>
                <button
                  type="button"
                  className="pb-3 px-1 border-b-2 border-transparent text-sm font-bold text-subtext-leaf hover:text-text-leaf dark:hover:text-white"
                >
                  Drafts (2)
                </button>
                <button
                  type="button"
                  className="pb-3 px-1 border-b-2 border-transparent text-sm font-bold text-subtext-leaf hover:text-text-leaf dark:hover:text-white"
                >
                  Past Events
                </button>
              </div>
              <Link
                to="/organizer/events"
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Event card 1 */}
              <div className="bg-white dark:bg-[#152a17] rounded-xl border border-border-green overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                <div
                  className="h-40 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${EVENT_IMG_1}')` }}
                  role="img"
                  aria-label="Eco-Innovate Summit"
                >
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-white/10 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-text-leaf">
                    Aug 24, 2024
                  </div>
                  <div className="absolute top-3 right-3 bg-primary text-background-dark p-1 rounded-full shadow-lg">
                    <span className="material-symbols-outlined text-sm block">eco</span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors text-text-leaf dark:text-white">
                    Eco-Innovate Summit
                  </h4>
                  <p className="text-xs text-subtext-leaf mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Seattle Convention Center
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-text-leaf dark:text-white">
                      <span>Tickets Sold</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-background-light dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "85%" }} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {AVATARS.slice(0, 3).map((src, i) => (
                          <div
                            key={i}
                            className="size-6 rounded-full border-2 border-white dark:border-background-dark bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url('${src}')` }}
                            aria-hidden
                          />
                        ))}
                        <div className="size-6 rounded-full border-2 border-white dark:border-background-dark bg-neutral-bg dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-text-leaf dark:text-white">
                          +12
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-bold text-subtext-leaf hover:text-primary"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event card 2 */}
              <div className="bg-white dark:bg-[#152a17] rounded-xl border border-border-green overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                <div
                  className="h-40 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${EVENT_IMG_2}')` }}
                  role="img"
                  aria-label="Solar Future Expo"
                >
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-white/10 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-text-leaf">
                    Sep 12, 2024
                  </div>
                  <div className="absolute top-3 right-3 bg-primary text-background-dark p-1 rounded-full shadow-lg">
                    <span className="material-symbols-outlined text-sm block">eco</span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors text-text-leaf dark:text-white">
                    Solar Future Expo
                  </h4>
                  <p className="text-xs text-subtext-leaf mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Virtual Event
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-text-leaf dark:text-white">
                      <span>Registrations</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full bg-background-light dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "42%" }} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        <div
                          className="size-6 rounded-full border-2 border-white dark:border-background-dark bg-cover bg-center"
                          style={{ backgroundImage: `url('${AVATARS[0]}')` }}
                          aria-hidden
                        />
                        <div
                          className="size-6 rounded-full border-2 border-white dark:border-background-dark bg-cover bg-center"
                          style={{ backgroundImage: `url('${AVATARS[1]}')` }}
                          aria-hidden
                        />
                        <div className="size-6 rounded-full border-2 border-white dark:border-background-dark bg-neutral-bg dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-text-leaf dark:text-white">
                          +82
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-bold text-subtext-leaf hover:text-primary"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add event card */}
              <Link
                to="/organizer/events"
                className="border-2 border-dashed border-border-green rounded-xl flex flex-col items-center justify-center p-8 text-subtext-leaf hover:bg-white dark:hover:bg-white/5 hover:border-primary transition-all group min-h-[280px]"
              >
                <span className="material-symbols-outlined text-4xl mb-2 group-hover:text-primary">
                  add_circle
                </span>
                <span className="font-bold">Create New Event</span>
                <span className="text-xs mt-1 opacity-60">Plan your next sustainable impact</span>
              </Link>
            </div>
          </div>

          {/* Recommended Venues */}
          <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-border-green shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-text-leaf dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Recommended Venues
              </h3>
              <Link
                to="/organizer/venues"
                className="text-xs font-bold text-primary hover:underline"
              >
                Browse Sustainable Venues →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/organizer/venues"
                className="flex items-center gap-4 p-3 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <div
                  className="size-12 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('${VENUE_IMG_1}')` }}
                  role="img"
                  aria-label="The Greenhouse Collective"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-leaf dark:text-white">
                    The Greenhouse Collective
                  </p>
                  <p className="text-xs text-subtext-leaf">LEED Platinum • Portland, OR</p>
                </div>
                <span className="material-symbols-outlined text-subtext-leaf">chevron_right</span>
              </Link>
              <Link
                to="/organizer/venues"
                className="flex items-center gap-4 p-3 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <div
                  className="size-12 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('${VENUE_IMG_2}')` }}
                  role="img"
                  aria-label="Austin Solar Pavilion"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-leaf dark:text-white">
                    Austin Solar Pavilion
                  </p>
                  <p className="text-xs text-subtext-leaf">
                    100% Renewable Energy • Austin, TX
                  </p>
                </div>
                <span className="material-symbols-outlined text-subtext-leaf">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>

        <footer className="p-8 border-t border-border-green text-center">
          <p className="text-sm text-subtext-leaf">
            © {new Date().getFullYear()} EventLeaf Eco-Management. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
