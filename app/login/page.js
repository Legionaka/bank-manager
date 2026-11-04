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
        await signup(email, password);
      } else {
        await login(email, password);
      }
      router.push("/");
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: "420px", margin: "4rem auto", padding: "1.5rem" }}>
      <h1>{isSignup ? "Create account" : "Log in"}</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          />
        </label>

        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        <button type="submit" disabled={loading} style={{ padding: "0.75rem" }}>
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        {isSignup ? "Already have an account?" : "Need an account?"}
        <button
          type="button"
          onClick={() => setIsSignup((value) => !value)}
          style={{ marginLeft: "0.5rem", background: "none", border: 0, color: "#0a66c2", cursor: "pointer" }}
        >
          {isSignup ? "Log in instead" : "Create one"}
        </button>
      </p>
    </main>
  );
}
