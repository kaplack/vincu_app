// frontend/src/routes/index.jsx
import React from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

//PUBLIC LAYOUT
import PublicLayout from "@/components/common/PublicLayout";

import Landing from "@/features/marketing/pages/Landing";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import Blog from "@/features/marketing/pages/Blog";

//import Join from "@/features/public/pages/Join";
// import ConsultaLogin from "@/features/public/pages/ConsultaLogin";
// import ConsultaCards from "@/features/public/pages/ConsultaCard";
import CardPublic from "@/features/public/pages/CardPublic";

import JoinPublic from "@/features/public/pages/JoinPublic";

// CUSTOMER PORTAL
import CustomerLayout from "@/app/layouts/CustomerLayout";
import MeCardHome from "@/features/me/pages/MeCardHome";
import MeRewards from "@/features/me/pages/MeRewards";
import MeHistory from "@/features/me/pages/MeHistory";
import MeSelectCard from "@/features/me/pages/MeSelectCard";
import MeRedemptionView from "@/features/me/pages/MeRedemptionView";

// PRIVATE LAYOUT
import AppLayout from "@/app/layouts/AppLayout";

import Dashboard from "@/features/loyalty/pages/Dashboard";
import Clientes from "@/features/customers/pages/Clientes";
import Puntos from "@/features/points/pages/Puntos";
import Recompensas from "@/features/rewards/pages/Recompensas";
import Canjes from "@/features/redemptions/pages/Canjes";
import Tarjeta from "@/features/settings/pages/Tarjeta";
import Reportes from "@/features/loyalty/pages/Reportes";
import Plan from "@/features/settings/pages/Plan";
import Configuracion from "@/features/settings/pages/Configuracion";
import Ayuda from "@/features/loyalty/pages/Ayuda";
import Negocio from "@/features/settings/pages/Negocio";
import Usuarios from "../features/settings/pages/Usuarios";
import Invite from "../features/auth/pages/Invite";

export const routes = (
  <>
    {/* 🌐 Public web */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/invite" element={<Invite />} />
      <Route path="/join/:slug" element={<JoinPublic />} />
      {/* <Route path="/consulta" element={<ConsultaLogin />} />
      <Route path="/consulta/cards" element={<ConsultaCards />} /> */}
      <Route path="/c/:token" element={<CardPublic />} />
    </Route>

    {/* 👤 Customer portal (privado con customerToken, layout propio) */}
    <Route path="/me" element={<CustomerLayout />}>
      <Route index element={<MeCardHome />} />
      <Route path="rewards" element={<MeRewards />} />
      <Route path="history" element={<MeHistory />} />
      <Route path="select-card" element={<MeSelectCard />} />
      <Route path="redemptions/:id" element={<MeRedemptionView />} />
    </Route>

    {/* 🔐 Private app */}
    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="puntos" element={<Puntos />} />
        <Route path="recompensas" element={<Recompensas />} />
        <Route path="canjes" element={<Canjes />} />

        {/* ✅ Setup inicial: solo requiere sesión */}
        <Route path="configuracion/negocio" element={<Negocio />} />

        {/* ✅ Rutas que requieren rol de negocio (OWNER). SUPERADMIN entra por bypass */}
        <Route element={<RoleGuard allow={["OWNER"]} />}>
          <Route path="reportes" element={<Reportes />} />

          <Route path="configuracion" element={<Configuracion />}>
            <Route path="tarjeta" element={<Tarjeta />} />
            <Route path="plan" element={<Plan />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        <Route path="ayuda" element={<Ayuda />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </>
);
