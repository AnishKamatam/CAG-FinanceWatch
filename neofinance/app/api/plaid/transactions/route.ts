import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '../../../../lib/plaid';

export async function POST(req: NextRequest) {
  const { access_token } = await req.json();

  try {
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: '2024-04-01',
      end_date: '2025-05-01',
      options: {
        count: 10,
        offset: 0,
      },
    });

    return NextResponse.json({ transactions: response.data.transactions });
  } catch (error) {
    console.error('Transaction Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
