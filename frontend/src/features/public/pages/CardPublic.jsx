import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import {
  getByPublicTokenThunk,
  selectPublicCard,
  selectPublicError,
  selectPublicStatus,
} from "@/features/public/slice/publicLoyaltySlice";

function pickPoints(payload) {
  // tolerante: ajusta cuando veamos tu response real
  return (
    payload?.points ??
    payload?.membership?.points ??
    payload?.card?.points ??
    payload?.membership?.pointsBalance ??
    0
  );
}

export default function CardPublic() {
  const { token } = useParams();
  const dispatch = useDispatch();

  const status = useSelector(selectPublicStatus);
  const error = useSelector(selectPublicError);
  const data = useSelector(selectPublicCard);

  useEffect(() => {
    dispatch(getByPublicTokenThunk({ token }));
  }, [dispatch, token]);

  const businessName =
    data?.business?.name || data?.businessName || "Programa de fidelidad";
  const points = pickPoints(data);
  const tx = data?.lastTransactions || data?.transactions || data?.items || [];

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
          <p className="mt-1 text-slate-600">Tu tarjeta VINCU</p>

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
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] p-6 text-white">
                <p className="text-sm opacity-90">Puntos acumulados</p>
                <p className="mt-1 text-4xl font-extrabold">{points}</p>
                <p className="mt-2 text-xs opacity-90">
                  Presenta esta tarjeta cuando compres para sumar puntos.
                </p>
              </div>

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

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ¿Tienes varias tarjetas? Ingresa en{" "}
                <Link className="font-semibold underline" to="/consulta">
                  /consulta
                </Link>{" "}
                para verlas todas.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
