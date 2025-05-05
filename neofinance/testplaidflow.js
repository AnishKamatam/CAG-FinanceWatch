import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PLAID_BASE = 'https://sandbox.plaid.com';
const LOCAL_API = 'http://localhost:3000/api/plaid';

const createLinkToken = async () => {
  try {
    const response = await axios.post(`${PLAID_BASE}/link/token/create`, {
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      client_name: 'NeoFinance',
      language: 'en',
      country_codes: ['US'],
      user: { client_user_id: 'test-user' },
      products: ['transactions'],
    });
    return response.data.link_token;
  } catch (error) {
    console.error('❌ Create Link Token Error:', error.response?.data || error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

const createPublicToken = async () => {
  try {
    const response = await axios.post(`${PLAID_BASE}/sandbox/public_token/create`, {
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      institution_id: 'ins_109508', // Sandbox bank
      initial_products: ['transactions'],
    });
    console.log('✅ Public token created:', response.data.public_token);
    return response.data.public_token;
  } catch (error) {
    console.error('❌ Create Public Token Error:', error.response?.data || error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

const exchangeToken = async (publicToken) => {
  try {
    console.log('🔄 Sending public token to exchange:', publicToken);
    const response = await axios.post(`${LOCAL_API}/exchange-token`, {
      public_token: publicToken,
    });
    console.log('✅ Access token received:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Exchange Token Error:', error.response?.data || error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure the Next.js server is running on port 3000');
    }
    throw error;
  }
};

const fetchTransactions = async (accessToken) => {
  try {
    console.log('🔄 Fetching transactions with access token:', accessToken);
    const response = await axios.post(`${LOCAL_API}/transactions`, {
      access_token: accessToken,
    });
    return response.data.transactions;
  } catch (error) {
    console.error('❌ Fetch Transactions Error:', error.response?.data || error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

(async () => {
  try {
    console.log('🔗 Creating public token...');
    const publicToken = await createPublicToken();

    console.log('🔑 Exchanging for access token...');
    const accessToken = await exchangeToken(publicToken);

    console.log('📄 Fetching transactions...');
    const transactions = await fetchTransactions(accessToken);

    console.log('\n✅ Transactions:', transactions);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
})();
