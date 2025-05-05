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