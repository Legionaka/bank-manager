"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/upload", label: "Upload" },
    { href: "/transactions", label: "Transactions" },
    { href: "/people", label: "People" },
    { href: "/rules", label: "Rules" },
  ];

  return (
    <nav
      style={{
        borderBottom: "1px solid #2b3744",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                color: active ? "#f3f6fb" : "#a3acba",
                background: active ? "#1a232d" : "transparent",
                borderRadius: "10px",
                padding: "0.55rem 0.8rem",
                fontWeight: active ? 700 : 500,
                border: active ? "1px solid #39495d" : "1px solid transparent",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {user ? (
        <button
          type="button"
          onClick={logout}
          style={{
            padding: "0.6rem 0.9rem",
            background: "#e8edf4",
            color: "#0a0d12",
            fontWeight: 700,
            border: "1px solid #e8edf4",
          }}
        >
          Log out
        </button>
      ) : (
        <Link
          href="/login"
          style={{
            textDecoration: "none",
            color: "#f3f6fb",
            fontWeight: 700,
          }}
        >
          Log in
        </Link>
      )}
    </nav>
  );
}
