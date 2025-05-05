import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '../../../../lib/plaid';

export async function POST(req: NextRequest) {
  const { public_token } = await req.json();
  
  console.log('🔄 Exchanging public token for access token...');

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token
    });
    
    console.log('✅ Token exchange successful');
    
    return NextResponse.json({ access_token: response.data.access_token });
  } catch (error: any) {
    console.error('❌ Token Exchange Error:', error);
    if ('response' in error) {
      console.error('❌ Error response:', error.response.data);
    }
    return NextResponse.json({ 
      error: 'Failed to exchange token',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
