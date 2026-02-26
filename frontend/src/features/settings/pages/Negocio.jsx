// frontend/src/features/settings/pages/Negocio.jsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchBusinessesThunk,
  setSelectedBusinessId,
  selectBusinesses,
  selectSelectedBusinessId,
  selectBusinessStatus,
  selectBusinessError,
  clearBusinessError,
  createBusinessThunk,
  createBranchThunk,
  updateBusinessThunk,
} from "@/features/settings/slice/businessSlice";

import BusinessTreeTable from "@/features/settings/components/BusinessTreeTable";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { Building2, Save } from "lucide-react";

import CreateBusinessModal from "@/features/settings/components/configuracion/CreateBusinessModal";
import CreateBranchModal from "@/features/settings/components/configuracion/CreateBranchModal";
import UpgradePlanModal from "@/features/settings/components/configuracion/UpgradePlanModal";
import BusinessCategorySelect from "@/features/settings/components/BusinessCategoySelect";

// Ubigeo Select
import UbigeoSelect from "@/features/settings/components/UbigeoSelect";

const DEFAULT_CATEGORY = "Gastronomía";

function canCreateMoreBusinesses(planKey, businessCount) {
  if (planKey === "pro") return true;
  return businessCount < 1;
}

function canCreateBranches(planKey) {
  return planKey === "pro";
}

