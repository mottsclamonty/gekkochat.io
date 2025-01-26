import { NextResponse } from "next/server";
import {
  classifyQuery,
  extractEarningsCallTime,
  summarizeTranscriptInChunks,
  rewriteInGordonGekkoStyle,
  extractCompanies,
  parseFinancialMetric,
  extractFinancialMetricTime,
} from "@/lib/openai";
import {
  fetchBatchEarningsCalls,
  fetchKeyMetrics,
  fetchSingleEarningsCall,
} from "@/lib/fmpClient";
import { delay } from "@/utils/delay";

// NOTE - console.logs left in so that we can watch in the review process how the data is being handled and passed

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    console.log("User Question:", question);

    if (!question) {
      return NextResponse.json(
        {
          error: "No user input provided",
        },
        { status: 500 }
      );
    }

    // Step 1: Classify the user's query as earning_call, financial_metric, or other
    const queryType = await classifyQuery(question);
    if (queryType === "other") {
      const response = await rewriteInGordonGekkoStyle(question, true);
      return NextResponse.json({ queryType, summary: response });
    }
    console.log("Query Type:", queryType);

    // Step 2: Extract company stock symbols from user query
    const companies = await extractCompanies(question);
    if (!companies.length) {
      console.error("No companies or symbols extracted.");
      const response = await rewriteInGordonGekkoStyle(
        "I don't know about any company with that name. Give me a real company, and we'll make some money.",
        false
      );

      // Give a sassy reply if we can't match any companies
      return NextResponse.json({
        queryType: "error",
        summary: response,
      });
    }
    const symbols = companies.map((company) => company.symbol);
    console.log("Extracted Symbols:", symbols);

    let output: string;

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
        const response = await rewriteInGordonGekkoStyle(
          "The earnings calls had no meaningful data related to your query.",
          false
        );
        return NextResponse.json({ queryType, summary: response });
      }

      output = finalSummary;
    } else if (queryType === "financial_metric") {
      // get the params for financial metric endpoint
      const { period = "annual", limit = 1 } = await extractFinancialMetricTime(
        question
      );

      const allMetricSummaries = [];

      for (const symbol of symbols) {
        console.log(`Fetching financial metrics for symbol: ${symbol}`);
        const metricsData = await fetchKeyMetrics(symbol, period, limit);
        if (!metricsData.length) {
          console.log(`No financial metrics found for symbol: ${symbol}`);
          continue;
        }

        const companyName =
          companies.find((c) => c.symbol === symbol)?.name || symbol;

        const relevantMetrics = await parseFinancialMetric(
          question,
          metricsData[0]
        );

        if (!relevantMetrics.length) {
          allMetricSummaries.push(
            `${companyName}: No relevant metrics found for your query. Can you be a bit more specific`
          );
          continue;
        }

        // In case the user is enquiring about overall metrics or specific ones
        if (relevantMetrics === "all") {
          const keyMetricsSummary = Object.entries(metricsData[0])
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          const overallResponse = await rewriteInGordonGekkoStyle(
            `For ${companyName}, here's an overview of the company's financial health: ${keyMetricsSummary}.`,
            false
          );
          allMetricSummaries.push(overallResponse);
          continue;
        }

        const metricDetails = relevantMetrics
          .map((metric) => {
            const value = metricsData[0][metric];
            return value !== undefined
              ? `${metric}: ${value}`
              : `The metric "${metric}" could not be retrieved.`;
          })
          .join(", ");

        const response = await rewriteInGordonGekkoStyle(
          `For ${companyName}, the requested metrics are: ${metricDetails}.`,
          false
        );

        allMetricSummaries.push(response);
      }

      const combinedResponse = allMetricSummaries.join("\n\n");
      return NextResponse.json({ queryType, summary: combinedResponse });
    } else {
      // General response if you prompt outside the bounds of earnings calls or financial metrics
      output =
        "The query type could not be identified. Please refine your question.";
    }

    const rewrittenOutput = await rewriteInGordonGekkoStyle(output, false);

    return NextResponse.json({ queryType, summary: rewrittenOutput });
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
