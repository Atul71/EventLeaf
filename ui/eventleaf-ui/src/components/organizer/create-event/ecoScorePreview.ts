/** Minimal venue shape for eco scoring (API venues or legacy mocks). */
export type WizardVenueLike = {
  isGreenAuditorium?: boolean;
  isEcoCertified: boolean;
};

export type WizardDraft = {
  eventName: string;
  category: string;
  description: string;
  hasBanner: boolean;
  venue: WizardVenueLike | null;
  digitalOnlyTicketing: boolean;
  zeroWasteCatering: boolean;
  onSiteRecycling: boolean;
  publicTransportIncentives: boolean;
};

export type EcoBadgePreview = {
  id: string;
  label: string;
  description: string;
  active: boolean;
  icon: string;
};

const GREEN_VENUE_ECO_BOOST = 40;
const NON_GREEN_VENUE_BASE = 12;

export function computeEcoScore(d: WizardDraft): number {
  let score = 0;

  const coreOk = d.eventName.trim().length > 0 && d.category.length > 0 && d.description.trim().length > 0;
  if (coreOk) score += 22;
  if (d.hasBanner) score += 3;

  if (d.venue) {
    if (d.venue.isGreenAuditorium || d.venue.isEcoCertified) {
      score += GREEN_VENUE_ECO_BOOST;
    } else {
      score += NON_GREEN_VENUE_BASE;
    }
  }

  if (d.digitalOnlyTicketing) score += 18;
  if (d.zeroWasteCatering) score += 10;
  if (d.onSiteRecycling) score += 8;
  if (d.publicTransportIncentives) score += 9;

  return Math.min(100, Math.round(score));
}

export function getEcoBadgePreviews(d: WizardDraft, ecoScore: number): EcoBadgePreview[] {
  const greenVenue = !!(d.venue && (d.venue.isGreenAuditorium || d.venue.isEcoCertified));

  return [
    {
      id: "eco-friendly",
      label: "Eco-Friendly Event",
      description: "Overall sustainability score meets the EventLeaf threshold.",
      active: ecoScore >= 58,
      icon: "eco",
    },
    {
      id: "paperless",
      label: "Paperless",
      description: "Digital-only ticketing — no printed tickets at the door.",
      active: d.digitalOnlyTicketing,
      icon: "smartphone",
    },
    {
      id: "green-venue",
      label: "Green-Certified Venue",
      description: "Hosted at a verified green or LEED-aligned space.",
      active: greenVenue,
      icon: "verified",
    },
    {
      id: "zero-waste",
      label: "Zero-Waste Catering",
      description: "Committed to low-waste food & beverage service.",
      active: d.zeroWasteCatering,
      icon: "delete_sweep",
    },
    {
      id: "recycling",
      label: "On-Site Recycling",
      description: "Recycling streams available for attendees.",
      active: d.onSiteRecycling,
      icon: "recycling",
    },
    {
      id: "transit",
      label: "Transit-Friendly",
      description: "Public transport guidance or incentives shared with guests.",
      active: d.publicTransportIncentives,
      icon: "directions_transit",
    },
  ];
}
