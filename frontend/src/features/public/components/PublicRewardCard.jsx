import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PublicRewardCard({ reward, compact = false }) {
  const img = reward?.thumbnailUrl || reward?.images?.[0] || "";

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg">
      {img ? (
        <div
          className={
            compact
              ? "h-44 w-full overflow-hidden bg-slate-100"
              : "h-[320px] w-full overflow-hidden bg-slate-100"
          }
        >
          <img
            src={img}
            alt={reward?.name || "Recompensa"}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>
      ) : null}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug text-slate-900">
            {reward?.name}
          </CardTitle>

          <Badge className="shrink-0 bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white">
            {reward?.pointsRequired ?? 0} pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-6 text-slate-600">
          {reward?.description || " "}
        </p>
      </CardContent>
    </Card>
  );
}
