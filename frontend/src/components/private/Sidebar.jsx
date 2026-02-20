// frontend/src/components/private/Sidebar.jsx
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Coins,
  Gift,
  CheckCircle,
  CreditCard,
  BarChart3,
  CreditCard as BillingIcon,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { logout } from "@/features/auth/slice/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const navItems = [
  // {
  //   id: "dashboard",
  //   label: "Dashboard",
  //   icon: LayoutDashboard,
  //   roles: ["OWNER", "OPERATOR"],
  // },
  {
    id: "clientes",
    label: "Clientes",
    icon: Users,
    roles: ["OWNER", "OPERATOR"],
  },
  {
    id: "puntos",
    label: "Puntos",
    icon: Coins,
    roles: ["OWNER", "OPERATOR"],
  },
  {
    id: "recompensas",
    label: "Recompensas",
    icon: Gift,
    roles: ["OWNER", "OPERATOR"],
  },
  {
    id: "canjes",
    label: "Canjes",
    icon: CheckCircle,
    roles: ["OWNER", "OPERATOR"],
  },
  // {
  //   id: "reportes",
  //   label: "Reportes",
  //   icon: BarChart3,
  //   roles: ["OWNER"],
  //   requiresEntitlement: (plan) => plan !== "Free",
  // },

  // 👇 Nuevo: Configuración como padre
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    roles: ["OWNER", "superAdmin"],
    children: [
      { id: "configuracion/negocio", label: "Negocio", icon: Building2 },
      { id: "configuracion/tarjeta", label: "Tarjeta", icon: CreditCard },
      {
        id: "configuracion/plan",
        label: "Plan y Facturación",
        icon: BillingIcon,
      },
      {
        id: "configuracion/usuarios",
        label: "Usuarios y Accesos",
        icon: Users,
      },
    ],
  },
];

