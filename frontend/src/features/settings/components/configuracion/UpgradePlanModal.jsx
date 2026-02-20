import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * UpgradePlanModal
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - reason?: string
 * - currentPlanLabel?: string
 * - onGoToPlans?: () => void
 */
export default function UpgradePlanModal({
  open,
  onOpenChange,
  reason,
  currentPlanLabel,
  onGoToPlans,
}) {
  const planLabel = currentPlanLabel || "Tu plan actual";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualiza tu plan</DialogTitle>
          <DialogDescription>
            {reason || "Esta función está disponible en el Plan Pro."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-slate-700">
          {planLabel}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cerrar
          </Button>
          <Button onClick={() => onGoToPlans?.()}>Ver planes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
