import { afterEach, describe, expect, it, vi } from "vitest";
import { tryFetchSavedEventIds, saveEventById } from "./eventleafApi";

describe("saved events API helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tryFetchSavedEventIds returns null on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      })
    );
    await expect(tryFetchSavedEventIds()).resolves.toBeNull();
  });

  it("tryFetchSavedEventIds returns ids on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ event_ids: ["aaa", "bbb"] }),
      })
    );
    await expect(tryFetchSavedEventIds()).resolves.toEqual(["aaa", "bbb"]);
  });

  it("saveEventById throws Not signed in on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      })
    );
    await expect(saveEventById("event-uuid")).rejects.toThrow("Not signed in");
  });
});
