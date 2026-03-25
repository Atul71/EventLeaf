import { useEffect, useState } from "react";
import type { PastGreenEvent } from "../../mocks/attendeeImpactData";
import { prefetchShareCardText } from "../../api/mockAttendeeImpactApi";

type ShareImpactCardModalProps = {
  event: PastGreenEvent | null;
  attendeeName: string;
  onClose: () => void;
};

export function ShareImpactCardModal({ event, attendeeName, onClose }: ShareImpactCardModalProps) {
  const [copyLine, setCopyLine] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "copied" | "error">("idle");

  useEffect(() => {
    if (!event) {
      setCopyLine("");
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    prefetchShareCardText(event.name, event.greenBadge.label)
      .then((text) => {
        if (!cancelled) {
          setCopyLine(text);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [event]);

  if (!event) return null;

  const shortDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(event.dateIso));

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyLine);
      setStatus("copied");
      setTimeout(() => setStatus("ready"), 2000);
    } catch {
      setStatus("error");
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) {
      await handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: "My EventLeaf eco-impact",
        text: copyLine,
      });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-impact-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border-leaf bg-white p-6 shadow-2xl dark:bg-[#1a2e1c]">
        <button
          type="button"
          className="absolute right-4 top-4 text-subtext-leaf hover:text-text-leaf dark:hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h3 id="share-impact-title" className="pr-10 text-lg font-bold text-text-leaf dark:text-white">
          Share your eco-impact card
        </h3>
        <p className="mt-1 text-sm text-subtext-leaf">Promote greener events — one post at a time.</p>

        <div className="mt-5 overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/20 via-white to-soft-green p-5 dark:from-primary/15 dark:via-[#1a2e1c] dark:to-[#102212]">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-subtext-leaf">EventLeaf</p>
          <p className="mt-3 text-center text-lg font-black text-text-leaf dark:text-white">{event.name}</p>
          <p className="mt-1 text-center text-xs font-semibold text-subtext-leaf">{shortDate}</p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-black uppercase tracking-wide text-text-leaf">
              <span className="material-symbols-outlined text-sm fill">eco</span>
              {event.greenBadge.label}
            </span>
          </div>
          <p className="mt-4 text-center text-sm font-bold text-text-leaf dark:text-white">{attendeeName}</p>
          <p className="mt-2 text-center text-xs text-subtext-leaf">I showed up for people &amp; planet.</p>
        </div>

        <div className="mt-4 rounded-lg bg-neutral-bg p-3 text-xs dark:bg-white/5">
          {status === "loading" && <p className="text-subtext-leaf">Preparing share text…</p>}
          {(status === "ready" || status === "copied" || status === "error") && (
            <p className="whitespace-pre-wrap font-medium text-text-leaf dark:text-white">{copyLine || "—"}</p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            disabled={status === "loading" || !copyLine}
            className="flex-1 rounded-xl bg-text-leaf py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-text-leaf"
          >
            {status === "copied" ? "Copied!" : "Copy caption"}
          </button>
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={status === "loading" || !copyLine}
            className="flex-1 rounded-xl border-2 border-primary py-3 text-sm font-bold text-text-leaf hover:bg-primary/10 disabled:opacity-50 dark:text-white"
          >
            Share sheet
          </button>
        </div>
      </div>
    </div>
  );
}
