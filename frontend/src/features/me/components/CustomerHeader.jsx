// src/components/customer/CustomerHeader.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutCustomer } from "@/features/public/slice/publicLoyaltySlice";
import { resetMeState } from "@/features/me/slice/meSlice";
import MembershipSwitcher from "@/features/me/components/MembershipSwitcher";

function TabLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "px-3 py-2 text-sm font-semibold rounded-lg transition-colors",
          isActive
            ? "text-slate-900 bg-slate-100"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function CustomerHeader({ theme }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-white",
      ].join(" ")}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between">
          {/* Left: Logo + Business (placeholder por ahora) */}
          <button
            onClick={() => navigate("/me")}
            className="flex items-center gap-3"
          >
            <img
              src="/VincuLogo500x300.png"
              alt="VINCU"
              className="h-10 w-auto"
            />
            <MembershipSwitcher />
          </button>

          {/* Center: Tabs (desktop) */}
          <nav className="hidden md:flex items-center gap-2">
            <TabLink to="/me">Tarjeta</TabLink>
            <TabLink to="/me/rewards">Canjes</TabLink>
            <TabLink to="/me/history">Historial</TabLink>
          </nav>

          {/* Right: menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
              aria-label="Menu"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/me/select-card");
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cambiar tarjeta
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    dispatch(logoutCustomer());
                    dispatch(resetMeState());
                    navigate("/consulta", { replace: true });
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Salir
                </button>

                <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">
                  <span className="inline-block rounded-full px-2 py-1 bg-slate-100">
                    VINCU
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accent line */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, #7B4BB7 0%, #2F7ED8 50%, #1ECAD3 100%)",
          }}
        />
      </div>
    </header>
  );
}
