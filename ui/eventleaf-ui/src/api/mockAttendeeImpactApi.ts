import {
  SAMPLE_ATTENDEE_IMPACT,
  type AttendeeImpactPayload,
} from "../mocks/attendeeImpactData";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock API: fetches full attendee impact dashboard payload.
 * Swap implementation for real HTTP client later.
 */
export async function fetchAttendeeImpact(): Promise<AttendeeImpactPayload> {
  await delay(420);
  return structuredClone(SAMPLE_ATTENDEE_IMPACT);
}

export async function prefetchShareCardText(eventName: string, badgeLabel: string): Promise<string> {
  await delay(120);
  return `I showed up green at "${eventName}" (${badgeLabel}) on EventLeaf. Digital tickets, real impact. #SustainableEvents`;
}
