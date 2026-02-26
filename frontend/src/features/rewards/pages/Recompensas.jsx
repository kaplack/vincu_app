import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
import { toast } from "sonner";

import {
  fetchRewardsThunk,
  createRewardThunk,
  updateRewardThunk,
  selectRewards,
  selectRewardsStatus,
} from "@/features/rewards/slice/rewardSlice";

export default function Recompensas() {
  const dispatch = useDispatch();
  const rewards = useSelector(selectRewards);
  const status = useSelector(selectRewardsStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchRewardsThunk());
  }, [dispatch]);

  const handleOpenDialog = (reward = null) => {
    if (reward) {
      setSelectedReward(reward);
      setName(reward.name || "");
      setDescription(reward.description || "");
      setPointsRequired(String(reward.pointsRequired ?? ""));
      setIsActive(Boolean(reward.isActive));
    } else {
      setSelectedReward(null);
      setName("");
      setDescription("");
      setPointsRequired("");
      setIsActive(true);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (isSaving) return; // 👈 candado anti doble click
    setIsSaving(true);

    try {
      if (!name || !pointsRequired) {
        toast.error("Por favor completa todos los campos obligatorios");
        return;
      }

      const points = parseInt(pointsRequired, 10);
      if (!Number.isInteger(points) || points <= 0) {
        toast.error("Puntos requeridos inválidos");
        return;
      }

      const payload = {
        name: name.trim(),
        description: description?.trim() ? description.trim() : null,
        pointsRequired: points,
        isActive,
      };

      if (selectedReward) {
        await dispatch(
          updateRewardThunk({ rewardId: selectedReward.id, payload }),
        ).unwrap();
        toast.success("Recompensa actualizada correctamente");
      } else {
        await dispatch(createRewardThunk(payload)).unwrap();
        toast.success("Recompensa creada correctamente");
      }

      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || "Ocurrió un error guardando la recompensa");
    } finally {
      setIsSaving(false); // 👈 libera el candado sí o sí
    }
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

      {/* Estado de carga simple */}
      {status === "loading" && (
        <div className="text-slate-500">Cargando recompensas...</div>
      )}

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{reward.name}</CardTitle>

                <Badge
                  variant={reward.isActive ? "default" : "secondary"}
                  className={
                    reward.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {reward.isActive ? (
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
              <p className="text-sm text-slate-600">
                {reward.description || "—"}
              </p>

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
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={isSaving}
              >
                {selectedReward ? "Actualizar" : "Crear"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
