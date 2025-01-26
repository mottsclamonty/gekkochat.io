# **GekkoChat: A Financial Insights Chatbot**

GekkoChat is a financial chatbot powered by **LangChain**, **OpenAI**, and the **FMP (Financial Modeling Prep) API**. Designed to deliver key financial insights, it allows users to query general financial metrics, assess the financial health of companies, or get summaries of earnings call transcripts.

Every response is delivered in the style of Gordon Gekko, the infamous wall-street trader played by Michael Douglas in the
film Wall Street.

---

## **Key Features**

### 1. **Authentication with OAuth2, Google, and Github**

- In order to access the chat features, users must authenticate with either a Google or Github account
- This allows chats to be saved and retrieved for any number of users

### 2. **Query Financial Metrics**

- Ask about specific financial metrics (e.g., P/E ratio, EBITDA) for companies.
- Receive detailed insights into a company’s financial performance based on its latest filings.

### 3. **Assess Financial Health**

- Request an overview of a company’s financial health, and the chatbot will compile a summary of its most critical metrics.

### 4. **Summarize Earnings Calls**

- Get concise and insightful summaries of quarterly earnings calls for public companies.
- Extract highlights such as growth strategies, market challenges, revenue updates, or comments on specific topics.

### 5. **Chat History**

- All meaningful chats (i.e those containing at least 4 messages between you and Gordon Gekko) are saved to a
  firebase backend
- Chats are automatically updated as you go, saved real-time
- Revisit older chats seamlessly from a hover-based menu

---

## **APIs, Libraries, and Technologies Used**

1. **OpenAI API**: Powers natural language understanding, query classification, and rewriting responses.
2. **LangChain**: Manages query processing, response rewriting, and modular NLP logic.
3. **FMP API**: Fetches real-time and historical financial data, including earnings call transcripts and company metrics.
4. **Firebase**: The application database - Users and their chat history are saved here
5. **Next.js**:  Handles all frontend logic/components and serverless API calls.
6. **NextAuth**: Handle authentication signIn and session logic
7. **Tailwind CSS**: Used for all styling
8. **ShadCN**: Provided several re-useable components used throughout the application

---

## **Getting Started**

### **1. Prerequisites**

- Node.js v18 or higher
- npm
- Valid OpenAI API key with sufficient tokens
- Valid FMP API key
- Google/GitHub credentials for authentication (via NextAuth)

### **2. Installation**

Clone the repository:

**IMPORTANT - Make sure you are running at least node version 18**

```bash
git clone https://github.com/yourusername/gekkochat.git
cd gekkochat
npm install
```

### **3. Necessary Env Variables**

```env
OPENAI_API_KEY=<your_openai_api_key>
FMP_API_KEY=<your_fmp_api_key>
GITHUB_ID=<your_github_client_id>
GITHUB_SECRET=<your_github_client_secret>
GOOGLE_ID=<your_google_client_id>
GOOGLE_SECRET=<your_google_client_secret>
NEXTAUTH_SECRET=<your_nextauth_secret>
NEXTAUTH_URL=http://localhost:3000
```

### **4. Running it Locally**

```bash
npm run dev
```

### **5. Testing with Cypress**

E2E testing has been done via cypress

```bash
npm run cypress:open
```

### **6. Live Deployment**

[GekkoChat.io](https://gekkochat-io.vercel.app/)


---
