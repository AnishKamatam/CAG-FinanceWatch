/**
 * Plaid Transactions API Endpoint
 * 
 * This endpoint handles fetching and storing transactions from Plaid.
 * It transforms Plaid's transaction format into our standardized format
 * and persists the data to a JSON file.
 */

import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '../../../../lib/plaid';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  // Extract access token from request body
  const { access_token } = await req.json();

  try {
    // Fetch transactions from Plaid API
    // Using a wide date range to ensure we get all available transactions
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: '2024-04-01',  // Start date for transaction fetch
      end_date: '2025-05-01',    // End date for transaction fetch
      options: {
        count: 10,               // Number of transactions per request
        offset: 0,               // Starting offset for pagination
      },
    });

    // Transform Plaid transactions to match our standardized format
    // This ensures consistency across the application
    const transformedTransactions = response.data.transactions.map(tx => ({
      date: tx.date,                                    // Transaction date
      category: tx.category?.[0] || 'Uncategorized',    // Primary category or default
      amount: tx.amount                                 // Transaction amount
    }));

    // Save transformed transactions to JSON file
    // This provides persistence and allows for offline analysis
    const dataPath = path.join(process.cwd(), 'data', 'transactions.json');
    await fs.writeFile(dataPath, JSON.stringify(transformedTransactions, null, 2));

    // Return success response with transformed transactions
    return NextResponse.json({ 
      success: true, 
      transactions: transformedTransactions 
    });
  } catch (error: any) {
    // Log error and return error response
    console.error('Transaction Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' }, 
      { status: 500 }
    );
  }
}
