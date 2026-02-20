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
import { Switch } from "@/components/ui/switch";

/**
 * CreateBranchModal
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - parentBusinessName?: string
 * - value: { commercialName: string, address: string, phone: string, isActive: boolean }
 * - onChange: (nextValue) => void
 * - onSubmit: () => void
 * - isSubmitting?: boolean
 */
export default function CreateBranchModal({
  open,
  onOpenChange,
  parentBusinessName,
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}) {
  const commercialName = value?.commercialName ?? "";
  const address = value?.address ?? "";
  const phone = value?.phone ?? "";
  const isActive = value?.isActive ?? true;

  const setField = (patch) => onChange?.({ ...value, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear sucursal</DialogTitle>
          <DialogDescription>
            La sucursal heredará la configuración del negocio.
            {parentBusinessName ? (
              <>
                {" "}
                Negocio:{" "}
                <span className="font-medium">{parentBusinessName}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newBranchCommercialName">
              Nombre de la sucursal
            </Label>
            <Input
              id="newBranchCommercialName"
              value={commercialName}
              onChange={(e) => setField({ commercialName: e.target.value })}
              placeholder="Ej. Miraflores"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newBranchAddress">Dirección</Label>
            <Input
              id="newBranchAddress"
              value={address}
              onChange={(e) => setField({ address: e.target.value })}
              placeholder="Av. Larco 123, Miraflores"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newBranchPhone">Teléfono (opcional)</Label>
            <Input
              id="newBranchPhone"
              value={phone}
              onChange={(e) => setField({ phone: e.target.value })}
              placeholder="+51 999 999 999"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="newBranchActive">Estado</Label>
              <p className="text-sm text-slate-600">Sucursal activa</p>
            </div>
            <Switch
              id="newBranchActive"
              checked={isActive}
              onCheckedChange={(checked) => setField({ isActive: checked })}
              disabled={isSubmitting}
            />
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
            {isSubmitting ? "Creando..." : "Crear sucursal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
