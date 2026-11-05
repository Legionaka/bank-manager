import { supabase } from "@/lib/supabase";
import { getPeople } from "@/lib/people";

function toNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export async function saveTransactions(rows, statementName = "uploaded.csv") {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData?.user) {
    throw new Error("You must be logged in.");
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const payload = rows.map((row) => ({
    id: row.id,
    user_id: userData.user.id,
    date: row.date || "",
    time: row.time || "",
    description: String(row.description || "").trim(),
    original_description: String(row.originalDescription || row.description || "").trim(),
    parent_category: String(row.parentCategory || "").trim(),
    category: String(row.category || "").trim(),
    amount: toNumber(row.amount),
    fee: toNumber(row.fee),
    balance: toNumber(row.balance),
    account_last4: String(row.accountLast4 || "").trim(),
    person_id: row.personId ?? null,
    statement_name: String(statementName || "uploaded.csv").trim(),
  }));

  const { data, error } = await supabase.from("transactions").upsert(payload, { onConflict: "id" }).select();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getTransactions() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const people = await getPeople();
  const peopleMap = new Map(people.map((person) => [person.id, person.name]));

  return (data ?? []).map((transaction) => ({
    ...transaction,
    person_name: transaction.person_id ? peopleMap.get(transaction.person_id) || "Unsorted" : "Unsorted",
  }));
}

export async function assignPerson(transactionId, personId) {
  const { data, error } = await supabase
    .from("transactions")
    .update({ person_id: personId || null })
    .eq("id", transactionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function applyRules(transactions, rules = []) {
  return transactions.map((transaction) => {
    const description = `${transaction.description || ""} ${transaction.original_description || ""}`.toLowerCase();

    const matchedRule = rules.find((rule) => {
      if (!rule.keyword) {
        return false;
      }

      return description.includes(String(rule.keyword).toLowerCase());
    });

    if (!matchedRule) {
      return transaction;
    }

    return {
      ...transaction,
      person_id: matchedRule.person_id,
    };
  });
}
