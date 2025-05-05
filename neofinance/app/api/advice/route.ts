/**
 * Financial Advice API Endpoint
 * 
 * This endpoint provides AI-powered financial advice based on transaction data.
 * It uses Perplexity AI to analyze spending patterns and generate personalized
 * recommendations. Results are cached to improve performance.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTransactions, getMonthlySummary } from "../../../lib/finance";
import { Redis } from '@upstash/redis';

// Initialize Redis client for caching
const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

/**
 * Generates a prompt for the AI based on transaction data and user input
 */
function generatePrompt(summary: Record<string, number>, userInput: string): string {
  return `
  You're a smart, friendly personal finance assistant.
  
  Here's what the user spent recently:
  ${JSON.stringify(summary, null, 2)}
  
  Now they asked:
  "${userInput}"
  
  Give helpful, personalized budgeting advice.
  `;
}

export async function POST(req: NextRequest) {
  console.log('✅ ROUTE HIT /api/advice');
  
  try {
    // Extract user input from request
    const { userId, userInput } = await req.json();
    console.log('🟢 Received input:', { userId, userInput });

    // Check if we have a cached response
    const cacheKey = `advice:${userId}:${userInput}`;
    const cachedAdvice = await redis.get(cacheKey);
    
    if (cachedAdvice) {
      console.log('🟡 Retrieved cached summary:', cachedAdvice);
      return NextResponse.json({ advice: cachedAdvice });
    }

    // Get transaction data and generate summary
    console.log('🟠 Caching new summary...');
    const transactions = await getTransactions();
    const summary = getMonthlySummary(transactions);

    // Generate AI prompt
    const prompt = generatePrompt(summary, userInput);
    console.log('🧠 Prompt:', prompt);

    // Call Perplexity API
    console.log('🔐 Perplexity Key (exists?):', !!process.env.PERPLEXITY_API_KEY);
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const advice = data.choices[0].message.content;

    // Cache the response
    await redis.set(cacheKey, advice, { ex: 3600 }); // Cache for 1 hour

    console.log('✅ Perplexity response:', advice);
    return NextResponse.json({ advice });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate advice' },
      { status: 500 }
    );
  }
}
