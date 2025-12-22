import { useState } from "react";
import { Link } from "react-router-dom";

export default function ReminderForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Servicios",
    type: "membership",
    amount: "",
    start_date: "",
    due_date: "",
    is_recurring: false,
    recurrence_type: "monthly",
    recurrence_interval: 1,
  });

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title || !form.due_date) return;
    const startDate = form.start_date || new Date().toISOString().split("T")[0];
    onSubmit({
      ...form,
      start_date: startDate,
      recurrence_interval: 1,
    });
  }

  return (
    <form className="reminder-form" onSubmit={submit}>
      <div className="field">
        <span className="filter-label">Titulo</span>
        <input
          className="input"
          name="title"
          placeholder="Titulo"
          onChange={handleChange}
          required
        />
      </div>
      <div className="field">
        <span className="filter-label">Descripcion</span>
        <textarea
          className="input"
          name="description"
          placeholder="Descripcion"
          onChange={handleChange}
        />
      </div>

      <div className="reminder-form__grid">
        <div className="field">
          <span className="filter-label">Categoria</span>
          <select className="input" name="category" onChange={handleChange}>
            <option>Servicios</option>
            <option>Transporte</option>
            <option>Alimentacion</option>
            <option>Prestamos</option>
            <option>Otros</option>
          </select>
        </div>

        <div className="field">
          <span className="filter-label">Tipo</span>
          <select className="input" name="type" onChange={handleChange}>
            <option value="membership">Membresia</option>
            <option value="debt">Deuda</option>
            <option value="loan">Prestamo</option>
          </select>
        </div>

        <div className="field">
          <span className="filter-label">Monto</span>
          <input
            className="input"
            name="amount"
            type="number"
            step="0.01"
            placeholder="Monto"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <span className="filter-label">Vence</span>
          <input
            className="input"
            name="due_date"
            type="date"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="reminder-form__recurrence">
        <label className="reminder-form__toggle">
          <input
            type="checkbox"
            name="is_recurring"
            checked={form.is_recurring}
            onChange={handleChange}
          />
          <span>Repetir recordatorio</span>
        </label>

        <div className="reminder-form__recurrence-row">
          <span className="filter-label">Frecuencia</span>
          <select
            className="input reminder-form__recurrence-select"
            name="recurrence_type"
            value={form.recurrence_type}
            onChange={handleChange}
            disabled={!form.is_recurring}
          >
            <option value="daily">Cada dia</option>
            <option value="weekly">Cada semana</option>
            <option value="monthly">Cada mes</option>
            <option value="yearly">Cada año</option>
          </select>
        </div>

        {form.is_recurring && (
          <p className="reminder-form__hint">
            El recordatorio se repetira automaticamente en cada periodo.
          </p>
        )}
      </div>

      <div className="reminder-form__actions">
        <Link className="btn btn--ghost" to="/reminders">
          Cancelar
        </Link>
        <button className="btn btn--primary" disabled={loading}>
          Guardar
        </button>
      </div>
    </form>
  );
}
