import React from "react";
import { Outlet } from "react-router-dom";
import CustomerPublicHeader from "./CustomerPublicHeader";
import CustomerPublicFooter from "./CustomerPublicFooter";

export default function CustomerPublicLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <CustomerPublicHeader />

      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>

      <CustomerPublicFooter />
    </div>
  );
}
