import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  fetchBusinessRewardsThunk,
  createRedemptionThunk,
  clearCurrentRedemption,
  selectMe,
  selectActiveMembership,
} from "@/features/me/slice/meSlice";

export default function MeRewards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const me = useSelector(selectMe);
  const membership = useSelector(selectActiveMembership);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const businessId = membership?.businessId || null;
  const pointsBalance = membership?.pointsBalance ?? 0;

  const rewardsPayload = businessId
    ? me.rewardsByBusinessId?.[businessId]
    : null;
  const rewards = rewardsPayload?.rewards || [];

  // Load rewards for active business
  useEffect(() => {
    if (!businessId) return;
    dispatch(fetchBusinessRewardsThunk({ businessId }));
  }, [dispatch, businessId]);

  // Split lists
  const { canRedeem, locked } = useMemo(() => {
    const ok = [];
    const no = [];
    for (const r of rewards) {
      if (r.canRedeem) ok.push(r);
      else no.push(r);
    }
    return { canRedeem: ok, locked: no };
  }, [rewards]);

  // When redemption is created, redirect to redemption view (next page)
  useEffect(() => {
    if (!me.currentRedemption?.id) return;

    const id = me.currentRedemption.id;
    setConfirmOpen(false);
    setSelectedReward(null);

    // En el próximo archivo creamos esta página.
    navigate(`/me/redemptions/${id}`);

    // (opcional) si no quieres mantenerla en estado global:
    // dispatch(clearCurrentRedemption());
  }, [me.currentRedemption?.id, navigate, dispatch]);

  function openConfirm(reward) {
    setSelectedReward(reward);
    setConfirmOpen(true);
  }

  async function confirmRedeem() {
    if (!membership?.id || !selectedReward?.id) return;

    await dispatch(
      createRedemptionThunk({
        membershipId: membership.id,
        rewardId: selectedReward.id,
      }),
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Canjes
          </h1>
          <p className="mt-1 text-slate-500">
            Elige una recompensa y confirma tu canje.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Puntos:</span>
          <span className="text-lg font-extrabold text-slate-900">
            {pointsBalance}
          </span>
        </div>
      </div>

      {!membership ? (
        <Card>
          <CardContent className="py-8 text-muted-foreground">
            No hay una tarjeta activa. Ve a <b>Cambiar tarjeta</b> y selecciona
            una.
          </CardContent>
        </Card>
      ) : null}

      {me.status === "loading" && rewards.length === 0 ? (
        <div className="text-muted-foreground">Cargando recompensas…</div>
      ) : null}

      {me.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {typeof me.error === "string"
            ? me.error
            : me.error?.message || "Error"}
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canjeables */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-extrabold">
                  Puedes canjear ahora
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recompensas disponibles según tus puntos.
                </p>
              </div>
              <Badge variant="secondary">{canRedeem.length}</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-3">
            {canRedeem.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aún no tienes recompensas canjeables.
              </div>
            ) : (
              canRedeem.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.name}</p>
                    {r.description ? (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {r.pointsRequired}
                      </span>{" "}
                      pts
                    </p>
                  </div>

                  <Button
                    onClick={() => openConfirm(r)}
                    className="shrink-0 text-white bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] hover:opacity-95"
                  >
                    Canjear
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bloqueadas */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-extrabold">
                  Te faltan puntos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sigue acumulando para desbloquear estas recompensas.
                </p>
              </div>
              <Badge variant="secondary">{locked.length}</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-3">
            {locked.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay recompensas bloqueadas.
              </div>
            ) : (
              locked.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.name}</p>
                    {r.description ? (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {r.pointsRequired}
                      </span>{" "}
                      pts • Te faltan{" "}
                      <span className="font-semibold text-foreground">
                        {r.missingPoints}
                      </span>
                    </p>
                  </div>

                  <Badge variant="outline" className="shrink-0">
                    Bloqueada
                  </Badge>
                </div>
              ))
            )}

            <div className="mt-2 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Tip: pide por delivery o visita el local y muestra tu QR para
                acumular puntos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setSelectedReward(null);
            dispatch(clearCurrentRedemption());
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar canje</DialogTitle>
            <DialogDescription>
              Vas a emitir un código para canjear esta recompensa. Muéstralo al
              pedir delivery o en tienda.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border p-4">
            <p className="font-semibold">{selectedReward?.name || "—"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Costo:{" "}
              <span className="font-semibold text-foreground">
                {selectedReward?.pointsRequired ?? "—"}
              </span>{" "}
              pts
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu saldo:{" "}
              <span className="font-semibold text-foreground">
                {pointsBalance}
              </span>{" "}
              pts
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={me.status === "loading"}
            >
              Cancelar
            </Button>

            <Button
              onClick={confirmRedeem}
              disabled={me.status === "loading"}
              className="text-white bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] hover:opacity-95"
            >
              {me.status === "loading" ? "Procesando…" : "Confirmar canje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
