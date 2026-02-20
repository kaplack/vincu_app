import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  selectMyMemberships,
  selectActiveMembershipId,
  setActiveMembership,
} from "@/features/me/slice/meSlice";

export default function MembershipSwitcher() {
  const dispatch = useDispatch();
  const memberships = useSelector(selectMyMemberships);
  const activeId = useSelector(selectActiveMembershipId);

  console.log("MembershipSwitcher render", { memberships, activeId });

  const active = useMemo(() => {
    if (!memberships?.length) return null;
    return memberships.find((m) => m.id === activeId) || memberships[0];
  }, [memberships, activeId]);

  // Si solo hay 1, no mostramos dropdown (no estorbar UX)
  if (!memberships || memberships.length <= 1) {
    return (
      <div className="hidden sm:block text-left">
        <p className="text-xs text-slate-500">Tu tarjeta en</p>
        <p className="text-sm font-extrabold text-slate-900">
          {active?.business?.commercialName ||
            active?.business?.name ||
            "Mi negocio"}
        </p>
      </div>
    );
  }

  const label =
    active?.business?.commercialName ||
    active?.business?.name ||
    "Mis tarjetas";
  const points = active?.pointsBalance ?? 0;

  return (
    <div className="hidden sm:block text-left">
      <p className="text-xs text-slate-500">Tu tarjeta en</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-0 h-auto hover:bg-transparent">
            <span className="text-sm font-extrabold text-slate-900 max-w-[180px] truncate">
              {label}
            </span>
            <Badge variant="secondary" className="ml-2">
              {points} pts
            </Badge>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Mis tarjetas</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {memberships.map((m) => {
            const name =
              m?.business?.commercialName || m?.business?.name || "Negocio";
            const pts = m?.pointsBalance ?? 0;
            const isActive = m.id === activeId;

            return (
              <DropdownMenuItem
                key={m.id}
                className="flex items-center justify-between gap-3"
                onClick={() => dispatch(setActiveMembership(m.id))}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{name}</div>
                  <div className="text-xs text-muted-foreground">{pts} pts</div>
                </div>
                {isActive ? <Badge variant="secondary">Activa</Badge> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
