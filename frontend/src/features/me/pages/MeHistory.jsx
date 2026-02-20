import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  fetchMembershipTxThunk,
  selectMe,
  selectActiveMembership,
  selectTxForActiveMembership,
} from "@/features/me/slice/meSlice";

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function mapTypeLabel(type) {
  if (type === "earn") return "Acumulación";
  if (type === "redeem") return "Canje";
  if (type === "adjust") return "Ajuste";
  return type || "—";
}

export default function MeHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const me = useSelector(selectMe);
  const membership = useSelector(selectActiveMembership);
  const tx = useSelector(selectTxForActiveMembership);

  const [filter, setFilter] = useState("all"); // all | earn | redeem

  useEffect(() => {
    if (!membership?.id) return;
    dispatch(fetchMembershipTxThunk({ membershipId: membership.id }));
  }, [dispatch, membership?.id]);

  const filtered = useMemo(() => {
    if (filter === "all") return tx;
    return tx.filter((t) => t.type === filter);
  }, [tx, filter]);

  const counts = useMemo(() => {
    let earn = 0;
    let redeem = 0;
    for (const t of tx) {
      if (t.type === "earn") earn++;
      if (t.type === "redeem") redeem++;
    }
    return { all: tx.length, earn, redeem };
  }, [tx]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Historial
          </h1>
          <p className="mt-1 text-slate-500">
            Aquí verás tus acumulaciones y canjes.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/me")}>
          Volver a tarjeta
        </Button>
      </div>

      {!membership ? (
        <Card>
          <CardContent className="py-8 text-muted-foreground">
            No hay una tarjeta activa. Ve a <b>Cambiar tarjeta</b> y selecciona
            una.
          </CardContent>
        </Card>
      ) : null}

      {me.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {typeof me.error === "string"
            ? me.error
            : me.error?.message || "Error"}
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-extrabold">
              Movimientos
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={
                  filter === "all" ? "bg-primary text-primary-foreground" : ""
                }
              >
                Todo{" "}
                <Badge className="ml-2" variant="secondary">
                  {counts.all}
                </Badge>
              </Button>

              <Button
                variant={filter === "earn" ? "default" : "outline"}
                onClick={() => setFilter("earn")}
                className={
                  filter === "earn" ? "bg-primary text-primary-foreground" : ""
                }
              >
                Acumulé{" "}
                <Badge className="ml-2" variant="secondary">
                  {counts.earn}
                </Badge>
              </Button>

              <Button
                variant={filter === "redeem" ? "default" : "outline"}
                onClick={() => setFilter("redeem")}
                className={
                  filter === "redeem"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                Canjeé{" "}
                <Badge className="ml-2" variant="secondary">
                  {counts.redeem}
                </Badge>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Loading (simple) */}
          {me.status === "loading" && tx.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">
              Cargando historial…
            </div>
          ) : null}

          {/* Empty */}
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no hay movimientos para mostrar.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {mapTypeLabel(t.type)}
                    </p>

                    <p className="text-sm text-muted-foreground truncate">
                      {t.note || "—"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(t.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <Badge
                      variant={t.type === "redeem" ? "outline" : "secondary"}
                    >
                      {t.type}
                    </Badge>
                    <p className="text-lg font-extrabold tabular-nums">
                      {t.points}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
