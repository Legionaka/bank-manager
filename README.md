# Bank Statement Manager

A simple Next.js app for importing Capitec CSV bank statements, assigning transactions to people, and tracking shared-card balances.

## Live checklist

1. Create a Supabase project at https://supabase.com
2. In Supabase, open the SQL editor and run the schema from `supabase/schema.sql`
3. In Authentication > Providers, enable Email/Password
4. Copy the Project URL and the anon/public key from your project settings
5. Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

6. Start the app:

```bash
npm install
npm run dev
```

7. Sign up, add people, upload a CSV, and create rules for automatic matching
8. Review the dashboard and transaction list to confirm balances and allocations

## Practical tools included

- CSV upload and preview
- One-click rule matching during import
- Person management with default `Unsorted` bucket
- Transaction assignment and review
- Dashboard totals for each person and total spend by category
- Empty states for no-data scenarios

## Important notes

- Use the browser-safe public/anon key in the frontend only
- Keep the service-role/secret key server-side only
- CSV parsing happens in the browser for simplicity and speed
- Auth and persistence are handled by Supabase

## Setup

```bash
npm install
npm run dev
```
