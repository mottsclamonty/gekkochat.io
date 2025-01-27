import { NextResponse } from "next/server";
import {
  classifyQuery,
  extractEarningsCallTime,
  summarizeTranscriptInChunks,
  rewriteInGordonGekkoStyle,
  extractCompanies,
  determineTargetEndpoint,
  summarizeFinancialMetrics,
  answerGenericPrompt,
} from "@/lib/openai";
import {
  fetchBalanceSheet,
  fetchBatchEarningsCalls,
  fetchCashFlowStatement,
  fetchIncomeStatement,
  fetchKeyMetrics,
  fetchSingleEarningsCall,
} from "@/lib/fmpClient";
import { delay } from "@/utils/delay";

// NOTE - console.logs left in so that we can watch in the review process how the data is being handled and passed

export async function POST(request: Request) {
  try {
    const { question, isGekko } = await request.json();
    console.log("User Question:", question);

    if (!question) {
      let response = "You need to ask me a question";
      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(response, false);
      }
      return NextResponse.json({
        summary: response,
      });
    }

    // Step 1: Classify the user's query as earning_call, financial_metric, or other
    const queryType = await classifyQuery(question);
    if (queryType === "other") {
      let response = "";
      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(question, true);
      } else {
        response = await answerGenericPrompt(question);
      }
      return NextResponse.json({ queryType, summary: response });
    }
    console.log("Query Type:", queryType);

    // Step 2: Extract company stock symbols from user query
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

      // Give a sassy reply if we can't match any companies
      return NextResponse.json({
        queryType: "error",
        summary: response,
      });
    }
    const symbols = companies.map((company) => company.symbol);
    console.log("Extracted Symbols:", symbols);

    let output: string = "";

    if (queryType === "earnings_call") {
      // Extract year, quarter, and multiple
      const { year, quarter, multiple } = await extractEarningsCallTime(
        question
      );
      const effectiveYear = !year ? 2024 : year; // Default to 2024 for year
      console.log("Extracted Time Info:", {
        year: effectiveYear,
        quarter,
        multiple,
      });

      const allCompanySummaries = [];

      for (const symbol of symbols) {
        console.log(`Fetching earnings calls for symbol: ${symbol}`);

        // Fetch batch or single earnings calls
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

          // Delay to avoid rate limits
          await delay(500);
        }

        // Combine all summaries for the company
        const companySummary = combinedSummaries.join("\n\n");
        allCompanySummaries.push(`**${companyName}**: ${companySummary}`);
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
      // Determine the target endpoint and metric
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

      // Log the identified endpoint for debugging
      console.log(`Fetching data from ${endpoint} for metric: ${metric}`);

      // Fetch data from the determined endpoint
      let data: any[] = [];
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

          console.log(`Fetched data for ${symbol}:`, data);

          if (!data.length) {
            console.error(
              `No data found for ${symbol} at endpoint: ${endpoint}`
            );
            continue;
          }

          // Use OpenAI to summarize the data in the context of the user's question
          const summary = await summarizeFinancialMetrics(
            question,
            data,
            metric
          );

          let response = summary;
          if (isGekko) {
            response = await rewriteInGordonGekkoStyle(response, false);
          }

          return NextResponse.json({ queryType, summary: response });
        } catch (error: any) {
          console.error(
            `Error fetching data from ${endpoint} for ${symbol}:`,
            error.message
          );
        }
      }

      // If no data was returned for any symbol, return a graceful error
      let response =
        "I couldn't find the financial data you were looking for. Try refining your question.";
      if (isGekko) {
        response = await rewriteInGordonGekkoStyle(response, false);
      }
      return NextResponse.json({ queryType: "error", summary: response });
    } else {
      // General response if you prompt outside the bounds of earnings calls or financial metrics
      output =
        "The query type could not be identified. Please refine your question.";
    }
    if (isGekko) {
      output = await rewriteInGordonGekkoStyle(output, false);
    }

    return NextResponse.json({ queryType, summary: output });
  } catch (error: any) {
    console.error("Error processing request:", error.message);
    const gekkoError = await rewriteInGordonGekkoStyle(
      error.message as string,
      false
    );
    return NextResponse.json({ queryType: "error", summary: gekkoError });
  }
}

/**
 * Simple health check route for serverless API
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Route is working!",
    },
    { status: 200 }
  );
}
