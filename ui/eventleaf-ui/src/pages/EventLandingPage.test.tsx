import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EventLandingPage } from "./EventLandingPage";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/:slug" element={<EventLandingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("EventLandingPage", () => {
  it("renders event title and trailer section for a valid slug", () => {
    renderAt("/events/eco-innovate-summit");

    expect(screen.getByRole("heading", { level: 1, name: /Eco-Innovate Summit 2026/i })).toBeInTheDocument();
    const trailerLink = screen.getByRole("link", {
      name: /watch trailer for eco-innovate summit 2026 on youtube \(opens in new tab\)/i,
    });
    expect(trailerLink).toHaveAttribute("href", "https://www.youtube.com/watch?v=M7lc1UVf-VE");
    expect(trailerLink).toHaveAttribute("target", "_blank");
  });

  it("renders not-found copy for an unknown slug", () => {
    renderAt("/events/unknown-slug-xyz");

    expect(screen.getByRole("heading", { name: /event not found/i })).toBeInTheDocument();
  });

  it("share button is clickable without throwing", async () => {
    const user = userEvent.setup();
    renderAt("/events/eco-innovate-summit");

    const share = screen.getByRole("button", { name: /share event/i });
    await user.click(share);
    expect(share).toBeInTheDocument();
  });
});
