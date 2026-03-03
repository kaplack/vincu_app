// frontend/src/features/redemptions/pages/Canjes.jsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function tabFromPath(pathname) {
  // /app/canjes (index) => "directo"
  // /app/canjes/validar => "validar"
  return pathname.includes("/canjes/validar") ? "validar" : "directo";
}

export default function Canjes() {
  const navigate = useNavigate();
  const location = useLocation();

  const tab = tabFromPath(location.pathname);

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Canjes</h1>
        <p className="text-slate-600">
          Gestiona canjes de forma simple y controlada
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          if (v === "directo") navigate("/app/canjes");
          if (v === "validar") navigate("/app/canjes/validar");
        }}
      >
        <TabsList className="grid w-full grid-cols-2 md:w-[420px]">
          <TabsTrigger value="directo">Canje Directo</TabsTrigger>
          <TabsTrigger value="validar">Validar Código</TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  );
}
