/* eslint-disable no-undef */

describe("Buy tickets flow", () => {
  const eventId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const eventDate = (() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const eventBody = {
    id: eventId,
    title: "Cypress Green Expo",
    description: "Ticket purchase test event",
    organizer_id: "org-1",
    venue_id: null,
    event_date: eventDate,
    event_start_time: "10:00:00",
    event_end_time: "12:00:00",
    is_eco_friendly: true,
    eco_summary: "Eco test summary",
    ticket_price: 25,
    total_capacity: 100,
    available_tickets: 20,
    status: "published",
    visibility: "public",
    image_url: null,
    category: "conference",
    venue_name: "Test Venue",
    venue_city: "Test City",
    venue_eco_certifications: ["EventLeaf green verified"],
    eco_attribute_names: ["Paperless Ticketing", "Digital Check-in"],
    has_digital_ticketing: true,
    has_paperless_checkin: true,
    has_public_transit: true,
  };

  it("executes payment gateway then purchases and shows QR + profile link", () => {
    cy.intercept("GET", `/api/v1/events/${eventId}`, {
      statusCode: 200,
      body: eventBody,
    }).as("getEvent");

    cy.intercept("POST", "/api/v1/payments", (req) => {
      expect(req.body).to.deep.include({
        expiry_month: 12,
        expiry_year: 2030,
        cvv: "123",
        amount: 50,
      });
      expect(String(req.body.card_number).replace(/\s/g, "")).to.eq("4242424242424242");
      req.reply({
        statusCode: 200,
        body: {
          status: "approved",
          transaction_id: "txn_test_123",
        },
      });
    }).as("processPayment");

    cy.intercept("POST", `/api/v1/events/${eventId}/tickets`, (req) => {
      expect(req.body).to.deep.include({ ticket_type: "general", quantity: 2 });
      req.reply({
        statusCode: 201,
        body: {
          tickets: [
            {
              id: "t1",
              user_id: "u1",
              event_id: eventId,
              ticket_number: "EL-t1",
              ticket_type: "general",
              status: "active",
              price_paid: 25,
              purchase_date: "2026-01-01T00:00:00Z",
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
              qr_code_value: "eventleaf:ticket:t1",
            },
            {
              id: "t2",
              user_id: "u1",
              event_id: eventId,
              ticket_number: "EL-t2",
              ticket_type: "general",
              status: "active",
              price_paid: 25,
              purchase_date: "2026-01-01T00:00:00Z",
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
              qr_code_value: "eventleaf:ticket:t2",
            },
          ],
          remaining_tickets: 18,
        },
      });
    }).as("buyTickets");

    cy.visit(`/events/${eventId}`);
    cy.wait("@getEvent");

    cy.contains("button", "Get Tickets").click();
    cy.contains("h3", "Buy tickets").should("be.visible");

    cy.get("#buy-ticket-qty").click().type("{selectall}2");
    cy.contains("label", "Card number").parent().find("input").type("4242424242424242");
    cy.contains("label", "Expiry").parent().find("input").type("1230");
    cy.contains("label", "CVV").parent().find("input").type("123");

    cy.contains("button", "Pay & buy now").click();
    cy.wait("@processPayment");
    cy.wait("@buyTickets");

    cy.contains("Purchased 2 tickets.").should("be.visible");
    cy.get('img[alt="Purchased ticket QR code"]').should("be.visible");
    cy.contains("View all my tickets").should("have.attr", "href", "/profile");
  });
});
