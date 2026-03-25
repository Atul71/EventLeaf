/** Sample attendee impact data — replace with real API responses later */

export type ImpactRankId = "sapling" | "sprout" | "oak" | "sequoia";

export type GreenBadgeKind =
  | "zero-waste"
  | "solar"
  | "leed"
  | "renewable"
  | "paperless"
  | "eco-auditorium"
  | "compost";

export type PastGreenEvent = {
  id: string;
  name: string;
  dateIso: string;
  venue: string;
  imageUrl: string;
  greenBadge: { kind: GreenBadgeKind; label: string };
  paperless: boolean;
  distanceFromHomeKm?: number;
};

export type TicketStubRecord = {
  id: string;
  eventName: string;
  dateIso: string;
  venue: string;
  ticketId: string;
  qrImageUrl: string;
  sustainabilityNote: string;
  co2AvoidedKg?: number;
};

export type MilestoneBadge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAtIso?: string;
};

export type AttendeeImpactPayload = {
  displayName: string;
  homeCity: string;
  homeLat: number;
  homeLng: number;
  digitalTicketsUsed: number;
  /** Sheets of paper equivalent avoided (derived from tickets in mock) */
  sheetsAvoided: number;
  venueCertifiedEventCount: number;
  totalCommuteKm: number;
  /** Estimated CO₂ from travel to venues (mock kg) */
  travelFootprintKg: number;
  /** When false, distance / commute tile prompts for location (optional footprint). */
  locationShared: boolean;
  rank: ImpactRankId;
  rankLabel: string;
  rankProgressPercent: number;
  pointsToNextRank: number;
  pastEvents: PastGreenEvent[];
  ticketStubs: TicketStubRecord[];
  milestoneBadges: MilestoneBadge[];
};

/** ~8,300 sheets ≈ one tree (common rule-of-thumb for marketing copy) */
export const SHEETS_PER_TREE = 8300;

