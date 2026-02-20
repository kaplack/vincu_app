// src/components/customer/BottomNavCustomer.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { CreditCard, Gift, Clock } from "lucide-react";

function Item({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 py-2",
          "text-xs font-semibold transition-colors",
          isActive ? "text-slate-900" : "text-slate-500",
        ].join(" ")
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function BottomNavCustomer() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3">
          <Item to="/me" icon={CreditCard} label="Tarjeta" />
          <Item to="/me/rewards" icon={Gift} label="Canjes" />
          <Item to="/me/history" icon={Clock} label="Historial" />
        </div>
      </div>
    </div>
  );
}
