import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSession } from "../auth/useSession";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import MovementsPage from "../pages/MovementsPage";
import RemindersPage from "../pages/Reminders/RemindersPage";
import NewReminderPage from "../pages/Reminders/NewReminderPage";

function ReloadToDashboard({ session }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    const navEntries = performance.getEntriesByType
      ? performance.getEntriesByType("navigation")
      : [];
    const navType =
      navEntries[0]?.type ||
      (performance?.navigation?.type === 1 ? "reload" : "navigate");
    if (navType === "reload" && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [session, location.pathname, navigate]);

  return null;
}

export default function AppRouter() {
  const { session, loading } = useSession();

  if (loading) return <p>Cargando...</p>;

  return (
    <BrowserRouter>
      <ReloadToDashboard session={session} />
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
        <Route
          path="/movements"
          element={session ? <MovementsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/reminders"
          element={session ? <RemindersPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/reminders/new"
          element={session ? <NewReminderPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
