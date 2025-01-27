import { delay } from "@/utils/delay";
import axios from "axios";

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/api";
const fmpClient = axios.create({
  baseURL: BASE_URL,
  params: { apikey: FMP_API_KEY },
});

/**
 * Fetch a list of all companies and their stock details
 */
export async function fetchCompanyList(): Promise<any[]> {
  try {
    const response = await fmpClient.get("/v3/stock/list");
    return response.data;
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
): Promise<any[]> {
  try {
    const response = await fmpClient.get(
      `/v3/earning_call_transcript/${symbol}`,
      {
        params: { year, quarter },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.error("Rate limit hit while fetching transcript. Retrying...");
      await delay(500);
      return fetchSingleEarningsCall(symbol, year, quarter);
    }
    console.error("Error fetching single earnings call:", error.message);
    throw new Error("Failed to fetch single earnings call transcript.");
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
      `/v4/batch_earning_call_transcript/${symbol}`,
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

/**
 * Fetch the income statement for a given company based on symbol and period
 */
export async function fetchIncomeStatement(
  symbol: string,
  period: string = "annual",
  limit?: number
): Promise<any[]> {
  try {
    const response = await fmpClient.get(`/v3/income-statement/${symbol}`, {
      params: { period, limit },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching income statement for ${symbol}:`,
      error.message
    );
    return [];
  }
}

/**
 * Fetch the balance sheet statement for a given company based on symbol and period
 */
export async function fetchBalanceSheet(
  symbol: string,
  period: string = "annual",
  limit?: number
): Promise<any[]> {
  try {
    const response = await fmpClient.get(
      `/v3/balance-sheet-statement/${symbol}`,
      {
        params: { period, limit },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching balance sheet statement for ${symbol}:`,
      error.message
    );
    return [];
  }
}

/**
 * Fetch the cash flow statement for a given company based on symbol and period
 */
export async function fetchCashFlowStatement(
  symbol: string,
  period: string = "annual",
  limit?: number
): Promise<any[]> {
  try {
    const response = await fmpClient.get(`/v3/cash-flow-statement/${symbol}`, {
      params: { period, limit },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching cash flow statement for ${symbol}:`,
      error.message
    );
    return [];
  }
}

/**
 * Fetch the key financial metrics for a given company based on symbol, period, and limit
 */
export async function fetchKeyMetrics(
  symbol: string,
  period: string = "annual",
  limit?: number
): Promise<any[]> {
  try {
    const response = await fmpClient.get(`/v3/key-metrics/${symbol}`, {
      params: { period, limit },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching key metrics for ${symbol}:`, error.message);
    return [];
  }
}
