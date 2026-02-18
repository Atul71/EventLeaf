import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBHoh-Wviba6xbyzV_za3GMmzDdlPCJQkaKIW3f484YIzzrc7oI4g-i876dNvGjLp0xllaCGOBODNkb9QCmrQjZqv8EaRnv-1cogzXO1yGurJPtakM9vG0FQoYDIMZQBdUlAG-_YPnZnAx2n6_B-Wu5kTDyJtpRLf3eppLsqubMh3sLNTvuogO6hPTiRQ3qEET95JPdX8XYLeiIWIOH80-wwt99UJz5DgHTxaBCIVhYIKb-8m9K1z8iYraPCW1h5rfjlLVqMWOWVQ";
const AVATAR1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDU-1_u-PWYjXVAbkB0ltsQ87HGlj2mblrFhuHS5OtIhIuu9rPlQz-sPqIoX5tKu5U-ZAYgsIblWmiT8uc4GA-RU-XCJj9C1iCil2bfzyXFn-_TRyeHWsyVAKXgtL3LLnu_wndoU4hyuvl8RxMe-QWan17z3UjXtC-DSGfkaHss1zQTNGljiJT3LcikIoAM-Bq7I2hRwPsqm-sbgLD03Wb9rd_dFaqkHA-DsmeJBumregv5ll_ODWwdIjBoMocHDaxUqy4Velu1YA";
const AVATAR2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDbksocYhNKpIuEXji7rNHY75GL163xlLQM-ls8cWPZkX4lhMNeciuekuVu1_PqGHXVHRcffuXhtmN6hgUkY9Ic0FrVODLErPJQhIDLDuF5tgKM9BXRjK3-68Zru2tevaw5Fq_O5EFVUUYlCVjmKr1U-vqBRiI69U7ZO5cXiZhRANXuvs6vzDixj2vo71X3RUvzAKiBXTKYnHk2MNVnSrcPu1KHmLthS9YA7t-BKuToYwfHqWWg9_2daWZYRvhyGTawemw1McEWuw";
const AVATAR3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAMUUdaU-3JpLsWV9JhvkEyZ23zlfvdw0gLiOJTgC9RIig_OfyTb6hjmf8J1m9W1_IJWtjjT_cZFRY8RUxOc2zoz8T_VB3HCIC4SwLCciI3-C6AfVbApplb1nOvVnYpXvsbPOxfEBgtNjqHKCSLbw-Ug33AaYiODeDjBC7KK1FWAymo4w6jwr7Chvl0v3Hr13XLEhJr1G8F1u4TRhR50PTM0JVGkZBjiOAFrUIl3bXpuEO2ptyUTBXeOLlkZumReY7o3gRvF7U-rA";

const STATS = [
  { label: "Paper Saved", value: "1.2M", change: "+12%" },
  { label: "Carbon Offset", value: "450T", change: "+8%" },
  { label: "Eco-Events", value: "15K+", change: "+25%" },
  { label: "Community Growth", value: "92%", change: "↑" },
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-green dark:bg-primary/10 border border-border-green dark:border-primary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-leaf dark:text-primary">
                New: Carbon Tracking 2.0
              </span>
            </div>
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
              <a
                href="#demo"
                className="bg-soft-green dark:bg-white/5 border border-border-green dark:border-white/10 px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 hover:bg-white transition-colors dark:text-white"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Event organizer" src={AVATAR1} />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Event manager" src={AVATAR2} />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Professional" src={AVATAR3} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Trusted by <span className="font-bold text-background-dark dark:text-white">2,000+</span> eco-planners
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border-8 border-white dark:border-white/5 shadow-2xl aspect-[4/3]">
              <img className="w-full h-full object-cover" alt="Sustainable outdoor conference" src={HERO_IMAGE} />
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
