import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "../components/AuthLayout";
import { loginThunk } from "../slice/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from;
  const presetEmail = location.state?.email || "";

  const { token, user, status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    identifier: presetEmail,
    password: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginThunk(form));
  };

  useEffect(() => {
    if (!token || !user) return;
    navigate(from || "/app", { replace: true });
  }, [token, user, from, navigate]);

  return (
    <AuthLayout
      title="Ingresa a VINCU"
      subtitle="Accede a tu panel para gestionar clientes, puntos y recompensas."
      bottomText="¿No tienes cuenta?"
      bottomLinkText="Crear una"
      bottomLinkTo="/register"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-600">Bienvenido de vuelta.</p>
        </div>
        <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
          Ver landing
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Correo o teléfono
          </label>
          <input
            name="identifier"
            type="text"
            value={form.identifier}
            onChange={onChange}
            disabled={!!presetEmail}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#1ECAD3]/30"
            placeholder="tu@email.com o 999888777"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#1ECAD3]/30"
            placeholder="••••••••"
          />
        </div>

        {status === "failed" && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
        >
          {status === "loading" ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthLayout>
  );
}
