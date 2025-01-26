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

  it("Should return an error for invalid user input (i.e empty string)", () => {
    cy.request({
      method: "POST",
      url: chatbotEndpoint,
      failOnStatusCode: false,
      body: { question: "" },
    }).then((response) => {
      expect(response.status).to.eq(500);
      expect(response.body.error).to.exist;
    });
  });

  it("Should return a 404 error if a nonsense company name is used", () => {
    cy.request({
      method: "POST",
      url: chatbotEndpoint,
      failOnStatusCode: false,
      body: { question: "Summarize the most recent earning call for ioaushf;iaushf;iashdf;ashdf;iaushdf;iaushdf" },
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body.error).to.exist;
    });
  });
});
