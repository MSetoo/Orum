import { useState } from "react";

export default function ReminderForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Servicios",
    type: "membership",
    amount: "",
    start_date: "",
    due_date: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title || !form.start_date || !form.due_date) return;
    onSubmit(form);
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
          <span className="filter-label">Inicio</span>
          <input
            className="input"
            name="start_date"
            type="date"
            onChange={handleChange}
            required
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

      <button className="btn btn--primary" disabled={loading}>
        Guardar
      </button>
    </form>
  );
}
