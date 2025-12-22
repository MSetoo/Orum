import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import ReminderCard from "../../components/Remiders/ReminderCard";
import {
  getNextDueDateOnPay,
  getUpcomingDueDate,
} from "../../utils/recurrence";
import "../../styles/reminders.css";

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("reminders")
      .select("*")
      .order("due_date");
    const normalized = (data || []).map((reminder) => {
      const isActive = reminder.is_active !== false;
      if (
        isActive &&
        reminder.is_recurring &&
        !reminder.is_paid &&
        reminder.due_date
      ) {
        const effective = getUpcomingDueDate(reminder);
        const hasTime =
          typeof reminder.due_date === "string" && reminder.due_date.includes("T");
        return {
          ...reminder,
          due_date_effective: hasTime
            ? effective.toISOString()
            : effective.toISOString().split("T")[0],
        };
      }
      return reminder;
    });
    setReminders(normalized);
  }

  async function markAsPaid(reminder) {
    if (reminder.is_recurring) {
      const nextDate = getNextDueDateOnPay(reminder);
      const storeWithTime = reminder.recurrence_type === "daily";
      await supabase
        .from("reminders")
        .update({
          due_date: storeWithTime
            ? nextDate.toISOString()
            : nextDate.toISOString().split("T")[0],
          paid_at: new Date().toISOString(),
          is_paid: false,
        })
        .eq("id", reminder.id);
    } else {
      await supabase
        .from("reminders")
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq("id", reminder.id);
    }

    load();
  }

  async function toggleActive(reminder) {
    const nextActive = reminder.is_active === false;
    await supabase
      .from("reminders")
      .update({ is_active: nextActive })
      .eq("id", reminder.id);

    load();
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div>
            <p className="eyebrow">ORUM</p>
            <h1>Recordatorios</h1>
          </div>
        </div>

        <div className="topbar-actions">
          <Link className="btn btn--ghost" to="/">
            Dashboard
          </Link>
          <Link className="btn btn--primary" to="/reminders/new">
            Nuevo recordatorio
          </Link>
        </div>
      </header>

      <section className="card">
        {reminders.length === 0 && (
          <p className="muted">No hay recordatorios.</p>
        )}
        <div className="reminders-grid">
          {reminders.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onPay={() => markAsPaid(r)}
              onToggleActive={() => toggleActive(r)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
