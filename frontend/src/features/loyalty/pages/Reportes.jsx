import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Users, Coins, Gift } from "lucide-react";
import { toast } from "sonner";

export default function Reportes() {
  const handleExport = (type) => {
    toast.success(`Exportando ${type}...`);
  };

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-slate-600">Exportación e impresión de datos</p>
      </div>

      {/* Export Options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Clients Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Clientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Exporta la lista completa de clientes con sus datos y puntos
              actuales.
            </p>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select defaultValue="xlsx">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleExport("clientes")}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Clientes
            </Button>
          </CardContent>
        </Card>

        {/* Transactions Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Coins className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Movimientos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Exporta el historial de movimientos de puntos con fechas y
              detalles.
            </p>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select defaultValue="xlsx">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleExport("movimientos")}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Movimientos
            </Button>
          </CardContent>
        </Card>

        {/* Redemptions Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Canjes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Exporta el registro de canjes realizados con estado y validación.
            </p>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select defaultValue="xlsx">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleExport("canjes")}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Canjes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Custom Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Personalizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Genera reportes personalizados con filtros específicos para tu
            negocio.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumen General</SelectItem>
                  <SelectItem value="monthly">Reporte Mensual</SelectItem>
                  <SelectItem value="customer-activity">
                    Actividad de Clientes
                  </SelectItem>
                  <SelectItem value="rewards-analysis">
                    Análisis de Recompensas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Período</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Generar Reporte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
