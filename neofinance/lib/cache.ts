import redis from "./redis";

export async function cacheSummary(userId: string, summary: string) {
  await redis.set(`summary:${userId}`, summary);
}

export async function getCachedSummary(userId: string) {
  return await redis.get(`summary:${userId}`);
}
