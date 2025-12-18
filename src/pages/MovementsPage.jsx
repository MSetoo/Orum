import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllMovements } from "../api/movementsApi";
import buhosImg from "../utils/img/buhos.png";
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

  function formatCategory(category) {
    if (!category) return "Sin categoria";
    const cleaned = String(category).replace(/_/g, " ").toLowerCase();
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function normalizeText(value) {
    if (!value) return "";
    return String(value).trim();
  }

  function getDateKey(movement) {
    const raw = movement?.email_ts || movement?.created_at;
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getSubject(movement) {
    const subject =
      normalizeText(movement?.subject) ||
      normalizeText(movement?.metadata?.subject) ||
      "Movimiento";
    return subject.replace(/retiro\s+cajero\s+aut\.?/gi, "Retiro cajero automatico");
  }

  function resolveCounterparty(movement) {
    const metadata = movement?.metadata || {};
    const fromMetadata =
      metadata?.transfer_details?.beneficiary ||
      metadata?.counterparty ||
      metadata?.merchant ||
      metadata?.beneficiary;
    const raw = movement?.counterparty || fromMetadata || "No registrada";
    const cleaned = String(raw).trim();
    if (/ub(?:r|er)\s*pending\.?ub/i.test(cleaned)) return "Uber";
    if (/ub\s*eats\s*ecuado/i.test(cleaned)) return "Uber Eats";
    if (/uber/i.test(cleaned)) return "Uber";
    return cleaned;
  }

  function resolveAmount(movement) {
    const metadata = movement?.metadata || {};
    return (
      movement?.amount_text ||
      metadata?.transfer_details?.amount_text ||
      metadata?.amount_text ||
      ""
    );
  }

  function normalizeAmount(amount) {
    if (!amount) return "";
    return String(amount).replace(/^[+-]\s*/, "").trim();
  }

  function getAmountStatus(movement) {
    const metadata = movement?.metadata || {};
    const subject = getSubject(movement).toLowerCase();
    const category = normalizeText(movement?.category).toLowerCase();

    if (metadata?.self_transfer) return "neutral";
    if (subject.includes("transferencia entre cuentas propias")) {
      return "neutral";
    }

    if (
      subject.includes("deposito") ||
      subject.includes("ingreso") ||
      subject.includes("abono") ||
      category.includes("deposito") ||
      category.includes("ingreso")
    ) {
      return "in";
    }

    return "out";
  }

  function formatAmount(amount, status) {
    if (!amount) return "";
    const normalized = normalizeAmount(amount);
    if (status === "neutral") return normalized;
    const sign = status === "in" ? "+" : "-";
    if (/^[+-]/.test(normalized)) return normalized;
    return `${sign}${normalized}`;
  }

  function resolveBank(movement) {
    const metadata = movement?.metadata || {};
    return movement?.bank || metadata?.transfer_details?.institution || "";
  }

  function getPaymentMethod(subject) {
    const text = subject.toLowerCase();
    if (text.includes("debit") || text.includes("debito")) return "Debito";
    if (text.includes("credito") || text.includes("tc")) return "Credito";
    return "";
  }

  function getFlags(movement) {
    const category = normalizeText(movement?.category).toLowerCase();
    const subject = getSubject(movement).toLowerCase();
    const isTransfer =
      category.includes("transfer") || subject.includes("transferencia");
    const isConsumption =
      category.includes("consumo") || subject.includes("compra");
    const isWithdrawal =
      category.includes("retiro") || subject.includes("retiro");
    const isDeposit =
      category.includes("deposito") || subject.includes("deposito");
    return { isTransfer, isConsumption, isWithdrawal, isDeposit };
  }

  function getCounterpartyLabel(flags) {
    if (flags.isTransfer) return "Para";
    if (flags.isConsumption) return "Comercio";
    if (flags.isDeposit) return "Origen";
    if (flags.isWithdrawal) return "Ubicacion";
    return "Contraparte";
  }

  function formatDateTime(movement) {
    const raw = movement?.email_ts || movement?.created_at;
    if (!raw) return "Fecha no disponible";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);
    return date.toLocaleString();
  }

  const bankOptions = useMemo(() => {
    const values = new Set();
    movements.forEach((movement) => {
      const value = resolveBank(movement);
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
      if (filters.bank && resolveBank(movement) !== filters.bank) {
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
              <button className="btn btn--ghost" type="button" onClick={clearFilters}>
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
        {!loading && !error && movements.length > 0 && filteredMovements.length === 0 && (
          <p className="muted">Sin resultados con los filtros actuales.</p>
        )}

        {!loading &&
          !error &&
          filteredMovements.map((movement) => (
            <div className="movement-card" key={movement.id}>
              {(() => {
                const subject = getSubject(movement);
                const rawAmount = resolveAmount(movement);
                const amountStatus = getAmountStatus(movement);
                const amount = formatAmount(rawAmount, amountStatus);
                const counterparty = resolveCounterparty(movement);
                const bank = resolveBank(movement);
                const flags = getFlags(movement);
                const paymentMethod = flags.isConsumption
                  ? getPaymentMethod(subject)
                  : "";
                const counterpartyLabel = getCounterpartyLabel(flags);
                return (
                  <div className="movement-row">
                    <div className="movement-info">
                      <p className="movement-date">
                        {formatDateTime(movement)}
                      </p>
                      <p className="movement-subject">{subject}</p>
                      <div className="movement-meta">
                        {amount && (
                          <span
                            className={`movement-amount movement-amount--${amountStatus}`}
                          >
                            {amount}
                          </span>
                        )}
                        {!flags.isWithdrawal && (
                          <span className="movement-meta-item">
                            <span className="movement-meta-label">
                              {counterpartyLabel}
                            </span>
                            <span>{counterparty}</span>
                          </span>
                        )}
                        {flags.isTransfer && bank && (
                          <span className="movement-meta-item">
                            <span className="movement-meta-label">Banco</span>
                            <span>{bank}</span>
                          </span>
                        )}
                        {paymentMethod && (
                          <span className="movement-meta-item">
                            <span className="movement-meta-label">Metodo</span>
                            <span>{paymentMethod}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                  </div>
                );
              })()}
            </div>
          ))}
      </div>
    </div>
  );
}
