"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main style={{ padding: "2rem" }}>
        <h1>Dashboard</h1>
        <p>TODO: show each person’s balance, category spend totals, and unsorted count.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
            <strong>Person balances</strong>
            <div>TODO</div>
          </div>
          <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
            <strong>Category spend</strong>
            <div>TODO</div>
          </div>
          <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
            <strong>Unsorted</strong>
            <div>TODO</div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
