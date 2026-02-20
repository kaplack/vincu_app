// frontend/src/redemptions/pages/Canjes.jsx

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  fetchRedemptionsThunk,
  consumeRedemptionThunk,
  cancelRedemptionThunk,
  selectIssuedRedemptions,
  selectRedeemedRedemptions,
  selectRedemptionsStatus,
} from "../slice/redemptionSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

function getCustomerLabel(r) {
  return (
    r.customerName ||
    r.customer?.fullName ||
    r.customer?.name ||
    r.customerMembership?.customer?.fullName ||
    r.customerMembershipId?.slice(0, 8) ||
    "—"
  );
}

export default function Canjes() {
  const dispatch = useDispatch();

  const issued = useSelector(selectIssuedRedemptions);
  const redeemed = useSelector(selectRedeemedRedemptions);
  const status = useSelector(selectRedemptionsStatus);

  const [tab, setTab] = useState("issued"); // issued | redeemed
  const [searchQuery, setSearchQuery] = useState("");
  const [codeToValidate, setCodeToValidate] = useState("");

  // Dialog Anular
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelCode, setCancelCode] = useState("");
  const [reasonCode, setReasonCode] = useState("customer_changed_mind");
  const [reasonText, setReasonText] = useState("");

  // Load initial lists
  useEffect(() => {
    dispatch(fetchRedemptionsThunk({ status: "issued", q: "" }));
    dispatch(fetchRedemptionsThunk({ status: "redeemed", q: "" }));
  }, [dispatch]);

  // Refetch on tab/search (simple, sin debounce por ahora)
  useEffect(() => {
    dispatch(fetchRedemptionsThunk({ status: tab, q: searchQuery }));
  }, [dispatch, tab, searchQuery]);

  const filteredIssued = useMemo(() => issued, [issued]);
  const filteredRedeemed = useMemo(() => redeemed, [redeemed]);

  const handleValidate = async () => {
    const redeemCode = codeToValidate.trim();
    if (!redeemCode) {
      toast.error("Ingresa un código de canje");
      return;
    }

    const res = await dispatch(consumeRedemptionThunk({ redeemCode }));
    if (consumeRedemptionThunk.fulfilled.match(res)) {
      toast.success(res.payload?.message || "Canje confirmado.");
      setCodeToValidate("");
      // refresca listas con el mismo q actual
      dispatch(fetchRedemptionsThunk({ status: "issued", q: searchQuery }));
      dispatch(fetchRedemptionsThunk({ status: "redeemed", q: searchQuery }));
    } else {
      toast.error(res.payload?.message || "No se pudo confirmar el canje.");
    }
  };

  const openCancelDialog = (redeemCode) => {
    setCancelCode(redeemCode);
    setReasonCode("customer_changed_mind");
    setReasonText("");
    setCancelOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelCode) return;

    if (reasonCode === "other" && reasonText.trim().length < 5) {
      toast.error("Describe el motivo (mínimo 5 caracteres).");
      return;
    }

    const res = await dispatch(
      cancelRedemptionThunk({
        redeemCode: cancelCode,
        reasonCode,
        reasonText: reasonCode === "other" ? reasonText.trim() : undefined,
      }),
    );

    if (cancelRedemptionThunk.fulfilled.match(res)) {
      toast.success(res.payload?.message || "Canje anulado.");
      setCancelOpen(false);
      dispatch(fetchRedemptionsThunk({ status: "issued", q: searchQuery }));
      // (si luego implementas tab Cancelados, lo cargas aparte)
    } else {
      toast.error(res.payload?.message || "No se pudo anular el canje.");
    }
  };

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Canjes</h1>
        <p className="text-slate-600">Validación y gestión de canjes</p>
      </div>

      {/* Validate Redemption */}
      <Card>
        <CardHeader>
          <CardTitle>Validar Canje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ingresa el código de canje..."
              value={codeToValidate}
              onChange={(e) => setCodeToValidate(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon" disabled>
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleValidate}
            className="w-full gap-2 md:w-auto"
            disabled={status === "loading"}
          >
            <CheckCircle className="h-4 w-4" />
            Confirmar Canje
          </Button>
        </CardContent>
      </Card>

      {/* Redemptions List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de Canjes</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar canjes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issued">
                Pendientes ({filteredIssued.length})
              </TabsTrigger>
              <TabsTrigger value="redeemed">
                Confirmados ({filteredRedeemed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issued" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssued.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono font-medium">
                        {r.redeemCode || r.code}
                      </TableCell>
                      <TableCell>{getCustomerLabel(r)}</TableCell>
                      <TableCell>{r.rewardNameSnapshot || "—"}</TableCell>
                      <TableCell>
                        {formatDate(r.issuedAt || r.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600 hover:text-green-700"
                            onClick={() =>
                              dispatch(
                                consumeRedemptionThunk({
                                  redeemCode: r.redeemCode || r.code,
                                }),
                              ).then((res) => {
                                if (
                                  consumeRedemptionThunk.fulfilled.match(res)
                                ) {
                                  toast.success(
                                    res.payload?.message || "Canje confirmado.",
                                  );
                                  dispatch(
                                    fetchRedemptionsThunk({
                                      status: "issued",
                                      q: searchQuery,
                                    }),
                                  );
                                  dispatch(
                                    fetchRedemptionsThunk({
                                      status: "redeemed",
                                      q: searchQuery,
                                    }),
                                  );
                                } else {
                                  toast.error(
                                    res.payload?.message ||
                                      "No se pudo confirmar.",
                                  );
                                }
                              })
                            }
                          >
                            <CheckCircle className="h-3 w-3" />
                            Validar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-600 hover:text-red-700"
                            onClick={() =>
                              openCancelDialog(r.redeemCode || r.code)
                            }
                          >
                            <XCircle className="h-3 w-3" />
                            Anular
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIssued.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-500"
                      >
                        No hay canjes pendientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="redeemed" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Fecha Canje</TableHead>
                    <TableHead>Validado Por</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedeemed.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono font-medium">
                        {r.redeemCode || r.code}
                      </TableCell>
                      <TableCell>{getCustomerLabel(r)}</TableCell>
                      <TableCell>{r.rewardNameSnapshot || "—"}</TableCell>
                      <TableCell>{formatDate(r.redeemedAt)}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {r.redeemedByUser?.name || r.redeemedByUserId || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Confirmado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRedeemed.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-slate-500"
                      >
                        No hay canjes confirmados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular canje</DialogTitle>
            <DialogDescription>
              El canje será anulado y los puntos se devolverán al cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Código: <span className="font-mono">{cancelCode}</span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Motivo</div>
              <Select value={reasonCode} onValueChange={setReasonCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_changed_mind">
                    Cliente cambió de opinión
                  </SelectItem>
                  <SelectItem value="operator_error">
                    Error del operador
                  </SelectItem>
                  <SelectItem value="reward_unavailable">
                    Recompensa no disponible
                  </SelectItem>
                  <SelectItem value="system_issue">
                    Problema del sistema
                  </SelectItem>
                  <SelectItem value="wrong_code">Código incorrecto</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reasonCode === "other" && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Describe el motivo</div>
                <Input
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Escribe el motivo (mín. 5 caracteres)..."
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmCancel} className="gap-2">
              <XCircle className="h-4 w-4" />
              Anular y devolver puntos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
