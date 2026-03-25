import type { SustainableVenue } from "../components/organizer/SustainableVenueCard";

/** BE-102 venue database shape: certifications shown when a Green Auditorium / eco venue is selected */
export type Be102Venue = SustainableVenue & {
  isGreenAuditorium: boolean;
  certifications: string[];
};

export const BE102_VENUES: Be102Venue[] = [
  {
    id: "1",
    name: "The Solar Atrium",
    location: "San Francisco, CA",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUgZyAF6_kz7YAFvp-Bb-k3gVyjjyzrYTuCA9VHstWph8Wb4JbIcpx82Y0jubQ8AT_aZEQrXu8CRNomu4-772Ti9jync7r-VNNHC67wobeQ8t9qU7rkybGSAvUit84L6TIu56NJQJToJCgPacH6e-LH5gno1AwWJwyhJJOd9lw8LoIRmXYRxvvzsNVYBuca-R3J19zDvLxkvsTa7whSGEiXtneTcXoB1VigmyTpAvqBge8JxmGdBv21tuQFpwgmQCNNS_gKq_8m0c",
    imageAlt: "Modern glass building atrium with lush indoor plants",
    rating: 4.8,
    sustainabilityIndex: 4.8,
    capacity: "500 cap",
    isEcoCertified: true,
    isGreenAuditorium: true,
    certifications: ["Green Auditorium", "LEED Gold", "100% Renewable Energy (on-site solar)"],
    featureTags: [
      { icon: "meeting_room", label: "Green Auditorium" },
      { icon: "bolt", label: "100% Solar" },
    ],
  },
  {
    id: "2",
    name: "Green Canopy Hall",
    location: "Portland, OR",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGDBAz27shXp6Z18jaL8qQTwf2HB7yngyvulwqIl511G5garKONhBhzIm4Lzef8AgVFGziHtskGnXeuBqSJp7NVPcYwG3QlK0gKdOutllKzAPn1IvF0QhPEGScGqxbRy3ViSHh8xDa5H_tvmP6PngtryucMCTHvZY8HRfsBwlNm_DdZlczOZHB6o1z2VynrR318LEkZJsf8I16vbyMVzvTQQgJTU4MFbt-vB6-jU7GYtp-3PtiUN5sckd60ZyqkcQTkicQbjCyqSU",
    imageAlt: "Industrial chic event space with hanging plants and natural light",
    rating: 4.5,
    sustainabilityIndex: 4.5,
    capacity: "1200 cap",
    isEcoCertified: true,
    isGreenAuditorium: true,
    certifications: ["LEED Gold", "Zero Waste Program (venue-wide)", "Green Auditorium"],
    featureTags: [
      { icon: "delete_sweep", label: "Zero Waste" },
      { icon: "verified", label: "LEED Gold" },
    ],
  },
  {
    id: "3",
    name: "Eco-Vista Center",
    location: "Seattle, WA",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrEq-ZEKATUnd5lJojsM_eW8VcSjz7PPpp0xOUliAZI1ChhRhgxrcFAi3-daQsfwGUOUYZxl-U0a-nMpalltepVVbJ4OF23zFvDjVg0j197nN3TZ66KLKteSsbeYeK_Aoq0se0L6PbLnixNOcLJRuKZkXyvL1dWPHqRHBP_yPay0NKn41AAcGWm9vi1pNhrzFUXTOXAVl9dTg9-KQVbKESuotZX76YF7mNQnkdmSV3TheNi4KKA1PhpPvnJMQhUro_QI90LN821Ds",
    imageAlt: "Futuristic sustainable conference center with wood and glass architecture",
    rating: 4.9,
    sustainabilityIndex: 4.9,
    capacity: "350 cap",
    isEcoCertified: true,
    isGreenAuditorium: true,
    certifications: ["LEED Platinum", "Rainwater harvesting", "Green Auditorium"],
    featureTags: [
      { icon: "compost", label: "Bio-Garden" },
      { icon: "water_drop", label: "Rain Harvest" },
    ],
  },
  {
    id: "4",
    name: "Renewable Roots Pavilion",
    location: "Austin, TX",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1rtHAMrSm8ECACxlIE8NdpXTQpIDEJLWThS3dAdb1ngz0dy_NzyjTF-6lXkzATWcMDkJqSH_b0RRdfTfKWNNj_HcissS7UL6hjwAaNnvRrkvB-yZGXPgYWFAR7Nsyoz1EiVpAaVr9eAvAoitvB5qXazuawGuo5mNCOSGHkwfpiVrX5c0NWBQa0SkeZPYfiDTSUDxlumnnSuvosLlaA1b4aGjzJjHI6R-jU4Y_rB8f1Z9qdJVuIUzq86Gvd4mhPrUIfIHccX9FLmc",
    imageAlt: "Rustic modern space with vertical gardens and reclaimed wood",
    rating: 4.2,
    sustainabilityIndex: 4.2,
    capacity: "200 cap",
    isEcoCertified: true,
    isGreenAuditorium: true,
    certifications: ["100% Renewable Energy (grid + offsets)", "Low-energy lighting retrofit"],
    featureTags: [
      { icon: "forest", label: "Urban Garden" },
      { icon: "lightbulb", label: "Low Energy" },
    ],
  },
  {
    id: "5",
    name: "Earth-First Ballroom",
    location: "Chicago, IL",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMR_fVwizOG-OxDMFrhNdDxOdeLA2iPM2hXgmBHwgjJxXj_Yq4WIYXDhHSedxMkZak7pJpM5LSC8bl-gEGtgiroAYkCfTv-d1gdTUfq5thk6Hre1X_RwCugghsuY5iF2fRA3LkVM9kdd_s3aVtHf5C-qxLNJVK3UQGwbwZ1KNCV8F6oyL5oXogHrZAu2CoYZTXvHe0O5TC-lQCXc1JQDz0OTZUGm71-3VCA1X_b84FC24J8n_R6TthwkrB0TWx2QlClEwYzLl0br0",
    imageAlt: "Grand elegant ballroom with modern energy-efficient lighting",
    rating: 4.7,
    sustainabilityIndex: 4.7,
    capacity: "2500 cap",
    isEcoCertified: true,
    isGreenAuditorium: true,
    certifications: ["Carbon-neutral operations (verified)", "Wind power PPA"],
    featureTags: [
      { icon: "energy_savings_leaf", label: "Carbon Neutral" },
      { icon: "wind_power", label: "Wind Energy" },
    ],
  },
  {
    id: "6",
    name: "Sustainable Skies Lounge",
    location: "New York, NY",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxW2_MBXE7Kjt9RehcaSo8PgEuUHoLUFQZdHqgNS5-QjN2pZczLjlmeIMd5XURmIePzEd20kmH4j_K4_nfWDnvxk_CkxfWYxVDU-R8Qq6Fm4ZcIMNtkHByduJDHhNfd2-sxenBJYKGHHibTg8TJjxHg4fDtqpaX5ktFqDFQDsCleG9OxQBHHw-KJoZZRz8u7BIwRLEPMplpeXiQzKLxXIsLqTyJAHDSbiC7jQoxT7zBvgH5OsjPvFOU5qR0oCGJyjDOQSI8Uopp2Y",
    imageAlt: "Rooftop event lounge with solar panels and panoramic city views",
    rating: 4.6,
    sustainabilityIndex: 4.6,
    capacity: "150 cap",
    isEcoCertified: true,
    isGreenAuditorium: true,
    certifications: ["LEED Silver", "Solar roof array", "Organic F&B partners"],
    featureTags: [
      { icon: "wb_sunny", label: "Solar Roof" },
      { icon: "local_dining", label: "Organic F&B" },
    ],
  },
  {
    id: "ng-1",
    name: "Metro Grand Hall",
    location: "Chicago, IL",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMR_fVwizOG-OxDMFrhNdDxOdeLA2iPM2hXgmBHwgjJxXj_Yq4WIYXDhHSedxMkZak7pJpM5LSC8bl-gEGtgiroAYkCfTv-d1gdTUfq5thk6Hre1X_RwCugghsuY5iF2fRA3LkVM9kdd_s3aVtHf5C-qxLNJVK3UQGwbwZ1KNCV8F6oyL5oXogHrZAu2CoYZTXvHe0O5TC-lQCXc1JQDz0OTZUGm71-3VCA1X_b84FC24J8n_R6TthwkrB0TWx2QlClEwYzLl0br0",
    imageAlt: "Large conventional event hall",
    rating: 4.1,
    sustainabilityIndex: 2.1,
    capacity: "3000 cap",
    isEcoCertified: false,
    isGreenAuditorium: false,
    certifications: [],
    featureTags: [{ icon: "apartment", label: "Standard venue" }],
  },
  {
    id: "ng-2",
    name: "Riverside Warehouse",
    location: "Portland, OR",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGDBAz27shXp6Z18jaL8qQTwf2HB7yngyvulwqIl511G5garKONhBhzIm4Lzef8AgVFGziHtskGnXeuBqSJp7NVPcYwG3QlK0gKdOutllKzAPn1IvF0QhPEGScGqxbRy3ViSHh8xDa5H_tvmP6PngtryucMCTHvZY8HRfsBwlNm_DdZlczOZHB6o1z2VynrR318LEkZJsf8I16vbyMVzvTQQgJTU4MFbt-vB6-jU7GYtp-3PtiUN5sckd60ZyqkcQTkicQbjCyqSU",
    imageAlt: "Industrial warehouse venue",
    rating: 3.9,
    sustainabilityIndex: 2.4,
    capacity: "800 cap",
    isEcoCertified: false,
    isGreenAuditorium: false,
    certifications: [],
    featureTags: [{ icon: "warehouse", label: "Industrial rental" }],
  },
  {
    id: "ng-3",
    name: "City Center Ballroom",
    location: "Denver, CO",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrEq-ZEKATUnd5lJojsM_eW8VcSjz7PPpp0xOUliAZI1ChhRhgxrcFAi3-daQsfwGUOUYZxl-U0a-nMpalltepVVbJ4OF23zFvDjVg0j197nN3TZ66KLKteSsbeYeK_Aoq0se0L6PbLnixNOcLJRuKZkXyvL1dWPHqRHBP_yPay0NKn41AAcGWm9vi1pNhrzFUXTOXAVl9dTg9-KQVbKESuotZX76YF7mNQnkdmSV3TheNi4KKA1PhpPvnJMQhUro_QI90LN821Ds",
    imageAlt: "Hotel ballroom",
    rating: 4.3,
    sustainabilityIndex: 2.6,
    capacity: "600 cap",
    isEcoCertified: false,
    isGreenAuditorium: false,
    certifications: [],
    featureTags: [{ icon: "hotel", label: "Hotel partner" }],
  },
];

export function getBe102VenueById(id: string): Be102Venue | undefined {
  return BE102_VENUES.find((v) => v.id === id);
}
