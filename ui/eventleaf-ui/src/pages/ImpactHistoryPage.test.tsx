import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ImpactHistoryPage } from "./ImpactHistoryPage";
import type { ApiEvent } from "../api/eventleafApi";
import { fetchCurrentUser, fetchMyEvents } from "../api/eventleafApi";

vi.mock("../api/eventleafApi", async () => {
  const actual = await vi.importActual("../api/eventleafApi");
  return {
    ...actual,
    fetchCurrentUser: vi.fn(),
    fetchMyEvents: vi.fn(),
  };
});

const mockFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockFetchMyEvents = vi.mocked(fetchMyEvents);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/profile/impact-history"]}>
      <Routes>
        <Route path="/profile/impact-history" element={<ImpactHistoryPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function makeEvent(overrides: Partial<ApiEvent>): ApiEvent {
  return {
    id: "evt-1",
    title: "Default Event",
    description: "Desc",
    organizer_id: "org-1",
    venue_id: null,
    event_date: "2026-05-01",
    event_start_time: "10:00:00",
    event_end_time: "12:00:00",
    is_eco_friendly: false,
    eco_summary: null,
    ticket_price: 0,
    total_capacity: 100,
    available_tickets: 100,
    status: "draft",
    visibility: "public",
    image_url: null,
    category: null,
    venue_name: null,
    venue_city: null,
    venue_eco_certifications: null,
    eco_attribute_names: null,
    has_digital_ticketing: false,
    has_paperless_checkin: false,
    has_public_transit: false,
    ...overrides,
  };
}

describe("ImpactHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders organizer impact summary and event table rows", async () => {
    mockFetchCurrentUser.mockResolvedValue({
      user_id: "u1",
      email: "demo@eventleaf.com",
      is_organizer: true,
    });
    mockFetchMyEvents.mockResolvedValue([
      makeEvent({
        id: "e1",
        title: "Zero Waste Expo",
        status: "published",
        total_capacity: 200,
        is_eco_friendly: true,
        has_digital_ticketing: true,
        has_paperless_checkin: true,
        has_public_transit: true,
        eco_attribute_names: ["Digital Check-in", "Waste Reduction Program"],
      }),
      makeEvent({
        id: "e2",
        title: "Neighborhood Meetup",
        status: "draft",
        total_capacity: 50,
        is_eco_friendly: false,
        has_digital_ticketing: true,
        has_paperless_checkin: false,
        has_public_transit: false,
      }),
    ]);

    renderPage();

    expect(screen.getByRole("heading", { name: /impact history/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetchMyEvents).toHaveBeenCalledWith(500);
    });

    expect(screen.getByText(/events created/i)).toBeInTheDocument();
    expect(screen.getByText(/eco-friendly events/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated paper saved/i)).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument(); // estimated paper saved
    expect(screen.getByRole("link", { name: /zero waste expo/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /indicators/i })).toBeInTheDocument();
  });

  it("shows empty state when organizer has no events", async () => {
    mockFetchCurrentUser.mockResolvedValue({
      user_id: "u2",
      email: "organizer@eventleaf.com",
      is_organizer: true,
    });
    mockFetchMyEvents.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(mockFetchMyEvents).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/no created events yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create your first event/i })).toBeInTheDocument();
  });
});
