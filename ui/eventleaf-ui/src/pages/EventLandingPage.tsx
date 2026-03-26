import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

// Lush forest canopy – environment-focused hero (Unsplash, free to use)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80";

const STATS = [
  { label: "Metric 1", value: "—", change: "" },
  { label: "Metric 2", value: "—", change: "" },
  { label: "Metric 3", value: "—", change: "" },
  { label: "Metric 4", value: "—", change: "" },
] as const;

const FEATURES = [
  {
    icon: "confirmation_number",
    title: "Digital Ticketing",
    description:
      "Eliminate paper waste completely with high-speed QR entries, digital-first check-ins, and automated mobile passes.",
  },
  {
    icon: "verified_user",
    title: "Eco-Labeling",
    description:
      "Certify your event's sustainability with our built-in auditor, green checklists, and verified impact badges for your brand.",
  },
  {
    icon: "bar_chart_4_bars",
    title: "Real-time Analytics",
    description:
      "Track live attendance, resource consumption, and your exact carbon footprint in one integrated, beautiful dashboard.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-leaf selection:bg-primary/30 min-h-screen">
      <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-green dark:border-[#243a26]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-semibold hover:text-primary transition-colors dark:text-gray-300" href="#features">
              Features
            </a>
            <a className="text-sm font-semibold hover:text-primary transition-colors dark:text-gray-300" href="#eco-impact">
              Eco-Impact
            </a>
            <a className="text-sm font-semibold hover:text-primary transition-colors dark:text-gray-300" href="#about">
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold hover:text-primary transition-colors dark:text-gray-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-background-dark px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <section className="py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight dark:text-white">
              Organize Events, <span className="text-primary">Save the Planet</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              The all-in-one digital workspace for eco-conscious event planners. Reduce waste, track impact, and create
              unforgettable experiences that give back to nature.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="bg-primary text-background-dark px-8 py-4 rounded-xl text-base font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
              >
                Get Started Free
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border-8 border-white dark:border-white/5 shadow-2xl aspect-[4/3]">
              <img className="w-full h-full object-cover" alt="Lush green forest canopy – nature and environment" src={HERO_IMAGE} />
            </div>
          </div>
        </section>

        <section id="features" className="py-12 border-y border-border-green dark:border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ label, value, change }) => (
              <div key={label} className="text-center md:text-left">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{label}</p>
                <p className="text-3xl font-black dark:text-white">
                  {value} <span className="text-primary text-xl tracking-tight">{change}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 dark:text-white">Built for a Sustainable Future</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform streamlines your workflow while minimizing your environmental footprint with industry-leading
              green tools.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="group p-8 rounded-2xl bg-white dark:bg-white/5 border border-border-green dark:border-white/10 hover:border-primary transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-soft-green dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined font-bold">{icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="eco-impact" className="py-24">
          <div className="bg-background-dark dark:bg-white/5 rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to host your greenest event yet?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
                Join thousands of organizers making a positive impact. No credit card required to start your first 100
                tickets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="bg-primary text-background-dark px-10 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-transform text-center"
                >
                  Create Your Event
                </Link>
                <a
                  href="#contact"
                  className="bg-transparent border border-white/20 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white/10 transition-colors text-center"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-background-dark border-t border-border-green dark:border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-background-dark">
                <span className="material-symbols-outlined text-xs font-bold">eco</span>
              </div>
              <h2 className="text-lg font-extrabold dark:text-white">EventLeaf</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Making world-class event management sustainable, accessible, and digital-first.
            </p>
          </div>
          <div className="flex gap-6">
            <a className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#about">
              About us
            </a>
            <a className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#contact">
              Contact us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
