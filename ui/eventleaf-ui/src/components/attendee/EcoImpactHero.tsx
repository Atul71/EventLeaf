import { treeMetaphorFromSheets } from "./impactUtils";

type EcoImpactHeroProps = {
  digitalTicketsUsed: number;
  sheetsAvoided: number;
  venueCertifiedEventCount: number;
  homeCity: string;
  showTravelFootprint: boolean;
  totalCommuteKm: number;
  travelFootprintKg: number;
};

export function EcoImpactHero({
  digitalTicketsUsed,
  sheetsAvoided,
  venueCertifiedEventCount,
  homeCity,
  showTravelFootprint,
  totalCommuteKm,
  travelFootprintKg,
}: EcoImpactHeroProps) {
  const tree = treeMetaphorFromSheets(sheetsAvoided);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border-leaf bg-gradient-to-br from-[#e8f8ea] via-white to-[#f0faf1] p-6 shadow-sm dark:from-[#152a18] dark:via-[#1a2e1c] dark:to-[#102212] md:p-8"
      aria-labelledby="eco-impact-heading"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/15 blur-2xl dark:bg-primary/10"
        aria-hidden
      />
      <div className="relative">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-subtext-leaf">Eco-Impact</p>
            <h2 id="eco-impact-heading" className="text-2xl font-black tracking-tight text-text-leaf dark:text-white md:text-3xl">
              Your choices add up to real forests
            </h2>
            <p className="mt-1 max-w-xl text-sm font-medium text-subtext-leaf">
              {digitalTicketsUsed.toLocaleString()} digital tickets — each one a stand-in for paper, ink, and waste you never created.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-xl border border-primary/20 bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-white/5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-2xl">forest</span>
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-leaf dark:text-white">Paper saved</h3>
            </div>
            <p className="text-lg font-black leading-snug text-text-leaf dark:text-white">{tree.headline}</p>
            <p className="mt-2 text-sm text-subtext-leaf">{tree.subline}</p>
            <p className="mt-3 text-xs font-semibold text-subtext-leaf/80">
              Rule of thumb: ~8,300 sheets ≈ one mature tree&apos;s worth of paper fiber.
            </p>
          </article>

          <article className="rounded-xl border border-primary/20 bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-white/5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-leaf dark:text-white">Venue certs supported</h3>
            </div>
            <p className="text-4xl font-black text-text-leaf dark:text-white">{venueCertifiedEventCount}</p>
            <p className="mt-2 text-sm text-subtext-leaf">
              Events at LEED-certified venues or spaces running on 100% renewable energy — your attendance backs greener infrastructure.
            </p>
          </article>

          <article className="rounded-xl border border-dashed border-border-leaf bg-neutral-bg/80 p-5 dark:bg-white/5 sm:col-span-2 xl:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-2xl">route</span>
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-leaf dark:text-white">Distance travelled</h3>
            </div>
            {showTravelFootprint ? (
              <>
                <p className="text-3xl font-black text-text-leaf dark:text-white">
                  {Math.round(totalCommuteKm).toLocaleString()} km
                </p>
                <p className="mt-2 text-sm text-subtext-leaf">
                  From your base in {homeCity}, that&apos;s roughly{" "}
                  <span className="font-bold text-text-leaf dark:text-white">{travelFootprintKg.toFixed(1)} kg CO₂</span> from
                  getting to venues — about what a young sapling can soak up in a season. Offset ideas: transit, carpool, or one
                  extra local show next month.
                </p>
              </>
            ) : (
              <p className="text-sm text-subtext-leaf">
                Add a home city in settings to see commute distance and a friendly footprint snapshot next to your green wins.
              </p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
