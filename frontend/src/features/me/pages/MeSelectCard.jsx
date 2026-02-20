import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import MembershipCard from "@/features/me/components/MembershipCard";
import {
  fetchMyMembershipsThunk,
  setActiveMembership,
  selectMyMemberships,
  selectActiveMembershipId,
  selectMe,
} from "@/features/me/slice/meSlice";

export default function MeSelectCard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector(selectMe);
  const memberships = useSelector(selectMyMemberships);
  const activeMembershipId = useSelector(selectActiveMembershipId);

  useEffect(() => {
    // Load memberships once
    dispatch(fetchMyMembershipsThunk());
  }, [dispatch]);

  // Si solo hay 1, no tiene sentido esta pantalla
  useEffect(() => {
    if (memberships.length === 1) {
      dispatch(setActiveMembership(memberships[0].id));
      navigate("/me", { replace: true });
    }
  }, [memberships, dispatch, navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Elige tu tarjeta
      </h1>
      <p className="mt-1 text-slate-500">
        Selecciona el negocio con el que quieres ingresar.
      </p>

      {status === "loading" ? (
        <div className="mt-6 text-slate-500">Cargando...</div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {typeof error === "string" ? error : error?.message || "Error"}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {memberships.map((m) => (
          <MembershipCard
            key={m.id}
            membership={m}
            isActive={m.id === activeMembershipId}
            onSelect={() => {
              dispatch(setActiveMembership(m.id));
              navigate("/me");
            }}
            businessLabelFallback={m.businessId?.slice(0, 8) || "Negocio"}
          />
        ))}
      </div>
    </div>
  );
}
