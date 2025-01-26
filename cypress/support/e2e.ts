Cypress.on("uncaught:exception", (err) => {
    // Prevent Cypress from failing tests on uncaught exceptions
    return false;
  });
  
  before(() => {
    cy.log("Starting E2E Tests...");
  });
  
  after(() => {
    cy.log("E2E Tests Completed.");
  });
  