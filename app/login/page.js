"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        const result = await signup(email, password);
        if (!result?.user) {
          throw new Error("The account was created, but the session is not available yet.");
        }
      } else {
        const result = await login(email, password);
        if (!result?.user) {
          throw new Error("Login was successful, but the session is not available yet.");
        }
      }

      router.replace("/");
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#05080d",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#0d1218",
          border: "1px solid #2b3744",
          borderRadius: "20px",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.3)",
          padding: "2rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#e8edf4",
              display: "grid",
              placeItems: "center",
              color: "#0a0d12",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            B
          </div>
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#f3f6fb" }}>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#a3acba" }}>
            {isSignup ? "Set up your bank manager account." : "Sign in to manage statements and shared spending."}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.4rem", color: "#f3f6fb", fontWeight: 600 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.85rem 0.9rem",
                border: "1px solid #39495d",
                borderRadius: "12px",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
                background: "#0b1117",
                color: "#f3f6fb",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem", color: "#f3f6fb", fontWeight: 600 }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              style={{
                width: "100%",
                padding: "0.85rem 0.9rem",
                border: "1px solid #39495d",
                borderRadius: "12px",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
                background: "#0b1117",
                color: "#f3f6fb",
              }}
            />
          </label>

          {error ? (
            <p
              style={{
                margin: 0,
                color: "#e3a4a7",
                background: "#17161b",
                border: "1px solid #41343a",
                borderRadius: "10px",
                padding: "0.75rem 0.9rem",
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              border: "1px solid #e8edf4",
              borderRadius: "12px",
              padding: "0.9rem 1rem",
              background: "#e8edf4",
              color: "#0a0d12",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p style={{ margin: "1.25rem 0 0", color: "#ccd4dd", textAlign: "center" }}>
          {isSignup ? "Already have an account?" : "Need an account?"}
          <button
            type="button"
            onClick={() => setIsSignup((value) => !value)}
            style={{
              marginLeft: "0.45rem",
              background: "none",
              border: 0,
              color: "#c0c7d1",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isSignup ? "Log in instead" : "Create one"}
          </button>
        </p>
      </section>
    </main>
  );
}
