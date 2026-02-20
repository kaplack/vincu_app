import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Coins,
  Gift,
  AlertCircle,
  Plus,
  TrendingUp,
} from "lucide-react";
import {
  mockMemberships,
  mockTransactions,
  mockRedemptions,
} from "@/data/mockData";
import { useOutletContext } from "react-router-dom";

export default function Dashboard() {
  const { currentBusiness: business } = useOutletContext();

  if (!business) {
    return <div className="p-6">Cargando dashboard...</div>;
  }

  const totalMembers = mockMemberships.length;
  const totalPointsEarned = mockTransactions
    .filter((t) => t.type === "earn")
    .reduce((sum, t) => sum + t.points, 0);
  const totalPointsRedeemed = Math.abs(
    mockTransactions
      .filter((t) => t.type === "redeem")
      .reduce((sum, t) => sum + t.points, 0),
  );
  const pendingRedemptions = mockRedemptions.filter(
    (r) => r.status === "pending",
  ).length;

  const recentRedemptions = mockRedemptions.slice(0, 5);

  const isNearLimit = business.cardsIssued / business.cardsLimit > 0.8;

  // ... el resto del JSX queda IGUAL

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600">Vista general de {business.name}</p>
      </div>

      {/* Alerts */}
      {isNearLimit && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">
                Te estás acercando al límite de tarjetas
              </p>
              <p className="text-sm text-orange-700">
                {business.cardsIssued} de {business.cardsLimit} tarjetas
                emitidas
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onNavigate("plan")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Mejorar plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-slate-600">Membresías emitidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Puntos Emitidos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsEarned}</div>
            <p className="text-xs text-slate-600">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Puntos Canjeados
            </CardTitle>
            <Coins className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsRedeemed}</div>
            <p className="text-xs text-slate-600">En recompensas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Canjes Pendientes
            </CardTitle>
            <Gift className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRedemptions}</div>
            <p className="text-xs text-slate-600">Por validar</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => onNavigate("puntos")} className="gap-2">
            <Plus className="h-4 w-4" />
            Sumar Puntos
          </Button>
          <Button
            onClick={() => onNavigate("recompensas")}
            variant="outline"
            className="gap-2"
          >
            <Gift className="h-4 w-4" />
            Crear Recompensa
          </Button>
          <Button
            onClick={() => onNavigate("canjes")}
            variant="outline"
            className="gap-2"
          >
            <Coins className="h-4 w-4" />
            Ver Canjes
          </Button>
        </CardContent>
      </Card>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Canjes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRedemptions.map((redemption) => {
              const member = mockMemberships.find(
                (m) => m.id === redemption.membershipId,
              );
              return (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{member?.name}</p>
                    <p className="text-sm text-slate-600">
                      Código: {redemption.code} •{" "}
                      {redemption.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      redemption.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {redemption.status === "confirmed"
                      ? "Confirmado"
                      : "Pendiente"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
