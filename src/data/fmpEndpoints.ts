
export const fmpEndpoints = {
  earnings_call_summary: {
    url: "https://financialmodelingprep.com/api/v3/earnings-call-transcripts",
    params: ["symbol"],
    description: "Fetch earnings call transcripts for a given company symbol.",
  },
  stock_quote: {
    url: "https://financialmodelingprep.com/api/v3/quote",
    params: ["symbol"],
    description:
      "Fetch real-time stock price quotes for a given company symbol.",
  },
  company_profile: {
    url: "https://financialmodelingprep.com/api/v3/profile",
    params: ["symbol"],
    description:
      "Fetch the company profile, including industry, sector, and description.",
  },
  historical_prices: {
    url: "https://financialmodelingprep.com/api/v3/historical-price-full",
    params: ["symbol", "from", "to"],
    description:
      "Fetch historical stock price data for a given company symbol and date range.",
  },
  income_statement: {
    url: "https://financialmodelingprep.com/api/v3/income-statement",
    params: ["symbol", "limit", "period"],
    description:
      "Fetch the income statement for a given company symbol. Limit and period are optional.",
  },
  balance_sheet: {
    url: "https://financialmodelingprep.com/api/v3/balance-sheet-statement",
    params: ["symbol", "limit", "period"],
    description:
      "Fetch the balance sheet for a given company symbol. Limit and period are optional.",
  },
  cash_flow: {
    url: "https://financialmodelingprep.com/api/v3/cash-flow-statement",
    params: ["symbol", "limit", "period"],
    description:
      "Fetch the cash flow statement for a given company symbol. Limit and period are optional.",
  },
  company_ratios: {
    url: "https://financialmodelingprep.com/api/v3/ratios",
    params: ["symbol", "limit"],
    description: "Fetch financial ratios for a given company symbol.",
  },
  key_metrics: {
    url: "https://financialmodelingprep.com/api/v3/key-metrics",
    params: ["symbol", "limit"],
    description: "Fetch key financial metrics for a given company symbol.",
  },
  financial_growth: {
    url: "https://financialmodelingprep.com/api/v3/financial-growth",
    params: ["symbol", "limit"],
    description:
      "Fetch financial growth indicators for a given company symbol.",
  },
  dividends: {
    url: "https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend",
    params: ["symbol"],
    description: "Fetch historical dividend data for a given company symbol.",
  },
  earnings_calendar: {
    url: "https://financialmodelingprep.com/api/v3/earnings-calendar",
    params: ["symbol", "from", "to"],
    description:
      "Fetch upcoming or historical earnings calendar events for a given company symbol and date range.",
  },
  insider_trading: {
    url: "https://financialmodelingprep.com/api/v4/insider-trading",
    params: ["symbol"],
    description: "Fetch insider trading data for a given company symbol.",
  },
  stock_news: {
    url: "https://financialmodelingprep.com/api/v3/stock_news",
    params: ["tickers", "limit"],
    description: "Fetch recent news articles related to a given stock ticker.",
  },
  market_gainers: {
    url: "https://financialmodelingprep.com/api/v3/gainers",
    params: [],
    description: "Fetch the top market gainers. No parameters required.",
  },
  market_losers: {
    url: "https://financialmodelingprep.com/api/v3/losers",
    params: [],
    description: "Fetch the top market losers. No parameters required.",
  },
  most_active: {
    url: "https://financialmodelingprep.com/api/v3/actives",
    params: [],
    description:
      "Fetch the most active stocks in the market. No parameters required.",
  },
  sector_performance: {
    url: "https://financialmodelingprep.com/api/v3/sector-performance",
    params: [],
    description: "Fetch sector performance data. No parameters required.",
  },
  commodities: {
    url: "https://financialmodelingprep.com/api/v3/quotes/commodity",
    params: [],
    description:
      "Fetch quotes for various commodities. No parameters required.",
  },
  currencies: {
    url: "https://financialmodelingprep.com/api/v3/quotes/forex",
    params: [],
    description:
      "Fetch quotes for various currency pairs. No parameters required.",
  },
  cryptocurrencies: {
    url: "https://financialmodelingprep.com/api/v3/quotes/crypto",
    params: [],
    description:
      "Fetch quotes for various cryptocurrencies. No parameters required.",
  },
  esg_score: {
    url: "https://financialmodelingprep.com/api/v4/esg-score",
    params: ["symbol"],
    description:
      "Fetch the ESG (Environmental, Social, and Governance) score for a given company.",
  },
  institutional_holders: {
    url: "https://financialmodelingprep.com/api/v4/institutional-holder",
    params: ["symbol"],
    description: "Fetch institutional holders for a given company.",
  },
  etf_sector_weightings: {
    url: "https://financialmodelingprep.com/api/v4/etf-sector-weightings",
    params: ["symbol"],
    description: "Fetch sector weightings for a given ETF.",
  },
  etf_country_weightings: {
    url: "https://financialmodelingprep.com/api/v4/etf-country-weightings",
    params: ["symbol"],
    description: "Fetch country weightings for a given ETF.",
  },
  analyst_estimates: {
    url: "https://financialmodelingprep.com/api/v4/analyst-estimates",
    params: ["symbol"],
    description: "Fetch analyst estimates for a given company.",
  },
  press_releases: {
    url: "https://financialmodelingprep.com/api/v3/press-releases",
    params: ["symbol", "limit"],
    description: "Fetch press releases for a given company.",
  },
  sec_filings: {
    url: "https://financialmodelingprep.com/api/v3/sec_filings",
    params: ["symbol", "type", "year"],
    description:
      "Fetch SEC filings for a given company with optional type and year filters.",
  },
  etf_holdings: {
    url: "https://financialmodelingprep.com/api/v4/etf-holder",
    params: ["symbol"],
    description: "Fetch the holdings of a given ETF.",
  },
} as const;

export type FmpEndpointKey = keyof typeof fmpEndpoints;

