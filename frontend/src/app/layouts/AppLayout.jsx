// frontend/src/app/layouts/AppLayout.jsx
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Sidebar } from "@/components/private/Sidebar";

import {
  fetchBusinessesThunk,
  setSelectedBusinessId,
  setSelectedBranchId,
  switchBusinessThunk,
  selectBusinesses,
  selectBusinessStatus,
  selectSelectedBusinessId,
  selectSelectedBranchId,
} from "@/features/settings/slice/businessSlice";

export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const norm = (v) =>
    String(v || "")
      .trim()
      .toUpperCase();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const items = useSelector(selectBusinesses);
  const businessStatus = useSelector(selectBusinessStatus);
  const selectedBusinessId = useSelector(selectSelectedBusinessId);
  const selectedBranchId = useSelector(selectSelectedBranchId);

  useEffect(() => {
    if (!token) return;
    if (businessStatus === "idle") dispatch(fetchBusinessesThunk());
  }, [token, businessStatus, dispatch]);

  const rootBusinesses = useMemo(() => {
    return (items || []).filter((b) => !b.parentId);
  }, [items]);

  const currentBusiness = useMemo(() => {
    if (!rootBusinesses.length) return null;
    return (
      rootBusinesses.find((b) => b.id === selectedBusinessId) ||
      rootBusinesses[0]
    );
  }, [rootBusinesses, selectedBusinessId]);

  const hasBusinessContext = Boolean(currentBusiness?.id);

  const isOnboardingUser =
    !isSuperAdmin &&
    businessStatus === "succeeded" &&
    rootBusinesses.length === 0;

  useEffect(() => {
    if (!token || !user || !rootBusinesses.length) return;

    const principals = rootBusinesses;
    const backendId = user.currentBusinessId || null;
    const exists = backendId && principals.some((b) => b.id === backendId);

    if (exists && selectedBusinessId !== backendId) {
      dispatch(setSelectedBusinessId(backendId));
      return;
    }

    if (!exists) {
      const fallbackId = principals[0]?.id;
      if (fallbackId) dispatch(switchBusinessThunk(fallbackId));
    }
  }, [token, user, rootBusinesses, selectedBusinessId, dispatch]);

  const businessRole = useMemo(() => {
    if (!currentBusiness?.id) return null;

    const b = (items || []).find((x) => x.id === currentBusiness.id);
    const raw = b?.membershipRole || b?.role || null;

    return raw ? norm(raw) : null;
  }, [items, currentBusiness]);

  const branches = useMemo(() => {
    if (!currentBusiness?.id) return [];
    return (items || []).filter((b) => b.parentId === currentBusiness.id);
  }, [items, currentBusiness]);

  useEffect(() => {
    if (!branches?.length) return;

    if (!selectedBranchId) {
      dispatch(setSelectedBranchId(branches[0].id));
      return;
    }

    const exists = branches.some((b) => b.id === selectedBranchId);
    if (!exists) dispatch(setSelectedBranchId(branches[0].id));
  }, [branches, selectedBranchId, dispatch]);

  const currentBranch = useMemo(() => {
    if (!selectedBranchId) return null;
    return branches.find((br) => br.id === selectedBranchId) || null;
  }, [branches, selectedBranchId]);

  const onBusinessChange = (businessId) =>
    dispatch(switchBusinessThunk(businessId));
  const onBranchChange = (branchIdOrNull) =>
    dispatch(setSelectedBranchId(branchIdOrNull));

  const currentView = useMemo(() => {
    const pathname = location.pathname || "";
    if (pathname === "/app" || pathname === "/app/") return "dashboard";
    if (!pathname.startsWith("/app/")) return "dashboard";
    return pathname.replace("/app/", "") || "dashboard";
  }, [location.pathname]);

  const onNavigate = (view) => {
    if (view === "dashboard") return navigate("/app");
    if (view === "configuracion") return navigate("/app/configuracion/negocio");
    return navigate(`/app/${view}`);
  };

  useEffect(() => {
    if (token) return;
    navigate("/login", { replace: true });
  }, [token, navigate]);

  console.log("AppLayout render", currentBusiness);

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        role={businessRole}
        isSuperAdmin={isSuperAdmin}
        hasBusinessContext={hasBusinessContext}
        currentBusiness={currentBusiness}
        businesses={rootBusinesses}
        onBusinessChange={onBusinessChange}
        branches={branches}
        currentBranchId={selectedBranchId}
        onBranchChange={onBranchChange}
        currentView={currentView}
        onNavigate={onNavigate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet
            context={{
              user,
              currentBusiness,
              branches,
              currentBranchId: selectedBranchId,
              currentBranch,

              businessRole,
              isSuperAdmin,
              hasBusinessContext,
              isOnboardingUser,
            }}
          />
        </main>
      </div>
    </div>
  );
}
