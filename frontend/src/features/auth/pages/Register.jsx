// frontend/src/features/auth/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "../components/AuthLayout";
import { registerThunk } from "../slice/authSlice";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from;
  const presetEmail = location.state?.email || "";

  const { status, error, token, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: presetEmail,
    phone: "",
    password: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();

    dispatch(
      registerThunk({
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    );
  };

  useEffect(() => {
    if (!token || !user) return;
    navigate(from || "/app", { replace: true });
  }, [token, user, from, navigate]);

  return (
    <AuthLayout
      title="Crea tu cuenta en VINCU"
      subtitle="Empieza gratis y crea tu programa de fidelización en minutos."
      bottomText="¿Ya tienes cuenta?"
      bottomLinkText="Inicia sesión"
      bottomLinkTo="/login"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Crear cuenta</h2>
          <p className="mt-1 text-sm text-slate-600">Sin tarjeta de crédito.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Apellido</label>
          <input
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Tu apellido"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            disabled={!!presetEmail}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            placeholder="tu@email.com"
          />
          {presetEmail && (
            <p className="mt-1 text-xs text-slate-500">
              Este correo viene de la invitación y no se puede cambiar.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Teléfono</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            placeholder="987654321"
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
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        {status === "failed" && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === "loading" ? "Creando..." : "Crear mi cuenta"}
        </button>

        <p className="pt-1 text-xs text-slate-500">
          Al crear tu cuenta, aceptas nuestros{" "}
          <span className="font-semibold text-slate-700">Términos</span> y{" "}
          <span className="font-semibold text-slate-700">
            Política de privacidad
          </span>
          .
        </p>
      </form>
      {status === "failed" && <p className="text-sm text-red-600">{error}</p>}
    </AuthLayout>
  );
}
