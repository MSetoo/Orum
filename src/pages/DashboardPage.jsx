import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { getReportByDate } from "../api/reportsApi";
import { getLocalDate } from "../utils/dateUtils";
import buhosImg from "../utils/img/buhos.png";

export default function DashboardPage() {
  const today = getLocalDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError(null);

      const { data, error } = await getReportByDate(selectedDate);

      if (error) {
        setReport(null);
        setError("Estamos trabajando en eso...");
      } else {
        setReport(data);
      }

      setLoading(false);
    }

    loadReport();
  }, [selectedDate]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div>
            <p className="eyebrow">ORUM</p>
            <h1>Dashboard</h1>
          </div>
        </div>

        <button className="btn btn--ghost" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </header>

      <div className="content-grid">
        <section className="card card--accent">
          <div className="card__head">
            <p className="eyebrow">Reporte diario</p>
          </div>
          <h2>Monitorea por fecha</h2>
          <p className="muted">
            Consulta diariamente tus reportes.
          </p>

          <label className="field field--inline">
            <span>Fecha</span>
            <input
              className="input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>

          <div className="meta-block">
            <span className="muted">Fecha seleccionada</span>
            <span className="meta-value">{selectedDate}</span>
          </div>
        </section>

        <section className="card report-card">
          <div className="card__head">
            <div>
              <p className="eyebrow">Detalle</p>
              <h3>Reporte de operaciones</h3>
            </div>
            <div>
              {loading && <span className="pill pill--soft">Cargando</span>}
              {!loading && report && (
                <span className="eyebrow">Cargado</span>
              )}
              {!loading && !report && (
                <span className="eyebrow">Sin datos</span>
              )}
            </div>
          </div>

          {loading && <p className="muted">Cargando reporte...</p>}

          {!loading && error && (
            <div className="empty-state">
              <img
                className="empty-illustration"
                src={buhosImg}
                alt="Buhos trabajando"
              />
              <p className="muted">Estamos trabajando en eso...</p>
            </div>
          )}

          {report && (
            <div className="report-body">
              {report.report_text}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
