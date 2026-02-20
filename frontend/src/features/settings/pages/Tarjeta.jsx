// frontend/src/features/settings/pages/Tarjeta.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Share2,
  QrCode,
  CheckCircle,
  Smartphone,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchWalletCardConfig,
  saveWalletCardBranding,
} from "../slice/walletCardSlice";

import AfiliacionQR from "../components/AfiliacionQR";

function planLabel(planKey) {
  if (planKey === "free") return "Free";
  if (planKey === "small") return "Pequeño Negocio";
  if (planKey === "pro") return "Pro";
  return planKey || "Free";
}

export default function Tarjeta() {
  const dispatch = useDispatch();
  const { currentBusiness: business } = useOutletContext();
  console.log("Current business in Tarjeta:", business);

  const { config, loading, saving, error } = useSelector((s) => s.walletCard);

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#1e40af");
  const [description, setDescription] = useState("");

  const gradientStyle = useMemo(() => {
    // Fallback if colors not loaded yet
    const from = primaryColor || "#2563eb";
    const to = secondaryColor || "#1e40af";
    return {
      backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
    };
  }, [primaryColor, secondaryColor]);

  // Load config on mount (business is needed because currentBusinessId is set server-side,
  // but in UI we also use business.id to build join link)
  useEffect(() => {
    if (!business) return;
    dispatch(fetchWalletCardConfig());
  }, [business, dispatch]);

  // Sync local form with server config
  useEffect(() => {
    if (!config) return;
    if (config.primaryColor) setPrimaryColor(config.primaryColor);
    if (config.secondaryColor) setSecondaryColor(config.secondaryColor);
    setDescription(config.description || "");
  }, [config]);

  useEffect(() => {
    if (!error) return;
    const msg = error?.message || error?.msg || "Ocurrió un error";
    toast.error(msg);
  }, [error]);

  if (!business) {
    return <div className="p-6">Cargando tarjeta...</div>;
  }

  const affiliationLink = `https://vincu.app/join/${business.id}`;

  const planKey = config?.planKey || "free";
  const plan = planLabel(planKey);

  const brandingLimited = planKey === "free";
  const brandingRestricted = planKey === "small";

  const syncActive = config?.syncStatus === "active";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliationLink);
    toast.success("Link copiado al portapapeles");
  };

  const handleShareWhatsApp = () => {
    const message = `¡Únete a nuestro programa de lealtad! ${affiliationLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSave = async () => {
    if (brandingLimited) return;

    const payload = {
      primaryColor,
      // IMPORTANT: en plan small NO enviamos secondaryColor
      ...(brandingRestricted ? {} : { secondaryColor }),
      description,
    };

    const res = await dispatch(saveWalletCardBranding(payload));
    if (saveWalletCardBranding.fulfilled.match(res)) {
      toast.success("Branding actualizado");
    }
  };

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Tarjeta Google Wallet</h1>
        <p className="text-slate-600">
          Configuración y distribución de tarjetas
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-3 ${syncActive ? "bg-green-100" : "bg-slate-100"}`}
            >
              <CheckCircle
                className={`h-6 w-6 ${syncActive ? "text-green-600" : "text-slate-500"}`}
              />
            </div>
            <div>
              <p className="font-semibold">Estado de Sincronización</p>
              <p className="text-sm text-slate-600">
                {syncActive
                  ? "Tarjetas sincronizadas con Google Wallet"
                  : "Aún no sincronizado"}
              </p>
            </div>
          </div>
          <Badge
            className={
              syncActive
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-700"
            }
          >
            {syncActive ? "Activo" : "Inactivo"}
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="afiliacion">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="afiliacion">Afiliación</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        {/* Affiliation Tab */}
        <TabsContent value="afiliacion" className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de la Tarjeta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-md">
                <div
                  className="relative aspect-[1.586/1] overflow-hidden rounded-2xl p-6 shadow-xl"
                  style={gradientStyle}
                >
                  <div className="flex h-full flex-col justify-between text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm opacity-90">
                          {description || "Programa de Lealtad"}
                        </p>
                        <h3 className="text-2xl font-bold">
                          {config?.commercialName || business.commercialName}
                        </h3>
                      </div>
                      <Smartphone className="h-8 w-8 opacity-75" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Puntos Disponibles</p>
                      <p className="text-4xl font-bold">250</p>
                    </div>
                  </div>
                  {brandingLimited && (
                    <div className="absolute bottom-2 right-2">
                      <p className="text-xs opacity-75">Powered by VINCU</p>
                    </div>
                  )}
                </div>

                {loading && (
                  <p className="mt-3 text-center text-sm text-slate-500">
                    Cargando configuración...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Affiliation Link */}
          <AfiliacionQR business={business} />
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Personalización de Branding</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    Personaliza la apariencia de tus tarjetas
                  </p>
                </div>

                <Badge
                  variant={planKey === "pro" ? "default" : "secondary"}
                  className={
                    planKey === "pro"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {plan}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {brandingLimited && (
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                  <p className="font-medium text-orange-900">
                    Funcionalidad Limitada
                  </p>
                  <p className="mt-1 text-sm text-orange-700">
                    El plan Free incluye branding básico con marca VINCU
                    visible. Actualiza a Pequeño Negocio o Pro para mayor
                    personalización.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-orange-600 hover:bg-orange-700"
                  >
                    Mejorar Plan
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="CommercialName">Nombre Comercial</Label>
                  <Input
                    id="CommercialName"
                    value={
                      config?.commercialName || business.commercialName || ""
                    }
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-slate-500">
                    El nombre comercial se gestiona desde{" "}
                    <b>Configuración → Negocio</b>.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Principal</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        disabled={brandingLimited || saving}
                        className="h-10 w-20"
                      />
                      <Input
                        value={primaryColor}
                        readOnly
                        disabled={brandingLimited || saving}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        disabled={
                          brandingLimited || brandingRestricted || saving
                        }
                        className="h-10 w-20"
                      />
                      <Input
                        value={secondaryColor}
                        readOnly
                        disabled={
                          brandingLimited || brandingRestricted || saving
                        }
                        className="flex-1 font-mono"
                      />
                    </div>
                    {brandingRestricted && (
                      <p className="text-xs text-slate-500">
                        Disponible solo en plan Pro
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción de la Tarjeta</Label>
                  <Input
                    id="description"
                    placeholder="Ej: Programa de lealtad de Café Central"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={brandingLimited || saving}
                  />
                </div>
              </div>

              {planKey === "pro" && (
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Palette className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        LoyaltyClass Exclusiva
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        Tu negocio cuenta con una LoyaltyClass exclusiva en
                        Google Wallet, sin branding VINCU.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={brandingLimited || saving || loading}
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>

                <Button
                  variant="outline"
                  disabled={brandingLimited || saving || loading}
                  onClick={() =>
                    toast.info("La vista previa se actualiza automáticamente.")
                  }
                >
                  Vista Previa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
