import type { ApiVenue } from "../api/eventleafApi";
import type { SustainableVenue } from "../components/organizer/SustainableVenueCard";
import { hashStringMod, venueImageUrlFromKey } from "./discoverPresentation";

function iconForCertLabel(label: string): string {
  const l = label.toLowerCase();
  if (/solar|sun|renewable|wind|energy|bolt/.test(l)) return "bolt";
  if (/leed|breeam|certified|green audit/.test(l)) return "verified";
  if (/water|rain|harvest/.test(l)) return "water_drop";
  if (/waste|recycl|compost|diversion|zero/.test(l)) return "recycling";
  if (/garden|bio|organic|local food|f&b|catering/.test(l)) return "restaurant";
  if (/carbon|neutral|offset/.test(l)) return "cloud";
  if (/solar roof|roof/.test(l)) return "wb_sunny";
  return "eco";
}

export function sustainabilityScoreFromVenue(v: ApiVenue): number {
  const certs = v.eco_certifications?.length ?? 0;
  let s = 3.0;
  if (v.is_eco_certified) s += 0.45;
  s += Math.min(certs, 5) * 0.18;
  if (v.has_public_transit) s += 0.2;
  if (v.has_accessible_facilities) s += 0.08;
  if (!v.has_parking) s += 0.04;
  return Math.min(5, Math.round(s * 10) / 10);
}

function ratingFromVenue(id: string, score: number): number {
  const jitter = (hashStringMod(id, 11) - 5) * 0.06;
  const r = score + jitter;
  return Math.min(5, Math.max(3.5, Math.round(r * 10) / 10));
}

function featureTagsFromVenue(v: ApiVenue): { icon: string; label: string }[] {
  const certs = v.eco_certifications ?? [];
  const tags: { icon: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const c of certs) {
    const t = c.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    tags.push({ icon: iconForCertLabel(t), label: t.length > 28 ? `${t.slice(0, 26)}…` : t });
    if (tags.length >= 2) break;
  }
  if (tags.length < 2 && v.has_public_transit) {
    tags.push({ icon: "train", label: "Transit access" });
  }
  if (tags.length < 2 && v.has_accessible_facilities) {
    tags.push({ icon: "accessible", label: "Accessible" });
  }
  if (tags.length < 2 && v.is_eco_certified) {
    tags.push({ icon: "energy_savings_leaf", label: "Green operations" });
  }
  return tags.slice(0, 4);
}

export function apiVenueToSustainableVenue(v: ApiVenue): SustainableVenue {
  const score = sustainabilityScoreFromVenue(v);
  const state = v.state?.trim();
  const location = state ? `${v.city}, ${state}` : v.city;
  const cap = typeof v.capacity === "number" && v.capacity > 0 ? v.capacity : 0;
  return {
    id: v.id,
    name: v.name,
    location,
    imageUrl: venueImageUrlFromKey(`${v.id}|${v.city}|${v.name}`),
    rating: ratingFromVenue(v.id, score),
    sustainabilityIndex: score,
    capacity: cap > 0 ? `${cap} cap` : "— cap",
    featureTags: featureTagsFromVenue(v),
    isEcoCertified: v.is_eco_certified,
  };
}

export function venueSearchBlob(v: ApiVenue): string {
  const parts = [
    v.name,
    v.city,
    v.state ?? "",
    v.description ?? "",
    ...(v.eco_certifications ?? []),
  ];
  return parts.join(" ").toLowerCase();
}

export function matchesPaperlessFilter(v: ApiVenue): boolean {
  return /paperless|digital|e-?ticket|ticketing|check-?in/i.test(venueSearchBlob(v));
}

export function matchesWasteReductionFilter(v: ApiVenue): boolean {
  return /waste|recycl|compost|diversion|zero waste|landfill/i.test(venueSearchBlob(v));
}

/** Lower = “lower estimated tier” for sort (deterministic, no $ in DB yet). */
export function compareVenuesByPriceTier(a: ApiVenue, b: ApiVenue): number {
  return hashStringMod(a.id, 100_000) - hashStringMod(b.id, 100_000);
}
