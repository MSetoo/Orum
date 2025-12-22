
import { supabase } from "../../api/supabaseClient";
import ReminderForm from "../../components/Remiders/ReminderForm";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/reminders.css";

export default function NewReminderPage() {
  const navigate = useNavigate();

  async function handleSubmit(data) {
    await supabase.from("reminders").insert(data);
    navigate("/reminders");
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div>
            <p className="eyebrow">ORUM</p>
            <h1>Nuevo recordatorio</h1>
          </div>
        </div>

        
      </header>

      <section className="card reminder-form-card">
        <ReminderForm onSubmit={handleSubmit} />
      </section>
    </div>
  );
}
