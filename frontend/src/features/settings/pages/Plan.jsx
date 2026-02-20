import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, TrendingUp, Crown } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const planFeatures = {
  Free: [
    "Hasta 10 tarjetas",
    "Gestión básica de puntos",
    "Recompensas ilimitadas",
    "Branding básico con marca VINCU",
    "Soporte por email",
  ],
  "Pequeño Negocio": [
    "Hasta 100 tarjetas",
    "Gestión completa de puntos",
    "Recompensas ilimitadas",
    "Branding mejorado",
    "Reportes y exportación",
    "Soporte prioritario",
    "Panel de análisis básico",
  ],
  Pro: [
    "Tarjetas ilimitadas",
    "Multi-negocio",
    "LoyaltyClass exclusiva sin branding VINCU",
    "Branding completo",
    "Reportes avanzados",
    "API access",
    "Soporte 24/7",
    "Panel de análisis avanzado",
    "Gestión de operadores",
  ],
};

const planPrices = {
  free: 0,
  small: 2999,
  pro: 9999,
};

export default function PlanView() {
  const { currentBusiness: business } = useOutletContext();

  if (!business) {
    return <div className="p-6">Cargando plan...</div>;
  }
  const usagePercentage = (business.cardsIssued / business.cardsLimit) * 100;
  const isNearLimit = usagePercentage > 80;

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Plan y Facturación</h1>
        <p className="text-slate-600">Administra tu suscripción y beneficios</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{business.plan}</p>
              <p className="text-sm text-slate-600">
                ${planPrices[business.planKey].toLocaleString("es-AR")} / mes
              </p>
            </div>
            <Badge
              variant="default"
              className={
                business.plan === "Pro"
                  ? "bg-purple-100 text-purple-700"
                  : business.plan === "Pequeño Negocio"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
              }
            >
              {business.plan}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Tarjetas utilizadas</span>
              <span className="font-medium">
                {business.cardsIssued} / {business.cardsLimit}
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className={
                isNearLimit ? "[&>div]:bg-orange-500" : "[&>div]:bg-blue-500"
              }
            />
            {isNearLimit && (
              <p className="text-sm text-orange-600">
                Te estás acercando al límite de tarjetas
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free Plan */}
        <Card
          className={business.plan === "Free" ? "border-2 border-blue-500" : ""}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              {business.plan === "Free" && (
                <Badge className="bg-blue-100 text-blue-700">Actual</Badge>
              )}
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold">Gratis</p>
              <p className="text-sm text-slate-600">Para empezar</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {planFeatures.Free.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {business.plan !== "Free" && (
              <Button variant="outline" className="w-full" disabled>
                Plan Actual Superior
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pequeño Negocio Plan */}
        <Card
          className={
            business.plan === "Pequeño Negocio"
              ? "border-2 border-blue-500"
              : "border-2"
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Pequeño Negocio
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardTitle>
              {business.plan === "Pequeño Negocio" && (
                <Badge className="bg-blue-100 text-blue-700">Actual</Badge>
              )}
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold">$2.999</p>
              <p className="text-sm text-slate-600">por mes</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {planFeatures["Pequeño Negocio"].map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {business.plan === "Free" && (
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Mejorar a Pequeño Negocio
              </Button>
            )}
            {business.plan === "Pequeño Negocio" && (
              <Button variant="outline" className="w-full" disabled>
                Plan Actual
              </Button>
            )}
            {business.plan === "Pro" && (
              <Button variant="outline" className="w-full" disabled>
                Plan Actual Superior
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card
          className={
            business.plan === "Pro" ? "border-2 border-purple-500" : "border-2"
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Pro
                <Crown className="h-4 w-4 text-purple-600" />
              </CardTitle>
              {business.plan === "Pro" && (
                <Badge className="bg-purple-100 text-purple-700">Actual</Badge>
              )}
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold">$9.999</p>
              <p className="text-sm text-slate-600">por mes</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {planFeatures.Pro.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {business.plan !== "Pro" && (
              <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                <Crown className="h-4 w-4" />
                Mejorar a Pro
              </Button>
            )}
            {business.plan === "Pro" && (
              <Button variant="outline" className="w-full" disabled>
                Plan Actual
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Billing Info */}
      {business.plan !== "Free" && (
        <Card>
          <CardHeader>
            <CardTitle>Información de Facturación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600">Próximo pago</p>
                <p className="font-semibold">15 de Febrero, 2026</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Método de pago</p>
                <p className="font-semibold">Tarjeta •••• 4242</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Cambiar Método de Pago</Button>
              <Button variant="outline">Ver Historial de Pagos</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
