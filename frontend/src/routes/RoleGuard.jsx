// src/routes/RoleGuard.jsx
import { Navigate, Outlet, useOutletContext } from "react-router-dom";

export default function RoleGuard({ allow = [] }) {
  const ctx = useOutletContext(); // 👈 traer el context del AppLayout
  const { businessRole, isSuperAdmin, hasBusinessContext } = ctx || {};

  // 1️⃣ No hay contexto de negocio
  if (!hasBusinessContext) {
    if (!isSuperAdmin)
      return <Navigate to="/app/configuracion/negocio" replace />;
    return <Navigate to="/app" replace />;
  }

  // 2️⃣ Superadmin con contexto → bypass total
  if (isSuperAdmin) {
    return <Outlet context={ctx} />; // ✅ forward
  }

  // 3️⃣ Usuario normal con negocio pero sin rol
  if (!businessRole) {
    return <Navigate to="/app" replace />;
  }

  // 4️⃣ Validar rol del negocio
  if (!allow.includes(businessRole)) {
    return <Navigate to="/app" replace />;
  }

  // ✅ Autorizado
  return <Outlet context={ctx} />; // ✅ forward
}
