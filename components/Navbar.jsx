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
  ];

  return (
    <nav style={{ borderBottom: "1px solid #ddd", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
              color: pathname === link.href ? "#111" : "#555",
              fontWeight: pathname === link.href ? 700 : 500,
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {user ? (
        <button type="button" onClick={logout} style={{ padding: "0.5rem 0.75rem" }}>
          Log out
        </button>
      ) : (
        <Link href="/login" style={{ textDecoration: "none" }}>
          Log in
        </Link>
      )}
    </nav>
  );
}
