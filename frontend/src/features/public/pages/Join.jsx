import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  joinBySlugThunk,
  selectJoinResult,
  selectPublicError,
  selectPublicStatus,
} from "@/features/public/slice/publicLoyaltySlice";

export default function Join() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const status = useSelector(selectPublicStatus);
  const error = useSelector(selectPublicError);
  const joinResult = useSelector(selectJoinResult);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    phone: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(joinBySlugThunk({ slug, payload: form }));
  };

  // Si join responde directLink, redirigimos a /c/:token
  useEffect(() => {
    const directLink = joinResult?.directLink;
    if (!directLink) return;

    // soporta si backend devuelve "/c/xxx" o URL completa
    if (directLink.startsWith("http")) {
      window.location.href = directLink;
    } else {
      navigate(directLink, { replace: true });
    }
  }, [joinResult, navigate]);

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start">
        <div className="md:w-1/2">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Volver
          </Link>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
            Únete al programa
          </h1>
          <p className="mt-2 text-slate-600">
            Regístrate para generar tu tarjeta y ver tus puntos.
          </p>

          {joinResult?.reused && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Ya tienes una tarjeta en este negocio. Te la mostraremos ahora.
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Completa tus datos
            </h2>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombres
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#1ECAD3]/30"
                  placeholder="Juan"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Apellidos
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#1ECAD3]/30"
                  placeholder="Pérez"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Documento de identidad
                </label>
                <input
                  name="documentNumber"
                  value={form.documentNumber}
                  onChange={onChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#1ECAD3]/30"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#1ECAD3]/30"
                  placeholder="999888777"
                />
              </div>

              {status === "failed" && (
                <p className="text-sm text-red-600">
                  {typeof error === "string"
                    ? error
                    : error?.message || "No pudimos generar tu tarjeta."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {status === "loading" ? "Generando..." : "Generar mi tarjeta"}
              </button>

              <p className="text-xs text-slate-500">
                Al registrarte, aceptas los términos del programa de fidelidad.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
