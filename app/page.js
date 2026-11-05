"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { getPeople } from "@/lib/people";
import { computeBalances, spendByCategory, monthlySummary, totalOutflow } from "@/lib/balances";
import { getTransactions } from "@/lib/transactions";

const moneyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

function EmptyState({ title, message }) {
  return (
    <div
      style={{
        border: "1px dashed #39495d",
        background: "#0b1117",
        borderRadius: "16px",
        padding: "1.25rem",
        color: "#a3acba",
      }}
    >
      <strong style={{ display: "block", color: "#edf3ff", marginBottom: "0.35rem" }}>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

export default function Page() {
  const [people, setPeople] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [peopleData, transactionData] = await Promise.all([getPeople(), getTransactions()]);
        setPeople(peopleData);
        setTransactions(transactionData);
      } catch (err) {
        setError(err.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const balances = computeBalances(transactions, people);
  const categoryTotals = spendByCategory(transactions).slice(0, 5);
  const monthly = monthlySummary(transactions).slice(-6);
  const totalSpend = totalOutflow(transactions);
  const unsortedCount = transactions.filter((transaction) => !transaction.person_id).length;

  function handleExport() {
    const rows = [
      ["Date", "Description", "Category", "Amount", "Assigned to"],
      ...transactions.map((transaction) => [
        transaction.date || "",
        transaction.description || "",
        transaction.category || "",
        transaction.amount || 0,
        transaction.person_name || "Unsorted",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bank-manager-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem 0 3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ margin: 0, color: "#c0c7d1", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.78rem" }}>
              Overview
            </p>
            <h1 style={{ margin: "0.35rem 0 0", color: "#f3f6fb" }}>Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={transactions.length === 0}
            style={{
              padding: "0.7rem 1rem",
              background: "#e8edf4",
              color: "#0a0d12",
              fontWeight: 700,
              border: "1px solid #e8edf4",
            }}
          >
            Export CSV
          </button>
        </div>

        {error ? <p style={{ color: "#e3a4a7" }}>{error}</p> : null}

        {loading ? (
          <p style={{ color: "#a3acba" }}>Loading dashboard...</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              <div style={{ border: "1px solid #2b3744", background: "#0e141b", padding: "1rem", borderRadius: "16px", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <div style={{ color: "#a3acba", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total spend</div>
                <div style={{ marginTop: "0.5rem", fontSize: "1.7rem", fontWeight: 700, color: "#f3f6fb" }}>{moneyFormatter.format(totalSpend)}</div>
              </div>
              <div style={{ border: "1px solid #2b3744", background: "#0e141b", padding: "1rem", borderRadius: "16px", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <div style={{ color: "#a3acba", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Unsorted</div>
                <div style={{ marginTop: "0.5rem", fontSize: "1.7rem", fontWeight: 700, color: "#f3f6fb" }}>{unsortedCount}</div>
              </div>
              <div style={{ border: "1px solid #2b3744", background: "#0e141b", padding: "1rem", borderRadius: "16px", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <div style={{ color: "#a3acba", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>People</div>
                <div style={{ marginTop: "0.5rem", fontSize: "1.7rem", fontWeight: 700, color: "#f3f6fb" }}>{people.length}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginTop: "0.5rem",
              }}
            >
              <div style={{ border: "1px solid #2b3744", background: "#0e141b", padding: "1rem", borderRadius: "16px", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", color: "#f3f6fb" }}>Person balances</strong>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {balances.length === 0 ? (
                    <EmptyState title="No balances yet" message="Add people and upload a CSV to start tracking spending." />
                  ) : (
                    balances.map((person) => (
                      <div key={person.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", color: "#e8edf4" }}>
                        <span>{person.name}</span>
                        <strong>{moneyFormatter.format(person.total)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ border: "1px solid #2b3744", background: "#0e141b", padding: "1rem", borderRadius: "16px", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", color: "#f3f6fb" }}>Category spend</strong>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {categoryTotals.length === 0 ? (
                    <EmptyState title="No categories yet" message="Once transactions are uploaded, category totals will appear here." />
                  ) : (
                    categoryTotals.map((row) => (
                      <div key={row.category} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", color: "#e8edf4" }}>
                        <span>{row.category}</span>
                        <strong>{moneyFormatter.format(row.total)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ border: "1px solid #2b3744", background: "#0e141b", padding: "1rem", borderRadius: "16px", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)" }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", color: "#f3f6fb" }}>Monthly trend</strong>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {monthly.length === 0 ? (
                    <EmptyState title="No history yet" message="Upload a few months of statements to see your monthly trend." />
                  ) : (
                    monthly.map((entry) => (
                      <div key={entry.month} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", color: "#e8edf4" }}>
                        <span>{entry.month}</span>
                        <strong>{moneyFormatter.format(entry.total)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
