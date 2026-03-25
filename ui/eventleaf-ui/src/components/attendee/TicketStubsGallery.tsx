import type { TicketStubRecord } from "../../mocks/attendeeImpactData";

type TicketStubsGalleryProps = {
  stubs: TicketStubRecord[];
};

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
}

export function TicketStubsGallery({ stubs }: TicketStubsGalleryProps) {
  const sorted = [...stubs].sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());

  return (
    <section className="rounded-2xl border border-border-leaf bg-white p-5 shadow-sm dark:bg-[#1a2e1c] md:p-6" aria-labelledby="stubs-heading">
      <h3 id="stubs-heading" className="text-lg font-bold text-text-leaf dark:text-white">
        Ticket stubs
      </h3>
      <p className="mt-1 text-sm text-subtext-leaf">
        A permanent digital archive — QR codes are retired, but your sustainability snapshot stays with the memory.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((stub) => (
          <li key={stub.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border-leaf bg-neutral-bg/40 dark:bg-white/5">
              <div className="relative border-b border-dashed border-border-leaf bg-white/90 p-4 dark:bg-[#142818]">
                <div className="absolute left-0 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background-light dark:bg-background-dark" aria-hidden />
                <div className="absolute right-0 top-1/2 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-background-light dark:bg-background-dark" aria-hidden />
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-subtext-leaf">EventLeaf</p>
                <p className="mt-2 text-center text-sm font-black text-text-leaf dark:text-white">{stub.eventName}</p>
                <p className="mt-1 text-center text-xs text-subtext-leaf">{formatShortDate(stub.dateIso)}</p>
                <p className="mt-1 text-center text-xs text-subtext-leaf">{stub.venue}</p>
                <div className="relative mt-4 flex justify-center">
                  <img
                    src={stub.qrImageUrl}
                    alt=""
                    className="size-28 object-contain opacity-40 grayscale contrast-75"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rotate-[-12deg] rounded border-2 border-subtext-leaf/40 bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-subtext-leaf shadow-sm dark:bg-[#1a2e1c]/95">
                      Used
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-center font-mono text-[11px] font-bold text-subtext-leaf">{stub.ticketId}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-subtext-leaf">Sustainability at check-in</p>
                <p className="text-sm text-text-leaf dark:text-white">{stub.sustainabilityNote}</p>
                {stub.co2AvoidedKg != null && (
                  <p className="mt-auto text-xs font-semibold text-subtext-leaf">
                    ~{stub.co2AvoidedKg.toFixed(1)} kg CO₂e avoided vs. print-at-home baseline (estimate)
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
