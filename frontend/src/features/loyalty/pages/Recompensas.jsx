import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { mockRewards } from "@/data/mockData";
import { toast } from "sonner";

export default function Recompensas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleOpenDialog = (reward = null) => {
    if (reward) {
      setSelectedReward(reward);
      setName(reward.name);
      setDescription(reward.description);
      setPointsRequired(reward.pointsRequired.toString());
      setIsActive(reward.status === "active");
    } else {
      setSelectedReward(null);
      setName("");
      setDescription("");
      setPointsRequired("");
      setIsActive(true);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name || !pointsRequired) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    toast.success(
      selectedReward
        ? "Recompensa actualizada correctamente"
        : "Recompensa creada correctamente",
    );
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recompensas</h1>
          <p className="text-slate-600">Catálogo de recompensas del negocio</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Recompensa
        </Button>
      </div>

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockRewards.map((reward) => (
          <Card key={reward.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <Badge
                  variant={reward.status === "active" ? "default" : "secondary"}
                  className={
                    reward.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {reward.status === "active" ? (
                    <>
                      <Eye className="mr-1 h-3 w-3" />
                      Activa
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-1 h-3 w-3" />
                      Inactiva
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{reward.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Puntos requeridos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reward.pointsRequired}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(reward)}
                  className="gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReward ? "Editar Recompensa" : "Nueva Recompensa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Café Gratis"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe la recompensa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Puntos Requeridos *</Label>
              <Input
                id="points"
                type="number"
                placeholder="100"
                value={pointsRequired}
                onChange={(e) => setPointsRequired(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Recompensa Activa</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {selectedReward ? "Actualizar" : "Crear"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
