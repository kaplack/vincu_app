// frontend/src/features/loyalty/pages/Puntos.jsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Minus,
  QrCode,
  TrendingUp,
  TrendingDown,
  Edit,
} from "lucide-react";
import { mockTransactions, mockMemberships } from "@/data/mockData";
import { toast } from "sonner";

export default function Puntos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");

  const handleAddPoints = () => {
    if (!selectedMember || !points) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    toast.success(`${points} puntos agregados correctamente`);
    setSelectedMember("");
    setPoints("");
    setDescription("");
  };

  const filteredTransactions = mockTransactions.filter((t) => {
    const member = mockMemberships.find((m) => m.id === t.membershipId);
    return (
      member?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Puntos</h1>
        <p className="text-slate-600">Gestión de puntos y movimientos</p>
      </div>

      {/* Add Points */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Puntos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member">Cliente</Label>
              <div className="flex gap-2">
                <Input
                  id="member"
                  placeholder="Buscar por teléfono..."
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Puntos</Label>
              <Input
                id="points"
                type="number"
                placeholder="Cantidad de puntos"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej: Compra - $5000"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAddPoints} className="gap-2">
              <Plus className="h-4 w-4" />
              Sumar Puntos
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Ajuste Manual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar movimientos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Operador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const member = mockMemberships.find(
                  (m) => m.id === transaction.membershipId,
                );
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.date.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {member?.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          transaction.type === "earn"
                            ? "bg-green-100 text-green-700"
                            : transaction.type === "redeem"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                        }
                      >
                        {transaction.type === "earn" && (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type === "redeem" && (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type === "adjust" && (
                          <Edit className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type === "earn"
                          ? "Ganados"
                          : transaction.type === "redeem"
                            ? "Canjeados"
                            : "Ajuste"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-semibold ${
                        transaction.points > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.points > 0 ? "+" : ""}
                      {transaction.points}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {transaction.operatorName}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
