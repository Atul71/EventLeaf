import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";

const ORGANIZER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAMIwarmNgeQexN0-DdcY0-iNGx-hDEy8iyRBWb1GhVfDf2SMZ58EMvs_I5R6UC507BXKup7WyE0YXrsqpjM5BQFIhOprrhg1MRQubtjMgYCIl5sfRYoaZMuAlA6R02ciz7V-4z-12CXY9I9VPRMMlGSb0aPoyc7jgEZSXZXkhuNj21u-RuBp_siMbNqoeH_2KglWCA54eA7e8QuUzDHd6xbsM4cYHv4PJ8xuP0g76NBJgBQmyWNgYS0gx-wWWxhASaBq500bVMuz0";

const navItems = [
  { path: "/organizer", icon: "dashboard", label: "Overview" },
  { path: "/organizer/events", icon: "event", label: "My Events" },
  { path: "/organizer/analytics", icon: "monitoring", label: "Event Analytics" },
  { path: "/organizer/venues", icon: "location_on", label: "Browse Sustainable Venues" },
];

export function OrganizerSidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 border-r border-border-green bg-white dark:bg-[#152a17] hidden lg:flex flex-col sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === "/organizer/events"
              ? location.pathname.startsWith("/organizer/events")
              : item.path === "/organizer/analytics"
                ? location.pathname.startsWith("/organizer/analytics")
              : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-text-leaf font-semibold border-l-4 border-primary"
                  : "text-subtext-leaf hover:bg-background-light dark:hover:bg-white/5"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "fill" : ""}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border-green">
        <Link
          to="/organizer/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-subtext-leaf hover:bg-background-light dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Account Settings</span>
        </Link>
        <Link
          to="/profile"
          className="mt-4 p-4 bg-background-light dark:bg-white/5 rounded-xl flex items-center gap-3 hover:bg-primary/5 transition-colors"
        >
          <div
            className="size-10 rounded-full bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url('${ORGANIZER_AVATAR}')` }}
            role="img"
            aria-label="Organizer profile"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-text-leaf dark:text-white">
              Green Horizon Co.
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
