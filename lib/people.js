import { supabase } from "@/lib/supabase";

export async function getPeople() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addPerson(name) {
  const trimmed = String(name || "").trim();

  if (!trimmed) {
    throw new Error("Person name is required.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData?.user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("people")
    .insert({
      user_id: userData.user.id,
      name: trimmed,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePerson(personId, name) {
  const trimmed = String(name || "").trim();

  if (!trimmed) {
    throw new Error("Person name is required.");
  }

  const { data, error } = await supabase
    .from("people")
    .update({ name: trimmed })
    .eq("id", personId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePerson(personId) {
  const { data: currentPerson, error: lookupError } = await supabase
    .from("people")
    .select("name")
    .eq("id", personId)
    .single();

  if (lookupError) {
    throw lookupError;
  }

  if (currentPerson?.name === "Unsorted") {
    throw new Error("The Unsorted bucket cannot be deleted.");
  }

  const { error } = await supabase.from("people").delete().eq("id", personId);

  if (error) {
    throw error;
  }

  return true;
}
