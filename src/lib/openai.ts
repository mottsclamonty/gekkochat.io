import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const openai = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in .env.local
});

/**
 * Classify the user's query into one of three categories:
 * - earnings_call: If the query is about topics that could be discussed in an earnings call (e.g., management comments, industry trends, strategic plans).
 * - financial_metric: If the query is about specific financial data or metrics (e.g., revenue, profit, net income, stock price).
 * - other: If the query doesn't fit into either of the above categories.
 */
export async function classifyQuery(
  userPrompt: string
): Promise<"earnings_call" | "financial_metric" | "other"> {
  const systemMessage = `
      You are an assistant tasked with analyzing user queries and categorizing them into three categories:
      1. earnings_call: The query is related to topics typically discussed in company earnings calls. This includes:
         - Comments or statements made by executives (e.g., CEOs, CFOs) during earnings calls.
         - Topics related to management's views, strategies, plans, or discussions of company performance, trends, or future outlooks.
         - Specific questions about information that might be addressed in an earnings call (e.g., "What are Elon Musk's comments about AI?").
      2. financial_metric: The query is asking for specific financial data or hard metrics. Examples include:
         - Revenue, net income, profit margins, or other financial metrics.
         - Specific values from financial statements or stock performance.
      3. other: The query is unrelated to finance or the categories above (e.g., "What is the weather like today?").
      
      Respond with ONLY ONE of the following categories: earnings_call, financial_metric, or other.
      
      Example 1:
      User prompt: "Summarize Tesla's latest earnings call."
      Response: earnings_call
  
      Example 2:
      User prompt: "What is Tesla's revenue for Q1 2023?"
      Response: financial_metric
  
      Example 3:
      User prompt: "What are Elon Musk's comments about AI?"
      Response: earnings_call
  
      Example 4:
      User prompt: "What is the weather like in California?"
      Response: other
    `;

  const inputMessage = `User prompt: "${userPrompt}"`;

  const response = await openai.invoke([
    new HumanMessage(systemMessage),
    new HumanMessage(inputMessage),
  ]);

  const content = response.content as string;

  if (
    ["earnings_call", "financial_metric", "other"].includes(content.trim())
  ) {
    return content.trim() as "earnings_call" | "financial_metric" | "other";
  } else {
    throw new Error(`Unexpected classification result: ${content}`);
  }
}

/**
 * Extract the specific financial metric being requested from the user's query.
 */
export async function extractFinancialMetric(
  userPrompt: string
): Promise<string> {
  const systemMessage = `
      Your task is to extract the specific financial metric or data point being requested in the user's query.
      Examples of financial metrics include revenue, gross profit, net income, EBITDA, operating cash flow, etc.
      If no financial metric is found, return "unknown".
  
      Example 1:
      User prompt: "What is Tesla's revenue for Q1 2023?"
      Response: revenue
  
      Example 2:
      User prompt: "Can you tell me the gross profit for Apple in 2021?"
      Response: gross profit
  
      Example 3:
      User prompt: "Tell me about Microsoft."
      Response: unknown
    `;

  const inputMessage = `User prompt: "${userPrompt}"`;

  const response = await openai.invoke([
    new HumanMessage(systemMessage),
    new HumanMessage(inputMessage),
  ]);

  const content = response.content as string;

  return content.trim().toLowerCase();
}

/**
 * Extract relevant company information from the user query. Parse according to company name, or CEO name if company not provided.
 */
export async function extractCompanies(
  userPrompt: string
): Promise<{ name: string; symbol: string }[]> {
  const systemMessage = `
    Your task is to extract company names and their corresponding stock symbols from the user's query.
    - If the query mentions a company or its CEO, provide both the company name and its stock symbol.
    - Return the result as a JSON array of objects with "name" and "symbol" fields.
    - If no companies or CEOs are mentioned, return an empty array.

    Examples:

    1. User prompt: "What are Mark Zuckerberg's comments about AI?"
       [{ "name": "Meta", "symbol": "META" }]

    2. User prompt: "What are Sundar Pichai's comments on profits?"
       [{ "name": "Google", "symbol": "GOOGL" }]

    3. User prompt: "What are Apple and Microsoft's latest developments?"
       [{ "name": "Apple", "symbol": "AAPL" }, { "name": "Microsoft", "symbol": "MSFT" }]

    4. User prompt: "Tell me about Tesla's financial performance."
       [{ "name": "Tesla", "symbol": "TSLA" }]
  `;

  const inputMessage = `User prompt: "${userPrompt}"`;

  try {
    const response = await openai.invoke([
      new HumanMessage(systemMessage),
      new HumanMessage(inputMessage),
    ]);

    const content = (response.content as string).trim();
    console.log("Raw extractCompanies Response:", content);

    // Attempt to parse the JSON response
    const parsedResponse = JSON.parse(content);

    if (Array.isArray(parsedResponse)) {
      console.log("Parsed extractCompanies Response:", parsedResponse);
      return parsedResponse;
    } else {
      console.error(
        "Unexpected response format from extractCompanies:",
        content
      );
      return [];
    }
  } catch (error: any) {
    console.error("Failed to parse extractCompanies response:", error.message);
    return [];
  }
}

