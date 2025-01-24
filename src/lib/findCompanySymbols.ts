import { extractCompanies } from "@/lib/openai";

/**
 * Find the associated symbols for a given company name
 */
export async function findCompanySymbols(
  userPrompt: string
): Promise<string[]> {
  // Step 1: Extract company names and symbols using ChatGPT
  const extractedCompanies = await extractCompanies(userPrompt);

  // Step 2: Return only the symbols from the extracted data
  const symbols = extractedCompanies.map((company) => company.symbol);

  console.log("Extracted Symbols:", symbols);
  return symbols;
}
