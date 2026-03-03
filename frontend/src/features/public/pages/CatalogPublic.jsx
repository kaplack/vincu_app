// frontend/src/features/public/pages/CatalogPublic.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { fetchPublicRewards } from "../api/publicLoyaltyApi";

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function CatalogPublic() {
  const { businessSlug } = useParams();

  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 400);

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | succeeded | failed
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setStatus("loading");
        setError(null);

        const data = await fetchPublicRewards({
          businessSlug,
          q: qDebounced?.trim() || undefined,
        });

        if (!alive) return;
        setItems(data?.items ?? []);
        setStatus("succeeded");
      } catch (err) {
        if (!alive) return;
        setStatus("failed");
        setError(err?.response?.data?.message || err.message || "Error");
      }
    }

    if (businessSlug) run();

    return () => {
      alive = false;
    };
  }, [businessSlug, qDebounced]);

  const title = useMemo(() => {
    // si luego traes metadata del negocio, aquí lo reemplazas
    return `Catálogo: ${businessSlug}`;
  }, [businessSlug]);

  return (
    <div className="mx-auto w-full max-w-5xl p-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Revisa las recompensas disponibles.
        </p>
      </div>

      <div className="flex gap-2 items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar recompensa..."
        />
        <Badge variant="secondary">
          {status === "loading" ? "Cargando..." : `${items.length} items`}
        </Badge>
      </div>

      {status === "failed" && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-wrap gap-6 justify-center">
        {items.map((r) => {
          const img = r.thumbnailUrl || r.images?.[0] || "";
          return (
            <Card
              key={r.id}
              className="basis-[300px] shrink-0 grow-0 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            >
              {img ? (
                <div className="w-100% h-[350px] bg-muted overflow-hidden">
                  <img
                    src={img}
                    alt={r.name}
                    loading="lazy"
                    className="w-full h-full object-cover block"
                  />
                </div>
              ) : null}

              <CardHeader className="px-0 pt-3 pb-2 flex flex-col gap-1">
                <div className="px-3">
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <div className="flex gap-2 items-center mt-1">
                    <Badge>{r.pointsRequired} pts</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-0 pb-4 text-sm text-muted-foreground">
                <p className="px-3 whitespace-normal break-words">
                  {r.description || " "}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {status === "succeeded" && items.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No hay recompensas disponibles.
        </div>
      )}
    </div>
  );
}
