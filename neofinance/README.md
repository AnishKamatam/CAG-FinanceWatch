# CAG-FinanceWatch

A smart financial analysis system that uses Plaid to fetch real transaction data and provides AI-powered financial advice.

## Features

- 🔄 Real-time transaction fetching from Plaid
- 📊 Transaction categorization and analysis
- 🤖 AI-powered financial advice using Perplexity
- 💾 Transaction data persistence
- 🔍 Detailed spending insights

## System Architecture

The system consists of several key components:

1. **Plaid Integration** (`/app/api/plaid/`)
   - Handles Plaid authentication and token management
   - Fetches real transaction data from connected bank accounts
   - Transforms Plaid data into a standardized format

2. **Financial Analysis** (`/lib/finance.ts`)
   - Processes transaction data
   - Generates spending summaries by category
   - Provides financial insights

3. **AI Advisory** (`/app/api/advice/`)
   - Uses Perplexity AI to analyze spending patterns
   - Generates personalized financial advice
   - Caches analysis results for performance

4. **Data Storage** (`/data/`)
   - Stores transaction data in JSON format
   - Maintains historical spending records

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Plaid API credentials
- Perplexity API key
- Redis instance (for caching)

### Environment Setup

Create a `.env` file in the root directory with:

```env
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
PERPLEXITY_API_KEY=your_perplexity_key
REDIS_URL=your_redis_url
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Test the system:
```bash
node testplaid.js  # Test Plaid integration
node testcag.js    # Test financial advice
```

## API Endpoints

### `/api/plaid/transactions`
- **POST**: Fetches and stores transactions from Plaid
- **Body**: `{ access_token: string }`
- **Response**: `{ success: boolean, transactions: Transaction[] }`

### `/api/advice`
- **POST**: Generates financial advice based on transactions
- **Body**: `{ userId: string, userInput: string }`
- **Response**: `{ advice: string }`

## Data Structure

Transactions are stored in the following format:
```typescript
interface Transaction {
  date: string;      // YYYY-MM-DD
  category: string;  // Transaction category
  amount: number;    // Transaction amount
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
