// frontend/src/features/settings/components/BusinessTreeTable.jsx
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, Trash2, Plus } from "lucide-react";

/**
 * Build a tree from a flat list using parentId.
 * - parentId: null -> principal
 * - parentId: string -> branch
 */
function buildTree(items) {
  const byId = new Map(items.map((x) => [x.id, { ...x, children: [] }]));
  const roots = [];

  for (const item of byId.values()) {
    if (item.parentId) {
      const parent = byId.get(item.parentId);
      if (parent) parent.children.push(item);
      else roots.push(item); // fallback if parent missing
    } else {
      roots.push(item);
    }
  }

  // Sort for stable UI
  const sortRec = (list) => {
    list.sort((a, b) =>
      (a.commercialName || a.name || "").localeCompare(
        b.commercialName || b.name || "",
      ),
    );
    list.forEach((n) => sortRec(n.children || []));
  };

  sortRec(roots);

  return roots;
}

function flattenTree(nodes, depth = 0, out = []) {
  for (const n of nodes) {
    out.push({ ...n, depth });
    if (n.children?.length) flattenTree(n.children, depth + 1, out);
  }
  return out;
}

export default function BusinessTreeTable({
  businesses = [],
  onCreateBusiness,
  onView,
  onEdit,
  onDelete,
  onCreateBranch,
}) {
  const rows = useMemo(() => {
    const tree = buildTree(businesses);
    return flattenTree(tree);
  }, [businesses]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Negocios</CardTitle>
          <p className="text-sm text-muted-foreground">
            Aquí gestionas negocios y sus sucursales.
          </p>
        </div>

        <Button onClick={onCreateBusiness} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear negocio
        </Button>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-4">Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[60px] text-right px-4">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aún no tienes negocios. Crea tu primer negocio para
                      empezar.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isBranch = Boolean(row.parentId);

                  return (
                    <TableRow
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer"
                      onClick={() => onView?.(row)} // 👈 selecciona con click
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onView?.(row);
                      }}
                    >
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          {/* Indent */}
                          <span
                            aria-hidden="true"
                            style={{ width: row.depth * 16 }}
                            className="inline-block"
                          />

                          {/* Tiny icon (emoji for now to avoid new deps) */}
                          <span className="text-muted-foreground">
                            {isBranch ? "📍" : "🏢"}
                          </span>

                          <span className="font-medium">
                            {row.commercialName || row.name}
                          </span>

                          {!isBranch && (
                            <Badge
                              variant="secondary"
                              className="ml-2 rounded-full"
                            >
                              Principal
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {isBranch ? "Sucursal" : "Negocio"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {row.address || "—"}
                      </TableCell>

                      <TableCell>
                        {row.isActive ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-300 text-emerald-700"
                          >
                            Activo
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-rose-300 text-rose-700"
                          >
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Acciones"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView?.(row)}>
                              <Eye className="h-4 w-4" />
                              Ver
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onEdit?.(row)}>
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>

                            {!isBranch && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onCreateBranch?.(row)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Crear sucursal
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete?.(row)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
