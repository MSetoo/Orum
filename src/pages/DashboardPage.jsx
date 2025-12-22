import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { getReportByDate } from "../api/reportsApi";
import { getLocalDate } from "../utils/dateUtils";
import buhosImg from "../utils/img/buhos.png";
import "../styles/movements.css";

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

        <div className="topbar-actions">
          <Link className="btn btn--ghost" to="/movements">
            Movimientos
          </Link>
          <Link className="btn btn--ghost" to="/reminders">
            <svg
              className="btn__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
              <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
            </svg>
            Recordatorios
          </Link>
          <button className="btn btn--ghost" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <div className="dashboard-shell">
        <div className="dashboard-grid">
          <section className="card card--accent report-filter-card">
            <div className="card__head">
              <p className="eyebrow">Reporte diario</p>
            </div>
            <h2>Monitorea por fecha</h2>
            <p className="muted">Consulta diariamente tus reportes.</p>

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
    </div>
  );
}
