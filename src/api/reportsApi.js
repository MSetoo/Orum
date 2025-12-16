import { supabase } from "./supabaseClient";

export async function getReportByDate(date) {
    return supabase
        .from("whatsapp_reports_daily")
        .select("report_date, report_text")
        .eq("report_date", date)
        .single();
}