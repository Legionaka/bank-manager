"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPeople } from "@/lib/people";
import { addRule, deleteRule, getRules } from "@/lib/rules";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [people, setPeople] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [personId, setPersonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [peopleData, rulesData] = await Promise.all([getPeople(), getRules()]);
      setPeople(peopleData);
      setRules(rulesData);
      setPersonId(peopleData[0]?.id || "");
    } catch (err) {
      setError(err.message || "Could not load rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddRule(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const newRule = await addRule({
        keyword,
        personId: personId || null,
      });

      setRules((current) => [newRule, ...current]);
      setKeyword("");
      setPersonId(people[0]?.id || "");
    } catch (err) {
      setError(err.message || "Could not create rule.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRule(ruleId) {
    try {
      await deleteRule(ruleId);
      setRules((current) => current.filter((rule) => rule.id !== ruleId));
    } catch (err) {
      setError(err.message || "Could not delete rule.");
    }
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem 0 3rem" }}>
        <h1 style={{ color: "#f3f6fb" }}>Rules</h1>

        <form
          onSubmit={handleAddRule}
          style={{
            display: "grid",
            gap: "1rem",
            maxWidth: "440px",
            marginBottom: "2rem",
            background: "#0d1218",
            border: "1px solid #2b3744",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.18)",
          }}
        >
          <label style={{ color: "#f3f6fb" }}>
            Keyword
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="e.g. amazon"
              style={{ marginTop: "0.35rem" }}
            />
          </label>

          <label style={{ color: "#f3f6fb" }}>
            Assign to
            <select
              value={personId}
              onChange={(event) => setPersonId(event.target.value)}
              style={{ marginTop: "0.35rem" }}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={saving || !keyword.trim()}
            style={{
              padding: "0.85rem 1rem",
              background: "#e8edf4",
              color: "#0a0d12",
              fontWeight: 700,
              border: "1px solid #e8edf4",
            }}
          >
            {saving ? "Saving..." : "Add rule"}
          </button>
        </form>

        {error ? <p style={{ color: "#e3a4a7" }}>{error}</p> : null}

        {loading ? (
          <p style={{ color: "#a3acba" }}>Loading rules...</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem", maxWidth: "760px" }}>
            {rules.length === 0 ? (
              <div
                style={{
                  padding: "1.25rem",
                  border: "1px dashed #39495d",
                  borderRadius: "14px",
                  background: "#0b1117",
                  color: "#a3acba",
                }}
              >
                No rules yet. Add a keyword to auto-assign uploaded transactions.
              </div>
            ) : (
              rules.map((rule) => {
                const person = people.find((entry) => entry.id === rule.person_id);

                return (
                  <div
                    key={rule.id}
                    style={{
                      border: "1px solid #2b3744",
                      borderRadius: "14px",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                      background: "#0d1218",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#f3f6fb" }}>{rule.keyword}</strong>
                      <div style={{ color: "#a3acba", marginTop: "0.25rem" }}>{person ? `Assigned to ${person.name}` : "Unassigned"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      style={{
                        background: "#17161b",
                        color: "#e3a4a7",
                        border: "1px solid #41343a",
                        padding: "0.65rem 0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
