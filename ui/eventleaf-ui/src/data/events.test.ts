import { describe, expect, it } from "vitest";
import type { EventItem } from "./events";
import { eventLocalDay, getEventBySlug, partitionEventsByRecency } from "./events";

describe("getEventBySlug", () => {
  it("returns the event when slug matches", () => {
    const event = getEventBySlug("eco-innovate-summit");
    expect(event).toBeDefined();
    expect(event?.name).toBe("Eco-Innovate Summit 2026");
  });

  it("returns undefined for unknown slug", () => {
    expect(getEventBySlug("no-such-event")).toBeUndefined();
  });

  it("returns undefined when slug is undefined", () => {
    expect(getEventBySlug(undefined)).toBeUndefined();
  });
});

describe("eventLocalDay", () => {
  it("normalizes an ISO date string to local start of day", () => {
    const d = eventLocalDay("2026-06-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });
});

describe("partitionEventsByRecency", () => {
  const sample = (iso: string): EventItem => ({
    slug: `e-${iso}`,
    name: "Test",
    description: "d",
    city: "X",
    dateLabel: iso,
    dateISO: iso,
    category: "Summit",
    priceLabel: "$0",
    priceValue: 0,
    sustainabilityScore: 4,
    imageUrl: "https://example.com/i.jpg",
    venueImageUrl: "https://example.com/v.jpg",
    venueName: "V",
    certifications: [],
    ecoProofs: [],
    agenda: [],
    leedCertified: false,
    solarPowered: false,
    paperlessTicketing: true,
    wasteReduction: false,
    publicTransitDistanceMeters: 100,
    treesSavedEstimate: 0,
    trailerYoutubeId: "M7lc1UVf-VE",
  });

  it("puts future dates within the next 7 days in current and later dates in upcoming", () => {
    const anchor = new Date("2026-03-10T12:00:00");
    const events = [sample("2026-03-12"), sample("2026-03-25")];
    const { current, upcoming } = partitionEventsByRecency(events, anchor);
    expect(current).toHaveLength(1);
    expect(current[0].dateISO).toBe("2026-03-12");
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].dateISO).toBe("2026-03-25");
  });

  it("excludes past events relative to anchor date", () => {
    const anchor = new Date("2026-03-10T12:00:00");
    const events = [sample("2026-03-01"), sample("2026-03-15")];
    const { current, upcoming } = partitionEventsByRecency(events, anchor);
    expect(current).toHaveLength(1);
    expect(upcoming).toHaveLength(0);
    expect(current[0].dateISO).toBe("2026-03-15");
  });
});
