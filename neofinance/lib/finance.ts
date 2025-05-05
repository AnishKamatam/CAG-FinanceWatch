import transactions from "../data/transactions.json";

export function getMonthlySummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const tx of transactions) {
    summary[tx.category] = (summary[tx.category] || 0) + tx.amount;
  }
  return summary;
}
