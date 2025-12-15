import { useEffect, useState } from "react";
import { signIn, signOut, getSession } from "./auth/authApi.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSession().then(({ data }) => setSession(data.session ?? null));
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");

    const { data, error } = await signIn(email, password);
    if (error) return setMsg(" " + error.message);
    

    setSession(data.session);
    setMsg(" Logueado");
  }

  async function handleLogout() {
    setMsg("");
    const { error } = await signOut();
    if (error) return setMsg(" " + error.message);

    setSession(null);
    setMsg(" Sesión cerrada");
  }

  return (
    <div style={{ padding: 40, maxWidth: 420 }}>
      <h1>Login ORUM</h1>

      {session ? (
        <>
          <p><b>Usuario:</b> {session.user.email}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button>Iniciar sesión</button>
          
        </form>
      )}

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
