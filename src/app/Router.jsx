import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "../auth/useSession";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

export default function AppRouter() {
  const { session, loading } = useSession();

  if (loading) return <p>Cargando...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Invitado */}
        <Route
          path="/login"
          element={!session ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* Protegido */}
        <Route
          path="/"
          element={session ? <DashboardPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
