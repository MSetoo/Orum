import ReminderBadge from "./ReminderBadge";
import { formatDate, isOverdue, isDueSoon } from "../../utils/dateHelpers";

export default function ReminderCard({ reminder, onPay, onToggleActive }) {
  const dueDate = reminder.due_date_effective || reminder.due_date;
  const overdue = isOverdue(dueDate, reminder.is_paid);
  const soon = isDueSoon(dueDate, reminder.is_paid);
  const isActive = reminder.is_active !== false;
  const status = reminder.is_paid
    ? "paid"
    : overdue
      ? "overdue"
      : soon
        ? "soon"
        : "upcoming";
  const recurrenceUnit =
    reminder.recurrence_type === "daily"
      ? "Cada dia"
      : reminder.recurrence_type === "weekly"
        ? "Cada semana"
        : reminder.recurrence_type === "yearly"
          ? "Cada ano"
          : "Cada mes";
  const recurrenceLabel = reminder.is_recurring ? recurrenceUnit : "";

  return (
    <div
      className={`reminder-card reminder-card--${status} ${
        isActive ? "" : "reminder-card--inactive"
      }`}
    >
      <div className="reminder-card__head">
        <h3 className="reminder-card__title">{reminder.title}</h3>
        <div className="reminder-card__actions">
          <label className="reminder-switch">
            <input
              type="checkbox"
              checked={isActive}
              onChange={onToggleActive}
            />
            <span className="reminder-switch__track">
              <span className="reminder-switch__thumb" />
            </span>
          </label>
          <span className="pill pill--soft">
            {reminder.is_paid ? "Pagado" : isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="reminder-card__badges">
        <ReminderBadge text={reminder.category} color="#2563eb" />
        <ReminderBadge text={reminder.type} color="#7c3aed" />
      </div>

      <div className="reminder-card__meta">
        <p className="muted">Vence: {formatDate(dueDate)}</p>
        {reminder.amount && (
          <span className="reminder-card__amount">
            USD {Number(reminder.amount).toFixed(2)}
          </span>
        )}
      </div>

      {recurrenceLabel && (
        <p className="reminder-card__recurrence">Repite: {recurrenceLabel}</p>
      )}

      {!reminder.is_paid && isActive && (
        <button className="btn btn--ghost" onClick={onPay}>
          Marcar como pagado
        </button>
      )}
    </div>
  );
}
