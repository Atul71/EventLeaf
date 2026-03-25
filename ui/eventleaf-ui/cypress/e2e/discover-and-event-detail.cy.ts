describe("Discover Events and event detail", () => {
  beforeEach(() => {
    cy.visit("/events");
  });

  it("shows discover page and can open Advanced Eco-Filters", () => {
    cy.contains("h1", "Discover Events").should("be.visible");
    cy.contains("button", "Advanced Eco-Filters").click();
    cy.contains("Sustainability rating (leaves)").should("be.visible");
  });

  it("filters list via search then opens event detail with trailer", () => {
    cy.get('input[type="search"]').first().clear().type("Solar Future");
    cy.contains("Solar Future Expo").should("be.visible");
    cy.contains("a", "View Event").first().click();
    cy.url().should("include", "/events/solar-future-expo");
    cy.contains("h1", "Solar Future Expo").should("be.visible");
    cy.contains("a", "Trailer").should("be.visible");
    cy.get('a[href*="youtube.com/watch?v=jNQXAC9IVRw"]').should("be.visible");
  });
});
