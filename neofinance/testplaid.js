import axios from 'axios';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
dotenv.config();

const PLAID_BASE = 'https://sandbox.plaid.com';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllTransactions(accessToken) {
  let allTransactions = [];
  let hasMore = true;
  let offset = 0;
  const batchSize = 100; // Fetch 100 transactions at a time

  while (hasMore) {
    try {
      const response = await axios.post(`${PLAID_BASE}/transactions/get`, {
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token: accessToken,
        start_date: '2023-01-01', // Extended start date to over a year ago
        end_date: '2025-05-01',
        options: {
          count: batchSize,
          offset: offset,
        },
      });

      const newTransactions = response.data.transactions;
      allTransactions = [...allTransactions, ...newTransactions];
      
      // Check if there are more transactions
      hasMore = newTransactions.length === batchSize;
      offset += batchSize;
      
      console.log(`📊 Fetched ${newTransactions.length} transactions (total: ${allTransactions.length})`);
      
      // Add a small delay between requests to avoid rate limits
      await delay(1000);
    } catch (error) {
      if (error.response?.data?.error_code === 'PRODUCT_NOT_READY') {
        console.log('Waiting for transactions to be ready...');
        await delay(2000);
        continue;
      }
      throw error;
    }
  }

  return allTransactions;
}

async function getTransactions() {
  try {
    console.log('🔑 Creating public token...');
    // Create a public token
    const publicTokenResponse = await axios.post(`${PLAID_BASE}/sandbox/public_token/create`, {
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      institution_id: 'ins_109508', // Sandbox bank
      initial_products: ['transactions'],
    });
    console.log('✅ Public token created:', publicTokenResponse.data.public_token);

    console.log('🔄 Exchanging for access token...');
    // Exchange for access token
    const exchangeResponse = await axios.post(`${PLAID_BASE}/item/public_token/exchange`, {
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      public_token: publicTokenResponse.data.public_token,
    });
    console.log('✅ Access token received:', exchangeResponse.data.access_token);

    console.log('📥 Fetching all transactions...');
    // Get all transactions
    const transactions = await fetchAllTransactions(exchangeResponse.data.access_token);

    // Transform transactions to match our format
    const transformedTransactions = transactions.map(tx => ({
      date: tx.date,
      category: tx.category?.[0] || 'Uncategorized',
      amount: tx.amount
    }));

    // Save to transactions.json
    const dataPath = path.join(process.cwd(), 'data', 'transactions.json');
    await fs.writeFile(dataPath, JSON.stringify(transformedTransactions, null, 2));

    console.log('✅ All transactions saved to transactions.json');
    console.log(`📈 Total transactions: ${transformedTransactions.length}`);
    console.log('📅 Date range:', {
      earliest: transformedTransactions[transformedTransactions.length - 1]?.date,
      latest: transformedTransactions[0]?.date
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

getTransactions(); 