import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  consultaCardsThunk,
  logoutCustomer,
  selectCustomerCards,
  selectCustomerToken,
  selectPublicError,
  selectPublicStatus,
} from "@/features/public/slice/publicLoyaltySlice";

function pickDirectLink(card) {
  return (
    card?.directLink ||
    card?.publicLink ||
    card?.link ||
    (card?.publicToken ? `/c/${card.publicToken}` : null)
  );
}

function pickBusinessName(card) {
  return (
    card?.business?.name ||
    card?.businessName ||
    card?.business?.slug ||
    "Negocio"
  );
}

function pickPoints(card) {
  return (
    card?.points ??
    card?.membership?.points ??
    card?.pointsBalance ??
    card?.membership?.pointsBalance ??
    0
  );
}

export default function ConsultaCards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectPublicStatus);
  const error = useSelector(selectPublicError);
  const customerToken = useSelector(selectCustomerToken);
  const cards = useSelector(selectCustomerCards);

  // Guard: si no hay token, vuelve a /consulta
  useEffect(() => {
    if (!customerToken) navigate("/consulta", { replace: true });
  }, [customerToken, navigate]);

  useEffect(() => {
    if (customerToken) dispatch(consultaCardsThunk());
  }, [dispatch, customerToken]);

  const onLogout = () => {
    dispatch(logoutCustomer());
    navigate("/consulta", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Inicio
          </Link>

          <button
            onClick={onLogout}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Salir
          </button>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Mis tarjetas
        </h1>
        <p className="mt-2 text-slate-600">
          Aquí aparecen todas tus tarjetas por negocio.
        </p>

        {status === "loading" && (
          <p className="mt-6 text-sm text-slate-600">Cargando…</p>
        )}

        {status === "failed" && (
          <p className="mt-6 text-sm text-red-600">
            {typeof error === "string"
              ? error
              : "No pudimos cargar tus tarjetas."}
          </p>
        )}

        {status === "succeeded" && (
          <div className="mt-6 space-y-3">
            {cards.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                No encontramos tarjetas asociadas a tus datos.
              </div>
            ) : (
              cards.map((c, idx) => {
                const link = pickDirectLink(c);
                const name = pickBusinessName(c);
                const points = pickPoints(c);

                return (
                  <div
                    key={c?.id || idx}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Puntos:{" "}
                          <span className="font-semibold text-slate-900">
                            {points}
                          </span>
                        </p>
                      </div>

                      {link ? (
                        <button
                          onClick={() => navigate(link)}
                          className="rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                        >
                          Ver tarjeta
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Sin link disponible
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
