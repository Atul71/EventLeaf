export type EcoProof = {
  icon: string;
  title: string;
  detail: string;
};

export type EventItem = {
  slug: string;
  name: string;
  city: string;
  dateLabel: string;
  category: "Conference" | "Expo" | "Workshop" | "Summit";
  priceLabel: string;
  sustainabilityScore: number; // out of 5
  imageUrl: string;
  venueImageUrl: string;
  venueName: string;
  certifications: string[];
  ecoProofs: EcoProof[];
  agenda: { time: string; title: string }[];
};

export const EVENTS: EventItem[] = [
  {
    slug: "eco-innovate-summit",
    name: "Eco-Innovate Summit 2026",
    city: "Portland",
    dateLabel: "April 21, 2026",
    category: "Summit",
    priceLabel: "$39",
    sustainabilityScore: 4.7,
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    venueName: "Green Canopy Hall",
    certifications: ["LEED Platinum", "TRUE Zero Waste", "ISO 14001", "Green Key Global"],
    ecoProofs: [
      { icon: "verified", title: "LEED Platinum Venue", detail: "Certified by U.S. Green Building Council" },
      { icon: "bolt", title: "100% Renewable Energy", detail: "Solar + wind-powered operations for event hours" },
      { icon: "recycling", title: "Zero-Waste Plan", detail: "92% diversion from landfill through reuse and composting" },
      { icon: "water_drop", title: "Water Conservation", detail: "Rainwater harvesting + low-flow infrastructure" },
    ],
    agenda: [
      { time: "09:00", title: "Registration & Green Welcome Kit" },
      { time: "10:00", title: "Opening Keynote: Climate-Positive Events" },
      { time: "12:30", title: "Plant-Based Networking Lunch" },
      { time: "15:00", title: "Venue Sustainability Walkthrough" },
    ],
  },
  {
    slug: "solar-future-expo",
    name: "Solar Future Expo",
    city: "San Francisco",
    dateLabel: "May 10, 2026",
    category: "Expo",
    priceLabel: "Free",
    sustainabilityScore: 4.8,
    imageUrl:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    venueName: "Solar Atrium",
    certifications: ["LEED Gold", "Energy Star", "BREEAM Excellent"],
    ecoProofs: [
      { icon: "solar_power", title: "Solar-Backed Operations", detail: "On-site PV supports core event operations" },
      { icon: "compost", title: "Compost-First F&B", detail: "All serving disposables are compostable and tracked" },
      { icon: "directions_bus", title: "Low-Carbon Transit Access", detail: "Transit-linked venue with bike parking" },
    ],
    agenda: [
      { time: "10:00", title: "Future of Distributed Solar Grids" },
      { time: "11:30", title: "Clean Tech Startup Showcase" },
      { time: "14:00", title: "Investor x Founder Matchmaking" },
    ],
  },
  {
    slug: "zero-waste-workshop",
    name: "Zero-Waste Event Ops Workshop",
    city: "Seattle",
    dateLabel: "June 02, 2026",
    category: "Workshop",
    priceLabel: "$19",
    sustainabilityScore: 4.5,
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    venueName: "Eco-Vista Center",
    certifications: ["TRUE Zero Waste", "ISO 20121"],
    ecoProofs: [
      { icon: "delete_sweep", title: "Waste Audit Program", detail: "Post-event waste streams measured and disclosed" },
      { icon: "restaurant", title: "Plant-Forward Catering", detail: "Menu designed for lower lifecycle emissions" },
      { icon: "local_shipping", title: "Reusable Logistics", detail: "Reusable signage, lanyards, and booth materials" },
    ],
    agenda: [
      { time: "09:30", title: "Waste Baseline & Goal Setting" },
      { time: "11:00", title: "Vendor Contract Sustainability Clauses" },
      { time: "13:30", title: "Reporting Toolkit Hands-on Session" },
    ],
  },
  {
    slug: "green-venue-leadership-conference",
    name: "Green Venue Leadership Conference",
    city: "Austin",
    dateLabel: "July 18, 2026",
    category: "Conference",
    priceLabel: "$59",
    sustainabilityScore: 4.6,
    imageUrl:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1200&q=80",
    venueName: "Renewable Roots Pavilion",
    certifications: ["LEED Gold", "WELL Certified"],
    ecoProofs: [
      { icon: "eco", title: "Green Venue Benchmarking", detail: "Venue meets annual sustainability benchmark criteria" },
      { icon: "water_ec", title: "Smart Water Systems", detail: "Sensor-based water optimization and leak prevention" },
      { icon: "energy_savings_leaf", title: "Energy Efficiency Controls", detail: "Demand-response aligned HVAC and lighting" },
    ],
    agenda: [
      { time: "10:00", title: "Venue ESG Reporting Standards" },
      { time: "12:00", title: "Circular Procurement for Events" },
      { time: "15:30", title: "Leadership Roundtable" },
    ],
  },
];

export function getEventBySlug(slug?: string) {
  return EVENTS.find((event) => event.slug === slug);
}
