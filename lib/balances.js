// Pure helper functions for computing pot balances, category totals, and monthly summaries.
export function computeBalances(transactions, people) {
  const map = new Map(people.map((person) => [person.id, { ...person, total: 0 }]));

  transactions.forEach((transaction) => {
    if (!transaction.person_id) {
      return;
    }

    const person = map.get(transaction.person_id);
    if (person) {
      person.total += Number(transaction.amount || 0);
    }
  });

  return [...map.values()];
}

export function spendByCategory(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    const amount = Number(transaction.amount || 0);

    if (totals.has(category)) {
      totals.set(category, totals.get(category) + amount);
      return;
    }

    totals.set(category, amount);
  });

  return [...totals.entries()].map(([category, total]) => ({ category, total }));
}

export function monthlySummary(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const date = transaction.date || "";
    const monthKey = date.length >= 7 ? date.slice(0, 7) : "Unknown";
    const amount = Number(transaction.amount || 0);

    totals.set(monthKey, (totals.get(monthKey) || 0) + amount);
  });

  return [...totals.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function totalOutflow(transactions) {
  return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}
