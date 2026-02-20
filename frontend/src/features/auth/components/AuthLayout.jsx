import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({
  title,
  subtitle,
  children,
  bottomText,
  bottomLinkText,
  bottomLinkTo,
}) {
  return (
    // <div className="min-h-screen bg-white">
    <div className=" bg-white">
      {/* Top mini header
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] bg-clip-text text-transparent">
              vincu
            </span>
          </span>
        </Link>
        <nav className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Volver al inicio
          </Link>
        </nav>
      </header> */}

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pb-16 pt-6 md:grid-cols-2 md:items-center">
        {/* Left panel */}
        <section className="relative overflow-hidden rounded-3xl border bg-[#F7F9FB] p-8 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] opacity-20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] opacity-20 blur-2xl" />

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? <p className="mt-3 text-slate-600">{subtitle}</p> : null}

          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#1ECAD3]" />
              Tarjeta digital en Google Wallet (sin app)
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2F7ED8]" />
              Registro por QR o link en segundos
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#7B4BB7]" />
              Puntos y recompensas automáticas
            </li>
          </ul>
        </section>

        {/* Form card */}
        <section className="rounded-3xl border bg-white p-8 shadow-sm md:p-10">
          {children}

          <div className="mt-6 text-center text-sm text-slate-600">
            {bottomText}{" "}
            <Link
              className="font-semibold text-slate-900 hover:underline"
              to={bottomLinkTo}
            >
              {bottomLinkText}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
