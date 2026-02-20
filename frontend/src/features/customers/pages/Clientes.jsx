// frontend/src/features/loyalty/pages/Clientes.jsx
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
import { Search, Eye, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  fetchCustomersThunk,
  fetchMembershipDetailThunk,
  fetchTransactionsThunk,
  clearSelected,
  selectCustomers,
  selectCustomersStatus,
  selectSelectedCustomer,
  selectSelectedCustomerStatus,
  selectTransactionsByMembershipId,
} from "@/features/customers/slice/customerSlice";

import QRCode from "qrcode";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

export default function Clientes() {
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const items = useSelector(selectCustomers);
  const status = useSelector(selectCustomersStatus);

  const selected = useSelector(selectSelectedCustomer);
  const selectedStatus = useSelector(selectSelectedCustomerStatus);

  const tx = useSelector(
    selectTransactionsByMembershipId(selectedMembershipId),
  );

  useEffect(() => {
    dispatch(fetchCustomersThunk());
  }, [dispatch]);

  const filteredMemberships = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter((m) => {
      const fullName = (m.fullName || "").toLowerCase();
      const phone = (m.phone || "").toLowerCase();
      const qrToken = (m.qrToken || "").toLowerCase();
      // Si luego agregas documento al payload, lo incluyes aquí
      return fullName.includes(q) || phone.includes(q) || qrToken.includes(q);
    });
  }, [items, searchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!selected?.qrToken) {
        setQrDataUrl("");
        return;
      }

      try {
        const url = await QRCode.toDataURL(selected.qrToken, {
          margin: 1,
          width: 180,
        });

        if (!cancelled) setQrDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR:", err);
        if (!cancelled) setQrDataUrl("");
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [selected]);

  function openDetail(membershipId) {
    setSelectedMembershipId(membershipId);
    dispatch(fetchMembershipDetailThunk(membershipId));
  }

  function closeDetail() {
    setSelectedMembershipId(null);
    dispatch(clearSelected());
  }

  function handleViewHistory() {
    if (!selectedMembershipId) return;
    dispatch(fetchTransactionsThunk(selectedMembershipId));
  }

  const publicBaseUrl =
    import.meta.env.VITE_PUBLIC_URL || window.location.origin;

  const publicLink = selected?.publicToken
    ? `${publicBaseUrl}/c/${selected.publicToken}`
    : "";

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-slate-600">Gestión de membresías</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por teléfono, documento de identidad, nombre o código QR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                // Aquí luego conectamos el scanner real (cam o input)
                // Por ahora no rompe UI.
              }}
            >
              <QrCode className="h-4 w-4" />
              Escanear QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Clientes (
            {status === "loading" ? "..." : filteredMemberships.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {status === "loading" && (
                <TableRow>
                  <TableCell colSpan={6} className="text-slate-500">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              )}

              {status !== "loading" && filteredMemberships.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-slate-500">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}

              {filteredMemberships.map((member) => (
                <TableRow key={member.membershipId}>
                  <TableCell className="font-medium">
                    {member.fullName}
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {member.pointsBalance} pts
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                      className={
                        member.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }
                    >
                      {member.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(member.registeredAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDetail(member.membershipId)}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog
        open={!!selectedMembershipId}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
          </DialogHeader>

          {selectedStatus === "loading" && (
            <div className="py-6 text-slate-500">Cargando detalle...</div>
          )}

          {selectedStatus !== "loading" && selected && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Nombre
                  </label>
                  <p className="text-lg font-semibold">{selected.fullName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Teléfono
                  </label>
                  <p className="text-lg font-semibold">{selected.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Puntos Actuales
                  </label>
                  <p className="text-lg font-semibold">
                    {selected.pointsBalance} pts
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Fecha de Registro
                  </label>
                  <p>{formatDate(selected.registeredAt)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Token QR
                  </label>
                  <p className="break-all font-mono text-sm">
                    {selected.qrToken}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Código QR
                  </label>

                  <div className="mt-2 flex items-start gap-4">
                    <div className="rounded-md border bg-white p-3">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR"
                          className="h-[96px] w-[96px]"
                        />
                      ) : (
                        <div className="flex h-[96px] w-[96px] items-center justify-center text-xs text-slate-400">
                          QR...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">
                    Link de consulta
                  </label>

                  <div className="mt-2 flex gap-2">
                    <Input
                      value={publicLink}
                      disabled
                      className="font-mono text-sm"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!publicLink) return;
                        navigator.clipboard.writeText(publicLink);
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>

              {/* <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleViewHistory}>
                  Ver Historial
                </Button>
                <Button variant="outline" disabled>
                  Reemitir Tarjeta
                </Button>
              </div> */}

              {/* Mini placeholder del historial (opcional) */}
              {tx?.status === "loading" && (
                <div className="text-slate-500">Cargando historial...</div>
              )}
              {tx?.status === "succeeded" && tx.items?.length > 0 && (
                <div className="rounded-md border p-3 text-sm">
                  <div className="mb-2 font-medium">Últimos movimientos</div>
                  <div className="space-y-1">
                    {tx.items.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex justify-between">
                        <span>
                          {t.type} {t.points > 0 ? `+${t.points}` : t.points}{" "}
                          pts
                        </span>
                        <span className="text-slate-500">
                          {formatDate(t.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
