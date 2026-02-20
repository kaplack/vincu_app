// frontend/src/app/layouts/CustomerLayout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import CustomerHeader from "@/features/me/components/CustomerHeader";
import BottomNavCustomer from "@/features/me/components/BottomNavCustomer";

import { fetchMyMembershipsThunk, selectMe } from "@/features/me/slice/meSlice";
import { selectCustomerToken } from "@/features/public/slice/publicLoyaltySlice"; // ajusta si tu selector se llama diferente

export default function CustomerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(selectCustomerToken);
  const me = useSelector(selectMe);

  // 1) Guard: si no hay token, fuera
  useEffect(() => {
    if (!token) navigate("/consulta", { replace: true });
  }, [token, navigate]);

  // 2) Bootstrap: si hay token, cargar memberships
  useEffect(() => {
    if (!token) return;
    if (me.status === "idle") dispatch(fetchMyMembershipsThunk());
  }, [dispatch, token, me.status]);

  const theme = {
    gradient: "from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3]",
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <CustomerHeader theme={theme} />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet context={{ theme }} />
        </div>
      </main>
      <BottomNavCustomer theme={theme} />
    </div>
  );
}
