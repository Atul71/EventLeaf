import type { ImpactRankId, MilestoneBadge } from "../../mocks/attendeeImpactData";

const RANK_ORDER: ImpactRankId[] = ["sapling", "sprout", "oak", "sequoia"];

const RANK_LABELS: Record<ImpactRankId, string> = {
  sapling: "Sapling",
  sprout: "Sprout",
  oak: "Oak",
  sequoia: "Giant Sequoia",
};

type ImpactTrophyCaseProps = {
  rank: ImpactRankId;
  rankProgressPercent: number;
  pointsToNextRank: number;
  badges: MilestoneBadge[];
};

export function ImpactTrophyCase({
  rank,
  rankProgressPercent,
  pointsToNextRank,
  badges,
}: ImpactTrophyCaseProps) {
  const idx = RANK_ORDER.indexOf(rank);
  const nextRank = idx >= 0 && idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null;

  return (
    <section
      className="rounded-2xl border border-border-leaf bg-white p-5 shadow-sm dark:bg-[#1a2e1c] md:p-6"
      aria-labelledby="trophy-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 id="trophy-heading" className="text-lg font-bold text-text-leaf dark:text-white">
          Impact level &amp; trophy case
        </h3>
        <span className="material-symbols-outlined text-primary fill">emoji_events</span>
      </div>

      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 to-transparent p-4 dark:from-primary/10">
        <p className="text-xs font-bold uppercase tracking-wider text-subtext-leaf">Current rank</p>
        <p className="mt-1 text-2xl font-black text-text-leaf dark:text-white">{RANK_LABELS[rank]}</p>
        <p className="mt-1 text-xs text-subtext-leaf">
          Sapling → Sprout → Oak → Giant Sequoia as you stack verified green events.
        </p>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-bg dark:bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(0, rankProgressPercent))}%` }}
          />
        </div>
        {nextRank && (
          <p className="mt-2 text-[11px] font-semibold text-subtext-leaf">
            {pointsToNextRank.toLocaleString()} impact points until &apos;{RANK_LABELS[nextRank]}&apos;
          </p>
        )}
      </div>

      <h4 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-text-leaf dark:text-white">Milestone badges</h4>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {badges.map((b) => (
          <li key={b.id}>
            <div
              className={`flex gap-3 rounded-xl border p-3 ${
                b.unlocked
                  ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                  : "border-dashed border-border-leaf bg-neutral-bg/60 opacity-80 dark:bg-white/5"
              }`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                  b.unlocked ? "bg-primary/25 text-text-leaf" : "bg-black/5 text-subtext-leaf dark:bg-white/10"
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${b.unlocked ? "" : "opacity-50"}`}>{b.icon}</span>
                {!b.unlocked && (
                  <span className="sr-only">Locked badge</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-text-leaf dark:text-white">{b.title}</p>
                  {!b.unlocked && (
                    <span className="material-symbols-outlined text-subtext-leaf text-lg" aria-hidden>
                      lock
                    </span>
                  )}
                </div>
                <p className={`mt-0.5 text-xs ${b.unlocked ? "text-subtext-leaf" : "text-subtext-leaf/80 italic"}`}>
                  {b.unlocked ? b.description : "Keep attending green-flagged events to unlock this milestone."}
                </p>
                {b.unlocked && b.unlockedAtIso && (
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-subtext-leaf">
                    Unlocked {new Date(b.unlockedAtIso).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
