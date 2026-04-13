import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notifyAuthSessionChanged } from "../api/eventleafApi";
import { Logo } from "../components/Logo";

const FOREST_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpEmWVelUwcSzZyAK8us3qQoVjVA2FU20baHb23V3inyNgsg-uT5kFBPivpMvLPSPoz5znxlhSwC-tfbWc8DTke5rOnkIEPX5_cfq-J36i5bi5e6i_YhkqiUcI-6e5Du9o0kEgzxJvCrju15ctOvMD35TcTM-jTB3x13_cJwvs6Nfx--QBPCj7XgXm3tsMOOGgxJ0BBNtAevu1wTu90_PbL3_HD2VaBbtxOcSXrtpHCR0ZUnftfc5-U7mAfVKg71wBlEl5kf9Teg";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  function validateEmail(email: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Please enter a valid email address.";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) return "Please enter a valid email address.";
    return null;
  }

  function validatePassword(password: string) {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0d1b0f]">
          <div className="absolute inset-0 z-0">
            <img
              alt="Lush green forest"
              className="w-full h-full object-cover opacity-60"
              src={FOREST_IMAGE}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102212] via-transparent to-transparent opacity-80" />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
            <Logo className="text-white [&_h2]:text-white [&_div]:text-white" />
            <div className="max-w-md">
              <h1 className="text-white text-4xl font-black leading-tight tracking-tight mb-6">
                The greatest threat to our planet is the belief that someone else will save it.
              </h1>
              <p className="text-primary text-xl font-medium">— Robert Swan</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex justify-center mb-8">
              <Logo />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-text-leaf dark:text-white tracking-tight">Welcome back</h2>
              <p className="mt-2 text-subtext-leaf dark:text-primary/80">Organize with purpose, manage with ease.</p>
            </div>
            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitError(null);
                try {
                  const fd = new FormData(e.currentTarget);
                  const email = String(fd.get("email") ?? "").trim();
                  const password = String(fd.get("password") ?? "");

                  const nextEmailError = validateEmail(email);
                  const nextPasswordError = validatePassword(password);
                  setEmailError(nextEmailError);
                  setPasswordError(nextPasswordError);
                  if (nextEmailError || nextPasswordError) return;

                  setSubmitting(true);

                  const res = await fetch("/api/v1/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password }),
                  });

                  if (!res.ok) {
                    let msg = `Could not reach server (${res.status})`;
                    try {
                      const data = (await res.json()) as { error?: string };
                      if (data?.error) msg = data.error;
                    } catch {
                      if (res.status === 401 || res.status === 400) msg = "Invalid email or password";
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
                } catch {
                  setSubmitError("Network error — is the API running on port 3000?");
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
                  <strong className="font-bold">Could not sign in:</strong> {submitError}
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-leaf dark:text-white/90" htmlFor="email">
                  Email or Username
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-subtext-leaf">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input
                    className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/5 border border-border-green dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-leaf dark:text-white placeholder-subtext-leaf/50"
                    id="email"
                    name="email"
                    placeholder="name@company.com or username"
                    required
                    type="text"
                    autoComplete="username"
                    onBlur={(e) => {
                      setEmailError(validateEmail(e.currentTarget.value));
                    }}
                  />
                </div>
                {emailError ? <p className="text-sm text-red-700 dark:text-red-300">{emailError}</p> : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-text-leaf dark:text-white/90" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-subtext-leaf">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    className="block w-full pl-11 pr-12 py-3.5 bg-white dark:bg-white/5 border border-border-green dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-leaf dark:text-white placeholder-subtext-leaf/50"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    onBlur={(e) => {
                      setPasswordError(validatePassword(e.currentTarget.value));
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-subtext-leaf hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {passwordError ? <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p> : null}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-primary hover:opacity-90 text-text-leaf font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {submitting ? "Signing In…" : "Sign In"}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <p className="text-xs text-subtext-leaf dark:text-white/50 leading-relaxed">
                Local dev with seeded DB: use <span className="font-mono text-text-leaf/90 dark:text-white/70">demo@login.com</span> and
                password <span className="font-mono text-text-leaf/90 dark:text-white/70">password</span> — or re-run{" "}
                <span className="font-mono">api/scripts/apply-seed.sh</span> so seed users get real password hashes.
              </p>
            </form>
            <div className="pt-4 text-center space-y-2">
              <p className="text-sm text-subtext-leaf dark:text-white/60">
                Don't have an account?{" "}
                <Link to="/signup" className="font-bold text-primary hover:underline ml-1">
                  Create an Account
                </Link>
              </p>
              <p className="text-xs text-subtext-leaf dark:text-white/50">
                Organizer?{" "}
                <Link to="/organizer" className="font-semibold text-primary hover:underline">
                  Go to Organizer Dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
