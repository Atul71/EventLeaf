import type { ApiEvent } from "../api/eventleafApi";

export type EcoProof = {
  icon: string;
  title: string;
  detail: string;
};

const ECO_PROOF_BY_NAME: Record<string, { icon: string; title: string; detail: string }> = {
  "Paperless Ticketing": {
    icon: "smartphone",
    title: "Paperless ticketing",
    detail: "Digital passes only — no printed tickets at the door.",
  },
  "Digital Check-in": {
    icon: "qr_code_scanner",
    title: "Digital check-in",
    detail: "QR-based attendance to cut paper and speed entry.",
  },
  "Waste Reduction Program": {
    icon: "recycling",
    title: "Waste reduction",
    detail: "Recycling and compost streams during the event.",
  },
  "Carbon Neutral Transport": {
    icon: "directions_bus",
    title: "Low-carbon travel",
    detail: "Transit, pooling, or incentives to reduce trip emissions.",
  },
  "Tree Planting Offset": {
    icon: "forest",
    title: "Offset program",
    detail: "Organizer-linked tree planting or verified offsets.",
  },
  "Zero Single-Use Plastics": {
    icon: "delete_sweep",
    title: "Low single-use plastic",
    detail: "Commitment to reusables or compostable serviceware.",
  },
  "Local Vendors": {
    icon: "storefront",
    title: "Local vendors",
    detail: "Regional suppliers to shorten supply chains.",
  },
  "Public Transit Access": {
    icon: "train",
    title: "Transit-friendly",
    detail: "Venue reachable by bus, rail, or bike.",
  },
  "Renewable Energy": {
    icon: "bolt",
    title: "Renewable energy",
    detail: "Venue or event block powered by clean energy.",
  },
  "Water Conservation": {
    icon: "water_drop",
    title: "Water-smart",
    detail: "Efficient fixtures or conservation practices on site.",
  },
  "Eco-Certified Venue": {
    icon: "verified",
    title: "Eco-certified space",
    detail: "Venue carries environmental certification or audit.",
  },
};

const VENUE_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
];

/** Deterministic bucket for strings (e.g. image pool, sort keys). */
export function hashStringMod(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

/** Stable hero image for a venue key (id + city, etc.). */
export function venueImageUrlFromKey(key: string): string {
  return VENUE_IMAGE_POOL[hashStringMod(key, VENUE_IMAGE_POOL.length)]!;
}

export function venueImageUrlForEvent(e: ApiEvent): string {
  const key = `${e.venue_name ?? ""}|${e.venue_city ?? ""}|${e.id}`;
  return venueImageUrlFromKey(key);
}

export function ecoProofsFromApi(e: ApiEvent): EcoProof[] {
  const seen = new Set<string>();
  const out: EcoProof[] = [];
  const add = (p: EcoProof) => {
    if (seen.has(p.title)) return;
    seen.add(p.title);
    out.push(p);
  };

  const names = e.eco_attribute_names ?? [];
  for (const name of names) {
    const mapped = ECO_PROOF_BY_NAME[name];
    if (mapped) {
      add({ icon: mapped.icon, title: mapped.title, detail: mapped.detail });
    } else {
      add({
        icon: "eco",
        title: name,
        detail: "Listed sustainability practice for this event.",
      });
    }
  }
  if (e.has_digital_ticketing && !names.includes("Paperless Ticketing")) {
    const m = ECO_PROOF_BY_NAME["Paperless Ticketing"]!;
    add({ icon: m.icon, title: m.title, detail: m.detail });
  }
  if (e.has_paperless_checkin && !names.includes("Digital Check-in")) {
    const m = ECO_PROOF_BY_NAME["Digital Check-in"]!;
    add({ icon: m.icon, title: m.title, detail: m.detail });
  }
  if (e.is_eco_friendly && out.length === 0) {
    add({
      icon: "energy_savings_leaf",
      title: "Eco-friendly event",
      detail: "Meets EventLeaf green criteria for this listing.",
    });
  }
  return out.slice(0, 6);
}

export function certificationsFromApi(e: ApiEvent): string[] {
  const v = e.venue_eco_certifications ?? [];
  if (v.length > 0) return v.slice(0, 6);
  if (e.is_eco_friendly) return ["EventLeaf green verified"];
  return [];
}

export function sustainabilityScoreFromApi(e: ApiEvent): number {
  const attr = (e.eco_attribute_names ?? []).length;
  const certs = (e.venue_eco_certifications ?? []).length;
  let s = 3.2;
  if (e.is_eco_friendly) s += 0.55;
  s += Math.min(attr, 6) * 0.12;
  s += Math.min(certs, 4) * 0.1;
  if (e.has_digital_ticketing) s += 0.08;
  return Math.min(5, Math.round(s * 10) / 10);
}

export function compactAgenda(e: ApiEvent): { time: string; title: string }[] {
  const st = (e.event_start_time ?? "10:00:00").slice(0, 5);
  const en = (e.event_end_time ?? "18:00:00").slice(0, 5);
  return [
    { time: st, title: "Doors & check-in" },
    { time: "—", title: "Main program & sessions" },
    { time: en, title: "Wrap & departure" },
  ];
}

export function eventSearchBlob(e: ApiEvent): string {
  const parts = [
    e.title,
    e.venue_name ?? "",
    e.venue_city ?? "",
    e.category ?? "",
    ...(e.eco_attribute_names ?? []),
    ...(e.venue_eco_certifications ?? []),
  ];
  return parts.join(" ").toLowerCase();
}

export function matchesVerifiedGreenOnly(e: ApiEvent): boolean {
  return e.is_eco_friendly;
}

export function matchesPaperlessOperations(e: ApiEvent): boolean {
  return Boolean(e.has_digital_ticketing || e.has_paperless_checkin);
}

export function matchesWasteReductionFilter(e: ApiEvent): boolean {
  const names = e.eco_attribute_names ?? [];
  // Keep logic aligned with eco_attribute seed names and the eco-proof mapping.
  return names.some((n) => {
    const l = n.toLowerCase();
    return /waste reduction program/i.test(l) || /zero single-use plastics/i.test(l);
  });
}

export function matchesPublicTransitAccessible(e: ApiEvent): boolean {
  return Boolean(e.has_public_transit);
}

export function matchesMinSustainabilityLeaves(e: ApiEvent, minLeaves: number): boolean {
  return sustainabilityScoreFromApi(e) >= minLeaves;
}
