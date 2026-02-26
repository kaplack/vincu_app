import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function cleanPhone9(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 9);
}

export default function JoinPublic() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => phone.length === 9 && status !== "loading",
    [phone, status],
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const payload = { phone };
      if (firstName.trim()) payload.firstName = firstName.trim();

      const { data } = await apiClient.post(`/public/join/${slug}`, payload);

      // El backend te devuelve directLink: "/c/<token>"
      const directLink = data?.directLink;
      if (!directLink) throw new Error("No directLink returned");

      // Redirige dentro del mismo frontend (asumiendo que tienes ruta /c/:token)
      navigate(directLink);
      setStatus("succeeded");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo registrar. Intenta de nuevo.";
      setError(msg);
      setStatus("failed");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Ingresa tu teléfono</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Teléfono (9 dígitos)
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(cleanPhone9(e.target.value))}
                placeholder="987654321"
                inputMode="numeric"
                maxLength={9}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Nombre (opcional)
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. José"
                maxLength={80}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" disabled={!canSubmit} className="w-full">
              {status === "loading" ? "Procesando..." : "Continuar"}
            </Button>

            <p className="text-xs text-slate-500">
              Con esto podrás ver tus puntos y tu tarjeta.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
