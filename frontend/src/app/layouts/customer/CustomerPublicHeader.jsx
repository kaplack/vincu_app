// frontend/src/app/layouts/customer/CustomerPublicHeader.jsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Cómo funciona", to: "#como-funciona", isAnchor: true },
  { label: "Ingresar", to: "/customer/login", isAnchor: false },
];

/**
 * Customer public header
 * Used in public customer-facing pages such as:
 * - /join/:slug
 * - /c/:token
 * - /catalog/:businessSlug
 */
export default function CustomerPublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Close mobile menu after navigation
   */
  function handleCloseMenu() {
    setMobileOpen(false);
  }

  /**
   * Toggle mobile menu state
   */
  function handleToggleMenu() {
    setMobileOpen((prev) => !prev);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Ir al inicio de Vincu"
        >
          <div className="">
            {/* <span className="font-bold text-xl tracking-tight">VINCU</span> */}
            <img
              src="/VincuLogo500x300.png"
              alt="Logo Vincu"
              className="h-15 w-auto"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.isAnchor ? (
              <a
                key={item.label}
                href={item.to}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-950"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-slate-950"
                      : "text-slate-700 hover:text-slate-950",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <button
          type="button"
          onClick={handleToggleMenu}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 md:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) =>
              item.isAnchor ? (
                <a
                  key={item.label}
                  href={item.to}
                  onClick={handleCloseMenu}
                  className="rounded-lg px-2 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={handleCloseMenu}
                  className={({ isActive }) =>
                    [
                      "rounded-lg px-2 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-50 text-slate-950"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