export default function Configuracion() {
  // Nuevo: item seleccionado (puede ser principal o sucursal)
  const [selectedItemId, setSelectedItemId] = useState(null);

  const outlet = useOutletContext?.() || {};
  const user = outlet.user || null; // not used for plan rules anymore, but ok to keep

  const dispatch = useDispatch();

  const businesses = useSelector(selectBusinesses);
  const selectedBusinessId = useSelector(selectSelectedBusinessId);
  const status = useSelector(selectBusinessStatus);
  const error = useSelector(selectBusinessError);

  // Load businesses on mount
  useEffect(() => {
    dispatch(fetchBusinessesThunk());
  }, [dispatch]);

  // Show errors as toast (and clear)
  useEffect(() => {
    if (!error) return;

    const msg =
      typeof error === "string"
        ? error
        : error?.message || error?.error || "Ocurrió un error";

    toast.error(msg);
    dispatch(clearBusinessError());
  }, [error, dispatch]);

  // Principals only (for selection + business count)
  const principalBusinesses = useMemo(
    () => businesses.filter((b) => !b.parentId),
    [businesses],
  );

  useEffect(() => {
    // Si aún no hay selección, selecciona el primer negocio principal por defecto
    if (selectedItemId) return;
    if (!principalBusinesses.length) return;

    const first = principalBusinesses[0];
    setSelectedItemId(first.id);
    dispatch(setSelectedBusinessId(first.id));
  }, [principalBusinesses, selectedItemId, dispatch]);

  const selectedBusiness = useMemo(() => {
    if (!selectedBusinessId) return null;
    return businesses.find((b) => b.id === selectedBusinessId) || null;
  }, [businesses, selectedBusinessId]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return businesses.find((b) => b.id === selectedItemId) || null;
  }, [businesses, selectedItemId]);

  const selectedPrincipal = useMemo(() => {
    if (!selectedItem) return null;
    if (!selectedItem.parentId) return selectedItem; // ya es principal
    return businesses.find((b) => b.id === selectedItem.parentId) || null;
  }, [businesses, selectedItem]);

  // Plan rules are per selected principal business
  const planKey = (selectedPrincipal?.planKey || "free")
    .toString()
    .toLowerCase();

  const businessCount = principalBusinesses.length;
  const allowMoreBusinesses = canCreateMoreBusinesses(planKey, businessCount);
  const allowBranches = canCreateBranches(planKey);

  // ----------------------------
  // Upgrade modal
  // ----------------------------
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const openUpgrade = (reason) => {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  };

  // ----------------------------
  // Create Business modal
  // ----------------------------
  const [createBusinessOpen, setCreateBusinessOpen] = useState(false);
  const [createBusinessForm, setCreateBusinessForm] = useState({
    commercialName: "",
    legalName: "",
    category: DEFAULT_CATEGORY,
  });

  const openCreateBusiness = () => {
    // If you want to enforce "1 business max" based on plan rules, you'd need an "account plan".
    // Since plan is per business, allow creating the first one if there are none.
    if (businessCount >= 1 && !allowMoreBusinesses) {
      openUpgrade("Para crear más negocios necesitas cambiar a Plan Pro.");
      return;
    }

    setCreateBusinessForm({
      commercialName: "",
      legalName: "",
      category: DEFAULT_CATEGORY,
    });
    setCreateBusinessOpen(true);
  };

  // ----------------------------
  // Create Business submit handler
  // ----------------------------
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);

  const handleCreateBusiness = async () => {
    if (isCreatingBusiness) return; // 👈 anti doble tap
    setIsCreatingBusiness(true);

    const commercialName = createBusinessForm.commercialName.trim();
    const legalName = createBusinessForm.legalName.trim();
    const category = (createBusinessForm.category || DEFAULT_CATEGORY).trim();

    if (!commercialName) return toast.error("Ingresa el nombre comercial.");
    if (!legalName) return toast.error("Ingresa la razón social.");
    if (!category) return toast.error("Selecciona una categoría.");

    try {
      const created = await dispatch(
        createBusinessThunk({ commercialName, legalName, category }),
      ).unwrap();

      // Ensure list is fresh (includes possible server-side computed fields)
      await dispatch(fetchBusinessesThunk()).unwrap();

      if (created?.id) {
        setSelectedItemId(created.id);
        dispatch(setSelectedBusinessId(created.id));
      }

      setCreateBusinessOpen(false);
      toast.success("Negocio creado.");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || err?.error || "No se pudo crear el negocio";
      toast.error(msg);
    } finally {
      setIsCreatingBusiness(false);
    }
  };

  // ----------------------------
  // Create Branch modal
  // ----------------------------
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const [branchParent, setBranchParent] = useState({ id: null, name: "" });

  const [createBranchForm, setCreateBranchForm] = useState({
    commercialName: "",
    address: "",
    phone: "",
    isActive: true,
    // optional ubigeo for branch (you can add UI later)
    departamento: "",
    provincia: "",
    distrito: "",
    ubigeoId: "",
  });

  const openCreateBranch = (parentRow) => {
    if (!allowBranches) {
      openUpgrade("Para crear sucursales necesitas cambiar a Plan Pro.");
      return;
    }

    setBranchParent({
      id: parentRow?.id || null,
      name: parentRow?.name || parentRow?.commercialName || "",
    });

    setCreateBranchForm({
      commercialName: "",
      address: "",
      phone: "",
      isActive: true,
      departamento: "",
      provincia: "",
      distrito: "",
      ubigeoId: "",
    });

    setCreateBranchOpen(true);
  };

  const handleCreateBranch = async () => {
    const businessId = branchParent.id;
    const commercialName = createBranchForm.commercialName.trim();
    const address = createBranchForm.address.trim();

    if (!businessId) return toast.error("No se detectó el negocio principal.");
    if (!commercialName)
      return toast.error("Ingresa el nombre de la sucursal.");
    if (!address) return toast.error("Ingresa la dirección de la sucursal.");

    const payload = {
      commercialName,
      address,
      phone: createBranchForm.phone.trim() || null,
      isActive: !!createBranchForm.isActive,
      departamento: createBranchForm.departamento?.trim() || null,
      provincia: createBranchForm.provincia?.trim() || null,
      distrito: createBranchForm.distrito?.trim() || null,
      ubigeoId: createBranchForm.ubigeoId?.trim() || null,
    };

    try {
      await dispatch(createBranchThunk({ businessId, payload })).unwrap();

      await dispatch(fetchBusinessesThunk()).unwrap();

      setCreateBranchOpen(false);
      toast.success("Sucursal creada.");
    } catch (err) {
      // If backend denies because not pro, open upgrade modal
      const code = err?.code || err?.errorCode;
      const msg =
        typeof err === "string"
          ? err
          : err?.message || err?.error || "No se pudo crear la sucursal";

      if (
        code === "BIZ_PLAN_PRO_REQUIRED" ||
        msg.toLowerCase().includes("plan")
      ) {
        openUpgrade("Para crear sucursales necesitas cambiar a Plan Pro.");
        return;
      }

      toast.error(msg);
    }
  };

  const handleSaveBranch = async () => {
    const isBranch = Boolean(selectedItem?.parentId);
    if (!selectedItem || !isBranch) return;

    const patch = {
      commercialName: branchTradeName.trim(),
      phone: branchPhone.trim() || null,
      address: branchAddress.trim() || null,
      departamento: branchUbigeo.departamento || null,
      provincia: branchUbigeo.provincia || null,
      distrito: branchUbigeo.distrito || null,
      ubigeoId: branchUbigeo.ubigeoId || null,
    };

    if (!patch.commercialName)
      return toast.error("Ingresa el nombre comercial.");

    try {
      await dispatch(
        updateBusinessThunk({ businessId: selectedItem.id, patch }),
      ).unwrap();

      await dispatch(fetchBusinessesThunk()).unwrap();
      toast.success("Sucursal guardada.");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || err?.error || "No se pudo guardar la sucursal";
      toast.error(msg);
    }
  };

  // ----------------------------
  // Inline form state (selected principal)
  // ----------------------------
  const [tradeName, setTradeName] = useState(""); // Nombre comercial
  const [businessName, setBusinessName] = useState(""); // Razón social
  const [businessUrl, setBusinessUrl] = useState("");
  const [businessCategory, setBusinessCategory] = useState(DEFAULT_CATEGORY);
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessRuc, setBusinessRuc] = useState("");

  const [ubigeo, setUbigeo] = useState({
    departamento: "",
    provincia: "",
    distrito: "",
    ubigeoId: "",
  });

  useEffect(() => {
    if (!selectedBusiness) {
      setTradeName("");
      setBusinessName("");
      setBusinessUrl("");
      setBusinessCategory(DEFAULT_CATEGORY);
      setBusinessEmail("");
      setBusinessPhone("");
      setAddress("");
      setBusinessRuc("");
      setUbigeo({
        departamento: "",
        provincia: "",
        distrito: "",
        ubigeoId: "",
      });
      return;
    }

    setTradeName(
      selectedBusiness.commercialName || selectedBusiness.name || "",
    );
    setBusinessName(selectedBusiness.legalName || "");
    setBusinessUrl(selectedBusiness.businessUrl || "");
    setBusinessCategory(selectedBusiness.category || DEFAULT_CATEGORY);
    setBusinessEmail(selectedBusiness.email || "");
    setBusinessPhone(selectedBusiness.phone || "");
    setAddress(selectedBusiness.address || "");
    setBusinessRuc(selectedBusiness.ruc || "");

    setUbigeo({
      departamento: selectedBusiness.departamento || "",
      provincia: selectedBusiness.provincia || "",
      distrito: selectedBusiness.distrito || "",
      ubigeoId: selectedBusiness.ubigeoId || "",
    });
  }, [selectedBusiness]);

  // ----------------------------
  // Inline form state (selected branch)
  // ----------------------------
  const [branchTradeName, setBranchTradeName] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  const [branchUbigeo, setBranchUbigeo] = useState({
    departamento: "",
    provincia: "",
    distrito: "",
    ubigeoId: "",
  });

  useEffect(() => {
    const isBranch = Boolean(selectedItem?.parentId);

    if (!isBranch) {
      setBranchTradeName("");
      setBranchPhone("");
      setBranchAddress("");
      setBranchUbigeo({
        departamento: "",
        provincia: "",
        distrito: "",
        ubigeoId: "",
      });
      return;
    }

    setBranchTradeName(selectedItem.commercialName || selectedItem.name || "");
    setBranchPhone(selectedItem.phone || "");
    setBranchAddress(selectedItem.address || "");

    setBranchUbigeo({
      departamento: selectedItem.departamento || "",
      provincia: selectedItem.provincia || "",
      distrito: selectedItem.distrito || "",
      ubigeoId: selectedItem.ubigeoId || "",
    });
  }, [selectedItem]);

  // ----------------------------
  // Points rules (UI only for now)
  // ----------------------------
  const [welcomePointsEnabled, setWelcomePointsEnabled] = useState(true);
  const [welcomePointsAmount, setWelcomePointsAmount] = useState("50");
  const [pointsPerPurchase, setPointsPerPurchase] = useState("10");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("100");

  const handleSaveAll = async () => {
    if (!selectedBusiness) {
      toast.message(
        "Crea o selecciona un negocio para guardar su configuración.",
      );
      return;
    }

    const patch = {
      commercialName: tradeName.trim(),
      legalName: businessName.trim(),
      businessUrl: businessUrl.trim() || null,
      category: businessCategory,
      email: businessEmail.trim() || null,
      phone: businessPhone.trim() || null,
      address: address.trim() || null,
      ruc: businessRuc.trim() || null,
      departamento: ubigeo.departamento || null,
      provincia: ubigeo.provincia || null,
      distrito: ubigeo.distrito || null,
      ubigeoId: ubigeo.ubigeoId || null,
    };

    try {
      await dispatch(
        updateBusinessThunk({ businessId: selectedBusiness.id, patch }),
      ).unwrap();

      await dispatch(fetchBusinessesThunk()).unwrap();

      toast.success("Configuración guardada.");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || err?.error || "No se pudo guardar";
      toast.error(msg);
    }
  };

  // ----------------------------
  // Actions from BusinessTreeTable
  // ----------------------------
  const handleView = (row) => {
    console.log("View row", row);
    setSelectedItemId(row.id);

    const principalId = row.parentId ? row.parentId : row.id;
    dispatch(setSelectedBusinessId(principalId));

    toast.message(`Seleccionado: ${row.name || row.commercialName}`);
  };

  const handleEdit = (row) => {
    setSelectedItemId(row.id);

    const principalId = row.parentId ? row.parentId : row.id;
    dispatch(setSelectedBusinessId(principalId));

    toast.message(`Editar: ${row.name || row.commercialName}`);
  };

  const handleDelete = (row) => {
    toast.message(`Eliminar (pendiente): ${row.name || row.commercialName}`);
  };

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Negocio</h1>
        <p className="text-slate-600">
          Configuración del negocio y reglas operativas
        </p>
      </div>

      {/* Optional loading indicator */}
      {status === "loading" && (
        <div className="text-sm text-slate-600">Cargando negocios...</div>
      )}

      <BusinessTreeTable
        businesses={businesses}
        onCreateBusiness={openCreateBusiness}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateBranch={openCreateBranch}
      />

      {/* Business Details Form */}

      {/* Datos del Negocio (solo principal) */}
      {selectedItem && !selectedItem.parentId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Datos del Negocio</CardTitle>

              <Badge variant="secondary" className="ml-2 rounded-full">
                {selectedItem.commercialName || selectedItem.name}
              </Badge>
            </div>
          </CardHeader>

          {/* Aquí dejas tu CardContent tal cual ya está (form completo de negocio) */}
          <CardContent className="space-y-4">
            {!selectedBusiness && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
                Crea tu negocio o selecciona uno en la tabla para editar su
                información.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nombre comercial</Label>
                <Input
                  id="tradeName"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Ej. Café Central"
                  disabled={!selectedBusiness}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Razon Social</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Café Central S.A.C."
                  disabled={!selectedBusiness}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessUrl">Sitio Web / Link</Label>
                <Input
                  id="businessUrl"
                  value={businessUrl}
                  onChange={(e) => setBusinessUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={!selectedBusiness}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoría</Label>
                <BusinessCategorySelect
                  value={businessCategory}
                  onChange={setBusinessCategory}
                  disabled={!selectedBusiness}
                />
                <p className="text-xs text-slate-500">
                  La categoría se hereda a las sucursales.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="contacto@minegocio.com"
                  disabled={!selectedBusiness}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  disabled={!selectedBusiness}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dirección del negocio"
                  disabled={!selectedBusiness}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  value={businessRuc}
                  onChange={(e) => setBusinessRuc(e.target.value)}
                  placeholder="20XXXXXXXXX"
                  disabled={!selectedBusiness}
                />
                <p className="text-xs text-slate-500">
                  Dato fiscal del negocio. No obligatorio.
                </p>
              </div>
            </div>

            <UbigeoSelect value={ubigeo} onChange={setUbigeo} />
          </CardContent>
        </Card>
      )}

      {/* Datos de la Sucursal (solo branch) */}
      {selectedItem && selectedItem.parentId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Datos de la Sucursal</CardTitle>

              {/* <Badge variant="secondary" className="ml-2 rounded-full">
                {selectedItem.commercialName || selectedItem.name}
              </Badge> */}

              <Badge variant="outline" className="ml-2 rounded-full">
                Sucursal de {selectedPrincipal?.commercialName || "—"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branchTradeName">Nombre comercial</Label>
                <Input
                  id="branchTradeName"
                  value={branchTradeName}
                  onChange={(e) => setBranchTradeName(e.target.value)}
                  placeholder="Ej. Cosa Nostra - Miraflores"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchPhone">Teléfono</Label>
                <Input
                  id="branchPhone"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branchAddress">Dirección</Label>
                <Input
                  id="branchAddress"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Dirección de la sucursal"
                />
              </div>
            </div>

            <UbigeoSelect value={branchUbigeo} onChange={setBranchUbigeo} />
          </CardContent>
        </Card>
      )}

      {/* business details form */}

      {/* Points Rules */}
      {/* {selectedItem && !selectedItem.parentId && (
        <Card>
          <CardHeader>
            <CardTitle>Reglas de Puntos</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="welcomePoints">Puntos de bienvenida</Label>
                <p className="text-sm text-slate-600">
                  Otorgar puntos automáticamente al registrarse.
                </p>
              </div>

              <Switch
                id="welcomePoints"
                checked={welcomePointsEnabled}
                onCheckedChange={setWelcomePointsEnabled}
                disabled={!selectedBusiness}
              />
            </div>

            {welcomePointsEnabled && (
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="welcomeAmount">Cantidad de puntos</Label>
                <Input
                  id="welcomeAmount"
                  type="number"
                  value={welcomePointsAmount}
                  onChange={(e) => setWelcomePointsAmount(e.target.value)}
                  disabled={!selectedBusiness}
                />
              </div>
            )}

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">
                  Compra mínima en soles para sumar puntos
                </Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={minPurchaseAmount}
                  onChange={(e) => setMinPurchaseAmount(e.target.value)}
                  disabled={!selectedBusiness}
                />
                <p className="text-xs text-slate-500">
                  Monto mínimo por transacción.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointsPerPurchase">
                  Puntos por cada S/ {minPurchaseAmount} de compra
                </Label>
                <Input
                  id="pointsPerPurchase"
                  type="number"
                  value={pointsPerPurchase}
                  onChange={(e) => setPointsPerPurchase(e.target.value)}
                  disabled={!selectedBusiness}
                />
                <p className="text-xs text-slate-500">
                  Ejemplo: 10 puntos por cada S/ 100 gastados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            if (!selectedItem) return;
            if (selectedItem.parentId) return handleSaveBranch();
            return handleSaveAll();
          }}
          className="gap-2"
          disabled={!selectedItem}
        >
          <Save className="h-4 w-4" />
          Guardar cambios
        </Button>

        <Button
          variant="outline"
          onClick={() => toast.message("Cancelar (pendiente)")}
          disabled={!selectedItem}
        >
          Cancelar
        </Button>
      </div>

      <CreateBusinessModal
        open={createBusinessOpen}
        onOpenChange={(open) => {
          if (isCreatingBusiness) return; // opcional: no cerrar mientras guarda
          setCreateBusinessOpen(open);
        }}
        value={createBusinessForm}
        onChange={setCreateBusinessForm}
        onSubmit={handleCreateBusiness}
        isSubmitting={isCreatingBusiness} // 👈 agrega esta prop
      />

      <CreateBranchModal
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        parentBusinessName={branchParent.name}
        value={createBranchForm}
        onChange={setCreateBranchForm}
        onSubmit={handleCreateBranch}
      />

      <UpgradePlanModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason={upgradeReason}
        currentPlanLabel={`Tu plan actual: ${planKey.toUpperCase()}`}
        onGoToPlans={() => toast.message("Ir a planes (pendiente)")}
      />
    </div>
  );
}
