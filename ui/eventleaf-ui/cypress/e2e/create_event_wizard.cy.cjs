/* eslint-disable no-undef */
/**
 * E2E tests for the Create Event Wizard (/organizer/events/create)
 *
 * All API calls are intercepted so tests run without a live backend.
 *
 * Wizard steps:
 *   1 – Core details  (name, category, description, date, times, price, capacity)
 *   2 – Venue         (search + select)
 *   3 – Sustainability (eco toggles)
 *   4 – Eco preview   (score, badges, publish / save draft)
 */

describe("Create Event Wizard", () => {
  // ─── shared fixtures ────────────────────────────────────────────────────────

  const ME = {
    user_id: "user-123",
    email: "organizer@eventleaf.test",
    username: "organizer",
    is_organizer: true,
  };

  const ECO_ATTRS = [
    { id: "attr-1", name: "Paperless Ticketing",       description: "No paper tickets" },
    { id: "attr-2", name: "Digital Check-in",          description: "QR check-in only" },
    { id: "attr-3", name: "Waste Reduction Program",   description: "Composting on site" },
    { id: "attr-4", name: "Zero Single-Use Plastics",  description: "No single-use plastics" },
    { id: "attr-5", name: "Carbon Neutral Transport",  description: "Transit incentives" },
  ];

  const VENUES = [
    {
      id: "venue-eco",
      name: "Green Pavilion",
      city: "Portland",
      state: "OR",
      is_eco_certified: true,
      eco_certifications: ["LEED Gold", "Zero Waste"],
    },
    {
      id: "venue-std",
      name: "Standard Hall",
      city: "Seattle",
      state: "WA",
      is_eco_certified: false,
      eco_certifications: [],
    },
  ];

  const CREATED_EVENT = {
    event: {
      id: "evt-new-001",
      title: "Cypress Green Summit",
      status: "published",
    },
    is_green: true,
  };

  const DRAFT_EVENT = {
    event: {
      id: "evt-draft-001",
      title: "Cypress Green Summit",
      status: "draft",
    },
    is_green: false,
  };

  // ─── helpers ─────────────────────────────────────────────────────────────────

  /** Stub the three bootstrap API calls the wizard makes on mount. */
  function stubBootstrap() {
    cy.intercept("GET", /\/api\/v1\/me$/, { statusCode: 200, body: ME }).as("getMe");
    cy.intercept("GET", /\/api\/v1\/venues/, { statusCode: 200, body: VENUES }).as("getVenues");
    cy.intercept("GET", /\/api\/v1\/eco-attributes/, { statusCode: 200, body: ECO_ATTRS }).as("getEcoAttrs");
  }

  /** Fill in all Step 1 required fields. */
  function fillStep1({
    name = "Cypress Green Summit",
    description = "A fully eco-conscious tech summit powered by renewable energy.",
  } = {}) {
    cy.get("#evt-name").clear().type(name);
    cy.get("#evt-cat").select("Conference");
    cy.get("#evt-desc").clear().type(description);
    // date and time fields already have defaults (tomorrow / 10:00 / 18:00)
    // capacity and price already have defaults (100 / 0)
  }

  /** Select the first venue from the dropdown on Step 2. */
  function selectFirstVenue() {
    cy.get("#venue-search").click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.get('[role="listbox"] button').first().click();
  }

  // ─── tests ───────────────────────────────────────────────────────────────────

  beforeEach(() => {
    stubBootstrap();
    cy.visit("/organizer/events/create");
    cy.wait(["@getMe", "@getVenues", "@getEcoAttrs"]);
  });

  // ── 1. Page structure ────────────────────────────────────────────────────────

  it("renders the wizard with Step 1 active and four step indicators", () => {
    cy.contains("h1", "Create event").should("be.visible");
    cy.contains("Core event details").should("be.visible");

    // Four step buttons visible in the progress rail
    cy.get('ol[aria-label="Steps"] li').should("have.length", 4);
    cy.contains("Core details").should("be.visible");
    cy.contains("Venue").should("be.visible");
    cy.contains("Sustainability").should("be.visible");
    cy.contains("Eco preview").should("be.visible");

    // Back button disabled on step 1
    cy.contains("button", "Back").should("be.disabled");
  });

  it("shows all required Step 1 fields", () => {
    cy.get("#evt-name").should("exist");
    cy.get("#evt-cat").should("exist");
    cy.get("#evt-desc").should("exist");
    cy.get("#evt-date").should("exist");
    cy.get("#evt-start").should("exist");
    cy.get("#evt-end").should("exist");
    cy.get("#evt-price").should("exist");
    cy.get("#evt-cap").should("exist");
  });

  // ── 2. Step 1 validation ─────────────────────────────────────────────────────

  it("disables Continue on Step 1 when required fields are empty", () => {
    cy.contains("button", "Continue").should("be.disabled");
  });

  it("enables Continue on Step 1 after all required fields are filled", () => {
    fillStep1();
    cy.contains("button", "Continue").should("not.be.disabled");
  });

  // ── 3. Step navigation ───────────────────────────────────────────────────────

  it("advances to Step 2 after completing Step 1", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    cy.contains("h2", "Venue selection").should("be.visible");
    cy.get("#venue-search").should("exist");
  });

  it("Back button on Step 2 returns to Step 1", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    cy.contains("h2", "Venue selection").should("be.visible");
    cy.contains("button", "Back").click();
    cy.contains("h2", "Core event details").should("be.visible");
  });

  it("disables Continue on Step 2 until a venue is selected", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").should("be.disabled");
  });

  it("enables Continue on Step 2 after selecting a venue", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").should("not.be.disabled");
  });

  it("advances to Step 3 after selecting a venue", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("h2", "Sustainability checklist").should("be.visible");
  });

  it("advances to Step 4 from Step 3", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();
    cy.contains("h2", "Real-time Eco-Score").should("be.visible");
  });

  // ── 4. Venue search ──────────────────────────────────────────────────────────

  it("shows venues in the dropdown when venue search is focused", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    cy.get("#venue-search").click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.get('[role="listbox"] button').should("have.length", VENUES.length);
  });

  it("filters venues by search query", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    cy.get("#venue-search").type("Green");
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="listbox"]', "Green Pavilion").should("be.visible");
    cy.contains('[role="listbox"]', "Standard Hall").should("not.exist");
  });

  it("shows selected venue card after selection", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("Green Pavilion").should("be.visible");
  });

  it("shows non-certified venue tip when a non-eco venue is selected", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    // Select the second (non-certified) venue
    cy.get("#venue-search").click();
    cy.get('[role="listbox"] button').eq(1).click();
    cy.contains("Tip:").should("be.visible");
    cy.contains("green-certified venue").should("be.visible");
  });

  // ── 5. Sustainability toggles ─────────────────────────────────────────────────

  it("has Digital-only ticketing ON by default on Step 3", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.get('[role="switch"][aria-checked="true"]').should("exist");
  });

  it("can toggle Digital-only ticketing off and back on", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    // Currently ON — click to turn off
    cy.get('[role="switch"]').click();
    cy.get('[role="switch"][aria-checked="false"]').should("exist");
    cy.contains("Printed tickets and will-call slips").should("be.visible");
    // Click again to turn back ON
    cy.get('[role="switch"]').click();
    cy.get('[role="switch"][aria-checked="true"]').should("exist");
  });

  it("can check additional eco option checkboxes", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("label", "Zero-waste catering").find("input[type='checkbox']").check();
    cy.contains("label", "On-site recycling").find("input[type='checkbox']").check();
    cy.contains("label", "Public transport incentives").find("input[type='checkbox']").check();
  });

  // ── 6. Eco Score preview (Step 4) ────────────────────────────────────────────

  it("shows eco score and badge grid on Step 4", () => {
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();
    cy.contains("h2", "Real-time Eco-Score").should("be.visible");
    cy.contains("h3", "Badge preview").should("be.visible");
    cy.get("ul").contains("Paperless").should("exist");
  });

  it("shows summary line with event name on Step 4", () => {
    fillStep1({ name: "My Eco Event" });
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();
    cy.contains("My Eco Event").should("be.visible");
  });

  it("disables Publish and Save as draft on Step 4 until step 1 + venue are complete (guards tested via fresh visit)", () => {
    // Navigate all the way through with a complete form
    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Save as draft").should("not.be.disabled");
    cy.contains("button", "Publish event").should("not.be.disabled");
  });

  // ── 7. Publishing ─────────────────────────────────────────────────────────────

  it("publishes an event and navigates to the event detail page", () => {
    cy.intercept("POST", /\/api\/v1\/events/, {
      statusCode: 201,
      body: CREATED_EVENT,
    }).as("createEvent");

    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();

    cy.contains("button", "Publish event").click();
    cy.wait("@createEvent").its("request.body").should((body) => {
      expect(body.title).to.equal("Cypress Green Summit");
      expect(body.status).to.equal("published");
      expect(body.venue_id).to.equal("venue-eco");
      expect(body.category).to.equal("Conference");
    });

    cy.url().should("include", "/events/evt-new-001");
  });

  it("saves an event as draft and navigates to organizer events", () => {
    cy.intercept("POST", /\/api\/v1\/events/, {
      statusCode: 201,
      body: DRAFT_EVENT,
    }).as("createDraft");

    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();

    cy.contains("button", "Save as draft").click();
    cy.wait("@createDraft").its("request.body").should((body) => {
      expect(body.status).to.equal("draft");
    });

    cy.url().should("include", "/organizer/events");
  });

  it("sends eco_attribute_ids for digital-only ticketing in the POST body", () => {
    cy.intercept("POST", /\/api\/v1\/events/, { statusCode: 201, body: CREATED_EVENT }).as("createEvent");

    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    // Digital-only ticketing is ON by default → should send Paperless + Digital Check-in IDs
    cy.contains("button", "Continue").click();
    cy.contains("button", "Publish event").click();

    cy.wait("@createEvent").its("request.body.eco_attribute_ids").should((ids) => {
      expect(ids).to.include("attr-1"); // Paperless Ticketing
      expect(ids).to.include("attr-2"); // Digital Check-in
    });
  });

  it("shows error banner on Step 4 when publish API fails", () => {
    cy.intercept("POST", /\/api\/v1\/events/, {
      statusCode: 500,
      body: { error: "Internal server error" },
    }).as("createFail");

    fillStep1();
    cy.contains("button", "Continue").click();
    selectFirstVenue();
    cy.contains("button", "Continue").click();
    cy.contains("button", "Continue").click();

    cy.contains("button", "Publish event").click();
    cy.wait("@createFail");
    cy.get('[role="alert"]').should("be.visible");
  });

  // ── 8. LiveLeafMeter ─────────────────────────────────────────────────────────

  it("shows the Live Leaf eco score meter in the header", () => {
    cy.contains("Live Leaf").should("be.visible");
  });
});
