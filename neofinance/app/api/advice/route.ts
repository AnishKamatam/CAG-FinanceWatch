import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getMonthlySummary } from "../../../lib/finance";
import { getCachedSummary, cacheSummary } from "../../../lib/cache";
import { generatePrompt } from "../../../utils/prompt";

export async function POST(req: NextRequest) {
  console.log("✅ ROUTE HIT /api/advice");

  try {
    const { userId, userInput } = await req.json();
    console.log("🟢 Received input:", { userId, userInput });

    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    console.log("🔐 Perplexity Key (exists?):", !!perplexityKey);

    if (!perplexityKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const cached = await getCachedSummary(userId);
    console.log("🟡 Retrieved cached summary:", cached);

    const summary = cached || JSON.stringify(getMonthlySummary(), null, 2);

    if (!cached) {
      console.log("🟠 Caching new summary...");
      await cacheSummary(userId, summary);
    }

    const prompt = generatePrompt(summary, userInput);
    console.log("🧠 Prompt:\n", prompt);

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${perplexityKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data.choices?.[0]?.message?.content;
    console.log("✅ Perplexity response:", result);

    return NextResponse.json({ advice: result });

  } catch (error: any) {
    console.error("❌ Error in /api/advice:");
    console.error("🔴 FULL ERROR:");
    console.error(error); // Full error object dump

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("🟥 Perplexity Error Response:");
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else if (error.request) {
        console.error("🟧 No response received from Perplexity.");
      } else {
        console.error("🟨 Axios setup error:", error.message);
      }
    } else {
      console.error("🟫 Unknown error:", error.message || error);
    }

    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
