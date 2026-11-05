"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPeople } from "@/lib/people";
import { getRules } from "@/lib/rules";
import { parseCapitecCsv } from "@/lib/parseCapitec";
import { saveTransactions } from "@/lib/transactions";

const moneyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [people, setPeople] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function loadPeople() {
      try {
        const [peopleData, rulesData] = await Promise.all([getPeople(), getRules()]);
        setPeople(peopleData);
        setRules(rulesData);
      } catch (err) {
        console.error(err);
      }
    }

    loadPeople();
  }, []);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [rows]
  );

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    setSaveMessage("");

    if (!selectedFile) {
      setFile(null);
      setRows([]);
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setError("");

    try {
      const parsedRows = await parseCapitecCsv(selectedFile);
      const defaultPerson = people.find((person) => person.name === "Unsorted");

      const hydratedRows = parsedRows.map((row) => {
        const description = `${row.description || ""} ${row.originalDescription || ""}`.toLowerCase();
        const matchedRule = rules.find((rule) => description.includes(String(rule.keyword).toLowerCase()));

        return {
          ...row,
          personId: matchedRule?.person_id || defaultPerson?.id || null,
        };
      });

      setRows(hydratedRows);
    } catch (err) {
      setError(err.message || "The CSV could not be parsed.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!rows.length) {
      setSaveMessage("No CSV rows ready to save yet.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const saved = await saveTransactions(rows, file?.name || "uploaded.csv");
      setSaveMessage(`${saved.length} transactions saved successfully.`);
      setRows([]);
      setFile(null);
      const input = document.querySelector('input[type="file"]');
      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(err.message || "The transactions could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const previewRows = rows.slice(0, 10);

  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem 0 3rem" }}>
        <section
          style={{
            background: "#0d1218",
            border: "1px solid #2b3744",
            borderRadius: "20px",
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.2)",
            padding: "1.5rem",
          }}
        >
          <h1 style={{ marginBottom: "1.5rem", color: "#f3f6fb" }}>Upload statement</h1>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.4rem", fontWeight: 600, color: "#f3f6fb" }}>
              Choose Capitec CSV
              <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
            </label>

            {file ? <p style={{ margin: 0, color: "#a3acba" }}>Selected file: {file.name}</p> : null}
            {loading ? <p style={{ margin: 0, color: "#c0c7d1" }}>Parsing CSV...</p> : null}
            {saving ? <p style={{ margin: 0, color: "#c0c7d1" }}>Saving transactions...</p> : null}
            {error ? <p style={{ margin: 0, color: "#e3a4a7", background: "#17161b", borderRadius: "10px", padding: "0.75rem 0.9rem", border: "1px solid #41343a" }}>{error}</p> : null}
          </div>

          {rows.length > 0 ? (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px", border: "1px solid #2b3744", background: "#0b1117", borderRadius: "14px", padding: "1rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.4rem", color: "#f3f6fb" }}>Total rows</strong>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f3f6fb" }}>{rows.length}</div>
                </div>
                <div style={{ flex: "1 1 200px", border: "1px solid #2b3744", background: "#0b1117", borderRadius: "14px", padding: "1rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.4rem", color: "#f3f6fb" }}>Net total</strong>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f3f6fb" }}>{moneyFormatter.format(total)}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!rows.length || saving}
                style={{
                  width: "fit-content",
                  padding: "0.9rem 1.2rem",
                  background: "#e8edf4",
                  color: "#0a0d12",
                  fontWeight: 700,
                  border: "1px solid #e8edf4",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              {saveMessage ? <p style={{ margin: 0, color: "#9ad3b2" }}>{saveMessage}</p> : null}

              <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid #2b3744" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#0b1117" }}>
                  <thead>
                    <tr style={{ background: "#0d1218" }}>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Date</th>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Description</th>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Category</th>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Amount</th>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#f3f6fb" }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.id}>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{row.date}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{row.description}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{row.category || "-"}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{moneyFormatter.format(row.amount)}</td>
                        <td style={{ borderBottom: "1px solid #2b3744", padding: "0.8rem 0.9rem", color: "#e8edf4" }}>{moneyFormatter.format(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </ProtectedRoute>
  );
}
