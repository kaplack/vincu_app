import { useState } from "react";
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
import { mockRedemptions, mockMemberships, mockRewards } from "@/data/mockData";
import { toast } from "sonner";

export default function Canjes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [codeToValidate, setCodeToValidate] = useState("");

  const handleValidate = () => {
    if (!codeToValidate) {
      toast.error("Ingresa un código de canje");
      return;
    }
    toast.success("Canje validado correctamente");
    setCodeToValidate("");
  };

  const pendingRedemptions = mockRedemptions.filter(
    (r) => r.status === "pending",
  );
  const confirmedRedemptions = mockRedemptions.filter(
    (r) => r.status === "confirmed",
  );

  const filteredPending = pendingRedemptions.filter((r) => {
    const member = mockMemberships.find((m) => m.id === r.membershipId);
    return (
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredConfirmed = confirmedRedemptions.filter((r) => {
    const member = mockMemberships.find((m) => m.id === r.membershipId);
    return (
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
            <Button variant="outline" size="icon">
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleValidate} className="w-full gap-2 md:w-auto">
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
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendientes ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmados ({filteredConfirmed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
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
                  {filteredPending.map((redemption) => {
                    const member = mockMemberships.find(
                      (m) => m.id === redemption.membershipId,
                    );
                    const reward = mockRewards.find(
                      (r) => r.id === redemption.rewardId,
                    );
                    return (
                      <TableRow key={redemption.id}>
                        <TableCell className="font-mono font-medium">
                          {redemption.code}
                        </TableCell>
                        <TableCell>{member?.name}</TableCell>
                        <TableCell>{reward?.name}</TableCell>
                        <TableCell>
                          {redemption.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Validar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3" />
                              Anular
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="confirmed" className="mt-4">
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
                  {filteredConfirmed.map((redemption) => {
                    const member = mockMemberships.find(
                      (m) => m.id === redemption.membershipId,
                    );
                    const reward = mockRewards.find(
                      (r) => r.id === redemption.rewardId,
                    );
                    return (
                      <TableRow key={redemption.id}>
                        <TableCell className="font-mono font-medium">
                          {redemption.code}
                        </TableCell>
                        <TableCell>{member?.name}</TableCell>
                        <TableCell>{reward?.name}</TableCell>
                        <TableCell>
                          {redemption.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {redemption.validatedBy}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Confirmado
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
