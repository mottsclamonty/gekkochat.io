import { NextResponse } from "next/server"; // Used to handle server responses
import {
  classifyQuery, // Determines the type of query (e.g., earnings call, financial metric, etc.)
  extractEarningsCallTime, // Extracts year, quarter, and other time-related details from the query
  summarizeTranscriptInChunks, // Summarizes transcripts by splitting them into chunks
  rewriteInGordonGekkoStyle, // Rewrites responses in a "Gordon Gekko" tone if required
  extractCompanies, // Extracts company symbols and names from the user's query
  determineTargetEndpoint, // Determines which financial endpoint to fetch data from
  summarizeFinancialMetrics, // Summarizes financial metrics using OpenAI
  answerGenericPrompt, // Handles general queries unrelated to financial data
} from "@/lib/openai";
import {
  fetchBalanceSheet, // Fetches balance sheet data
  fetchBatchEarningsCalls, // Fetches multiple earnings call transcripts
  fetchCashFlowStatement, // Fetches cash flow statement data
  fetchIncomeStatement, // Fetches income statement data
  fetchKeyMetrics, // Fetches key financial metrics
  fetchSingleEarningsCall, // Fetches a single earnings call transcript
} from "@/lib/fmpClient";
import { delay } from "@/utils/delay"; // Utility to add delays to avoid API rate limits

// NOTE: Console logs are left intentionally for debugging purposes during the review process

/**
 * POST route to handle user queries related to financial data or earnings calls.
 */
export async function POST(request: Request) {
  try {
    // Extract user question and "Gordon Gekko" tone preference from the request body
    const { question, isGekko } = await request.json();
    console.log("User Question:", question);

    // If no question is provided, return a default response
    if (!question) {
      let response = "You need to ask me a question";
      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(response, false);
      }
      return NextResponse.json({
        summary: response,
      });
    }

    // Step 1: Classify the user's query type
    const queryType = await classifyQuery(question);
    if (queryType === "other") {
      let response = "";
      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(question, true); // Rewrite query in "Gordon Gekko" style
      } else {
        response = await answerGenericPrompt(question); // Handle general questions
      }
      return NextResponse.json({ queryType, summary: response });
    }
    console.log("Query Type:", queryType);

    // Step 2: Extract companies or stock symbols from the query
    const companies = await extractCompanies(question);
    if (!companies.length) {
      console.error("No companies or symbols extracted.");
      let response = "No companies were found matching those names";

      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(
          "I don't know about any company with that name. Give me a real company, and we'll make some money.",
          false
        );
      }

      // Return an error if no companies are found
      return NextResponse.json({
        queryType: "error",
        summary: response,
      });
    }
    const symbols = companies.map((company) => company.symbol);
    console.log("Extracted Symbols:", symbols);

    let output: string = "";

    if (queryType === "earnings_call") {
      // Step 3: Handle earnings call queries
      const { year, quarter, multiple } = await extractEarningsCallTime(
        question
      );
      const effectiveYear = !year ? 2024 : year; // Default to 2024 if the year is not specified
      console.log("Extracted Time Info:", {
        year: effectiveYear,
        quarter,
        multiple,
      });

      const allCompanySummaries = [];

      for (const symbol of symbols) {
        console.log(`Fetching earnings calls for symbol: ${symbol}`);

        // Fetch earnings calls (batch or single) based on query details
        const earningsCalls = multiple
          ? await fetchBatchEarningsCalls(symbol, effectiveYear)
          : await fetchSingleEarningsCall(symbol, year, quarter);

        if (!earningsCalls.length) {
          console.log(`No earnings calls found for symbol: ${symbol}`);
          continue;
        }

        const companyName =
          companies.find((c) => c.symbol === symbol)?.name || symbol;

        console.log(
          `Processing ${earningsCalls.length} earnings calls for ${companyName}`
        );
        const combinedSummaries = [];

        for (const call of earningsCalls) {
          const transcript = call.content || "";
          console.log(`Summarizing transcript for ${companyName}`);
          const chunkSummaries = await summarizeTranscriptInChunks(
            transcript,
            question,
            companyName
          );
          combinedSummaries.push(chunkSummaries.join("\n\n"));

          // Add delay to avoid hitting API rate limits
          await delay(500);
        }

        // Combine all summaries for the current company
        const companySummary = combinedSummaries.join("\n\n");
        allCompanySummaries.push(`${companySummary}`);
      }

      const finalSummary = allCompanySummaries.join("\n\n");

      if (!finalSummary) {
        let response =
          "The earnings call had no meaningful data related to your query";

        if (isGekko) {
          response = await rewriteInGordonGekkoStyle(response, false);
        }
        return NextResponse.json({ queryType, summary: response });
      }

      output = finalSummary;
    } else if (queryType === "financial_metric") {
      const { metric, endpoint } = await determineTargetEndpoint(question);
      console.log(`Determined metric: "${metric}" and endpoint: "${endpoint}"`);

      if (!metric || !endpoint) {
        let response =
          "I couldn't find the financial metric you were looking for. Try being more specific.";
        if (isGekko) {
          response = await rewriteInGordonGekkoStyle(response, false);
        }
        return NextResponse.json({ queryType: "error", summary: response });
      }

      console.log(`Fetching data from ${endpoint} for metric: "${metric}"`);

      let data: any[] = [];
      const allSummaries: string[] = [];

      for (const symbol of symbols) {
        try {
          if (endpoint === "key_metrics") {
            data = await fetchKeyMetrics(symbol, "annual");
          } else if (endpoint === "income_statement") {
            data = await fetchIncomeStatement(symbol, "annual");
          } else if (endpoint === "balance_sheet") {
            data = await fetchBalanceSheet(symbol, "annual");
          } else if (endpoint === "cashflow_statement") {
            data = await fetchCashFlowStatement(symbol, "annual");
          }

          console.log(
            `Fetched data for ${symbol}:`,
            JSON.stringify(data, null, 2)
          );

          if (!data.length) {
            console.error(
              `No data found for ${symbol} at endpoint: ${endpoint}`
            );
            continue;
          }

          const summary = await summarizeFinancialMetrics(
            question,
            data,
            metric
          );
          allSummaries.push(`${summary}`);
        } catch (error: any) {
          console.error(
            `Error fetching data from ${endpoint} for ${symbol}:`,
            error.message
          );
        }
      }

      if (allSummaries.length > 0) {
        let response = allSummaries.join("\n\n");
        if (isGekko) {
          response = await rewriteInGordonGekkoStyle(response, false);
        }
        return NextResponse.json({ queryType, summary: response });
      }

      let response =
        "I couldn't find the financial data you were looking for. Try refining your question.";
      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(response, false);
      }
      return NextResponse.json({ queryType: "error", summary: response });
    } else {
      // Step 5: Handle unrecognized queries
      output =
        "The query type could not be identified. Please refine your question.";
    }
    if (isGekko) {
      output = await rewriteInGordonGekkoStyle(output, false);
    }

    return NextResponse.json({ queryType, summary: output });
  } catch (error: any) {
    console.error("Error processing request:", error.message);

    // Return an error summary rewritten in "Gordon Gekko" style
    const gekkoError = await rewriteInGordonGekkoStyle(
      error.message as string,
      false
    );
    return NextResponse.json({ queryType: "error", summary: gekkoError });
  }
}

/**
 * Simple health check route for serverless API.
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Route is working!", // Response message to indicate the route is functioning
    },
    { status: 200 }
  );
}
