import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notifyAuthSessionChanged } from "../api/eventleafApi";
import { Logo } from "../components/Logo";

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const leafSvg = (
    <svg className="w-[400px] h-[400px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
    </svg>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed top-[-50px] left-[-50px] opacity-[0.04] rotate-[-15deg] pointer-events-none z-0 text-primary">{leafSvg}</div>
      <div className="fixed bottom-[-50px] right-[-50px] opacity-[0.04] rotate-[165deg] pointer-events-none z-0 text-primary">{leafSvg}</div>

      <nav className="relative z-10 w-full px-6 lg:px-20 py-6 flex justify-between items-center bg-transparent">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-subtext-leaf dark:text-primary/80 hidden md:inline">Already a member?</span>
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-bold text-text-leaf dark:text-white border border-border-green dark:border-primary/20 rounded-lg hover:bg-soft-green dark:hover:bg-primary/10 transition-colors"
          >
            Log In
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a2e1c] shadow-xl shadow-primary/5 rounded-2xl p-8 lg:p-10 border border-soft-green dark:border-primary/10">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-black text-text-leaf dark:text-white leading-tight mb-2">Create Account</h1>
            <p className="text-subtext-leaf dark:text-primary/70 text-sm">
              Join the eco-friendly event management movement today.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitError(null);
              setSubmitting(true);
              try {
                const fd = new FormData(e.currentTarget);
                const username = String(fd.get("username") ?? "").trim().toLowerCase();
                const email = String(fd.get("email") ?? "").trim();
                const password = String(fd.get("password") ?? "");
                const isOrganizer = fd.get("is_organizer") === "on";

                const res = await fetch("/api/v1/signup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    username,
                    email,
                    password,
                    is_organizer: isOrganizer,
                    is_eco_conscious: true,
                  }),
                });

                if (!res.ok) {
                  let msg = "Signup failed";
                  try {
                    const data = (await res.json()) as { error?: string };
                    if (data?.error) msg = data.error;
                  } catch {
                    /* ignore */
                  }
                  setSubmitError(msg);
                  return;
                }

                let path = "/profile";
                try {
                  const data = (await res.json()) as {
                    redirect_path?: string;
                    is_organizer?: boolean;
                  };
                  if (data.redirect_path) path = data.redirect_path;
                  else if (data.is_organizer) path = "/organizer";
                } catch {
                  /* keep default */
                }
                notifyAuthSessionChanged();
                navigate(path);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
              >
                <strong className="font-bold">Could not create account:</strong> {submitError}
              </div>
            ) : null}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-subtext-leaf dark:text-primary/60 px-1">
                Username
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtext-leaf text-xl transition-colors group-focus-within:text-primary">
                  person
                </span>
                <input
                  name="username"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f8fcf8] dark:bg-[#0d1b0f] border border-border-green dark:border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-leaf dark:text-white placeholder-subtext-leaf/50 transition-all"
                  placeholder="jane_doe"
                  type="text"
                  pattern="[a-z0-9_]+"
                  minLength={3}
                  maxLength={30}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-subtext-leaf dark:text-primary/60 px-1">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtext-leaf text-xl transition-colors group-focus-within:text-primary">
                  mail
                </span>
                <input
                  name="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f8fcf8] dark:bg-[#0d1b0f] border border-border-green dark:border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-leaf dark:text-white placeholder-subtext-leaf/50 transition-all"
                  placeholder="name@email.com"
                  type="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-subtext-leaf dark:text-primary/60 px-1">
                Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-subtext-leaf text-xl transition-colors group-focus-within:text-primary">
                  lock
                </span>
                <input
                  name="password"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#f8fcf8] dark:bg-[#0d1b0f] border border-border-green dark:border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-leaf dark:text-white placeholder-subtext-leaf/50 transition-all"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext-leaf hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-5 h-5 rounded border-border-green text-primary focus:ring-primary/30 cursor-pointer"
                  required
                />
              </div>
              <label className="text-xs text-subtext-leaf dark:text-primary/70 leading-relaxed cursor-pointer select-none" htmlFor="terms">
                I agree to the{" "}
                <a href="#terms" className="font-bold text-text-leaf dark:text-white hover:underline underline-offset-2">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#privacy" className="font-bold text-text-leaf dark:text-white hover:underline underline-offset-2">
                  Privacy Policy
                </a>{" "}
                regarding my personal data.
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs text-subtext-leaf dark:text-primary/70">
              <input id="is_organizer" name="is_organizer" type="checkbox" className="w-4 h-4 rounded border-border-green text-primary focus:ring-primary/30 cursor-pointer" />
              I want to create events as an organizer
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-[#25d633] text-text-leaf font-extrabold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>{submitting ? "Creating Account…" : "Create Account"}</span>
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-soft-green dark:border-primary/10" />
              <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-subtext-leaf/50">
                Or sign up with
              </span>
              <div className="flex-grow border-t border-soft-green dark:border-primary/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="#google-signup"
                className="flex items-center justify-center gap-2 py-3 border border-border-green dark:border-primary/10 rounded-xl bg-white dark:bg-transparent hover:bg-[#f8fcf8] dark:hover:bg-primary/5 transition-colors text-sm font-bold text-text-leaf dark:text-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </a>
              <a
                href="#apple-signup"
                className="flex items-center justify-center gap-2 py-3 border border-border-green dark:border-primary/10 rounded-xl bg-white dark:bg-transparent hover:bg-[#f8fcf8] dark:hover:bg-primary/5 transition-colors text-sm font-bold text-text-leaf dark:text-white"
              >
                <span className="material-symbols-outlined text-xl">ios</span>
                Apple
              </a>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-subtext-leaf dark:text-primary/50 text-xs">
          © 2024 EventLeaf Management Inc. <br className="md:hidden" /> Powered by 100% renewable energy workflows.
        </p>
      </main>
    </div>
  );
}
