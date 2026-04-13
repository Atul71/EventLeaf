import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { BackButton } from "../components/BackButton";
import {
  fetchCurrentUser,
  updateMyProfile,
  type CurrentUser,
  type UpdateMyProfilePayload,
} from "../api/eventleafApi";

export function EditProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isEcoConscious, setIsEcoConscious] = useState(false);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => {
        setUser(u);
        setFirstName(u.first_name ?? "");
        setLastName(u.last_name ?? "");
        setPhone(u.phone ?? "");
        setBio(u.bio ?? "");
        setProfileImageUrl(u.profile_image_url ?? "");
        setIsEcoConscious(u.is_eco_conscious ?? false);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  function validatePhone(value: string): string | null {
    if (!value) return null;
    if (!/^\d{10}$/.test(value)) return "Phone must be exactly 10 digits.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pErr = validatePhone(phone);
    setPhoneError(pErr);
    if (pErr) return;

    const payload: UpdateMyProfilePayload = {
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      phone: phone || undefined,
      bio: bio || undefined,
      profile_image_url: profileImageUrl || undefined,
      is_eco_conscious: isEcoConscious,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateMyProfile(payload);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined animate-pulse text-4xl text-primary">forest</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-text-leaf font-display">
      <header className="sticky top-0 z-50 w-full border-b border-border-leaf bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 sm:px-6 md:px-20">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4">
          <BackButton fallbackTo="/profile" />
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border-leaf bg-white dark:bg-[#1a2e1c] p-6 shadow-sm sm:p-8">
          <h1 className="mb-1 text-2xl font-bold">Edit Profile</h1>
          <p className="mb-6 text-sm text-subtext-leaf">
            {user?.email}
          </p>

          {success && (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-text-leaf">
              Profile updated! Redirecting…
            </div>
          )}

          {submitError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="first_name">
                  First name
                </label>
                <input
                  id="first_name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full rounded-lg border border-border-leaf bg-neutral-bg dark:bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="last_name">
                  Last name
                </label>
                <input
                  id="last_name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full rounded-lg border border-border-leaf bg-neutral-bg dark:bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(null);
                }}
                onBlur={() => setPhoneError(validatePhone(phone))}
                placeholder="10-digit number"
                maxLength={10}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-neutral-bg dark:bg-white/5 ${
                  phoneError ? "border-red-400" : "border-border-leaf"
                }`}
              />
              {phoneError && (
                <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself…"
                rows={3}
                className="w-full rounded-lg border border-border-leaf bg-neutral-bg dark:bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="profile_image_url">
                Profile image URL
              </label>
              <input
                id="profile_image_url"
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-border-leaf bg-neutral-bg dark:bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border-leaf bg-neutral-bg dark:bg-white/5 px-4 py-3">
              <input
                id="eco_conscious"
                type="checkbox"
                checked={isEcoConscious}
                onChange={(e) => setIsEcoConscious(e.target.checked)}
                className="size-4 accent-primary cursor-pointer"
              />
              <label htmlFor="eco_conscious" className="cursor-pointer select-none text-sm font-semibold">
                I am eco-conscious
                <span className="ml-1 text-xs font-normal text-subtext-leaf">
                  — helps us surface green events for you
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 rounded-lg border border-border-leaf px-4 py-2.5 text-sm font-bold hover:bg-neutral-bg dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || success}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-leaf shadow-sm hover:brightness-105 transition-all disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
