import axios from "axios";

const FMP_API_KEY = process.env.FMP_API_KEY; // Store in your `.env.local`

const fmpClient = axios.create({
  baseURL: "https://financialmodelingprep.com/api/v3",
  params: { apikey: FMP_API_KEY },
});

/**
 * Fetch a list of all companies and their stock details
 */
export async function fetchCompanyList(): Promise<any[]> {
  try {
    const response = await fmpClient.get("/stock/list");
    return response.data; // Returns an array of companies
  } catch (error: any) {
    console.error("Error fetching company list:", error.message);
    throw new Error("Failed to fetch company list from FMP API");
  }
}

/**
 * Fetch a single earnings call transcript for a given symbol, year, and quarter.
 */
export async function fetchSingleEarningsCall(
  symbol: string,
  year?: number,
  quarter?: "Q1" | "Q2" | "Q3" | "Q4"
): Promise<any> {
  try {
    const response = await fmpClient.get(`/earning_call_transcript/${symbol}`, {
      params: { year, quarter },
    });
    console.log(
      `Earnings call response for ${symbol}, year ${year}:`,
      response.data
    );
    return response.data || [];
  } catch (error: any) {
    console.error(
      `Error fetching single earnings call for ${symbol}, year ${year}:`,
      error.message
    );
    return [];
  }
}
/**
 * Fetch a batch set of earnings call transcripts for a given symbol and year
 */
export async function fetchBatchEarningsCalls(
  symbol: string,
  year?: number
): Promise<any[]> {
  try {
    const response = await fmpClient.get(
      `/batch_earning_call_transcript/${symbol}`,
      {
        params: { year },
      }
    );
    console.log(
      `Batch earnings call response for ${symbol}, year ${year}:`,
      response.data
    );
    return response.data || [];
  } catch (error: any) {
    console.error(
      `Error fetching batch earnings calls for ${symbol}, year ${year}:`,
      error.message
    );
    return [];
  }
}
