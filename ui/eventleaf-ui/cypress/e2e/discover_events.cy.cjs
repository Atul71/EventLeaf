describe("Discover Events", () => {
  const now = new Date();
  const SHOW_DELAY_MS = 750;

  function isoLocalDate(daysFromNow) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromNow);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const events = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Tomorrow Land Green Expo",
      description: "Test event A",
      organizer_id: "o1",
      venue_id: null,
      event_date: isoLocalDate(2),
      event_start_time: "10:00:00",
      event_end_time: "11:00:00",
      is_eco_friendly: true,
      eco_summary: "Eco summary A",
      ticket_price: 10,
      total_capacity: 100,
      available_tickets: 50,
      status: "published",
      visibility: "public",
      image_url: null,
      category: "conference",
      venue_name: "Venue A",
      venue_city: "Test City",
      venue_eco_certifications: ["LEED Gold"],
      eco_attribute_names: ["Paperless Ticketing", "Digital Check-in", "Carbon Neutral Transport"],
      has_digital_ticketing: true,
      has_paperless_checkin: true,
      has_public_transit: true,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Event in next 7 (B)",
      description: "Test event B",
      organizer_id: "o1",
      venue_id: null,
      event_date: isoLocalDate(5),
      event_start_time: "12:00:00",
      event_end_time: "13:00:00",
      is_eco_friendly: true,
      eco_summary: "Eco summary B",
      ticket_price: 0,
      total_capacity: 200,
      available_tickets: 120,
      status: "published",
      visibility: "public",
      image_url: null,
      category: "music",
      venue_name: "Venue B",
      venue_city: "Test City",
      venue_eco_certifications: ["Eco-certified space"],
      eco_attribute_names: ["Paperless Ticketing", "Digital Check-in", "Waste Reduction Program"],
      has_digital_ticketing: true,
      has_paperless_checkin: true,
      has_public_transit: false,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      title: "Event outside next 7 (C)",
      description: "Test event C",
      organizer_id: "o1",
      venue_id: null,
      event_date: isoLocalDate(20),
      event_start_time: "14:00:00",
      event_end_time: "15:00:00",
      is_eco_friendly: false,
      eco_summary: null,
      ticket_price: 25,
      total_capacity: 300,
      available_tickets: 10,
      status: "published",
      visibility: "public",
      image_url: null,
      category: "conference",
      venue_name: "Venue C",
      venue_city: "Test City",
      venue_eco_certifications: [],
      eco_attribute_names: [],
      has_digital_ticketing: false,
      has_paperless_checkin: false,
      has_public_transit: false,
    },
  ];

  const byId = events.reduce((acc, ev) => {
    acc[ev.id] = ev;
    return acc;
  }, {});

  it("renders events, filters by next 7 days, and shows a Back button on event page", () => {
    cy.intercept("GET", /\/api\/v1\/events\?.*/, {
      statusCode: 200,
      body: events,
    }).as("getEvents");

    cy.intercept("GET", /\/api\/v1\/events\/[^?]+$/, (req) => {
      const match = req.url.match(/\/events\/([^/?]+)/);
      const id = match ? match[1] : null;
      const body = id && byId[id] ? byId[id] : events[0];
      req.reply({ statusCode: 200, body });
    }).as("getEventById");

    cy.visit("/events");
    cy.wait(SHOW_DELAY_MS);

    cy.get('a:contains("View Event")').should("have.length", 3);
    cy.wait(SHOW_DELAY_MS);

    // Set date filter to "Next 7 days"
    cy.contains("label", "Date").find("select").select("next7");
    cy.wait(SHOW_DELAY_MS);
    cy.get('a:contains("View Event")').should("have.length", 2);
    cy.wait(SHOW_DELAY_MS);

    // Search for an event by title
    cy.get('input[aria-label="Search Events"]').clear().type("tomorrow land");
    cy.wait(SHOW_DELAY_MS);
    cy.get('a:contains("View Event")').should("have.length", 1);

    // Open first event
    cy.get('a:contains("View Event")').first().click();
    cy.wait(SHOW_DELAY_MS);

    // Verify back link exists
    cy.contains("a", "Back").should("have.attr", "href", "/events");
  });
});

