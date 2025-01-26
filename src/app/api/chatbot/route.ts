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
import { fetchKeyMetrics, fetchSingleEarningsCall } from "@/lib/fmpClient";
import { delay } from "@/utils/delay";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    console.log("User Question:", question);

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
      return NextResponse.json({
        error: "No relevant companies were found in your query.",
      });
    }
    const symbols = companies.map((company) => company.symbol);
    console.log("Extracted Symbols:", symbols);

    let output: string;

    if (queryType === "earnings_call") {
      // Step 3: Extract the time information, i.e quarter year period etc
      const { year, quarter, multiple } = await extractEarningsCallTime(
        question
      );
      console.log("Extracted Time Info:", { year, quarter, multiple });

      const allCompanySummaries = []; // Array to store summaries for all companies

      // Process each company symbol one by one with throttling
      for (const symbol of symbols) {
        console.log(`Fetching earnings call for symbol: ${symbol}`);
        const data = await fetchSingleEarningsCall(symbol, year, quarter);
        console.log(`Earnings call response for ${symbol}:`, data);

        if (!data.length) {
          console.log(`No earnings call found for symbol: ${symbol}`);
          continue;
        }

        const transcript = data[0]?.content || "";
        const companyName =
          companies.find((c) => c.symbol === symbol)?.name || symbol;

        console.log(`Summarizing transcript for ${companyName}`);
        const chunkSummaries = await summarizeTranscriptInChunks(
          transcript,
          question,
          companyName
        );

        // Combine summaries for this company
        const combinedSummary = chunkSummaries.join("\n\n");
        allCompanySummaries.push({
          company: companyName,
          summary: combinedSummary,
        });

        // Delay between company processing to avoid rate limits
        await delay(500); // 500ms between processing each company
      }

      // Combine all company summaries into a single output
      const finalSummary = allCompanySummaries
        .map((entry) => `**${entry.company}**: ${entry.summary}`)
        .join("\n\n");

      console.log("Combined Final Summary:", finalSummary);

      if (!finalSummary) {
        const response = await rewriteInGordonGekkoStyle(
          "The earnings calls had no meaningful data related to your query.",
          false
        );
        return NextResponse.json({ queryType, summary: response });
      }

      output = finalSummary;
    } else if (queryType === "financial_metric") {
      // Step 2: Extract time information (optional for now)
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

        // Step 3: Parse the user's prompt to find the most relevant metric
        const relevantMetric = await parseFinancialMetric(
          question,
          metricsData[0]
        );
        if (!relevantMetric) {
          console.log(
            `No relevant financial metric identified for ${companyName}`
          );
          allMetricSummaries.push(
            `${companyName}: No relevant metric found for your query.`
          );
          continue;
        }

        // Extract the metric value
        const metricValue = metricsData[0][relevantMetric];
        if (metricValue === undefined) {
          allMetricSummaries.push(
            `${companyName}: The metric "${relevantMetric}" could not be retrieved.`
          );
          continue;
        }

        console.log(`Metric: ${relevantMetric}, Value: ${metricValue}`);

        // Step 4: Format the response in Gordon Gekko's style
        const response = await rewriteInGordonGekkoStyle(
          `For ${companyName}, the value for "${relevantMetric}" is ${metricValue}.`,
          false
        );

        allMetricSummaries.push(response);
      }

      // Combine all company responses
      const combinedResponse = allMetricSummaries.join("\n\n");
      return NextResponse.json({ queryType, summary: combinedResponse });
    } else {
      output =
        "The query type could not be identified. Please refine your question.";
    }

    // Step 6: Rewrite the final output in Gordon Gekko's style
    const rewrittenOutput = await rewriteInGordonGekkoStyle(output, false);

    return NextResponse.json({ queryType, summary: rewrittenOutput });
  } catch (error: any) {
    console.error("Error processing request:", error.message);

    const errorResponse = await rewriteInGordonGekkoStyle(
      "An error occurred while processing your request. Please try again later.",
      false
    );
    return NextResponse.json({ error: errorResponse }, { status: 500 });
  }
}

/**
 * Simple health check route for serverless API
 */
export async function GET(request: Request) {
  return NextResponse.json(
    {
      message: "Route is working!",
    },
    { status: 200 }
  );
}
