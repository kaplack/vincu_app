import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import BusinessCategorySelect from "../BusinessCategoySelect";
import { DEFAULT_CATEGORY } from "@/features/loyalty/constants/businessCategories";

/**
 * CreateBusinessModal
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - value: { commercialName: string, legalName: string, category: string }
 * - onChange: (nextValue) => void
 * - onSubmit: () => void
 * - isSubmitting?: boolean
 */
export default function CreateBusinessModal({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}) {
  const commercialName = value?.commercialName ?? "";
  const legalName = value?.legalName ?? "";
  const category = value?.category ?? DEFAULT_CATEGORY;

  const setField = (patch) => onChange?.({ ...value, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear negocio</DialogTitle>
          <DialogDescription>
            Crea el negocio principal de tu programa de fidelización.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newBusinessCommercialName">Nombre comercial</Label>
            <Input
              id="newBusinessCommercialName"
              value={commercialName}
              onChange={(e) => setField({ commercialName: e.target.value })}
              placeholder="Ej. Café Central"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newBusinessLegalName">Razón social</Label>
            <Input
              id="newBusinessLegalName"
              value={legalName}
              onChange={(e) => setField({ legalName: e.target.value })}
              placeholder="Ej. Café Central S.A.C."
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500">
              Opcional por ahora (pero recomendado para emisión/facturación).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newBusinessCategory">Categoría</Label>

            <BusinessCategorySelect
              value={category}
              onChange={(next) => setField({ category: next })}
              disabled={isSubmitting}
            />

            <p className="text-xs text-slate-500">
              La categoría se heredará a las sucursales.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear negocio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
