import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { getReportByDate } from "../api/reportsApi";
import { getLocalDate } from "../utils/dateUtils";

export default function DashboardPage() {
  const today = getLocalDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Cargar reporte cuando cambia la fecha
  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError(null);

      const { data, error } = await getReportByDate(selectedDate);

      if (error) {
        setReport(null);
      } else {
        setReport(data);
      }

      setLoading(false);
    }

    loadReport();
  }, [selectedDate]);

  // 🔐 Cerrar sesión
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div style={{ padding: 40, maxWidth: 900 }}>
      {/* HEADER */}
      <h1>Dashboard ORUM</h1>

      <button onClick={handleLogout}>Cerrar sesión</button>

      <hr />

      {/* SELECTOR DE FECHA */}
      <section style={{ marginBottom: 20 }}>
        <h2>Reporte diario</h2>

        <label>
          Selecciona una fecha:{" "}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </section>

      {/* CONTENIDO */}
      <section>
        <p>
          <strong>Fecha:</strong> {selectedDate}
        </p>

        {loading && <p>Cargando reporte...</p>}

        {!loading && !report && (
          <p>No existe reporte para esta fecha</p>
        )}

        {report && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f7f7f7",
              padding: 20,
              borderRadius: 6,
              lineHeight: 1.5,
            }}
          >
            {report.report_text}
          </pre>
        )}
      </section>
    </div>
  );
}
