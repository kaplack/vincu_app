// src/features/settings/components/UbigeoSelect.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ubigeoData from "@/features/settings/constants/ubigeoData.json";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * UbigeoSelect (Perú)
 * - 3 selects progresivos: Departamento -> Provincia -> Distrito
 * - Usa el Select de components/ui
 * - Soporta edición (precarga) con value: { departamento, provincia, distrito, ubigeoId }
 *
 * Props:
 * - value: { departamento?: string, provincia?: string, distrito?: string, ubigeoId?: string }
 * - onChange: (nextValue) => void
 * - disabled?: boolean
 * - required?: boolean
 * - labels?: { departamento?: string, provincia?: string, distrito?: string }
 * - placeholders?: { departamento?: string, provincia?: string, distrito?: string }
 */
const DEFAULT_LABELS = {
  departamento: "Departamento",
  provincia: "Provincia",
  distrito: "Distrito",
};

const DEFAULT_PLACEHOLDERS = {
  departamento: "Selecciona un departamento",
  provincia: "Selecciona una provincia",
  distrito: "Selecciona un distrito",
};

// Build an index once: ubigeoId -> { departamento, provincia, distrito }
const UBIGEO_INDEX = (() => {
  const index = new Map();

  try {
    const departamentos = Object.keys(ubigeoData || {});
    for (const dep of departamentos) {
      const provinciasObj = ubigeoData[dep] || {};
      const provincias = Object.keys(provinciasObj);
      for (const prov of provincias) {
        const distritosArr = provinciasObj[prov] || [];
        for (const dist of distritosArr) {
          const id = String(dist?.IDDIST ?? "").trim();
          const nombre = String(dist?.NOMBDIST ?? "").trim();
          if (!id) continue;
          index.set(id, {
            departamento: dep,
            provincia: prov,
            distrito: nombre,
            ubigeoId: id,
          });
        }
      }
    }
  } catch (e) {
    // If the JSON shape changes, we fail gracefully (component still renders, but no options).
  }

  return index;
})();

function normalizeStr(s) {
  return String(s ?? "").trim();
}