/**
 * Extract time-related information (year, quarter, number of periods, etc.) from the user's query.
 */
export async function extractEarningsCallTime(userPrompt: string): Promise<{
  year?: number;
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  multiple?: boolean;
}> {
  const systemMessage = `
    Analyze the user's query and extract relevant time-related information for earnings calls.
    Return:
    - year (if explicitly mentioned or inferred)
    - quarter (e.g., Q1, Q2, Q3, Q4, if mentioned)
    - multiple (true if the query refers to multiple earnings calls, false for a single earnings call)

    Example 1:
    User prompt: "Summarize Apple's earnings call for Q1 2023."
    Response: { "year": 2023, "quarter": "Q1", "multiple": false }

    Example 2:
    User prompt: "What did Microsoft discuss in the last two earnings calls?"
    Response: { "year": null, "quarter": null, "multiple": true }

    Example 3:
    User prompt: "Summarize Tesla's earnings call last quarter."
    Response: { "year": 2023, "quarter": "Q2", "multiple": false } (assuming current quarter is Q3 2023)

    Example 4:
    User prompt: "What did Amazon say in its last earnings calls?"
    Response: { "year": null, "quarter": null, "multiple": true }

    Respond with a JSON object.
  `;

  const inputMessage = `User prompt: "${userPrompt}"`;

  const response = await new ChatOpenAI({
    model: "gpt-4",
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
  }).invoke([new HumanMessage(systemMessage), new HumanMessage(inputMessage)]);
  const content = response.content as string;
  console.log("extract earning call time content", content);
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(
      "Failed to parse time extraction response:",
      response.content
    );
    return { year: undefined, quarter: undefined, multiple: false };
  }
}

/**
 * Summarize a long transcript by chunking into smaller token sizes. Summarize in the context of a user query
 */
export async function summarizeTranscriptInChunks(
  transcript: string,
  userQuery: string
): Promise<string> {
  const CHUNK_SIZE = 6000; // Adjust based on GPT-4's token limit
  const SYSTEM_MESSAGE = `
  You are tasked with analyzing earnings call transcripts to extract relevant information based on a user's query.
  Focus only on the parts of the transcript(s) that are directly relevant to the query. Summarize the key points.

  If no relevant information is found in a given chunk, respond with: "No relevant information found."
`;
  const chunks = [];
  for (let i = 0; i < transcript.length; i += CHUNK_SIZE) {
    chunks.push(transcript.slice(i, i + CHUNK_SIZE));
  }

  const chunkSummaries = await Promise.all(
    chunks.map(async (chunk, index) => {
      const inputMessage = `
        User query: "${userQuery}"
        Transcript chunk (${index + 1} of ${chunks.length}): "${chunk}"
      `;

      const response = await new ChatOpenAI({
        model: "gpt-4",
        temperature: 0.7,
        apiKey: process.env.OPENAI_API_KEY,
      }).invoke([
        new HumanMessage(SYSTEM_MESSAGE),
        new HumanMessage(inputMessage),
      ]);

      const content = (response.content as string).trim();
      console.log(`Chunk ${index + 1} summary:`, content);
      return content.includes("No relevant information found") ? null : content;
    })
  );

  // Combine non-null summaries
  const filteredSummaries = chunkSummaries.filter((summary) => summary);
  if (!filteredSummaries.length) {
    return "The transcript does not contain relevant information about your query.";
  }

  // Summarize the combined summaries
  const combinedSummary = filteredSummaries.join("\n");
  const finalResponse = await new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
  }).invoke([
    new HumanMessage(SYSTEM_MESSAGE),
    new HumanMessage(
      `User query: "${userQuery}"\nCombined summaries:\n${combinedSummary}`
    ),
  ]);

  return (finalResponse.content as string).trim();
}

/**
 * Rewrite any text in the style of Gordon Gekko, the Wall Street trader.
 */
export async function rewriteInGordonGekkoStyle(text: string): Promise<string> {
  const systemMessage = `
    You are tasked with rewriting text in the style of Gordon Gekko, the Wall Street trader from the movie "Wall Street."
    Gordon Gekko's tone is:
    - Confident
    - Aggressive
    - Persuasive
    - Focused on money, power, and success
    - Always on the lookout for the next edge or good business deal/investment

    Rewrite the following text with Gekko's characteristic style. Be concise, impactful, powerful, and persuasive.
    Preserve the meaning of the text but infuse it with Gordon Gekko's attitude and tone.

    If no original text is provided, respond with a sassy, dismissive claim that something went wrong on the backend and you're wasting his time. Time is money, and we're wasting yours.
  `;

  const inputMessage = `Original text: "${text}"`;

  const response = await new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.8,
    apiKey: process.env.OPENAI_API_KEY,
  }).invoke([new HumanMessage(systemMessage), new HumanMessage(inputMessage)]);

  return (response.content as string).trim();
}
