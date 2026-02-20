import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { getInvitationByToken, acceptInvitation } from "../api/invitationApi";

function roleLabel(role) {
  const r = String(role || "").toUpperCase();
  if (r === "OWNER") return "Owner";
  if (r === "MANAGER") return "Manager";
  if (r === "OPERATOR") return "Operator";
  return r || "-";
}

function statusCopy(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING") return { tone: "ok", text: "Invitación activa" };
  if (s === "ACCEPTED") return { tone: "warn", text: "Invitación ya aceptada" };
  if (s === "EXPIRED") return { tone: "err", text: "Invitación expirada" };
  if (s === "CANCELED") return { tone: "err", text: "Invitación cancelada" };
  return { tone: "warn", text: s || "Estado desconocido" };
}

export default function Invite() {
  const [params] = useSearchParams();
  const tokenParam = params.get("token") || "";
  const token = tokenParam.trim();

  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  const { user } = useSelector((s) => s.auth);

  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("El enlace de invitación no es válido.");
          return;
        }

        const data = await getInvitationByToken(token);
        if (!alive) return;
        setInv(data);
      } catch (e) {
        if (!alive) return;
        setError(
          e?.response?.data?.message || "No se pudo cargar la invitación.",
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [token]);

  const inviteEmail = inv?.email || "";
  const businessName = inv?.businessName || "VINCU";
  const statusInfo = statusCopy(inv?.status);
  const canProceed = inv?.status === "PENDING";

  const handleAccept = async () => {
    try {
      setSubmitting(true);
      setError("");
      await acceptInvitation(token);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(
        e?.response?.data?.message || "No se pudo aceptar la invitación.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Left panel (same vibe as Register page) */}
        <div className="hidden lg:block">
          <div className="rounded-3xl bg-[#EAF4FF] p-10 shadow-sm">
            <h2 className="text-3xl font-semibold text-slate-900">
              Estás a un paso de entrar a{" "}
              <span className="text-[#1ECAD3]">VINCU</span>
            </h2>

            <p className="mt-3 text-slate-700">
              Te invitaron a operar{" "}
              <span className="font-semibold">{businessName}</span>. Inicia
              sesión o crea tu cuenta para continuar.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#1ECAD3]" />
                <p>
                  Tu rol se asigna desde el negocio y no se puede cambiar desde
                  el enlace.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#7C5CFF]" />
                <p>
                  Si ya tienes cuenta, solo inicia sesión con el correo
                  invitado.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" />
                <p>
                  Luego el Owner/Manager te asignará a una sucursal si eres
                  Operator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Invitación a {businessName}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Rol asignado:{" "}
                <span className="font-semibold">{roleLabel(inv?.role)}</span>
              </p>
            </div>

            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                statusInfo.tone === "ok"
                  ? "bg-emerald-50 text-emerald-700"
                  : "",
                statusInfo.tone === "warn" ? "bg-amber-50 text-amber-700" : "",
                statusInfo.tone === "err" ? "bg-rose-50 text-rose-700" : "",
              ].join(" ")}
            >
              {statusInfo.text}
            </span>
          </div>

          <div className="mt-6">
            {loading && (
              <div className="text-sm text-slate-600">Cargando invitación…</div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {inviteEmail ? (
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Correo invitado
                    </label>
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                      {inviteEmail}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Este es el correo asociado a la invitación. Debes iniciar
                      sesión o registrarte con este mismo correo.
                    </p>
                  </div>
                ) : null}

                {!canProceed && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Esta invitación ya no está activa. Pide al administrador que
                    genere una nueva.
                  </div>
                )}

                {canProceed && !user && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700">
                      Para continuar, inicia sesión o crea una cuenta.
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        to="/login"
                        state={{ from: fromPath, email: inviteEmail }}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 sm:w-auto"
                      >
                        Iniciar sesión
                      </Link>

                      <Link
                        to="/register"
                        state={{ from: fromPath, email: inviteEmail }}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#1ECAD3] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 sm:w-auto"
                      >
                        Crear cuenta
                      </Link>
                    </div>
                  </div>
                )}

                {canProceed && user && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700">
                      Estás autenticado. Haz clic para aceptar la invitación y
                      entrar al negocio.
                    </p>

                    <button
                      onClick={handleAccept}
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#1ECAD3] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Aceptando…" : "Aceptar invitación"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-slate-500">
            ¿Problemas con la invitación? Verifica que el enlace no haya
            expirado o solicita uno nuevo al administrador.
          </div>
        </div>
      </div>
    </div>
  );
}
