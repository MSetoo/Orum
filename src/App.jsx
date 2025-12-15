import { useEffect } from "react";
import { supabase } from "./api/supabaseClient";

export default function App() {
  useEffect(() => {
    console.log(" Probando conexión Supabase...");

    supabase
      .from("whatsapp_reports_daily") 
      .select("id")
      .range(0, 0)
      .then(({ data, error }) => {
        console.log(" DATA:", data);
        console.log("ERROR:", error);
      });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Supabase</h1>
      <p>Soy mateo </p>
    </div>
  );
}