export function Sidebar({
  role,
  isSuperAdmin = false,
  hasBusinessContext, // opcional: si no viene, lo derivamos de currentBusiness
  currentBusiness,
  businesses,
  onBusinessChange,
  branches = [],
  currentBranchId,
  onBranchChange,
  currentView,
  onNavigate,
}) {
  console.log("[Sidebar] role:", role);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const norm = (v) =>
    String(v || "")
      .trim()
      .toUpperCase();
  const roleNorm = norm(role);
  const superNorm = isSuperAdmin === true;
  const hasCtx =
    typeof hasBusinessContext === "boolean"
      ? hasBusinessContext
      : Boolean(currentBusiness?.id);

  const noBusinessContext = !hasCtx;
  const showOnboardingMenu = noBusinessContext && !superNorm;
  const showSuperadminNoContext = noBusinessContext && superNorm;

  const isConfigView =
    typeof currentView === "string" && currentView.startsWith("configuracion/");
  const [configOpen, setConfigOpen] = useState(isConfigView);

  useEffect(() => {
    if (isConfigView) {
      setConfigOpen(true);
    }
  }, [isConfigView]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const filteredNavItems = navItems.filter((item) => {
    // si no hay contexto, no mostramos el menú normal
    if (noBusinessContext) return false;

    // superadmin con contexto ve todo (igual puedes mantener requiresEntitlement)
    if (superNorm) {
      if (
        item.requiresEntitlement &&
        !item.requiresEntitlement(currentBusiness?.plan)
      ) {
        return false;
      }
      return true;
    }

    // usuario normal: filtrar por rol del negocio
    const allowed = (item.roles || []).some((r) => norm(r) === roleNorm);
    if (!allowed) return false;

    if (
      item.requiresEntitlement &&
      !item.requiresEntitlement(currentBusiness?.plan)
    ) {
      return false;
    }
    return true;
  });

  const goTo = (viewId) => {
    console.log("[Sidebar goTo] viewId:", viewId);
    onNavigate(viewId);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-auto items-center justify-center rounded-lg bg-white/10">
              <span className="font-bold">
                <img
                  src="/MinLogo.png"
                  alt="VINCU Logo"
                  className="h-8 w-auto"
                />
              </span>
            </div>
            <span className="text-xl font-bold">
              <img
                src="/VincuLogo500x300.png"
                alt="VINCU Logo"
                className="h-10 w-auto"
              />
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden text-white hover:bg-slate-800 lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="text-white hover:bg-slate-800 lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="bg-slate-700" />

      {/* Business Selector - when no currentBusiness yet (e.g. SUPERADMIN or loading) */}
      {!collapsed &&
        !currentBusiness &&
        Array.isArray(businesses) &&
        businesses.length > 0 && (
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">Seleccionar negocio</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[240px] bg-slate-800 text-white">
                {businesses.map((business) => (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() => onBusinessChange(business.id)}
                    className="focus:bg-slate-700"
                  >
                    <div className="flex flex-col">
                      <span>{business.name}</span>
                      <span className="text-xs text-slate-400">
                        {business.plan} - {business.cardsIssued}/
                        {business.cardsLimit} tarjetas
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

      {/* Business Selector */}
      {currentBusiness && businesses.length > 1 && (
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{currentBusiness.name}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[240px] bg-slate-800 text-white">
              {businesses.map((business) => (
                <DropdownMenuItem
                  key={business.id}
                  onClick={() => onBusinessChange(business.id)}
                  className="focus:bg-slate-700"
                >
                  <div className="flex flex-col">
                    <span>{business.name}</span>
                    <span className="text-xs text-slate-400">
                      {business.plan} - {business.cardsIssued}/
                      {business.cardsLimit} tarjetas
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {currentBusiness && businesses.length === 1 && (
        <div className="p-4">
          <div className="rounded-lg bg-slate-800 p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{currentBusiness.name}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Plan {currentBusiness.plan}
            </div>
          </div>
        </div>
      )}

      {/* Branch Selector (Sucursales) */}
      {!collapsed && Array.isArray(branches) && branches.length > 1 && (
        <div className="px-4 pb-4 -mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">
                    {currentBranchId
                      ? branches.find((b) => b.id === currentBranchId)?.name ||
                        "Sucursal"
                      : "Todo el negocio"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[240px] bg-slate-800 text-white">
              <DropdownMenuItem
                onClick={() => onBranchChange(null)}
                className="focus:bg-slate-700"
              >
                <div className="flex flex-col">
                  <span>Todo el negocio</span>
                  <span className="text-xs text-slate-400">
                    Agregado de todas las sucursales
                  </span>
                </div>
              </DropdownMenuItem>

              <Separator className="my-1 bg-slate-700" />

              {branches.map((br) => (
                <DropdownMenuItem
                  key={br.id}
                  onClick={() => onBranchChange(br.id)}
                  className="focus:bg-slate-700"
                >
                  <div className="flex flex-col">
                    <span>{br.name}</span>
                    <span className="text-xs text-slate-400">
                      Solo esta sucursal
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">
          {/* Onboarding / No business context menu */}
          {noBusinessContext && (
            <div className="space-y-2 px-1">
              {showOnboardingMenu && (
                <Button
                  variant="ghost"
                  onClick={() => goTo("configuracion/negocio")}
                  className={cn(
                    "w-full justify-start gap-3 text-white hover:bg-slate-800",
                    currentView === "configuracion/negocio" &&
                      "bg-blue-600 hover:bg-blue-700",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Building2 className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>Configurar negocio</span>}
                </Button>
              )}

              {showSuperadminNoContext && !collapsed && (
                <div className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                  Selecciona un negocio para continuar.
                </div>
              )}
            </div>
          )}
          {filteredNavItems.map((item) => {
            const Icon = item.icon;

            // ✅ Caso 1: item normal (sin hijos)
            if (!item.children) {
              const isActive = currentView === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => goTo(item.id)}
                  className={cn(
                    "w-full justify-start gap-3 text-white hover:bg-slate-800",
                    isActive && "bg-blue-600 hover:bg-blue-700",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              );
            }

            // ✅ Caso 2: item padre (Configuración) con hijos
            const isParentActive =
              currentView === item.id ||
              (typeof currentView === "string" &&
                currentView.startsWith("configuracion/"));

            // 👉 Default: cuando hacen click en el padre, ir a Negocio
            const defaultChildId = "configuracion/negocio";

            // --- Collapsed: Flyout (Dropdown a la derecha)
            if (collapsed) {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => {}}
                      className={cn(
                        "w-full justify-center px-2 text-white hover:bg-slate-800",
                        isParentActive && "bg-blue-600 hover:bg-blue-700",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={10}
                    className="w-56 bg-slate-800 text-white"
                  >
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = currentView === child.id;

                      return (
                        <DropdownMenuItem
                          key={child.id}
                          onClick={() => goTo(child.id)}
                          className={cn(
                            "focus:bg-slate-700",
                            isChildActive && "bg-slate-700",
                          )}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // --- Expanded: Collapsible
            return (
              <Collapsible
                key={item.id}
                open={configOpen}
                onOpenChange={setConfigOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // default a Negocio
                      goTo(defaultChildId);
                      // y abrir el collapsible
                      setConfigOpen(true);
                    }}
                    className={cn(
                      "w-full justify-start gap-3 text-white hover:bg-slate-800",
                      isParentActive && "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        (configOpen || isParentActive) && "rotate-180",
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-1 space-y-1 pl-6">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = currentView === child.id;

                    return (
                      <Button
                        key={child.id}
                        variant="ghost"
                        onClick={() => goTo(child.id)}
                        className={cn(
                          "w-full justify-start gap-3 hover:bg-slate-800",
                          "pl-12 pr-4",
                          "text-slate-300",
                          isChildActive &&
                            "bg-blue-600 text-white hover:bg-blue-700",
                        )}
                      >
                        <ChildIcon className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="text-sm">{child.label}</span>
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-slate-700" />

      {/* Footer */}
      <div className="space-y-1 p-3">
        <Button
          variant="ghost"
          onClick={() => {
            onNavigate("ayuda");
            setMobileOpen(false);
          }}
          className={cn(
            "w-full justify-start gap-3 text-white hover:bg-slate-800",
            currentView === "ayuda" && "bg-blue-600 hover:bg-blue-700",
            collapsed && "justify-center px-2",
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Ayuda</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 text-white hover:bg-slate-800",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden h-screen border-r border-slate-700 lg:block",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
