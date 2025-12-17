import { useState } from "react";
import { signIn } from "../auth/authApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { error } = await signIn(email, password);
    if (error) setError(error.message);
  }

  return (
    <div className="page">
      <div className="auth-brand">
        <h1 className="brand-title">Orum</h1>
        <p className="muted">Manejador de finanzas seguro.</p>
      </div>

      <div className="auth-grid auth-grid--single">
        <section className="card form-card">
          <div>
            <p className="eyebrow">Ingreso</p>
            <h2>Inicia sesion</h2>
            <p className="muted">Usa tu correo para continuar.</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Correo electronico</span>
              <input
                className="input"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Contrasena</span>
              <input
                className="input"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="form__error">{error}</p>}

            <button className="btn btn--primary btn--full" type="submit">
              Entrar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
