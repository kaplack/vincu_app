// frontend/src/features/rewards/pages/Recompensas.jsx

import { useEffect, useMemo, useState } from "react";
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
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchRewardsThunk,
  createRewardThunk,
  updateRewardThunk,
  selectRewards,
  selectRewardsStatus,
} from "@/features/rewards/slice/rewardSlice";

import {
  uploadRewardImage,
  removeRewardImage,
  setRewardThumbnail,
} from "@/features/rewards/api/rewardApi";

import { useOutletContext } from "react-router-dom";
import CatalogoQR from "@/features/settings/components/CatalogoQR";

export default function Recompensas() {
  const dispatch = useDispatch();
  const rewards = useSelector(selectRewards);
  const status = useSelector(selectRewardsStatus);
  const { currentBusiness } = useOutletContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchRewardsThunk());
  }, [dispatch]);

  const selectedImages = useMemo(() => {
    return Array.isArray(selectedReward?.images) ? selectedReward.images : [];
  }, [selectedReward]);

  const selectedThumb = useMemo(() => {
    return selectedReward?.thumbnailUrl || selectedImages[0] || null;
  }, [selectedReward, selectedImages]);

  const refreshRewardsAndSyncSelected = async (rewardIdToSync = null) => {
    const data = await dispatch(fetchRewardsThunk()).unwrap(); // { items }
    if (rewardIdToSync) {
      const updated = data?.items?.find((r) => r.id === rewardIdToSync) || null;
      setSelectedReward(updated);
    }
  };

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
    if (isSaving) return;
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
        await refreshRewardsAndSyncSelected(selectedReward.id);
      } else {
        const created = await dispatch(createRewardThunk(payload)).unwrap(); // { item }
        toast.success("Recompensa creada correctamente");

        // Opcional: abrir el mismo modal ya en modo edición para que pueda subir fotos
        const createdId = created?.item?.id;
        if (createdId) {
          await refreshRewardsAndSyncSelected(createdId);
        } else {
          await refreshRewardsAndSyncSelected(null);
        }
      }

      // Nota: NO cierro el modal automáticamente si quieres que suba fotos.
      // Si prefieres cerrar siempre, descomenta:
      // setDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || "Ocurrió un error guardando la recompensa");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickFile = async (file) => {
    if (!file) return;

    if (!selectedReward?.id) {
      toast.error("Guarda primero la recompensa para poder subir fotos.");
      return;
    }

    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG o PNG.");
      return;
    }

    if (selectedImages.length >= 3) {
      toast.error("Máximo 3 imágenes por recompensa.");
      return;
    }

    setIsUploading(true);
    try {
      // Si no hay imágenes todavía, la primera la ponemos como thumbnail
      const shouldSetAsThumb = selectedImages.length === 0;

      await uploadRewardImage(selectedReward.id, file, {
        setAsThumbnail: shouldSetAsThumb,
      });

      toast.success("Imagen subida correctamente");
      await refreshRewardsAndSyncSelected(selectedReward.id);
    } catch (err) {
      toast.error(err?.message || "Error subiendo la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetThumb = async (url) => {
    if (!selectedReward?.id) return;
    setIsUploading(true);
    try {
      await setRewardThumbnail(selectedReward.id, { thumbnailUrl: url });
      toast.success("Imagen principal actualizada");
      await refreshRewardsAndSyncSelected(selectedReward.id);
    } catch (err) {
      toast.error(err?.message || "No se pudo cambiar la imagen principal");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (url) => {
    if (!selectedReward?.id) return;
    setIsUploading(true);
    try {
      await removeRewardImage(selectedReward.id, { imageUrl: url });
      toast.success("Imagen eliminada");
      await refreshRewardsAndSyncSelected(selectedReward.id);
    } catch (err) {
      toast.error(err?.message || "No se pudo eliminar la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const getRewardCardImage = (reward) => {
    const img =
      reward?.thumbnailUrl ||
      (Array.isArray(reward?.images) ? reward.images[0] : null);
    return img;
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

      {status === "loading" && (
        <div className="text-slate-500">Cargando recompensas...</div>
      )}

      {currentBusiness?.slug && (
        <div className="w-full">
          <CatalogoQR business={currentBusiness} />
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => {
          const cover = getRewardCardImage(reward);

          return (
            <Card key={reward.id} className="relative overflow-hidden">
              {/* Cover */}
              <div className="h-40 w-full bg-slate-100">
                {cover ? (
                  <img
                    src={cover}
                    alt={reward.name}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-40 w-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

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
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            // Limpieza de UI al cerrar
            setIsUploading(false);
            setIsSaving(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReward ? "Editar Recompensa" : "Nueva Recompensa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Form */}
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

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={isSaving || isUploading}
                >
                  {selectedReward ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving || isUploading}
                >
                  Cancelar
                </Button>
              </div>

              {!selectedReward?.id && (
                <div className="text-sm text-slate-500">
                  Guarda la recompensa para poder subir fotos.
                </div>
              )}
            </div>

            {/* Images */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Fotos</h3>
                  <p className="text-sm text-slate-500">
                    Máximo 3 imágenes. Haz clic en una imagen para marcarla como
                    principal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="reward-image"
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer ${
                      !selectedReward?.id ||
                      isUploading ||
                      selectedImages.length >= 3
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    {isUploading ? "Subiendo..." : "Subir"}
                  </Label>
                  <input
                    id="reward-image"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    disabled={
                      !selectedReward?.id ||
                      isUploading ||
                      selectedImages.length >= 3
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // permitir subir mismo archivo de nuevo si lo vuelve a elegir
                      e.target.value = "";
                      handlePickFile(file);
                    }}
                  />
                </div>
              </div>

              {/* Principal preview */}
              <div className="flex items-start gap-4">
                <div className="w-56">
                  <div className="text-xs text-slate-500 mb-2">Principal</div>
                  <div className="h-36 w-56 rounded-md border bg-slate-100 overflow-hidden flex items-center justify-center">
                    {selectedThumb ? (
                      <img
                        src={selectedThumb}
                        alt="principal"
                        className="h-36 w-56 object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Sin imagen
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-2">Galería</div>
                  {selectedImages.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Aún no hay imágenes.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {selectedImages.map((url) => {
                        const isThumb =
                          selectedReward?.thumbnailUrl === url ||
                          (!selectedReward?.thumbnailUrl &&
                            selectedImages[0] === url);

                        return (
                          <div
                            key={url}
                            className={`relative h-24 w-32 rounded-md border overflow-hidden cursor-pointer ${
                              isThumb ? "ring-2 ring-blue-500" : ""
                            }`}
                            title="Clic para hacer principal"
                            onClick={() => handleSetThumb(url)}
                          >
                            <img
                              src={url}
                              alt="reward"
                              className="h-24 w-32 object-cover"
                              loading="lazy"
                            />

                            {/* Badge principal */}
                            {isThumb && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[11px] text-center py-0.5">
                                Principal
                              </div>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              className="absolute top-1 right-1 p-1 rounded bg-white/90 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(url);
                              }}
                              disabled={isUploading}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    {selectedImages.length}/3 imágenes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
