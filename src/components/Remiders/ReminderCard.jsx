import ReminderBadge from "./ReminderBadge";
import { formatDate, isOverdue, isDueSoon } from "../../utils/dateHelpers";

export default function ReminderCard({ reminder, onPay }) {
  const overdue = isOverdue(reminder.due_date, reminder.is_paid);
  const soon = isDueSoon(reminder.due_date, reminder.is_paid);
  const status = reminder.is_paid
    ? "paid"
    : overdue
      ? "overdue"
      : soon
        ? "soon"
        : "upcoming";

  return (
    <div className={`reminder-card reminder-card--${status}`}>
      <div className="reminder-card__head">
        <h3 className="reminder-card__title">{reminder.title}</h3>
        <span className="pill pill--soft">
          {reminder.is_paid ? "Pagado" : "Pendiente"}
        </span>
      </div>

      <div className="reminder-card__badges">
        <ReminderBadge text={reminder.category} color="#2563eb" />
        <ReminderBadge text={reminder.type} color="#7c3aed" />
      </div>

      <div className="reminder-card__meta">
        <p className="muted">Vence: {formatDate(reminder.due_date)}</p>
        {reminder.amount && (
          <span className="reminder-card__amount">
            USD {Number(reminder.amount).toFixed(2)}
          </span>
        )}
      </div>

      {!reminder.is_paid && (
        <button className="btn btn--ghost" onClick={() => onPay(reminder.id)}>
          Marcar como pagado
        </button>
      )}
    </div>
  );
}
