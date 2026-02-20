import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Reusable membership card UI (used by /me flows).
 * Data source can be /api/me or legacy /public (we avoid duplicating UI).
 */
export default function MembershipCard({
  membership,
  isActive,
  onSelect,
  businessLabelFallback = "Negocio",
}) {
  const points = membership?.pointsBalance ?? 0;
  const businessName =
    membership?.business?.commercialName || businessLabelFallback;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Negocio</p>
            <CardTitle className="mt-1 text-lg font-extrabold">
              {businessName}
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Puntos:{" "}
              <span className="font-semibold text-foreground">{points}</span>
            </p>
          </div>

          {isActive ? <Badge variant="secondary">Activa</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Button
          onClick={onSelect}
          className="w-full text-white bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] hover:opacity-95"
        >
          Entrar
        </Button>
      </CardContent>

      <div className="h-[3px] bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3]" />
    </Card>
  );
}
