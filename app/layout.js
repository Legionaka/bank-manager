import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: {
    default: "Bank Statement Manager",
    template: "%s | Bank Statement Manager",
  },
  description:
    "Track bank statements, shared pot balances, and monthly spending with simple CSV uploads and assignment rules.",
  keywords: [
    "bank manager",
    "statement tracker",
    "shared expenses",
    "CSV upload",
    "personal finance",
    "budget planner",
  ],
  openGraph: {
    title: "Bank Statement Manager",
    description:
      "Track bank statements, shared pot balances, and monthly spending with simple CSV uploads and assignment rules.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
