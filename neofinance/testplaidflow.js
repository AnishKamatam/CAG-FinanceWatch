import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PLAID_BASE = 'https://sandbox.plaid.com';
const LOCAL_API = 'http://localhost:3000/api/plaid';

const createLinkToken = async () => {
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
};

const createPublicToken = async () => {
  const response = await axios.post(`${PLAID_BASE}/sandbox/public_token/create`, {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    institution_id: 'ins_109508', // Sandbox bank
    initial_products: ['transactions'],
  });
  return response.data.public_token;
};

const exchangeToken = async (publicToken) => {
  const response = await axios.post(`${LOCAL_API}/exchange-token`, {
    public_token: publicToken,
  });
  return response.data.access_token;
};

const fetchTransactions = async (accessToken) => {
  const response = await axios.post(`${LOCAL_API}/transactions`, {
    access_token: accessToken,
  });
  return response.data.transactions;
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
  }
})();
