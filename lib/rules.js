import { supabase } from "@/lib/supabase";

export async function getRules() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addRule({ keyword, category = "", personId = null }) {
  const trimmedKeyword = String(keyword || "").trim();

  if (!trimmedKeyword) {
    throw new Error("A keyword is required.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData?.user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("rules")
    .insert({
      user_id: userData.user.id,
      keyword: trimmedKeyword,
      category: category || null,
      person_id: personId || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteRule(ruleId) {
  const { error } = await supabase.from("rules").delete().eq("id", ruleId);

  if (error) {
    throw error;
  }

  return true;
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
