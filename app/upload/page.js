"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { parseCapitecCsv } from "@/lib/parseCapitec";

const moneyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

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
      setRows(parsedRows);
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

    setSaveMessage("Save is not implemented yet. This screen only previews and validates the CSV.");
  }

  const previewRows = rows.slice(0, 10);

  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem" }}>
        <h1>Upload statement</h1>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          Choose Capitec CSV
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} style={{ display: "block", marginTop: "0.5rem" }} />
        </label>

        {file ? <p>Selected file: {file.name}</p> : null}
        {loading ? <p>Parsing CSV...</p> : null}
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        {rows.length > 0 ? (
          <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
                <strong>Total rows</strong>
                <div>{rows.length}</div>
              </div>
              <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
                <strong>Net total</strong>
                <div>{moneyFormatter.format(total)}</div>
              </div>
            </div>

            <button type="button" onClick={handleSave} disabled={!rows.length} style={{ width: "fit-content", padding: "0.75rem 1rem" }}>
              Save
            </button>

            {saveMessage ? <p>{saveMessage}</p> : null}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Date</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Description</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Category</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Amount</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.date}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.description}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.category || "-"}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{moneyFormatter.format(row.amount)}</td>
                      <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{moneyFormatter.format(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
