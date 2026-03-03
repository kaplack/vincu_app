// frontend/src/features/redemptions/pages/CanjesDirecto.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { QrCode, Search, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { directRedeemThunk } from "../slice/redemptionSlice";
import {
  fetchRewardsThunk,
  selectRewards,
  selectRewardsStatus,
} from "@/features/rewards/slice/rewardSlice";

import {
  fetchCustomersThunk,
  selectCustomers,
  selectCustomersStatus,
} from "@/features/customers/slice/customerSlice";

const MOCK_CUSTOMERS = [
  {
    id: "c1",
    name: "María López",
    doc: "DNI 76432198",
    phone: "999111222",
    points: 120,
  },
  {
    id: "c2",
    name: "Juan Pérez",
    doc: "DNI 71234567",
    phone: "988777666",
    points: 45,
  },
];

const MOCK_REWARDS = [
  { id: "r1", name: "Porción + gaseosa", cost: 30, stock: 10 },
  { id: "r2", name: "Pizza familiar (promo)", cost: 100, stock: 3 },
  { id: "r3", name: "Postre", cost: 40, stock: 8 },
];

export default function CanjesDirecto() {
  const [query, setQuery] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const rewards = useSelector(selectRewards);
  const rewardsStatus = useSelector(selectRewardsStatus);

  const customers = useSelector(selectCustomers);
  const customersStatus = useSelector(selectCustomersStatus);

  useEffect(() => {
    dispatch(fetchRewardsThunk());
    dispatch(fetchCustomersThunk());
  }, [dispatch]);

  function safeStr(v) {
    return (v ?? "").toString().toLowerCase();
  }

  function pickPhone(c) {
    return (
      c?.phone ??
      c?.customer?.phone ??
      c?.membership?.phone ??
      ""
    ).toString();
  }

  function pickDni(c) {
    return (
      c?.dni ??
      c?.documentNumber ??
      c?.docNumber ??
      c?.customer?.dni ??
      c?.customer?.documentNumber ??
      ""
    ).toString();
  }

  function pickName(c) {
    const first = c?.firstName ?? c?.customer?.firstName ?? "";
    const last = c?.lastName ?? c?.customer?.lastName ?? "";
    const full =
      c?.fullName ?? c?.customer?.fullName ?? `${first} ${last}`.trim();
    return full || c?.name || c?.customer?.name || "";
  }

  function pickPoints(c) {
    return c?.pointsBalance ?? c?.membership?.pointsBalance ?? c?.points ?? 0;
  }

  function pickMembershipId(c) {
    return c?.id ?? c?.membershipId ?? c?.membership?.id ?? null;
  }

  const results = useMemo(() => {
    const list = customers || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter((c) => {
      const phone = pickPhone(c);
      const dni = pickDni(c);
      const name = pickName(c);

      return (
        safeStr(phone).includes(q) ||
        safeStr(dni).includes(q) ||
        safeStr(name).includes(q)
      );
    });
  }, [customers, query]);

  const selectedCustomer = useMemo(() => {
    return (
      (customers || []).find(
        (c) => pickMembershipId(c) === selectedMembershipId,
      ) || null
    );
  }, [customers, selectedMembershipId]);

  const rewardsActive = useMemo(() => {
    return (rewards || []).filter((r) => r.isActive && !r.isArchived);
  }, [rewards]);

  const selectedReward = useMemo(() => {
    return (rewards || []).find((r) => r.id === selectedRewardId) || null;
  }, [rewards, selectedRewardId]);

  const membershipId = pickMembershipId(selectedCustomer);
  const rewardId = selectedReward?.id || null;

  const canRedeem =
    Boolean(selectedCustomer && selectedReward) &&
    pickPoints(selectedCustomer) >= (selectedReward.pointsRequired ?? 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Paso 1: Identificar cliente */}
      <Card>
        <CardHeader>
          <CardTitle>1 Identificar cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Buscar por teléfono o DNI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outline" size="icon" title="Escanear QR (mock)">
              <QrCode className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {results.map((c) => {
              const mid = pickMembershipId(c);
              const active = mid === selectedMembershipId;
              return (
                <button
                  key={c.customerId}
                  type="button"
                  onClick={() => setSelectedMembershipId(mid)}
                  className={[
                    "w-full rounded-md border p-3 text-left transition",
                    active
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-slate-500">
                        {c.fullName} · {c.phone}
                      </div>
                    </div>
                    <Badge>{c.pointsBalance} pts</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {!selectedCustomer && (
            <div className="text-sm text-slate-500">
              Tip: puedes canjear sin buscar, solo dale click al nombre del
              cliente.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paso 2: Catálogo + Confirmación */}
      <Card>
        <CardHeader>
          <CardTitle>2) Elegir recompensa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedCustomer ? (
            <div className="rounded-md border border-dashed p-6 text-center text-slate-500">
              Selecciona primero un cliente para ver su canje.
            </div>
          ) : (
            <>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="font-medium">{selectedCustomer.fullName}</div>
                <div className="text-sm text-slate-600">
                  Puntos disponibles:{" "}
                  <span className="font-semibold">
                    {selectedCustomer.pointsBalance}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {rewardsStatus === "loading" ? (
                  <div className="text-sm text-slate-500">
                    Cargando catálogo...
                  </div>
                ) : rewardsActive.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-slate-500">
                    No tienes recompensas activas. Ve a Recompensas y activa al
                    menos una.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {rewardsActive.map((r) => {
                      const active = r.id === selectedRewardId;

                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRewardId(r.id)}
                          className={[
                            "rounded-md border p-3 text-left transition hover:bg-slate-50",
                            active
                              ? "border-blue-600 bg-blue-50"
                              : "border-slate-200",
                          ].join(" ")}
                        >
                          <div className="font-medium">{r.name}</div>

                          <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                            <span>{r.pointsRequired} pts</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  className="gap-2"
                  onClick={() => setConfirmOpen(true)}
                  disabled={!canRedeem}
                >
                  <CheckCircle className="h-4 w-4" />
                  Canjear
                </Button>
                {!selectedReward && (
                  <div className="text-sm text-slate-500">
                    Elige una recompensa.
                  </div>
                )}
                {selectedReward &&
                  selectedCustomer.points < selectedReward.cost && (
                    <div className="text-sm text-red-600">
                      Puntos insuficientes para esta recompensa.
                    </div>
                  )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar canje</DialogTitle>
            <DialogDescription>
              El negocio confirma el canje. El cliente no hace nada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Cliente:</span>{" "}
              <span className="font-medium">
                {selectedCustomer?.fullName || "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Recompensa:</span>{" "}
              <span className="font-medium">{selectedReward?.name || "—"}</span>
            </div>
            <div>
              <span className="text-slate-500">Costo:</span>{" "}
              <span className="font-medium">
                {selectedReward?.pointsRequired || 0} pts
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={submitting}
              onClick={async () => {
                try {
                  if (!membershipId || !rewardId) {
                    toast.error("Falta identificar cliente o recompensa.");
                    return;
                  }

                  setSubmitting(true);

                  const res = await dispatch(
                    directRedeemThunk({
                      membershipId,
                      rewardId,
                      source: "manual",
                    }),
                  ).unwrap();

                  toast.success(res?.message || "Canje confirmado.");

                  setConfirmOpen(false);
                  setSelectedRewardId(null);
                } catch (err) {
                  toast.error(err?.message || "No se pudo confirmar el canje.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Confirmando..." : "Confirmar canje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
