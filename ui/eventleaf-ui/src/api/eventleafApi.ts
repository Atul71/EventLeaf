/** Use same-origin `/api` (Vite dev proxy → Go server). */

const API_PREFIX = "/api/v1";

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`;
}

export type ApiEcoAttribute = {
  id: string;
  name: string;
  category: string;
};

export type ApiVenue = {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  state?: string | null;
  country?: string;
  capacity: number;
  latitude?: number | null;
  longitude?: number | null;
  is_eco_certified: boolean;
  eco_certifications?: string[] | null;
  has_public_transit: boolean;
  has_parking: boolean;
  has_accessible_facilities: boolean;
};

export type ApiEvent = {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  venue_id?: string | null;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  is_eco_friendly: boolean;
  eco_summary?: string | null;
  ticket_price: number;
  total_capacity: number;
  available_tickets: number;
  status: string;
  visibility: string;
  image_url?: string | null;
  category?: string | null;
  venue_name?: string | null;
  venue_city?: string | null;
  /** From venues.eco_certifications */
  venue_eco_certifications?: string[] | null;
  /** From event_eco_attributes + eco_attributes */
  eco_attribute_names?: string[] | null;
  has_digital_ticketing?: boolean;
  has_paperless_checkin?: boolean;
  /** From venues.has_public_transit */
  has_public_transit?: boolean;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  organizer_id: string;
  venue_id?: string | null;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  eco_summary?: string;
  ticket_price: number;
  total_capacity: number;
  status?: string;
  visibility?: string;
  category?: string;
  eco_attribute_ids?: string[];
};

export type CreateEventResponse = {
  event: ApiEvent;
  is_green: boolean;
  green_criteria_met?: string[];
  green_criteria_not_met?: string[];
};

export type CurrentUser = {
  user_id: string;
  email: string;
  username?: string;
  is_organizer?: boolean;
};

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch(`${API_PREFIX}/me`, { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<CurrentUser>;
}

export async function logoutSession(): Promise<void> {
  const res = await fetch(`${API_PREFIX}/logout`, { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
}

/** Window event name: fire after login/signup so nav bars can refetch `/me`. */
export const AUTH_SESSION_CHANGED_EVENT = "eventleaf-auth-changed";

export function notifyAuthSessionChanged(): void {
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT));
}

export async function fetchDemoOrganizerId(): Promise<string> {
  const res = await fetch(`${API_PREFIX}/bootstrap/organizer-id`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { organizer_id: string };
  return data.organizer_id;
}

export async function fetchVenues(limit = 500): Promise<ApiVenue[]> {
  const res = await fetch(`${API_PREFIX}/venues?limit=${limit}&offset=0`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ApiVenue[]>;
}

export async function fetchEcoAttributes(): Promise<ApiEcoAttribute[]> {
  const res = await fetch(`${API_PREFIX}/eco-attributes`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ApiEcoAttribute[]>;
}

export async function fetchPublishedEvents(limit = 100): Promise<ApiEvent[]> {
  const res = await fetch(`${API_PREFIX}/events?limit=${limit}&offset=0`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ApiEvent[]>;
}

/** All events for the signed-in organizer (drafts and published). Tries `/organizer/events` then `/me/events`. */
export async function fetchMyEvents(limit = 200): Promise<ApiEvent[]> {
  const qs = `limit=${limit}&offset=0`;
  const urls = [`${API_PREFIX}/organizer/events?${qs}`, `${API_PREFIX}/me/events?${qs}`];
  for (const url of urls) {
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      return res.json() as Promise<ApiEvent[]>;
    }
    if (res.status !== 404) {
      throw new Error(await parseError(res));
    }
  }
  throw new Error(
    "Could not load your events (organizer list API missing). Rebuild and restart the API so GET /api/v1/organizer/events is available."
  );
}

export async function fetchEventById(id: string): Promise<ApiEvent> {
  const res = await fetch(`${API_PREFIX}/events/${encodeURIComponent(id)}`, { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<ApiEvent>;
}

export async function publishEventById(id: string): Promise<CreateEventResponse> {
  const res = await fetch(`${API_PREFIX}/events/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<CreateEventResponse>;
}

export async function createEvent(body: CreateEventPayload): Promise<CreateEventResponse> {
  const res = await fetch(`${API_PREFIX}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<CreateEventResponse>;
}

export function normalizeTimeForApi(t: string): string {
  const trimmed = t.trim();
  const parts = trimmed.split(":");
  if (parts.length === 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  }
  if (parts.length >= 3) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
  }
  return trimmed;
}
