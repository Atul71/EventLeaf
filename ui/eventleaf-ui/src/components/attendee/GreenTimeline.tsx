import type { PastGreenEvent } from "../../mocks/attendeeImpactData";
import { EcoCertifiedBadge } from "../organizer/EcoCertifiedBadge";

type GreenTimelineProps = {
  events: PastGreenEvent[];
  onShareEvent: (event: PastGreenEvent) => void;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function GreenTimeline({ events, onShareEvent }: GreenTimelineProps) {
  const sorted = [...events].sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());

  return (
    <section className="rounded-2xl border border-border-leaf bg-white p-5 shadow-sm dark:bg-[#1a2e1c] md:p-6" aria-labelledby="green-timeline-heading">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 id="green-timeline-heading" className="text-lg font-bold text-text-leaf dark:text-white">
            Green Timeline
          </h3>
          <p className="text-sm text-subtext-leaf">Your past events, told through a sustainability lens.</p>
        </div>
      </div>

      <ol className="relative space-y-0 border-l-2 border-primary/25 pl-6 dark:border-primary/20">
        {sorted.map((ev, index) => (
          <li key={ev.id} className="relative pb-10 last:pb-0">
            <span
              className="absolute -left-[1.4rem] top-1 flex size-4 items-center justify-center rounded-full border-2 border-white bg-primary shadow-sm dark:border-[#1a2e1c]"
              aria-hidden
            >
              <span className="size-1.5 rounded-full bg-text-leaf" />
            </span>
            <article className="overflow-hidden rounded-xl border border-border-leaf bg-neutral-bg/50 transition-colors hover:border-primary/35 dark:bg-white/5">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
                <div
                  className="h-36 w-full shrink-0 rounded-lg bg-cover bg-center sm:h-auto sm:w-36"
                  style={{ backgroundImage: `url('${ev.imageUrl}')` }}
                  role="img"
                  aria-label=""
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-text-leaf dark:text-white">{ev.name}</h4>
                      {ev.paperless && (
                        <EcoCertifiedBadge variant="compact" className="!normal-case">
                          Paperless
                        </EcoCertifiedBadge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-subtext-leaf">{formatDate(ev.dateIso)}</p>
                    <p className="mt-1 flex items-start gap-1 text-sm text-subtext-leaf">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {ev.venue}
                    </p>
                    <div className="mt-3">
                      <EcoCertifiedBadge variant="default" className="!normal-case">
                        {ev.greenBadge.label}
                      </EcoCertifiedBadge>
                    </div>
                    {ev.distanceFromHomeKm != null && (
                      <p className="mt-2 text-xs font-semibold text-subtext-leaf">
                        ~{ev.distanceFromHomeKm.toFixed(1)} km from home
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onShareEvent(ev)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-text-leaf shadow-sm hover:brightness-105"
                    >
                      <span className="material-symbols-outlined text-lg">ios_share</span>
                      Share to socials
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wide text-subtext-leaf self-center">
                      #{sorted.length - index} in your green history
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
