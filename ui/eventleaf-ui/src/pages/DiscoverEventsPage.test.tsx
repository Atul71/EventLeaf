import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DiscoverEventsPage } from "./DiscoverEventsPage";

describe("DiscoverEventsPage", () => {
  it("renders the discover heading and search control", () => {
    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route path="/events" element={<DiscoverEventsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /discover events/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search events/i })).toBeInTheDocument();
  });
});
