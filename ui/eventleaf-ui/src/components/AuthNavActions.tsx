import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AUTH_SESSION_CHANGED_EVENT,
  fetchCurrentUser,
  logoutSession,
  type CurrentUser,
} from "../api/eventleafApi";

/**
 * Shared header actions: Login / Sign up when logged out; Discover, Organizer, Profile, Log out when logged in.
 * Refetches session when the route changes so the home page reflects the cookie after login/signup.
 */
export function AuthNavActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function load() {
      setLoading(true);
      fetchCurrentUser()
        .then((me) => {
          if (!cancelled) setUser(me);
        })
        .catch(() => {
          if (!cancelled) setUser(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, load);
    };
  }, [location.key, location.pathname]);

  async function handleLogout() {
    try {
      await logoutSession();
    } catch {
      /* still clear local UI */
    }
    setUser(null);
    navigate("/", { replace: true });
  }

  const linkMuted =
    "px-4 py-2 text-sm font-bold hover:text-primary transition-colors dark:text-gray-300 text-text-leaf";

  if (loading) {
    return (
      <div className="flex items-center gap-3" aria-busy="true">
        <span className="h-4 w-20 rounded bg-neutral-bg/80 dark:bg-white/10" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/login" className={linkMuted}>
          Login
        </Link>
        <Link
          to="/signup"
          className="bg-primary text-background-dark px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const label = user.username?.trim() ? `@${user.username}` : user.email.split("@")[0] ?? "Account";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <Link to="/events" className={`${linkMuted} hidden sm:inline`}>
        Discover
      </Link>
      {user.is_organizer ? (
        <Link to="/organizer" className={`${linkMuted} hidden sm:inline`}>
          Organizer
        </Link>
      ) : null}
      <Link to="/profile" className={`${linkMuted} max-w-[140px] truncate sm:max-w-none`} title={user.email}>
        {label}
      </Link>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="rounded-lg border border-border-green px-4 py-2 text-sm font-bold text-text-leaf hover:bg-soft-green dark:border-white/15 dark:text-white dark:hover:bg-white/10"
      >
        Log out
      </button>
    </div>
  );
}
