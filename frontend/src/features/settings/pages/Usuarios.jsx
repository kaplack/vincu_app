// frontend/src/features/settings/pages/Usuarios.jsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import {
  listBusinessUsers,
  inviteBusinessUser,
  updateBusinessUser,
  removeBusinessUser,
} from "@/features/settings/api/businessUsersApi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Mail,
  Plus,
  MoreVertical,
  Shield,
  User,
  UserMinus,
  UserCheck,
} from "lucide-react";

/**
 * MVP: Users & Access
 * - List members for the current business
 * - Invite user (mock)
 * - Change role (mock)
 * - Activate/Deactivate (mock)
 * - Remove from business (mock)
 *
 * Notes:
 * - Real enforcement will be done in backend later.
 * - This UI assumes only Owner/Superadmin can access this route (RoleGuard).
 */

const ROLES = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  OPERATOR: "OPERATOR",
};

function roleBadgeVariant(role) {
  if (role === ROLES.OWNER) return "default";

  return "secondary";
}

export default function Usuarios() {
  const outlet = useOutletContext?.() || {};
  const user = outlet.user || null;
  const currentBusiness = outlet.currentBusiness || null;

  // ----------------------------
  // Mock members (per business)
  // ----------------------------

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const businessId = currentBusiness?.id;
  const isUuid =
    typeof businessId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      businessId,
    );

  const fetchUsers = async () => {
    if (!businessId || !isUuid) return;

    try {
      setLoading(true);
      const { rows } = await listBusinessUsers(businessId);
      console.log("Fetched business users:", rows);
      setMembers(rows);
    } catch (e) {
      toast.error("No se pudo cargar usuarios del negocio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isUuid) return;
    fetchUsers();
  }, [businessId, isUuid]);

  const ownersCount = useMemo(
    () =>
      members.filter((m) => m.role === ROLES.OWNER && m.status !== "suspended")
        .length,
    [members],
  );

  // ----------------------------
  // Invite dialog (MODAL)
  // ----------------------------
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: ROLES.OPERATOR,
  });
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCreated, setInviteCreated] = useState(false);

  const openInvite = () => {
    setInviteForm({ email: "", role: ROLES.OPERATOR });
    setInviteLink("");
    setInviteCreated(false);
    setInviteOpen(true);
  };

  const handleInvite = async () => {
    const email = inviteForm.email.trim().toLowerCase();
    console.log("Inviting user...", inviteForm);
    if (!email) {
      console.error("Invalid email.");
      toast.error("Ingresa un email válido.");
      return;
    }
    if (!businessId || !isUuid) {
      console.error("No business selected.");
      toast.error("Selecciona un negocio.");
      return;
    }

    try {
      const { invitation } = await inviteBusinessUser(businessId, {
        email,
        role: inviteForm.role.toLowerCase(), // "owner" | "manager" | "operator"
      });

      const link = `${window.location.origin}/invite?token=${invitation.token}`;

      setInviteLink(link);
      setInviteCreated(true);

      toast.success("Invitación creada. Comparte el enlace.");
      fetchUsers();
    } catch (e) {
      toast.error("No se pudo crear la invitación.");
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Link copiado.");
    } catch {
      toast.error("No se pudo copiar el link.");
    }
  };

  const sendInviteWhatsApp = () => {
    const msg = `Te invitaron a operar ${businessName} en VINCU.\n\nAbre este enlace para registrarte o iniciar sesión y aceptar la invitación:\n${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ----------------------------
  // Actions
  // ----------------------------
  const isSelf = (member) =>
    member?.email?.toLowerCase() === (user?.email || "").toLowerCase();

  const canEditMember = (member) => {
    // Since route is Owner/Superadmin only, we keep it simple.
    // - Owner cannot remove/deactivate themselves
    // - Cannot remove the last owner
    if (!member) return false;
    if (isSelf(member)) return false;
    return true;
  };

  const canDemoteOwner = (member) => {
    if (!member) return false;
    if (member.role !== ROLES.OWNER) return true;
    // Prevent removing the last owner role
    return ownersCount > 1;
  };

  const changeRole = async (userId, nextRoleLabel) => {
    try {
      await updateBusinessUser(businessId, userId, {
        role: nextRoleLabel.toLowerCase(), // "owner" | "manager"
      });
      toast.success("Rol actualizado.");
      fetchUsers();
    } catch (e) {
      toast.error("No se pudo actualizar el rol.");
    }
  };

  const toggleActive = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";

    try {
      await updateBusinessUser(businessId, userId, { status: nextStatus });
      toast.success("Estado actualizado.");
      fetchUsers();
    } catch (e) {
      toast.error("No se pudo actualizar el estado.");
    }
  };

  const removeMember = async (userId) => {
    try {
      await removeBusinessUser(businessId, userId);
      toast.success("Usuario removido del negocio.");
      fetchUsers();
    } catch (e) {
      toast.error("No se pudo remover al usuario.");
    }
  };

  // ----------------------------
  // UI helpers
  // ----------------------------
  const businessName = currentBusiness?.name || "Negocio";
  const businessPlan = currentBusiness?.plan || "free";

  return (
    <div className="space-y-6">
      {/* Page header (like Negocio.jsx) */}
      <div>
        <h1 className="text-3xl font-bold">Usuarios y Accesos</h1>
        <p className="text-slate-600">
          Administra quién puede operar{" "}
          <span className="font-medium">{businessName}</span>.
        </p>
      </div>

      {/* Business summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Accesos del negocio
            </CardTitle>
            <p className="text-sm text-slate-600">
              Plan: <span className="font-medium">{businessPlan}</span>
            </p>
          </div>
          <Button onClick={openInvite} className="gap-2">
            <Plus className="h-4 w-4" />
            Invitar usuario
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-slate-600">
              <div className="col-span-4">Usuario</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Rol</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1 text-right">Acciones</div>
            </div>
            <Separator />
            {!businessId || !isUuid ? (
              <div className="px-4 py-8 text-center text-sm text-slate-600">
                Primero crea/selecciona un negocio para gestionar usuarios.
              </div>
            ) : loading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-600">
                Cargando usuarios...
              </div>
            ) : members.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-600">
                Aún no hay usuarios registrados para este negocio.
              </div>
            ) : (
              members.map((m) => {
                const isInvited = m.status === "invited";

                const statusLabel =
                  m.status === "active"
                    ? "Activo"
                    : m.status === "invited"
                      ? "Invitado"
                      : "Suspendido";

                const statusVariant =
                  m.status === "active"
                    ? "secondary"
                    : m.status === "invited"
                      ? "outline"
                      : "destructive";

                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-12 items-center gap-2 px-4 py-3"
                  >
                    <div className="col-span-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <div className="leading-tight">
                        <div className="text-sm font-medium">{m.name}</div>
                        {isSelf(m) && (
                          <div className="text-xs text-slate-500">
                            Tu cuenta
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 text-sm text-slate-700 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="truncate">{m.email}</span>
                    </div>

                    <div className="col-span-2">
                      <Badge variant={roleBadgeVariant(m.role)}>{m.role}</Badge>
                    </div>

                    <div className="col-span-2">
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            disabled={
                              isInvited ||
                              !canEditMember(m) ||
                              !canDemoteOwner(m)
                            }
                            onClick={() => {
                              const next =
                                m.role === ROLES.OWNER
                                  ? ROLES.MANAGER
                                  : ROLES.OWNER;
                              changeRole(m.id, next);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {m.role === ROLES.OWNER
                              ? "Cambiar a Manager"
                              : "Cambiar a Owner"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={isInvited || !canEditMember(m)}
                            onClick={() => toggleActive(m.id, m.status)}
                          >
                            {m.status === "suspended" ? (
                              <UserCheck className="mr-2 h-4 w-4" />
                            ) : (
                              <UserMinus className="mr-2 h-4 w-4" />
                            )}
                            {m.status === "suspended" ? "Activar" : "Suspender"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            disabled={isInvited || !canEditMember(m)}
                            onClick={() => removeMember(m.id)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remover del negocio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Separator className="my-6" />

          {/* Minimal "Permissions" summary (informative only for MVP) */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Resumen de permisos</div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Owner</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div>✅ Acceso total a Configuración.</div>
                  <div>✅ Puede invitar y administrar usuarios.</div>
                  <div>✅ Puede ver Plan y Facturación.</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manager</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div>✅ Opera Clientes, Puntos, Canjes, Recompensas.</div>
                  <div>❌ Sin acceso a Configuración / Plan / Usuarios.</div>
                </CardContent>
              </Card>
            </div>

            {/* <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  Acceso a Configuración
                </div>
                <div className="text-xs text-slate-600">
                  Solo Owner y Superadmin pueden administrar la configuración
                  del negocio.
                </div>
              </div>
              <Switch checked disabled />
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
            <DialogDescription>
              Envía una invitación para operar{" "}
              <span className="font-medium">{businessName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                placeholder="correo@negocio.com"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={
                    inviteForm.role === ROLES.OPERATOR ? "default" : "outline"
                  }
                  onClick={() =>
                    setInviteForm((p) => ({ ...p, role: ROLES.OPERATOR }))
                  }
                >
                  Operator
                </Button>

                <Button
                  type="button"
                  variant={
                    inviteForm.role === ROLES.MANAGER ? "default" : "outline"
                  }
                  onClick={() =>
                    setInviteForm((p) => ({ ...p, role: ROLES.MANAGER }))
                  }
                >
                  Manager
                </Button>
              </div>
              <p className="text-xs text-slate-600">
                Recomendado: Operator para operación diaria en una sucursal.
              </p>
            </div>

            {inviteCreated && (
              <div className="space-y-2">
                <Label>Link de invitación</Label>
                <Input value={inviteLink} readOnly />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyInviteLink}
                  >
                    Copiar invitación
                  </Button>
                  <Button type="button" onClick={sendInviteWhatsApp}>
                    Enviar por WhatsApp
                  </Button>
                </div>
                <p className="text-xs text-slate-600">
                  Puedes pegar este link en WhatsApp. El rol ya está definido en
                  el backend y no se puede cambiar desde el enlace.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setInviteOpen(false);
                setInviteLink("");
                setInviteCreated(false);
              }}
            >
              Cerrar
            </Button>

            {!inviteCreated && (
              <Button onClick={handleInvite}>Crear invitación</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
