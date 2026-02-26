import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import {
  getByPublicTokenThunk,
  selectPublicCard,
  selectPublicError,
  selectPublicStatus,
} from "@/features/public/slice/publicLoyaltySlice";

import { getWalletSaveUrlByPublicToken } from "@/features/public/api/publicLoyaltyApi";

function formatPhonePE(phoneRaw = "") {
  const digits = String(phoneRaw).replace(/\D/g, "");

  // Caso típico: +51987654321 -> 51987654321
  // Nos interesa mostrar solo los últimos 9 si empieza con 51
  const nine =
    digits.length === 11 && digits.startsWith("51") ? digits.slice(2) : digits;

  if (nine.length === 9)
    return `${nine.slice(0, 3)} ${nine.slice(3, 6)} ${nine.slice(6)}`;
  return phoneRaw || "";
}

function pickPoints(payload) {
  return payload?.membership?.pointsBalance ?? payload?.pointsBalance ?? 0;
}

export default function CardPublic() {
  const { token } = useParams();
  const dispatch = useDispatch();

  const status = useSelector(selectPublicStatus);
  const error = useSelector(selectPublicError);
  const data = useSelector(selectPublicCard);

  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    if (token) dispatch(getByPublicTokenThunk({ token }));
  }, [dispatch, token]);

  const businessName =
    data?.business?.commercialName ||
    data?.business?.name ||
    data?.businessName ||
    "Programa de fidelidad";

  const points = pickPoints(data);

  const phone = useMemo(() => {
    const raw = data?.customer?.phone || data?.phone || "";
    return formatPhonePE(raw);
  }, [data]);

  const tx = data?.transactions || data?.items || data?.lastTransactions || [];

  async function handleAddToWallet() {
    try {
      setWalletError("");
      setWalletLoading(true);

      const res = await getWalletSaveUrlByPublicToken(token);
      const saveUrl = res?.saveUrl;

      if (!saveUrl) throw new Error("Missing saveUrl");
      window.location.href = saveUrl;
    } catch (_e) {
      setWalletError(
        "No se pudo generar la tarjeta para Google Wallet. Intenta nuevamente.",
      );
    } finally {
      setWalletLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
          ← Volver
        </Link>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {businessName}
          </h1>
          <p className="mt-1 text-slate-600">Tu tarjeta digital</p>

          {status === "loading" && (
            <p className="mt-6 text-sm text-slate-600">Cargando tarjeta…</p>
          )}

          {status === "failed" && (
            <p className="mt-6 text-sm text-red-600">
              {typeof error === "string"
                ? error
                : error?.message || "Link inválido o expirado."}
            </p>
          )}

          {status === "succeeded" && (
            <>
              {/* Tarjeta “real” */}
              <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs opacity-90">Programa</p>
                    <p className="mt-1 text-lg font-bold leading-tight">
                      {businessName}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs">
                        Cliente
                      </span>
                      {phone ? (
                        <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs">
                          📱 {phone}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* “chip” visual */}
                  <div className="h-10 w-14 rounded-lg bg-white/25 backdrop-blur-sm" />
                </div>

                <div className="mt-8">
                  <p className="text-sm opacity-90">Puntos</p>
                  <p className="mt-1 text-5xl font-extrabold tracking-tight">
                    {points}
                  </p>
                  <p className="mt-2 text-xs opacity-90">
                    Presenta esta tarjeta cuando compres para sumar puntos.
                  </p>
                </div>
              </div>

              {/* CTA Wallet */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddToWallet}
                  disabled={walletLoading}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {walletLoading
                    ? "Generando tarjeta…"
                    : "Agregar a Google Wallet"}
                </button>

                {walletError ? (
                  <p className="mt-2 text-sm text-red-600">{walletError}</p>
                ) : null}
              </div>

              {/* Movimientos */}
              <div className="mt-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Últimos movimientos
                </h2>

                {Array.isArray(tx) && tx.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600">
                    Aún no tienes movimientos.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {tx.slice(0, 10).map((t, idx) => (
                      <div
                        key={t?.id || idx}
                        className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {t?.type || t?.kind || "Movimiento"}
                          </p>
                          <p className="text-xs text-slate-600">
                            {t?.createdAt
                              ? new Date(t.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {t?.points ?? t?.deltaPoints ?? ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nuevo mensaje inferior (sin /consulta) */}
              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ¿Tienes varias tarjetas en Vincu? Completa tu registro y
                gestiona todas tus recompensas desde tu cuenta.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
