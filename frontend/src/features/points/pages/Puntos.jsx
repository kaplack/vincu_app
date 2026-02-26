// frontend/src/pages/Puntos.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  fetchCustomersThunk,
  fetchMembershipDetailThunk,
  fetchByQrTokenThunk,
  fetchTransactionsThunk,
  selectCustomers,
  selectCustomersStatus,
  selectSelectedCustomer,
  selectTransactionsByMembershipId,
} from "@/features/customers/slice/customerSlice";

import {
  createPointsTxThunk,
  selectPointsCreateStatus,
  selectPointsCreateError,
} from "@/features/points/slice/pointsSlice";

import { selectSelectedBranchId } from "@/features/settings/slice/businessSlice";
import { toast } from "sonner";
import { QrCode } from "lucide-react";

function safeDate(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function Puntos() {
  const dispatch = useDispatch();

  // Redux data
  const customers = useSelector(selectCustomers);
  const customersStatus = useSelector(selectCustomersStatus);
  const selectedCustomerDetail = useSelector(selectSelectedCustomer); // detail del membership consultado
  const selectedBranchId = useSelector(selectSelectedBranchId);

  const createStatus = useSelector(selectPointsCreateStatus);
  const createError = useSelector(selectPointsCreateError);

  // Local UI state
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);

  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");

  const [searchQuery, setSearchQuery] = useState(""); // filtro del historial

  // local lock for buttons while creating
  const [isCreatingLocal, setIsCreatingLocal] = useState(false);

  // Transactions selector depende del membershipId
  const txState = useSelector(
    selectTransactionsByMembershipId(selectedMembershipId || "___none___"),
  );
  const transactions = txState?.items || [];
  const txStatus = txState?.status || "idle";

  // Load customers on mount
  useEffect(() => {
    dispatch(fetchCustomersThunk());
  }, [dispatch]);

  // Derived: quick selected row from list
  const selectedRow = useMemo(() => {
    if (!selectedMembershipId) return null;
    return (
      customers.find((c) => c.membershipId === selectedMembershipId) || null
    );
  }, [customers, selectedMembershipId]);

  // Suggestions
  const filteredCustomers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);

    return customers
      .filter((c) => {
        const fullName = (c.fullName || "").toLowerCase();
        const phone = (c.phone || "").toLowerCase();
        return fullName.includes(q) || phone.includes(q);
      })
      .slice(0, 8);
  }, [customers, memberSearch]);

  // Load detail + transactions when selection changes
  useEffect(() => {
    if (!selectedMembershipId) return;

    dispatch(fetchMembershipDetailThunk(selectedMembershipId));
    dispatch(fetchTransactionsThunk(selectedMembershipId));
  }, [dispatch, selectedMembershipId]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((t) => {
      const desc = (t.note || "").toLowerCase();
      const type = (t.type || "").toLowerCase();
      const opName = [t.operator?.name || "", t.operator?.lastName || ""]
        .join(" ")
        .trim()
        .toLowerCase();

      const branchName = (t.branch?.name || "").toLowerCase();
      return (
        desc.includes(q) ||
        type.includes(q) ||
        opName.includes(q) ||
        branchName.includes(q)
      );
    });
  }, [transactions, searchQuery]);

  async function handleQrLookup() {
    const qrToken = prompt("Pega el QR token");
    if (!qrToken) return;

    const res = await dispatch(fetchByQrTokenThunk(qrToken.trim()));
    if (fetchByQrTokenThunk.fulfilled.match(res)) {
      const item = res.payload?.item;
      if (!item?.id) {
        toast.error("No se encontró el cliente por QR.");
        return;
      }
      // item.id es el membershipId según tu backend
      setSelectedMembershipId(item.id);
      setMemberSearch(item.phone || "");
      toast.success("Cliente encontrado por QR.");
    } else {
      toast.error(
        res.payload?.message || "QR inválido o cliente no encontrado",
      );
    }
  }

  async function handleEarn() {
    if (isCreatingLocal) return;
    if (!selectedMembershipId) return toast.error("Selecciona un cliente.");

    const pts = Number(points);
    if (!Number.isFinite(pts) || !Number.isInteger(pts) || pts <= 0) {
      return toast.error("Los puntos deben ser un entero mayor a 0.");
    }

    setIsCreatingLocal(true);
    try {
      const payload = {
        membershipId: selectedMembershipId,
        type: "earn",
        points: pts,
        note: note?.trim() || "Ingreso de puntos",
        source: "manual",
        branchId: selectedBranchId || null,
        idempotencyKey: crypto.randomUUID(),
      };

      const res = await dispatch(createPointsTxThunk(payload));
      if (createPointsTxThunk.fulfilled.match(res)) {
        toast.success("Puntos agregados.");
        dispatch(fetchMembershipDetailThunk(selectedMembershipId));
        dispatch(fetchTransactionsThunk(selectedMembershipId));
        setPoints("");
        setNote("");
      } else {
        toast.error(res.payload?.message || "No se pudo agregar puntos");
      }
    } finally {
      setIsCreatingLocal(false);
    }
  }

  async function handleAdjust(sign) {
    if (isCreatingLocal) return;

    if (!selectedMembershipId) return toast.error("Selecciona un cliente.");

    const pts = Number(points);
    if (!Number.isFinite(pts) || !Number.isInteger(pts) || pts <= 0) {
      return toast.error("Para ajuste, puntos enteros > 0.");
    }
    if (!note?.trim()) {
      return toast.error("Para ajuste manual, la descripción es obligatoria.");
    }
    setIsCreatingLocal(true);

    try {
      const payload = {
        membershipId: selectedMembershipId,
        type: "adjust",
        points: sign === "minus" ? -pts : pts,
        note: note.trim(),
        source: "manual",
        branchId: selectedBranchId || null,
        idempotencyKey: `adj-${selectedMembershipId}-${Date.now()}`,
      };

      const res = await dispatch(createPointsTxThunk(payload));
      if (createPointsTxThunk.fulfilled.match(res)) {
        toast.success("Ajuste registrado.");

        dispatch(fetchMembershipDetailThunk(selectedMembershipId));
        dispatch(fetchTransactionsThunk(selectedMembershipId));

        setPoints("");
        setNote("");
      } else {
        toast.error(res.payload?.message || "No se pudo registrar el ajuste");
      }
    } finally {
      setIsCreatingLocal(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Puntos</h1>

        <Button variant="outline" onClick={handleQrLookup} className="gap-2">
          <QrCode className="h-4 w-4" />
          Buscar por QR
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operación */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Registrar movimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente (buscar por teléfono o nombre)</Label>
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Ej: 987654321"
              />

              {memberSearch.trim().length > 0 &&
                filteredCustomers.length > 0 && (
                  <div className="border rounded-md p-2 space-y-1">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.membershipId}
                        type="button"
                        onClick={() => {
                          setSelectedMembershipId(c.membershipId);
                          setMemberSearch(c.phone || c.fullName || "");
                        }}
                        className={`w-full text-left px-2 py-1 rounded hover:bg-muted ${
                          selectedMembershipId === c.membershipId
                            ? "bg-muted"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{c.fullName}</div>
                          <div className="text-sm opacity-70">
                            {c.pointsBalance} pts
                          </div>
                        </div>
                        <div className="text-sm opacity-70">{c.phone}</div>
                      </button>
                    ))}
                  </div>
                )}

              {(selectedRow || selectedCustomerDetail) && (
                <div className="text-sm opacity-80">
                  <div>
                    <span className="font-medium">Seleccionado:</span>{" "}
                    {selectedRow?.fullName ||
                      `${selectedCustomerDetail?.customer?.firstName || ""} ${selectedCustomerDetail?.customer?.lastName || ""}`.trim()}{" "}
                    —{" "}
                    {selectedRow?.phone ||
                      selectedCustomerDetail?.customer?.phone ||
                      "-"}
                  </div>
                  <div>
                    <span className="font-medium">Saldo:</span>{" "}
                    {selectedCustomerDetail?.pointsBalance ??
                      selectedRow?.pointsBalance ??
                      0}{" "}
                    pts
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Puntos</Label>
              <Input
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Ej: 10"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Compra - S/ 25"
              />
            </div>

            {createStatus === "failed" && (
              <div className="text-sm text-red-600">
                {createError?.message || createError || "Error al registrar."}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleEarn}
                disabled={createStatus === "loading" || isCreatingLocal}
              >
                {createStatus === "loading" ? "Registrando..." : "Sumar Puntos"}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleAdjust("minus")}
                disabled={createStatus === "loading" || isCreatingLocal}
              >
                Ajuste -
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAdjust("plus")}
                disabled={createStatus === "loading" || isCreatingLocal}
              >
                Ajuste +
              </Button>
            </div>

            {customersStatus === "loading" && (
              <div className="text-sm opacity-70">Cargando clientes...</div>
            )}
          </CardContent>
        </Card>

        {/* Historial */}
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-2">
            <CardTitle>Historial</CardTitle>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar movimientos..."
            />
          </CardHeader>

          <CardContent>
            {!selectedMembershipId ? (
              <div className="text-sm opacity-70">
                Selecciona un cliente para ver el historial.
              </div>
            ) : txStatus === "loading" ? (
              <div className="text-sm opacity-70">Cargando historial...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Puntos</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Sucursal</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm opacity-70"
                        >
                          No hay movimientos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((t) => {
                        const operatorName = [
                          t.operator?.name || "",
                          t.operator?.lastName || "",
                        ]
                          .join(" ")
                          .trim();

                        return (
                          <TableRow key={t.id}>
                            <TableCell>
                              {safeDate(t.createdAt || t.date)}
                            </TableCell>
                            <TableCell>{t.type}</TableCell>
                            <TableCell
                              className={
                                t.points < 0
                                  ? "text-red-600"
                                  : "text-emerald-700"
                              }
                            >
                              {t.points}
                            </TableCell>
                            <TableCell>{t.note || "-"}</TableCell>
                            <TableCell>{operatorName || "-"}</TableCell>
                            <TableCell>{t.branch?.name || "-"}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
