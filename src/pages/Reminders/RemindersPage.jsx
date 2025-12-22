import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import ReminderCard from "../../components/Remiders/ReminderCard";

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
    setReminders(data || []);
  }

  async function markAsPaid(id) {
    await supabase
      .from("reminders")
      .update({ is_paid: true, paid_at: new Date() })
      .eq("id", id);

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
        {reminders.map((r) => (
          <ReminderCard key={r.id} reminder={r} onPay={markAsPaid} />
        ))}
      </section>
    </div>
  );
}
