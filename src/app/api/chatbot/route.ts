import { NextResponse } from "next/server";
import {
  classifyQuery,
  extractEarningsCallTime,
  summarizeTranscriptInChunks,
  rewriteInGordonGekkoStyle,
  extractCompanies,
} from "@/lib/openai";
import { fetchSingleEarningsCall } from "@/lib/fmpClient";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    console.log("User Question:", question);

    // Step 1: Extract company stock symbols from user query
    const companies = await extractCompanies(question);
    if (!companies.length) {
      console.error("No companies or symbols extracted.");
      return NextResponse.json({
        error: "No relevant companies were found in your query.",
      });
    }
    const symbols = companies.map((company) => company.symbol);
    console.log("Extracted Symbols:", symbols);

    // Step 2: Classify the user's query as earning_call, financial_metric, or other
    const queryType = await classifyQuery(question);
    console.log("Query Type:", queryType);

    let output: string;

    if (queryType === "earnings_call") {
      // Step 3: Extract the time information, i.e quarter year period etc
      const { year, quarter, multiple } = await extractEarningsCallTime(
        question
      );
      console.log("Extracted Time Info:", { year, quarter, multiple });

      const transcripts = await Promise.all(
        symbols.map(async (symbol) => {
          console.log(`Fetching earnings call for symbol: ${symbol}`);
          const data = await fetchSingleEarningsCall(symbol, year, quarter);
          console.log(`Earnings call response for ${symbol}:`, data);
          return data.length ? data[0].content : null;
        })
      );

      // Step 4: Handle case where no transcripts are found
      const validTranscripts = transcripts.filter((t) => t);
      if (!validTranscripts.length) {
        const response = await rewriteInGordonGekkoStyle(
          "No recent earnings call data is available for the companies in your query."
        );
        return NextResponse.json({ queryType, summary: response });
      }

      // Step 5: Summarize transcripts with context of user query
      const chunkSummaries = await Promise.all(
        validTranscripts.map((transcript) =>
          summarizeTranscriptInChunks(transcript, question)
        )
      );

      // Combine all chunk summaries into one final summary
      const finalSummary = chunkSummaries
        .flat()
        .filter((summary) => summary) // Remove empty summaries
        .join("\n\n"); // Combine summaries into a single string

      console.log("Combined Final Summary:", finalSummary);

      if (!finalSummary) {
        const response = await rewriteInGordonGekkoStyle(
          "The earnings calls had no meaningful data related to your query."
        );
        return NextResponse.json({ queryType, summary: response });
      }

      output = finalSummary;
    } else if (queryType === "financial_metric") {
      output =
        "Financial metrics functionality has not been implemented in this version.";
    } else {
      output =
        "The query type could not be identified. Please refine your question.";
    }

    // Step 6: Rewrite the final output in Gordon Gekko's style
    const rewrittenOutput = await rewriteInGordonGekkoStyle(output);

    return NextResponse.json({ queryType, summary: rewrittenOutput });
  } catch (error: any) {
    console.error("Error processing request:", error.message);

    const errorResponse = await rewriteInGordonGekkoStyle(
      "An error occurred while processing your request. Please try again later."
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
