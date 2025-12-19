import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import MovementCard from "../components/MovementCard";
import { getAllMovements } from "../api/movementsApi";
import buhosImg from "../utils/img/buhos.png";
import {
  formatCategory,
  formatDateShort,
  formatMonthLabel,
  formatSignedUsd,
  getDateKey,
  getMovementAmountStatus,
  parseAmountValue,
  resolveMovementAmount,
  resolveMovementBank,
} from "../utils/movementFormatters";
import "../styles/movements.css";

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    bank: "",
    category: "",
  });

  function getDateRangeKeys() {
    if (filteredMovements.length === 0) return [];
    const parseDate = (value) => {
      if (!value) return null;
      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    };

    const dates = filteredMovements
      .map((movement) => getDateKey(movement))
      .filter(Boolean)
      .map((value) => parseDate(value))
      .filter(Boolean);

    if (dates.length === 0) return [];

    const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));
    const start = parseDate(filters.dateFrom) || minDate;
    const end = parseDate(filters.dateTo) || maxDate;
    if (start > end) return [];

    const keys = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      keys.push(`${year}-${month}-${day}`);
      cursor.setDate(cursor.getDate() + 1);
    }
    return keys;
  }

  function getMonthRangeKeys() {
    if (filteredMovements.length === 0) return [];
    const parseDate = (value) => {
      if (!value) return null;
      const date = new Date(`${value}-01T00:00:00`);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    };

    const dates = filteredMovements
      .map((movement) => getDateKey(movement))
      .filter(Boolean)
      .map((value) => parseDate(value.slice(0, 7)))
      .filter(Boolean);

    if (dates.length === 0) return [];

    const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));
    const start = parseDate(filters.dateFrom?.slice(0, 7)) || minDate;
    const end = parseDate(filters.dateTo?.slice(0, 7)) || maxDate;
    if (start > end) return [];

    const keys = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= last) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      keys.push(`${year}-${month}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }

  const bankOptions = useMemo(() => {
    const values = new Set();
    movements.forEach((movement) => {
      const value = resolveMovementBank(movement);
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  }, [movements]);

  const categoryOptions = useMemo(() => {
    const values = new Set();
    movements.forEach((movement) => {
      const value = formatCategory(movement.category);
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  }, [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const dateKey = getDateKey(movement);
      if (filters.dateFrom && dateKey && dateKey < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && dateKey && dateKey > filters.dateTo) {
        return false;
      }
      if (filters.bank && resolveMovementBank(movement) !== filters.bank) {
        return false;
      }
      if (
        filters.category &&
        formatCategory(movement.category) !== filters.category
      ) {
        return false;
      }
      return true;
    });
  }, [filters, movements]);

  const analytics = useMemo(() => {
    const mode = filters.dateFrom || filters.dateTo ? "day" : "month";
    let incomeTotal = 0;
    let expenseTotal = 0;
    const seriesMap = new Map();

    filteredMovements.forEach((movement) => {
      const amountValue = parseAmountValue(resolveMovementAmount(movement));
      const status = getMovementAmountStatus(movement);
      const dateKey =
        mode === "month"
          ? getDateKey(movement).slice(0, 7)
          : getDateKey(movement);

      if (status === "in") incomeTotal += amountValue;
      if (status === "out") expenseTotal += amountValue;

      if (!dateKey) return;
      const current = seriesMap.get(dateKey) || {
        dateKey,
        income: 0,
        expense: 0,
      };
      if (status === "in") current.income += amountValue;
      if (status === "out") current.expense += amountValue;
      seriesMap.set(dateKey, current);
    });

    const dateKeys = mode === "month" ? getMonthRangeKeys() : getDateRangeKeys();
    const series = dateKeys.map((dateKey) => {
      const existing = seriesMap.get(dateKey);
      return (
        existing || {
          dateKey,
          income: 0,
          expense: 0,
        }
      );
    });

    const maxValue = series.reduce(
      (max, item) => Math.max(max, item.income, item.expense),
      0
    );

    return {
      incomeTotal,
      expenseTotal,
      netTotal: incomeTotal - expenseTotal,
      count: filteredMovements.length,
      series,
      maxValue,
      mode,
    };
  }, [filteredMovements, filters.dateFrom, filters.dateTo]);

  const chartPoints = useMemo(() => {
    const width = 520;
    const height = 200;
    const padX = 24;
    const padY = 20;
    const usableWidth = width - padX * 2;
    const usableHeight = height - padY * 2;
    const maxValue = analytics.maxValue || 1;

    if (analytics.series.length === 0) {
      return { width, height, income: [], expense: [] };
    }

    const step =
      analytics.series.length > 1
        ? usableWidth / (analytics.series.length - 1)
        : 0;

    const income = analytics.series.map((item, index) => {
      const x =
        analytics.series.length === 1
          ? padX + usableWidth / 2
          : padX + step * index;
      const y = padY + (1 - item.income / maxValue) * usableHeight;
      return { x, y, dateKey: item.dateKey, value: item.income };
    });

    const expense = analytics.series.map((item, index) => {
      const x =
        analytics.series.length === 1
          ? padX + usableWidth / 2
          : padX + step * index;
      const y = padY + (1 - item.expense / maxValue) * usableHeight;
      return { x, y, dateKey: item.dateKey, value: item.expense };
    });

    return { width, height, income, expense };
  }, [analytics]);

  const axisLabels = useMemo(() => {
    if (analytics.series.length === 0) return [];
    if (analytics.mode === "month") {
      const years = new Set(
        analytics.series.map((item) => item.dateKey.split("-")[0])
      );
      const includeYear = years.size > 1;
      return analytics.series.map((item) =>
        formatMonthLabel(item.dateKey, includeYear)
      );
    }

    const labels = analytics.series.map(() => "");
    labels[0] = formatDateShort(analytics.series[0].dateKey);
    labels[labels.length - 1] = formatDateShort(
      analytics.series[analytics.series.length - 1].dateKey
    );
    return labels;
  }, [analytics]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      dateFrom: "",
      dateTo: "",
      bank: "",
      category: "",
    });
  }

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await getAllMovements();
      if (error) {
        setMovements([]);
        setError("Supabase no responde. Intenta mas tarde.");
      } else {
        const sorted = (data || []).slice().sort((a, b) => {
          const aDate = new Date(a?.email_ts || a?.created_at || 0).getTime();
          const bDate = new Date(b?.email_ts || b?.created_at || 0).getTime();
          if (Number.isNaN(aDate) && Number.isNaN(bDate)) return 0;
          if (Number.isNaN(aDate)) return 1;
          if (Number.isNaN(bDate)) return -1;
          return bDate - aDate;
        });
        setMovements(sorted);
      }
    } catch {
      setMovements([]);
      setError("No se pudo conectar con Supabase. Revisa tu conexion.");
    }

    setLoading(false);
  }

  return (
    <div className="page movements-page">
      <Navbar />

      <div className="movements-layout">
        <section className="insight-card chart-card">
          <div className="insight-head">
            <div>
              <p className="eyebrow">Analitica</p>
              <h2>Ingresos vs gastos</h2>
            </div>
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot legend-dot--in" />
              Ingresos
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--out" />
              Gastos
            </span>
          </div>
          {analytics.series.length === 0 ? (
            <p className="muted">Sin datos para graficas.</p>
          ) : (
            <div className="line-chart">
              <svg
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                aria-label="Ingresos vs gastos"
              >
                {[0.2, 0.4, 0.6, 0.8].map((fraction) => (
                  <line
                    key={fraction}
                    className="line-grid"
                    x1="0"
                    x2={chartPoints.width}
                    y1={chartPoints.height * fraction}
                    y2={chartPoints.height * fraction}
                  />
                ))}
                <polyline
                  className="line-series line-series--out"
                  points={chartPoints.expense
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                />
                <polyline
                  className="line-series line-series--in"
                  points={chartPoints.income
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                />
                {chartPoints.expense.map((point) => (
                  <circle
                    key={`out-${point.dateKey}`}
                    className="line-point line-point--out"
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                  />
                ))}
                {chartPoints.income.map((point) => (
                  <circle
                    key={`in-${point.dateKey}`}
                    className="line-point line-point--in"
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                  />
                ))}
                {axisLabels.map((label, index) => {
                  if (!label) return null;
                  const point = chartPoints.income[index];
                  if (!point) return null;
                  return (
                    <text
                      key={`${analytics.series[index].dateKey}-label`}
                      className="line-axis-label"
                      x={point.x}
                      y={chartPoints.height - 4}
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}
        </section>

        <div className="insight-grid">
          <div className="insight-card">
            <p className="insight-label">Ingresos</p>
            <p className="insight-value insight-value--in">
              {formatSignedUsd(analytics.incomeTotal)}
            </p>
          </div>
          <div className="insight-card">
            <p className="insight-label">Gastos</p>
            <p className="insight-value insight-value--out">
              {formatSignedUsd(-analytics.expenseTotal)}
            </p>
          </div>
          <div className="insight-card">
            <p className="insight-label">Neto</p>
            <p className="insight-value insight-value--net">
              {formatSignedUsd(analytics.netTotal)}
            </p>
          </div>
          <div className="insight-card">
            <p className="insight-label">Movimientos</p>
            <p className="insight-value">{analytics.count}</p>
          </div>
        </div>

        <div className="movements-main">
          <div className="movements-container">
            <div className="movements-header">
              <div>
                <p className="eyebrow">Movimientos</p>
                <h1>Historial</h1>
              </div>
            </div>

            {!loading && !error && (
              <>
                <div className="movements-filters">
                  <label className="filter-field">
                    <span className="filter-label">Desde</span>
                    <input
                      className="input"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    />
                  </label>
                  <label className="filter-field">
                    <span className="filter-label">Hasta</span>
                    <input
                      className="input"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter("dateTo", e.target.value)}
                    />
                  </label>
                  <label className="filter-field">
                    <span className="filter-label">Banco</span>
                    <select
                      className="input"
                      value={filters.bank}
                      onChange={(e) => updateFilter("bank", e.target.value)}
                    >
                      <option value="">Todos</option>
                      {bankOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="filter-field">
                    <span className="filter-label">Categoria</span>
                    <select
                      className="input"
                      value={filters.category}
                      onChange={(e) => updateFilter("category", e.target.value)}
                    >
                      <option value="">Todas</option>
                      {categoryOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="movements-actions">
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </>
            )}

            {loading && <p className="muted">Cargando movimientos...</p>}

            {!loading && error && (
              <div className="empty-state movements-empty">
                <img
                  className="empty-illustration"
                  src={buhosImg}
                  alt="Buhos trabajando"
                />
                <p className="empty-title">Estamos trabajando en eso...</p>
                <p className="muted">{error}</p>
              </div>
            )}

            {!loading && !error && movements.length === 0 && (
              <p className="muted">No hay movimientos registrados.</p>
            )}
            {!loading &&
              !error &&
              movements.length > 0 &&
              filteredMovements.length === 0 && (
                <p className="muted">
                  Sin resultados con los filtros actuales.
                </p>
              )}

            {!loading &&
              !error &&
              filteredMovements.map((movement) => (
                <MovementCard key={movement.id} movement={movement} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
