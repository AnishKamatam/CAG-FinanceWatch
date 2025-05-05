import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '../../../../lib/plaid';

export async function POST(req: NextRequest) {
  const { public_token } = await req.json();

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;
    return NextResponse.json({ access_token });
  } catch (error) {
    console.error('Exchange Token Error:', error);
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
  }
}
