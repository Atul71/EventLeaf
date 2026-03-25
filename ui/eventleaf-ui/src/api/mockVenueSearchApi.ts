import { BE102_VENUES, type Be102Venue } from "../mocks/be102Venues";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock BE-102 venue database search. Replace with GET /api/venues?search=… when backend is ready.
 */
export async function searchBe102Venues(query: string): Promise<Be102Venue[]> {
  await delay(220);
  const q = query.trim().toLowerCase();
  if (!q) return [...BE102_VENUES];
  return BE102_VENUES.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q) ||
      v.certifications.some((c) => c.toLowerCase().includes(q)) ||
      v.featureTags.some((t) => t.label.toLowerCase().includes(q))
  );
}
