describe("Chatbot API End-to-End Tests", () => {
  const chatbotEndpoint = "/api/chatbot";

  it("Should return 200 for health check (GET)", () => {
    cy.request("GET", chatbotEndpoint).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.eq("Route is working!");
    });
  });

  it("Should return a summary for valid earning_call query", () => {
    const question = "Summarize Tesla's earnings call for Q2 2023.";
    cy.request("POST", chatbotEndpoint, { question }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.queryType).to.eq("earnings_call");
      expect(response.body.summary).to.exist;
    });
  });

  it("Should handle financial_metric query correctly", () => {
    const question = "What is Apple's PE ratio for the last quarter?";
    cy.request("POST", chatbotEndpoint, { question }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.queryType).to.eq("financial_metric");
      expect(response.body.summary).to.exist;
    });
  });
});
