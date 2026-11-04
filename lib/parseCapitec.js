import Papa from "papaparse";

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function normalizeRow(row) {
  const moneyIn = num(row["Money In"]);
  const moneyOut = Math.abs(num(row["Money Out"]));
  const fee = Math.abs(num(row["Fee"]));
  const [date, time = ""] = String(row["Transaction Date"] ?? "").trim().split(" ");

  return {
    date,
    time,
    description: String(row["Description"] ?? "").trim(),
    originalDescription: String(row["Original Description"] ?? "").trim(),
    parentCategory: String(row["Parent Category"] ?? "").trim(),
    category: String(row["Category"] ?? "").trim(),
    amount: moneyIn - moneyOut - fee,
    fee,
    balance: num(row["Balance"]),
    accountLast4: String(row["Account"] ?? "").trim().slice(-4),
    personId: null,
  };
}

export function parseCapitecCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: async ({ data }) => {
        try {
          const rows = [];
          for (const raw of data) {
            if (!raw["Transaction Date"]) continue;
            const t = normalizeRow(raw);
            t.id = await sha256(
              [raw["Account"], raw["Transaction Date"], raw["Original Description"], t.amount, t.balance].join("|")
            );
            rows.push(t);
          }
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      },
      error: reject,
    });
  });
}
