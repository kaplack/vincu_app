import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  selectMe,
  clearCurrentRedemption,
  fetchRedemptionByIdThunk,
} from "@/features/me/slice/meSlice";

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function MeRedemptionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const me = useSelector(selectMe);
  const [copied, setCopied] = useState(false);

  const redemption = me.currentRedemption;

  useEffect(() => {
    if (!id) return;

    // Si no hay redemption en memoria o no coincide, la traemos del backend
    if (!me.currentRedemption?.id || me.currentRedemption.id !== id) {
      dispatch(fetchRedemptionByIdThunk({ redemptionId: id }));
    }
  }, [dispatch, id, me.currentRedemption?.id]);

  // Si estamos en /me/redemptions/:id pero el estado no coincide, considerarlo "no disponible"
  const matches = useMemo(() => {
    if (!redemption?.id) return false;
    return redemption.id === id;
  }, [redemption?.id, id]);

  const redeemCode = matches ? redemption?.redeemCode : null;
  const expiresAt = matches ? redemption?.expiresAt : null;
  const status = matches ? redemption?.status : null;

  async function handleCopy() {
    if (!redeemCode) return;
    try {
      await navigator.clipboard.writeText(redeemCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback simple
      const el = document.createElement("textarea");
      el.value = redeemCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tu canje
          </h1>
          <p className="mt-1 text-slate-500">
            Muéstralo al pedir delivery o en tienda.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/me/rewards")}>
          Volver a canjes
        </Button>
      </div>

      {!matches ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-extrabold">
              Canje no disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Este canje no está en memoria (por ejemplo, refrescaste la
              página). Por ahora, vuelve al catálogo y genera el canje
              nuevamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="text-white bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] hover:opacity-95"
                onClick={() => navigate("/me/rewards")}
              >
                Ir a Canjes
              </Button>

              <Button variant="outline" onClick={() => navigate("/me")}>
                Ir a Tarjeta
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Siguiente mejora: agregaremos{" "}
              <span className="font-mono">GET /api/me/redemptions/:id</span>{" "}
              para recuperar el canje incluso después de recargar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código de canje</p>
                <CardTitle className="mt-1 text-lg font-extrabold">
                  ID: <span className="font-mono text-sm">{id}</span>
                </CardTitle>
              </div>

              <Badge variant="secondary">{status || "issued"}</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* Code big */}
            <div className="rounded-2xl border bg-muted/20 p-6 text-center">
              <div className="text-xs text-muted-foreground">
                Muestra este código
              </div>
              <div className="mt-2 font-mono text-3xl sm:text-4xl font-extrabold tracking-widest">
                {redeemCode}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleCopy}
                  className="text-white bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] hover:opacity-95"
                >
                  {copied ? "Copiado ✅" : "Copiar código"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/me")}>
                  Ver mi tarjeta
                </Button>
              </div>
            </div>

            {/* Expiration */}
            <div className="rounded-xl border p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Vence</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(expiresAt)}
                </p>
              </div>
              <Badge variant="outline">No compartas el código</Badge>
            </div>

            {/* Instructions */}
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Importante:
                </span>{" "}
                el canje se valida y se consume en el negocio. Si el negocio no
                lo consume, seguirá como “emitido”.
              </p>
            </div>

            {/* Clear state (optional) */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  dispatch(clearCurrentRedemption());
                  navigate("/me/rewards");
                }}
              >
                Listo
              </Button>
            </div>
          </CardContent>

          <div className="h-[3px] bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3]" />
        </Card>
      )}
    </div>
  );
}
