"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { addPerson, deletePerson, getPeople, updatePerson } from "@/lib/people";

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPeople() {
    try {
      setLoading(true);
      const data = await getPeople();
      setPeople(data);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load people.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPeople();
  }, []);

  async function handleAddPerson(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const newPerson = await addPerson(name);
      setPeople((current) => [...current, newPerson]);
      setName("");
    } catch (err) {
      setError(err.message || "Could not create person.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(personId) {
    setSaving(true);
    setError("");

    try {
      const updated = await updatePerson(personId, editingName);
      setPeople((current) =>
        current.map((person) => (person.id === personId ? { ...person, name: updated.name } : person))
      );
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError(err.message || "Could not update person.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePerson(personId) {
    setSaving(true);
    setError("");

    try {
      await deletePerson(personId);
      setPeople((current) => current.filter((person) => person.id !== personId));
    } catch (err) {
      setError(err.message || "Could not delete person.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem 0 3rem" }}>
        <h1 style={{ color: "#f3f6fb" }}>People</h1>

        <form
          onSubmit={handleAddPerson}
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            background: "#0d1218",
            border: "1px solid #2b3744",
            borderRadius: "16px",
            padding: "1rem",
            width: "100%",
            maxWidth: "640px",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.18)",
          }}
        >
          <input
            type="text"
            placeholder="Add a person"
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{ flex: "1 1 220px" }}
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            style={{
              padding: "0.85rem 1rem",
              background: "#e8edf4",
              color: "#0a0d12",
              fontWeight: 700,
              border: "1px solid #e8edf4",
            }}
          >
            {saving ? "Saving..." : "Add person"}
          </button>
        </form>

        {error ? <p style={{ color: "#e3a4a7" }}>{error}</p> : null}

        {loading ? (
          <p style={{ color: "#a3acba" }}>Loading people...</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem", maxWidth: "680px" }}>
            {people.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #39495d",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  background: "#0b1117",
                  color: "#a3acba",
                }}
              >
                No people yet. Add a person to get started.
              </div>
            ) : (
              people.map((person) => {
                const isEditing = editingId === person.id;

                return (
                  <div
                    key={person.id}
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
                    {isEditing ? (
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        style={{ flex: 1, minWidth: "180px" }}
                      />
                    ) : (
                      <strong style={{ color: "#f3f6fb" }}>{person.name}</strong>
                    )}

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(person.id)}
                            disabled={saving || !editingName.trim()}
                            style={{ padding: "0.65rem 0.9rem", background: "#e8edf4", color: "#0a0d12", border: "1px solid #e8edf4" }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            style={{ padding: "0.65rem 0.9rem", background: "#0b1117", color: "#f3f6fb", border: "1px solid #2b3744" }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(person.id);
                              setEditingName(person.name);
                            }}
                            style={{ padding: "0.65rem 0.9rem", background: "#0b1117", color: "#f3f6fb", border: "1px solid #2b3744" }}
                          >
                            Rename
                          </button>
                          {person.name !== "Unsorted" ? (
                            <button
                              type="button"
                              onClick={() => handleDeletePerson(person.id)}
                              style={{ padding: "0.65rem 0.9rem", background: "#17161b", color: "#e3a4a7", border: "1px solid #41343a" }}
                            >
                              Delete
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
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
