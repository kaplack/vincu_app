import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  consultaLoginThunk,
  selectCustomerToken,
  selectPublicError,
  selectPublicStatus,
} from "@/features/public/slice/publicLoyaltySlice";

export default function ConsultaLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectPublicStatus);
  const error = useSelector(selectPublicError);
  const customerToken = useSelector(selectCustomerToken);
  //console.log("ConsultaLogin render", { status, error, customerToken });

  const [form, setForm] = useState({ phone: "", documentNumber: "" });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(consultaLoginThunk(form));
  };

  // Si ya está logueado, manda directo a /consulta/cards
  useEffect(() => {
    if (customerToken) navigate("/me", { replace: true });
    if (!customerToken) console.log("No customer token, stay in login");
  }, [customerToken, navigate]);

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <div className="mx-auto max-w-lg px-4 py-12">
        <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
          ← Volver
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Consulta tus tarjetas
        </h1>
        <p className="mt-2 text-slate-600">
          Ingresa tu teléfono y DNI para ver tus puntos.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
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

            <div>
              <label className="text-sm font-medium text-slate-700">DNI</label>
              <input
                name="documentNumber"
                value={form.documentNumber}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#1ECAD3]/30"
                placeholder="12345678"
              />
            </div>

            {status === "failed" && (
              <p className="text-sm text-red-600">
                {/* MVP: mensaje genérico */}
                {typeof error === "string" ? error : "Credenciales inválidas"}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {status === "loading" ? "Ingresando..." : "Ver mis tarjetas"}
            </button>

            <p className="text-xs text-slate-500">
              Si tus datos son correctos, verás todas tus tarjetas.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