export default function UbigeoSelect({
  value,
  onChange,
  disabled = false,
  required = false,
  labels,
  placeholders,
}) {
  const L = { ...DEFAULT_LABELS, ...(labels || {}) };
  const P = { ...DEFAULT_PLACEHOLDERS, ...(placeholders || {}) };

  const incoming = {
    departamento: normalizeStr(value?.departamento),
    provincia: normalizeStr(value?.provincia),
    distrito: normalizeStr(value?.distrito),
    ubigeoId: normalizeStr(value?.ubigeoId),
  };

  // Local UI state for selects (kept in sync with value)
  const [dep, setDep] = useState(incoming.departamento || "");
  const [prov, setProv] = useState(incoming.provincia || "");
  const [distId, setDistId] = useState(incoming.ubigeoId || ""); // district select uses ubigeoId
  const didInitRef = useRef(false);

  // Options
  const departamentos = useMemo(() => Object.keys(ubigeoData || {}).sort(), []);
  const provincias = useMemo(() => {
    if (!dep) return [];
    return Object.keys(ubigeoData?.[dep] || {}).sort();
  }, [dep]);

  const distritos = useMemo(() => {
    if (!dep || !prov) return [];
    const arr = ubigeoData?.[dep]?.[prov] || [];
    // Keep original order; you can sort if you want:
    // return [...arr].sort((a, b) => String(a.NOMBDIST).localeCompare(String(b.NOMBDIST)));
    return arr;
  }, [dep, prov]);

  // Helper: emit value to parent
  const emit = (next) => {
    onChange?.({
      departamento: next.departamento ?? "",
      provincia: next.provincia ?? "",
      distrito: next.distrito ?? "",
      ubigeoId: next.ubigeoId ?? "",
    });
  };

  // Initial sync / edit mode support:
  // - If ubigeoId exists, resolve to dep/prov/dist and set selects.
  // - Else if dep/prov/dist provided, try to resolve ubigeoId (best effort).
  useEffect(() => {
    // Avoid fighting user input after first init unless value actually changes.
    // We'll still react if parent pushes a different ubigeoId.
    const key = `${incoming.ubigeoId}|${incoming.departamento}|${incoming.provincia}|${incoming.distrito}`;

    if (!didInitRef.current) {
      didInitRef.current = true;

      if (incoming.ubigeoId && UBIGEO_INDEX.has(incoming.ubigeoId)) {
        const found = UBIGEO_INDEX.get(incoming.ubigeoId);
        setDep(found.departamento);
        setProv(found.provincia);
        setDistId(found.ubigeoId);
        emit(found);
        return;
      }

      // If no ubigeoId, but dep/prov/dist present, try to find matching IDDIST
      if (incoming.departamento && incoming.provincia && incoming.distrito) {
        const list =
          ubigeoData?.[incoming.departamento]?.[incoming.provincia] || [];
        const match = list.find(
          (d) =>
            normalizeStr(d?.NOMBDIST).toLowerCase() ===
            incoming.distrito.toLowerCase(),
        );
        const id = normalizeStr(match?.IDDIST);
        setDep(incoming.departamento);
        setProv(incoming.provincia);
        setDistId(id || "");
        emit({
          departamento: incoming.departamento,
          provincia: incoming.provincia,
          distrito: incoming.distrito,
          ubigeoId: id || "",
        });
        return;
      }

      // Otherwise just initialize with what we have
      setDep(incoming.departamento || "");
      setProv(incoming.provincia || "");
      setDistId(incoming.ubigeoId || "");
      return;
    }

    // After init: if parent pushes a different ubigeoId, update UI
    if (
      incoming.ubigeoId &&
      incoming.ubigeoId !== distId &&
      UBIGEO_INDEX.has(incoming.ubigeoId)
    ) {
      const found = UBIGEO_INDEX.get(incoming.ubigeoId);
      setDep(found.departamento);
      setProv(found.provincia);
      setDistId(found.ubigeoId);
      // Don't emit again to avoid loops; parent already has it
      return;
    }

    // If parent clears everything, reflect it
    if (
      !incoming.ubigeoId &&
      !incoming.departamento &&
      !incoming.provincia &&
      !incoming.distrito
    ) {
      setDep("");
      setProv("");
      setDistId("");
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    incoming.ubigeoId,
    incoming.departamento,
    incoming.provincia,
    incoming.distrito,
  ]);

  // Handlers (cascading reset)
  const handleDepartamento = (nextDep) => {
    setDep(nextDep);
    setProv("");
    setDistId("");
    emit({ departamento: nextDep, provincia: "", distrito: "", ubigeoId: "" });
  };

  const handleProvincia = (nextProv) => {
    setProv(nextProv);
    setDistId("");
    emit({
      departamento: dep,
      provincia: nextProv,
      distrito: "",
      ubigeoId: "",
    });
  };

  const handleDistrito = (nextUbigeoId) => {
    setDistId(nextUbigeoId);

    const found = UBIGEO_INDEX.get(String(nextUbigeoId));
    if (found) {
      // Ensure dep/prov matches the resolved values (safety)
      setDep(found.departamento);
      setProv(found.provincia);
      emit(found);
      return;
    }

    // Fallback (should rarely happen)
    const districtObj = distritos.find(
      (d) => normalizeStr(d?.IDDIST) === String(nextUbigeoId),
    );
    emit({
      departamento: dep,
      provincia: prov,
      distrito: normalizeStr(districtObj?.NOMBDIST),
      ubigeoId: String(nextUbigeoId),
    });
  };

  const provinciaDisabled = disabled || !dep;
  const distritoDisabled = disabled || !dep || !prov;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Departamento */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {L.departamento}{" "}
          {required ? <span className="text-red-500">*</span> : null}
        </label>

        <Select
          value={dep || ""}
          onValueChange={handleDepartamento}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={P.departamento} />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Provincia */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {L.provincia}{" "}
          {required ? <span className="text-red-500">*</span> : null}
        </label>

        <Select
          value={prov || ""}
          onValueChange={handleProvincia}
          disabled={provinciaDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={P.provincia} />
          </SelectTrigger>
          <SelectContent>
            {provincias.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Distrito */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {L.distrito}{" "}
          {required ? <span className="text-red-500">*</span> : null}
        </label>

        <Select
          value={distId || ""}
          onValueChange={handleDistrito}
          disabled={distritoDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={P.distrito} />
          </SelectTrigger>
          <SelectContent>
            {distritos.map((d) => {
              const id = normalizeStr(d?.IDDIST);
              const name = normalizeStr(d?.NOMBDIST);
              if (!id) return null;
              return (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
