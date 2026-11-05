"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPeople } from "@/lib/people";
import { assignPerson, getTransactions } from "@/lib/transactions";

const moneyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [peopleData, transactionData] = await Promise.all([getPeople(), getTransactions()]);
      setPeople(peopleData);
      setTransactions(transactionData);
    } catch (err) {
      setError(err.message || "Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handlePersonChange(transactionId, value) {
    try {
      await assignPerson(transactionId, value || null);
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                person_id: value || null,
                person_name: value ? people.find((person) => person.id === value)?.name || "Unsorted" : "Unsorted",
              }
            : transaction
        )
      );
    } catch (err) {
      setError(err.message || "Could not assign the person.");
    }
  }

  const total = useMemo(
    () => transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    [transactions]
  );

  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem 0 3rem" }}>
        <h1 style={{ color: "#f3f6fb" }}>Transactions</h1>

        {error ? <p style={{ color: "#e3a4a7" }}>{error}</p> : null}

        {loading ? (
          <p style={{ color: "#a3acba" }}>Loading transactions...</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div
              style={{
                border: "1px solid #2b3744",
                background: "#0d1218",
                borderRadius: "16px",
                padding: "1rem 1.25rem",
                boxShadow: "0 14px 32px rgba(0, 0, 0, 0.15)",
                width: "fit-content",
                minWidth: "220px",
              }}
            >
              <strong style={{ display: "block", marginBottom: "0.35rem", color: "#f3f6fb" }}>Total value</strong>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f3f6fb" }}>{moneyFormatter.format(total)}</div>
            </div>

            <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid #2b3744", background: "#0b1117" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0d1218" }}>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Date</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Description</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Category</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Amount</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Assigned to</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "1rem", color: "#a3acba" }}>
                        No transactions yet. Upload a CSV to get started.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{transaction.date}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{transaction.description}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{transaction.category || "-"}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{moneyFormatter.format(transaction.amount)}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem" }}>
                          <select
                            value={transaction.person_id || ""}
                            onChange={(event) => handlePersonChange(transaction.id, event.target.value)}
                            style={{ minWidth: "180px" }}
                          >
                            <option value="">Unsorted</option>
                            {people.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