export const SAMPLE_ATTENDEE_IMPACT: AttendeeImpactPayload = {
  displayName: "Vivek Chengannassery",
  homeCity: "Portland, Oregon",
  homeLat: 45.5152,
  homeLng: -122.6784,
  digitalTicketsUsed: 47,
  sheetsAvoided: 71,
  venueCertifiedEventCount: 6,
  totalCommuteKm: 238,
  travelFootprintKg: 42.1,
  locationShared: true,
  rank: "oak",
  rankLabel: "Oak",
  rankProgressPercent: 72,
  pointsToNextRank: 1250,
  pastEvents: [
    {
      id: "ev-1",
      name: "Cascadia Clean Energy Forum",
      dateIso: "2025-01-18T18:00:00.000Z",
      venue: "Portland LEED Platinum Center",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAXaf7r5E82omvGNLSFSsKstOAPPdjuGdb3tpCzVwSGEEyNwmdJdg97wKlrlIOFArmIR6UkbzeeZIQ2ryHZcm5zKMNsbgYfKYzlXwAA2T7QZ_A53D8tvGh9Fg-9Ou3GvIhL8E5eK7UkyYiMqA5JK8BohK3qnzcXM3UWgSH8AXeWPvWMWt0mM5wcHAdo69mMtL15SBikFxS7aolm3dRytp6G8A-crgK3pHOl1z0Aj9HNzhDpE-KUmj8PFiJmY5eorX_l1N0kFQNNHg",
      greenBadge: { kind: "leed", label: "LEED Platinum Venue" },
      paperless: true,
      distanceFromHomeKm: 4.2,
    },
    {
      id: "ev-2",
      name: "Riverfront Zero-Waste Music Night",
      dateIso: "2024-11-02T21:00:00.000Z",
      venue: "Tom McCall Waterfront Park",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAI0lRqLsSz2FJaw5YB6CrMLPzpvdHolIt9N-arrgNnWrnaYgygcHQCT23A6w30wFTP45TQqbmc64j9MrCtwU3L3BVokhU_SHW-E0H3tMgVrRtcTkH8_P21dCgOpC9mcWMI21FFw0Jgho8vErlwjEcibhASugfMTB1jsTY6Mk5JDWLD98-lyedhnlo-PbUonQ_ySSFZ_pHxs2XC0k8u1L8r6MMRhEIqX5jG0tHGPPqN2-5pmhsJePyvDb5UD_IXkKAynmuNdJy_-g",
      greenBadge: { kind: "zero-waste", label: "Zero Waste Event" },
      paperless: true,
      distanceFromHomeKm: 2.1,
    },
    {
      id: "ev-3",
      name: "Solar Sound Sessions",
      dateIso: "2024-09-14T19:30:00.000Z",
      venue: "Eco-Auditorium East (newly verified)",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAXaf7r5E82omvGNLSFSsKstOAPPdjuGdb3tpCzVwSGEEyNwmdJdg97wKlrlIOFArmIR6UkbzeeZIQ2ryHZcm5zKMNsbgYfKYzlXwAA2T7QZ_A53D8tvGh9Fg-9Ou3GvIhL8E5eK7UkyYiMqA5JK8BohK3qnzcXM3UWgSH8AXeWPvWMWt0mM5wcHAdo69mMtL15SBikFxS7aolm3dRytp6G8A-crgK3pHOl1z0Aj9HNzhDpE-KUmj8PFiJmY5eorX_l1N0kFQNNHg",
      greenBadge: { kind: "solar", label: "Solar Powered Venue" },
      paperless: true,
      distanceFromHomeKm: 18.6,
    },
    {
      id: "ev-4",
      name: "Forest Corridor Trail Day",
      dateIso: "2024-07-07T10:00:00.000Z",
      venue: "Forest Park Education Yurt",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAI0lRqLsSz2FJaw5YB6CrMLPzpvdHolIt9N-arrgNnWrnaYgygcHQCT23A6w30wFTP45TQqbmc64j9MrCtwU3L3BVokhU_SHW-E0H3tMgVrRtcTkH8_P21dCgOpC9mcWMI21FFw0Jgho8vErlwjEcibhASugfMTB1jsTY6Mk5JDWLD98-lyedhnlo-PbUonQ_ySSFZ_pHxs2XC0k8u1L8r6MMRhEIqX5jG0tHGPPqN2-5pmhsJePyvDb5UD_IXkKAynmuNdJy_-g",
      greenBadge: { kind: "compost", label: "Compost-Forward Catering" },
      paperless: true,
      distanceFromHomeKm: 11.0,
    },
    {
      id: "ev-5",
      name: "Renewable Run 10K",
      dateIso: "2024-05-19T08:00:00.000Z",
      venue: "100% Renewable Energy Stadium",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAXaf7r5E82omvGNLSFSsKstOAPPdjuGdb3tpCzVwSGEEyNwmdJdg97wKlrlIOFArmIR6UkbzeeZIQ2ryHZcm5zKMNsbgYfKYzlXwAA2T7QZ_A53D8tvGh9Fg-9Ou3GvIhL8E5eK7UkyYiMqA5JK8BohK3qnzcXM3UWgSH8AXeWPvWMWt0mM5wcHAdo69mMtL15SBikFxS7aolm3dRytp6G8A-crgK3pHOl1z0Aj9HNzhDpE-KUmj8PFiJmY5eorX_l1N0kFQNNHg",
      greenBadge: { kind: "renewable", label: "100% Renewable Venue" },
      paperless: true,
      distanceFromHomeKm: 56.0,
    },
  ],
  ticketStubs: [
    {
      id: "stub-1",
      eventName: "Cascadia Clean Energy Forum",
      dateIso: "2025-01-18T18:00:00.000Z",
      venue: "Portland LEED Platinum Center",
      ticketId: "EL-20491-A",
      qrImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDWtW5ZKqOExTNPyI1rhkfCxtgxo-b-6j2naSx60wvoA6KB5Kk61hx3ZGsb_bi0Ah6XjSA-C7mtc_Rsl7q26sbPjDQFb_LmAgDmNFVgDjSg8oMp73I-dWn5ZoloSUxRc8RysmkkQLWxkXUspbXTejWKzddwOx8aNOA_K0LdLcEg58PUac0CtGdc_YMIKiUZwHkIB7Fhms56dW6dI7bu7D8VMyqEvKkiaaZ2dhTkj97muGImoqNIqXA3Kssut41usUd9hbEaIyh7bw",
      sustainabilityNote: "LEED Platinum · digital-only · local transit encouraged",
      co2AvoidedKg: 2.4,
    },
    {
      id: "stub-2",
      eventName: "Riverfront Zero-Waste Music Night",
      dateIso: "2024-11-02T21:00:00.000Z",
      venue: "Tom McCall Waterfront Park",
      ticketId: "EL-19802-B",
      qrImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDWtW5ZKqOExTNPyI1rhkfCxtgxo-b-6j2naSx60wvoA6KB5Kk61hx3ZGsb_bi0Ah6XjSA-C7mtc_Rsl7q26sbPjDQFb_LmAgDmNFVgDjSg8oMp73I-dWn5ZoloSUxRc8RysmkkQLWxkXUspbXTejWKzddwOx8aNOA_K0LdLcEg58PUac0CtGdc_YMIKiUZwHkIB7Fhms56dW6dI7bu7D8VMyqEvKkiaaZ2dhTkj97muGImoqNIqXA3Kssut41usUd9hbEaIyh7bw",
      sustainabilityNote: "Zero waste to landfill · reusables only",
      co2AvoidedKg: 1.8,
    },
    {
      id: "stub-3",
      eventName: "Solar Sound Sessions",
      dateIso: "2024-09-14T19:30:00.000Z",
      venue: "Eco-Auditorium East",
      ticketId: "EL-18440-C",
      qrImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDWtW5ZKqOExTNPyI1rhkfCxtgxo-b-6j2naSx60wvoA6KB5Kk61hx3ZGsb_bi0Ah6XjSA-C7mtc_Rsl7q26sbPjDQFb_LmAgDmNFVgDjSg8oMp73I-dWn5ZoloSUxRc8RysmkkQLWxkXUspbXTejWKzddwOx8aNOA_K0LdLcEg58PUac0CtGdc_YMIKiUZwHkIB7Fhms56dW6dI7bu7D8VMyqEvKkiaaZ2dhTkj97muGImoqNIqXA3Kssut41usUd9hbEaIyh7bw",
      sustainabilityNote: "On-site solar · first season at verified eco-auditorium",
      co2AvoidedKg: 2.1,
    },
  ],
  milestoneBadges: [
    {
      id: "digital-native",
      title: "Digital Native",
      description: "Attended 5 events with 100% paperless ticketing.",
      icon: "smartphone",
      unlocked: true,
      unlockedAtIso: "2024-09-14T19:30:00.000Z",
    },
    {
      id: "green-pioneer",
      title: "Green Pioneer",
      description: "Attended the first event at a newly verified eco-auditorium.",
      icon: "explore",
      unlocked: true,
      unlockedAtIso: "2024-09-14T19:30:00.000Z",
    },
    {
      id: "sustainability-streak",
      title: "Sustainability Streak",
      description: "Attended 3 green-flagged events in a row.",
      icon: "local_fire_department",
      unlocked: false,
    },
  ],
};
