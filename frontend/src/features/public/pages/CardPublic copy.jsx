// frontend/src/features/public/pages/CardPublic.jsx
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

import { fetchPublicRewards } from "../api/publicLoyaltyApi";
import PublicRewardCard from "../components/PublicRewardCard";

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

  const [rewards, setRewards] = useState([]);
  const [rewardsStatus, setRewardsStatus] = useState("idle");

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

  useEffect(() => {
    let alive = true;

    async function loadRewardsPreview() {
      const businessSlug = data?.business?.slug;
      if (!businessSlug) return;

      try {
        setRewardsStatus("loading");
        const res = await fetchPublicRewards({ businessSlug });
        if (!alive) return;

        setRewards((res?.items || []).slice(0, 3));
        setRewardsStatus("succeeded");
      } catch (_err) {
        if (!alive) return;
        setRewardsStatus("failed");
        setRewards([]);
      }
    }

    if (status === "succeeded") {
      loadRewardsPreview();
    }

    return () => {
      alive = false;
    };
  }, [status, data?.business?.slug]);

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
              {/* <div className="mt-4">
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
              </div> */}

              {/* Catalogo top 3 */}

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Recompensas disponibles
                    </h2>
                    <p className="text-sm text-slate-600">
                      Descubre lo que puedes canjear con tus puntos.
                    </p>
                  </div>

                  {data?.business?.slug ? (
                    <Link
                      to={`/catalog/${data.business.slug}`}
                      className="text-sm font-medium text-[#2F7ED8] hover:text-[#1d5fb0]"
                    >
                      Ver catálogo
                    </Link>
                  ) : null}
                </div>

                {rewardsStatus === "loading" && (
                  <p className="mt-3 text-sm text-slate-600">
                    Cargando recompensas…
                  </p>
                )}

                {rewardsStatus === "succeeded" && rewards.length > 0 && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rewards.map((reward) => (
                      <PublicRewardCard
                        key={reward.id}
                        reward={reward}
                        compact
                      />
                    ))}
                  </div>
                )}

                {rewardsStatus === "succeeded" && rewards.length === 0 && (
                  <p className="mt-3 text-sm text-slate-600">
                    Aún no hay recompensas publicadas.
                  </p>
                )}
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
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      ¿Tienes varias tarjetas en Vincu?
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Completa tu registro para gestionar todas tus recompensas
                      desde una sola cuenta.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {/* {data?.business?.slug ? (
                      <Link
                        to={`/catalog/${data.business.slug}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                      >
                        Ver catálogo
                      </Link>
                    ) : null} */}

                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                    >
                      Completar registro
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
