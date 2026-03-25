export type EcoProof = {
  icon: string;
  title: string;
  detail: string;
};

export type EventItem = {
  slug: string;
  name: string;
  description: string;
  city: string;
  dateLabel: string;
  dateISO: string;
  category: "Conference" | "Expo" | "Workshop" | "Summit";
  priceLabel: string;
  priceValue: number;
  sustainabilityScore: number;
  imageUrl: string;
  venueImageUrl: string;
  venueName: string;
  certifications: string[];
  ecoProofs: EcoProof[];
  agenda: { time: string; title: string }[];
  leedCertified: boolean;
  solarPowered: boolean;
  paperlessTicketing: boolean;
  wasteReduction: boolean;
  publicTransitDistanceMeters: number;
  treesSavedEstimate: number;
  trailerYoutubeId: string;
};

export const EVENTS: EventItem[] = [
  {
    slug: "eco-innovate-summit",
    name: "Eco-Innovate Summit 2026",
    description:
      "A sustainability-focused summit with verified eco venue standards, paperless access, and low-waste operations.",
    city: "Portland",
    dateLabel: "April 21, 2026",
    dateISO: "2026-04-21",
    category: "Summit",
    priceLabel: "$39",
    priceValue: 39,
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
    leedCertified: true,
    solarPowered: true,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 420,
    treesSavedEstimate: 18,
    trailerYoutubeId: "M7lc1UVf-VE",
  },
  {
    slug: "solar-future-expo",
    name: "Solar Future Expo",
    description:
      "An expo for renewable-tech enthusiasts featuring a solar-powered venue and digital-only attendee check-in.",
    city: "San Francisco",
    dateLabel: "May 10, 2026",
    dateISO: "2026-05-10",
    category: "Expo",
    priceLabel: "Free",
    priceValue: 0,
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
    leedCertified: true,
    solarPowered: true,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 610,
    treesSavedEstimate: 14,
    trailerYoutubeId: "jNQXAC9IVRw",
  },
  {
    slug: "zero-waste-workshop",
    name: "Zero-Waste Event Ops Workshop",
    description:
      "Hands-on workshop for organizers to design events with strong recycling, composting, and measurable waste reduction.",
    city: "Seattle",
    dateLabel: "June 02, 2026",
    dateISO: "2026-06-02",
    category: "Workshop",
    priceLabel: "$19",
    priceValue: 19,
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
    leedCertified: false,
    solarPowered: false,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 480,
    treesSavedEstimate: 9,
    trailerYoutubeId: "9bZkp7q19f0",
  },
  {
    slug: "green-venue-leadership-conference",
    name: "Green Venue Leadership Conference",
    description:
      "A leadership conference on ESG-ready venues with practical sessions on energy efficiency and sustainable operations.",
    city: "Austin",
    dateLabel: "July 18, 2026",
    dateISO: "2026-07-18",
    category: "Conference",
    priceLabel: "$59",
    priceValue: 59,
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
    leedCertified: true,
    solarPowered: false,
    paperlessTicketing: false,
    wasteReduction: true,
    publicTransitDistanceMeters: 530,
    treesSavedEstimate: 6,
    trailerYoutubeId: "kJQP7kiw5Fk",
  },
  {
    slug: "urban-forest-summit",
    name: "Urban Forest Restoration Summit",
    description:
      "City planners and NGOs meet to scale tree-planting partnerships, with a carbon-neutral venue and local food sourcing.",
    city: "Denver",
    dateLabel: "March 08, 2026",
    dateISO: "2026-03-08",
    category: "Summit",
    priceLabel: "$25",
    priceValue: 25,
    sustainabilityScore: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    venueName: "Cedar Commons Convention Center",
    certifications: ["LEED Platinum", "Living Building Challenge Petal", "ISO 20121"],
    ecoProofs: [
      { icon: "forest", title: "Biodiversity Offsets", detail: "Event fees fund local native-species planting" },
      { icon: "restaurant", title: "Regional Catering", detail: "90% ingredients sourced within 150 miles" },
      { icon: "directions_railway", title: "Rail-Adjacent Venue", detail: "Light rail stop 180m from main entrance" },
    ],
    agenda: [
      { time: "08:30", title: "City Canopy Baselines & GIS Workshop" },
      { time: "11:00", title: "Public–Private Reforestation Panels" },
      { time: "14:30", title: "Community Stewardship Fair" },
    ],
    leedCertified: true,
    solarPowered: true,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 180,
    treesSavedEstimate: 22,
    trailerYoutubeId: "L_jWHffIx5E",
  },
  {
    slug: "circular-fashion-pop-up",
    name: "Circular Fashion Pop-Up Expo",
    description:
      "Independent designers showcase repair, resale, and low-impact textiles. Digital tickets and minimal single-use packaging.",
    city: "Brooklyn",
    dateLabel: "April 05, 2026",
    dateISO: "2026-04-05",
    category: "Expo",
    priceLabel: "$12",
    priceValue: 12,
    sustainabilityScore: 3.4,
    imageUrl:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80",
    venueName: "Loft 7 Warehouse Studios",
    certifications: ["Green America Certified Business"],
    ecoProofs: [
      { icon: "apparel", title: "Take-Back Stations", detail: "On-site textile recycling partner for attendees" },
      { icon: "water_drop", title: "Low-Impact Dye Education", detail: "Workshops on natural dyes and water use" },
    ],
    agenda: [
      { time: "11:00", title: "Slow Fashion Brand Alley Opens" },
      { time: "13:00", title: "Panel: Legislation & Textile Waste" },
      { time: "16:00", title: "Mending & Upcycling Demos" },
    ],
    leedCertified: false,
    solarPowered: false,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 890,
    treesSavedEstimate: 4,
    trailerYoutubeId: "e-ORhEE9VVg",
  },
  {
    slug: "ev-charging-symposium",
    name: "EV Charging Infrastructure Symposium",
    description:
      "Utilities and municipalities align on grid-ready charging rollouts. Hosted at a solar-backed tech campus with shuttle from transit.",
    city: "San Diego",
    dateLabel: "May 22, 2026",
    dateISO: "2026-05-22",
    category: "Conference",
    priceLabel: "$45",
    priceValue: 45,
    sustainabilityScore: 4.2,
    imageUrl:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    venueName: "Harborview Tech Campus",
    certifications: ["LEED Silver", "Energy Star"],
    ecoProofs: [
      { icon: "ev_station", title: "EV Priority Parking", detail: "Fast chargers powered by on-site solar canopy" },
      { icon: "groups", title: "Shared Mobility Desk", detail: "Bike-share and carpool matching at registration" },
    ],
    agenda: [
      { time: "09:00", title: "Grid Capacity & Peak Shaving" },
      { time: "11:30", title: "Municipal Procurement Playbooks" },
      { time: "15:00", title: "Site Tours: Depot Charging" },
    ],
    leedCertified: true,
    solarPowered: true,
    paperlessTicketing: true,
    wasteReduction: false,
    publicTransitDistanceMeters: 720,
    treesSavedEstimate: 11,
    trailerYoutubeId: "60ItHLz5WEA",
  },
  {
    slug: "community-garden-build-day",
    name: "Community Garden Build Day",
    description:
      "Volunteer-led raised beds and compost systems for a neighborhood food hub. Outdoor event with printed waivers only.",
    city: "Chicago",
    dateLabel: "June 14, 2026",
    dateISO: "2026-06-14",
    category: "Workshop",
    priceLabel: "Free",
    priceValue: 0,
    sustainabilityScore: 2.8,
    imageUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    venueName: "Southside Community Plots",
    certifications: [],
    ecoProofs: [
      { icon: "compost", title: "Compost Bin Build", detail: "Three-bin system installed with local wood salvage" },
      { icon: "water_drop", title: "Rain Barrel Workshop", detail: "Attendees assemble barrels for plot irrigation" },
    ],
    agenda: [
      { time: "08:00", title: "Safety Briefing & Tool Checkout" },
      { time: "09:00", title: "Bed Construction Teams" },
      { time: "13:00", title: "Soil & Composting 101" },
    ],
    leedCertified: false,
    solarPowered: false,
    paperlessTicketing: false,
    wasteReduction: true,
    publicTransitDistanceMeters: 1200,
    treesSavedEstimate: 2,
    trailerYoutubeId: "YQHsXMglC9A",
  },
  {
    slug: "ocean-plastics-hackathon",
    name: "Ocean Plastics Innovation Hackathon",
    description:
      "48-hour build sprint for tracking and reducing marine plastic. Venue runs on renewables with strict waste sorting.",
    city: "Miami",
    dateLabel: "July 09, 2026",
    dateISO: "2026-07-09",
    category: "Workshop",
    priceLabel: "$29",
    priceValue: 29,
    sustainabilityScore: 5.0,
    imageUrl:
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Coral Reef Innovation Lab",
    certifications: ["LEED Platinum", "TRUE Platinum", "ISO 14001"],
    ecoProofs: [
      { icon: "water", title: "Coastal NGO Partner", detail: "Proceeds support local reef cleanup programs" },
      { icon: "recycling", title: "Zero Single-Use Plastics", detail: "Verified vendor packaging audit pre-event" },
      { icon: "bolt", title: "Renewable-Powered Hack Floor", detail: "100% REC-backed power for duration of event" },
    ],
    agenda: [
      { time: "18:00", title: "Kickoff & Problem Statements" },
      { time: "09:00", title: "Mentor Office Hours (Day 2)" },
      { time: "17:00", title: "Demo Showcase & Awards" },
    ],
    leedCertified: true,
    solarPowered: true,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 350,
    treesSavedEstimate: 25,
    trailerYoutubeId: "OPf0YbXqDm0",
  },
  {
    slug: "regenerative-ag-field-day",
    name: "Regenerative Agriculture Field Day",
    description:
      "Farm walk-throughs on cover crops and soil health. Rural venue; carpool encouraged; limited digital infrastructure.",
    city: "Boulder",
    dateLabel: "August 02, 2026",
    dateISO: "2026-08-02",
    category: "Workshop",
    priceLabel: "$35",
    priceValue: 35,
    sustainabilityScore: 3.1,
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    venueName: "Prairie Song Farm",
    certifications: ["Regenerative Organic Certified"],
    ecoProofs: [
      { icon: "grass", title: "Soil Carbon Demo Plots", detail: "Side-by-side comparisons with lab sampling" },
      { icon: "agriculture", title: "No-Till Equipment Tour", detail: "Machinery partners explain fuel savings" },
    ],
    agenda: [
      { time: "07:30", title: "Sunrise Farm Walk" },
      { time: "10:00", title: "Cover Crop Variety Trials" },
      { time: "14:00", title: "Buyer Meetup: Regional Grain" },
    ],
    leedCertified: false,
    solarPowered: false,
    paperlessTicketing: false,
    wasteReduction: true,
    publicTransitDistanceMeters: 4500,
    treesSavedEstimate: 3,
    trailerYoutubeId: "RgKAFK5djSk",
  },
  {
    slug: "climate-finance-forum",
    name: "Climate Finance & Disclosure Forum",
    description:
      "Institutional investors and issuers on TCFD-aligned reporting. Downtown convention center with strong transit links.",
    city: "Boston",
    dateLabel: "September 17, 2026",
    dateISO: "2026-09-17",
    category: "Conference",
    priceLabel: "$99",
    priceValue: 99,
    sustainabilityScore: 4.0,
    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    venueName: "Harborline Convention Center",
    certifications: ["LEED Gold", "WELL Silver"],
    ecoProofs: [
      { icon: "account_balance", title: "Carbon-Adjusted Catering", detail: "Menus scored for supply-chain emissions" },
      { icon: "description", title: "Digital-First Program", detail: "Agenda and slides via app; optional print" },
    ],
    agenda: [
      { time: "08:00", title: "Registration & Networking Breakfast" },
      { time: "10:00", title: "Keynote: Transition Risk Scenarios" },
      { time: "14:00", title: "Breakout: Nature-Related Disclosures" },
    ],
    leedCertified: true,
    solarPowered: false,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 220,
    treesSavedEstimate: 15,
    trailerYoutubeId: "CevxZvSJLk8",
  },
  {
    slug: "night-market-green-edition",
    name: "Night Market: Green Edition",
    description:
      "Street festival with local makers, LED lighting, and reusables. Mixed indoor-outdoor footprint; some printed signage.",
    city: "Los Angeles",
    dateLabel: "October 03, 2026",
    dateISO: "2026-10-03",
    category: "Expo",
    priceLabel: "$8",
    priceValue: 8,
    sustainabilityScore: 3.7,
    imageUrl:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80",
    venueImageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    venueName: "Arts District Block Party",
    certifications: ["Green Seal Event Standard (Pilot)"],
    ecoProofs: [
      { icon: "lightbulb", title: "LED-Only Street Lighting", detail: "Temporary installs meet efficiency spec" },
      { icon: "local_mall", title: "Reusable Cup Deposit", detail: "Refundable cups at all beverage vendors" },
    ],
    agenda: [
      { time: "17:00", title: "Vendor Alley Opens" },
      { time: "19:00", title: "Live Music: Solar-Powered Stage" },
      { time: "22:00", title: "Late-Night Repair Café" },
    ],
    leedCertified: false,
    solarPowered: true,
    paperlessTicketing: true,
    wasteReduction: true,
    publicTransitDistanceMeters: 640,
    treesSavedEstimate: 5,
    trailerYoutubeId: "ktvTqknDobU",
  },
];

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function eventLocalDay(dateISO: string) {
  return startOfLocalDay(new Date(`${dateISO}T12:00:00`));
}

export function partitionEventsByRecency(events: EventItem[], now = new Date()) {
  const today = startOfLocalDay(now);
  const weekEndExclusive = new Date(today);
  weekEndExclusive.setDate(weekEndExclusive.getDate() + 7);

  const current: EventItem[] = [];
  const upcoming: EventItem[] = [];

  for (const event of events) {
    const day = eventLocalDay(event.dateISO);
    if (day < today) continue;
    if (day < weekEndExclusive) current.push(event);
    else upcoming.push(event);
  }

  return { current, upcoming };
}

export function getEventBySlug(slug?: string) {
  return EVENTS.find((event) => event.slug === slug);
}
