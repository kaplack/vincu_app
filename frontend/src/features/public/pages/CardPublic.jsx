import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, Gift, Smartphone, Star } from "lucide-react";

import {
  getByPublicTokenThunk,
  selectPublicCard,
  selectPublicError,
  selectPublicStatus,
} from "@/features/public/slice/publicLoyaltySlice";

import { fetchPublicRewards } from "../api/publicLoyaltyApi";
import PublicRewardCard from "../components/PublicRewardCard";

function formatPhonePE(phoneRaw = "") {
  const digits = String(phoneRaw).replace(/\D/g, "");

  const nine =
    digits.length === 11 && digits.startsWith("51") ? digits.slice(2) : digits;

  if (nine.length === 9) {
    return `${nine.slice(0, 3)} ${nine.slice(3, 6)} ${nine.slice(6)}`;
  }

  return phoneRaw || "";
}

function pickPoints(payload) {
  return payload?.membership?.pointsBalance ?? payload?.pointsBalance ?? 0;
}

function formatMovementDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
}

export default function CardPublic() {
  const { token } = useParams();
  const dispatch = useDispatch();

  const status = useSelector(selectPublicStatus);
  const error = useSelector(selectPublicError);
  const data = useSelector(selectPublicCard);

  const [rewards, setRewards] = useState([]);
  const [rewardsStatus, setRewardsStatus] = useState("idle");

  useEffect(() => {
    if (token) {
      dispatch(getByPublicTokenThunk({ token }));
    }
  }, [dispatch, token]);

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
      } catch {
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
  const hasTransactions = Array.isArray(tx) && tx.length > 0;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {status === "loading" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Cargando tarjeta…
          </div>
        )}

        {status === "failed" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {typeof error === "string"
              ? error
              : error?.message || "Link inválido o expirado."}
          </div>
        )}

        {status === "succeeded" && (
          <div className="space-y-16">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white px-6 py-8 shadow-sm sm:px-8 lg:px-10 lg:py-12">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#7B4BB7]/15 to-[#1ECAD3]/15 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#2F7ED8]/15 to-[#7B4BB7]/15 blur-3xl" />

              <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="text-center lg:text-left">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                    Tarjeta activada
                  </p>

                  <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    Ya tienes tu tarjeta digital de{" "}
                    <span className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] bg-clip-text text-transparent">
                      {businessName}
                    </span>
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    Empieza a acumular puntos con cada compra, revisa las
                    recompensas disponibles y usa tu tarjeta cada vez que
                    consumas.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-600 lg:justify-start">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                      <Star className="h-4 w-4 text-[#7B4BB7]" />
                      {points} puntos acumulados
                    </div>

                    {phone ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                        <Smartphone className="h-4 w-4 text-[#2F7ED8]" />
                        {phone}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                    {data?.business?.slug ? (
                      <Link
                        to={`/catalog/${data.business.slug}`}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
                      >
                        Ver catálogo
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-400"
                    >
                      Google Wallet próximamente
                    </button>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#7B4BB7]/20 via-[#2F7ED8]/20 to-[#1ECAD3]/20 blur-2xl" />

                    <div className="relative h-[520px] w-[300px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] p-6 text-white shadow-2xl">
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/80">
                                Programa
                              </p>
                              <p className="mt-2 text-2xl font-bold leading-tight">
                                {businessName}
                              </p>
                            </div>

                            <div className="h-12 w-14 rounded-xl bg-white/20 backdrop-blur-sm" />
                          </div>

                          {phone ? (
                            <div className="mt-8 inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                              📱 {phone}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <p className="text-sm text-white/85">Puntos</p>
                          <p className="mt-2 text-6xl font-extrabold tracking-tight">
                            {points}
                          </p>

                          <div className="mt-8 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs leading-5 text-white/90">
                              Solo indica tu número de teléfono al momento de
                              pagar para acumular puntos y canjear recompensas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <div className="absolute -left-6 top-10 hidden rounded-2xl border border-white/40 bg-white/80 px-4 py-3 shadow-lg backdrop-blur md:block">
                      <p className="text-xs text-slate-500">Estado</p>
                      <p className="text-sm font-semibold text-slate-900">
                        Lista para usar
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            </section>

            {/* CATALOGO */}
            <section className="space-y-6">
              <div className="text-center lg:text-left">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                  Recompensas
                </p>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Descubre lo que puedes canjear
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Estas son algunas recompensas disponibles dentro del programa
                  de {businessName}.
                </p>
              </div>

              {rewardsStatus === "loading" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  Cargando recompensas…
                </div>
              )}

              {rewardsStatus === "succeeded" && rewards.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {rewards.map((reward) => (
                    <PublicRewardCard key={reward.id} reward={reward} compact />
                  ))}
                </div>
              )}

              {rewardsStatus === "succeeded" && rewards.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Aún no hay recompensas publicadas.
                </div>
              )}

              {data?.business?.slug ? (
                <div className="flex justify-center lg:justify-start">
                  <Link
                    to={`/catalog/${data.business.slug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Ver catálogo completo
                  </Link>
                </div>
              ) : null}
            </section>

            {/* COMO FUNCIONA */}
            <section className="rounded-[2rem] bg-[#F7F9FB] px-6 py-10 sm:px-8 lg:px-10">
              <div className="mb-8 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                  Cómo funciona
                </p>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Acumula puntos en tres pasos
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-sm font-bold text-white">
                    1
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Indica tu numero Telefonico
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Indica tu numero telefonico o presenta tu tarjeta cada vez
                    que realices una compra en {businessName}.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-sm font-bold text-white">
                    2
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Acumula puntos
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Tus consumos suman puntos que se registran dentro del
                    programa.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-sm font-bold text-white">
                    3
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Canjea recompensas
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Revisa el catálogo y utiliza tus puntos cuando quieras.
                  </p>
                </div>
              </div>
            </section>

            {/* MOVIMIENTOS */}
            <section className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                  Historial
                </p>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Tus movimientos
                </h2>
              </div>

              {!hasTransactions ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                  Aún no tienes movimientos. Tu historial aparecerá aquí cuando
                  empieces a acumular puntos.
                </div>
              ) : (
                <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        Ver últimos movimientos
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Tienes {tx.length} movimiento
                        {tx.length === 1 ? "" : "s"} registrado
                        {tx.length === 1 ? "" : "s"}.
                      </p>
                    </div>

                    <ChevronDown className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="border-t border-slate-200 px-5 py-4">
                    <div className="space-y-3">
                      {tx.slice(0, 10).map((t, idx) => (
                        <div
                          key={t?.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {t?.type || t?.kind || "Movimiento"}
                            </p>
                            <p className="text-xs text-slate-600">
                              {formatMovementDate(t?.createdAt)}
                            </p>
                          </div>

                          <p className="text-sm font-bold text-slate-900">
                            {t?.points ?? t?.deltaPoints ?? ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              )}
            </section>

            {/* CTA CUSTOMER */}
            <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                    Tu cuenta Vincu
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Gestiona todas tus tarjetas en un solo lugar
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    Completa tu registro para acceder a la plataforma y
                    consultar todas tus recompensas desde una sola cuenta.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {data?.business?.slug ? (
                    <Link
                      to={`/catalog/${data.business.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Ver catálogo
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-5 py-3 text-sm font-semibold text-white opacity-80"
                  >
                    Completar registro próximamente
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
