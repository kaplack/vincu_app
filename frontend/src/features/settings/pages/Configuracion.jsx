import { Outlet, useOutletContext } from "react-router-dom";

export default function Configuracion() {
  const parentContext = useOutletContext() || {};
  const { currentBusiness, user } = parentContext;
  return (
    <div className="p-6">
      <Outlet context={{ currentBusiness, user }} />
    </div>
  );
}
