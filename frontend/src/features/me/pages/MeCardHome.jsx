import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  fetchMyMembershipsThunk,
  fetchMembershipTxThunk,
  fetchBusinessRewardsThunk,
  selectMe,
  selectMyMemberships,
  selectActiveMembershipId,
  selectActiveMembership,
  selectTxForActiveMembership,
} from "@/features/me/slice/meSlice";

export default function MeCardHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const me = useSelector(selectMe);
  const memberships = useSelector(selectMyMemberships);
  const activeMembershipId = useSelector(selectActiveMembershipId);
  const activeMembership = useSelector(selectActiveMembership);
  const tx = useSelector(selectTxForActiveMembership);

  // 1) Asegurar memberships cargadas
  useEffect(() => {
    if (me.status === "idle") dispatch(fetchMyMembershipsThunk());
  }, [dispatch, me.status]);

  // 2) Si tiene varias tarjetas y no hay activa válida, forzar selector
  useEffect(() => {
    if (me.status !== "succeeded") return;

    if (memberships.length > 1) {
      const exists = memberships.some((m) => m.id === activeMembershipId);
      if (!activeMembershipId || !exists) {
        navigate("/me/select-card", { replace: true });
      }
    }
  }, [me.status, memberships, activeMembershipId, navigate]);

  // 3) Cargar datos secundarios cuando ya hay tarjeta activa
  useEffect(() => {
    if (!activeMembership?.id) return;

    dispatch(fetchMembershipTxThunk({ membershipId: activeMembership.id }));
    dispatch(
      fetchBusinessRewardsThunk({ businessId: activeMembership.businessId }),
    );
  }, [dispatch, activeMembership?.id, activeMembership?.businessId]);

  const points = activeMembership?.pointsBalance ?? 0;

  // Preview canjeables (si ya lo cargaste en rewardsByBusinessId)
  const rewardsPreview = useMemo(() => {
    const byBiz = me.rewardsByBusinessId?.[activeMembership?.businessId];
    const rewards = byBiz?.rewards || [];
    // Solo 3 para preview, y canjeables primero ya viene ordenado desde backend
    return rewards.slice(0, 3);
  }, [me.rewardsByBusinessId, activeMembership?.businessId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tarjeta</p>
              <CardTitle className="mt-1 text-2xl sm:text-3xl font-extrabold">
                {points}{" "}
                <span className="text-base font-semibold text-muted-foreground">
                  puntos
                </span>
              </CardTitle>

              <p className="mt-2 text-sm text-muted-foreground">
                Membership:{" "}
                <span className="font-mono text-xs">
                  {activeMembership?.id?.slice(0, 8) || "—"}
                </span>
              </p>
            </div>

            <Badge variant="secondary">
              {activeMembership?.status === "active" ? "Activa" : "Bloqueada"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/me/rewards")}
              className="text-white bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] hover:opacity-95"
            >
              Ver canjes
            </Button>

            <Button variant="outline" onClick={() => navigate("/me")}>
              Mostrar mi QR
            </Button>

            {memberships.length > 1 ? (
              <Button
                variant="ghost"
                onClick={() => navigate("/me/select-card")}
              >
                Cambiar tarjeta
              </Button>
            ) : null}
          </div>
        </CardContent>

        <div className="h-[3px] bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3]" />
      </Card>

      {/* Estado general */}
      {me.status === "loading" ? (
        <div className="text-muted-foreground">Cargando tu información…</div>
      ) : null}

      {me.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {typeof me.error === "string"
            ? me.error
            : me.error?.message || "Error"}
        </div>
      ) : null}

      {/* 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos movimientos */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-extrabold">
                Últimos movimientos
              </CardTitle>
              <Button variant="link" onClick={() => navigate("/me/history")}>
                Ver historial →
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {tx.length === 0 ? (
              <div className="py-6 text-sm text-muted-foreground">
                Aún no hay movimientos.
              </div>
            ) : (
              <div className="divide-y">
                {tx.slice(0, 5).map((row) => (
                  <div
                    key={row.id}
                    className="py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {row.type === "earn"
                          ? "Acumulación"
                          : row.type === "redeem"
                            ? "Canje"
                            : row.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {row.note || "—"}
                      </p>
                    </div>
                    <p className="font-extrabold">{row.points}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview canjeables */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-extrabold">Canjeables</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recompensas según tus puntos.
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-3">
            {rewardsPreview.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aún no hay recompensas para mostrar.
              </div>
            ) : (
              rewardsPreview.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border p-4 hover:bg-muted/40 transition"
                >
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.pointsRequired} pts{" "}
                    {r.canRedeem ? (
                      <span className="ml-2 font-semibold text-foreground">
                        • Puedes canjear
                      </span>
                    ) : (
                      <span className="ml-2">
                        • Te faltan {r.missingPoints}
                      </span>
                    )}
                  </p>
                </div>
              ))
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/me/rewards")}
            >
              Ir al catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
