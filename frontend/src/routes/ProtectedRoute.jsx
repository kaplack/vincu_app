import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// 👇 Ajusta si tus imports/paths difieren
import {
  selectBusinesses,
  selectBusinessStatus,
} from "@/features/settings/slice/businessSlice";

export default function ProtectedRoute() {
  const location = useLocation();

  // --- Auth (según tu AppLayout) ---
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // Si tienes status en authSlice úsalo; si no, déjalo en "succeeded"
  const authStatus = useSelector((state) => state.auth.status || "succeeded");
  const isAuthLoading = authStatus === "loading" || authStatus === "restoring";

  // --- Business (para onboarding con reglas y SIN loops) ---
  const items = useSelector(selectBusinesses);
  const businessStatus = useSelector(selectBusinessStatus);

  const isSuperAdmin = user?.role === "SUPERADMIN";

  // consideramos "negocios principales" = parentId null
  const rootBusinesses = Array.isArray(items)
    ? items.filter((b) => !b.parentId)
    : [];

  const hasAnyBusiness = rootBusinesses.length > 0;

  // --- 1) No sesión → login ---
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/app" }}
      />
    );
  }

  // --- 2) Sesión restaurando/cargando ---
  if (isAuthLoading || !user) {
    // Pon aquí tu skeleton/spinner si quieres
    return <div className="p-6 text-slate-500">Cargando...</div>;
  }

  // --- 3) Onboarding SOLO con reglas (evitar loops) ---
  // Reglas:
  // - NO superadmin
  // - ya se cargaron negocios (para no redirigir "a ciegas")
  // - realmente no tiene negocio
  // - no estamos ya en /app/configuracion/negocio
  const isOnboardingPath = location.pathname === "/app/configuracion/negocio";

  if (
    !isSuperAdmin &&
    businessStatus === "succeeded" &&
    !hasAnyBusiness &&
    !isOnboardingPath
  ) {
    return <Navigate to="/app/configuracion/negocio" replace />;
  }

  // ✅ OK
  return <Outlet />;
}
