import { supabase } from "./supabaseClient";

export async function getMovements(limit = 100) {
  return supabase
    .from("whatsapp_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getAllMovements(pageSize = 1000) {
  let allRows = [];
  let page = 0;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("whatsapp_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return { data: allRows, error };
    }

    const rows = data || [];
    allRows = allRows.concat(rows);

    if (rows.length < pageSize) break;
    page += 1;
  }

  return { data: allRows, error: null };
}
