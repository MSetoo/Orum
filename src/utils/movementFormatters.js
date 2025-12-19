export function formatCategory(category) {
  if (!category) return "Sin categoria";
  const cleaned = String(category).replace(/_/g, " ").toLowerCase();
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeText(value) {
  if (!value) return "";
  return String(value).trim();
}

export function getDateKey(movement) {
  const raw = movement?.email_ts || movement?.created_at;
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMovementDate(movement) {
  const raw = movement?.email_ts || movement?.created_at;
  if (!raw) return "Fecha no disponible";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleString();
}

export function formatDateShort(dateKey) {
  if (!dateKey) return "";
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  return `${parts[2]}/${parts[1]}`;
}

export function formatMonthLabel(monthKey, includeYear) {
  if (!monthKey) return "";
  const parts = monthKey.split("-");
  if (parts.length < 2) return monthKey;
  const monthIndex = Number(parts[1]) - 1;
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const monthLabel = months[monthIndex] || monthKey;
  if (!includeYear) return monthLabel;
  return `${monthLabel} ${parts[0].slice(-2)}`;
}

export function getMovementSubject(movement) {
  const subject =
    normalizeText(movement?.subject) ||
    normalizeText(movement?.metadata?.subject) ||
    "Movimiento";
  return subject.replace(
    /retiro\s+cajero\s+aut\.?/gi,
    "Retiro cajero automatico"
  );
}

export function resolveMovementCounterparty(movement) {
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

export function resolveMovementAmount(movement) {
  const metadata = movement?.metadata || {};
  return (
    movement?.amount_text ||
    metadata?.transfer_details?.amount_text ||
    metadata?.amount_text ||
    ""
  );
}

export function parseAmountValue(amount) {
  if (!amount) return 0;
  const cleaned = String(amount).replace(/[^0-9,.-]/g, "").replace(/,/g, "");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.abs(value);
}

export function normalizeAmount(amount) {
  if (!amount) return "";
  return String(amount).replace(/^[+-]\s*/, "").trim();
}

export function formatUsd(amount) {
  return `USD ${amount.toFixed(2)}`;
}

export function formatSignedUsd(amount) {
  if (amount === 0) return formatUsd(0);
  const sign = amount > 0 ? "+" : "-";
  return `${sign}${formatUsd(Math.abs(amount))}`;
}

export function getMovementAmountStatus(movement) {
  const metadata = movement?.metadata || {};
  const subject = getMovementSubject(movement).toLowerCase();
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

export function formatMovementAmount(amount, status) {
  if (!amount) return "";
  const normalized = normalizeAmount(amount);
  if (status === "neutral") return normalized;
  const sign = status === "in" ? "+" : "-";
  if (/^[+-]/.test(normalized)) return normalized;
  return `${sign}${normalized}`;
}

export function resolveMovementBank(movement) {
  const metadata = movement?.metadata || {};
  return movement?.bank || metadata?.transfer_details?.institution || "";
}

export function getMovementPaymentMethod(subject) {
  const text = subject.toLowerCase();
  if (text.includes("debit") || text.includes("debito")) return "Debito";
  if (text.includes("credito") || text.includes("tc")) return "Credito";
  return "";
}

export function getMovementFlags(movement) {
  const category = normalizeText(movement?.category).toLowerCase();
  const subject = getMovementSubject(movement).toLowerCase();
  const isTransfer =
    category.includes("transfer") || subject.includes("transferencia");
  const isConsumption =
    category.includes("consumo") || subject.includes("compra");
  const isWithdrawal = category.includes("retiro") || subject.includes("retiro");
  const isDeposit = category.includes("deposito") || subject.includes("deposito");
  return { isTransfer, isConsumption, isWithdrawal, isDeposit };
}

export function getMovementCounterpartyLabel(flags) {
  if (flags.isTransfer) return "Para";
  if (flags.isConsumption) return "Comercio";
  if (flags.isDeposit) return "Origen";
  if (flags.isWithdrawal) return "Ubicacion";
  return "Contraparte";
}
