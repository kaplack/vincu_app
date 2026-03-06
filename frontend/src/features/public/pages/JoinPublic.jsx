import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QrCode, Smartphone, Gift } from "lucide-react";

import apiClient from "@/services/apiClient";
import { Card, CardContent } from "@/components/ui/card";
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

  const [bizStatus, setBizStatus] = useState("loading"); // loading | succeeded | failed
  const [businessName, setBusinessName] = useState("");

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadBusiness() {
      try {
        setBizStatus("loading");
        setBusinessName("");

        const { data } = await apiClient.get(
          `/businesses/public/by-slug/${slug}`,
        );

        const name = data?.business?.commercialName || "";

        if (!alive) return;

        setBusinessName(name);
        setBizStatus("succeeded");
      } catch (err) {
        if (!alive) return;
        setBizStatus("failed");
      }
    }

    if (slug) {
      loadBusiness();
    } else {
      setBizStatus("failed");
    }

    return () => {
      alive = false;
    };
  }, [slug]);

  const canSubmit = useMemo(
    () =>
      phone.length === 9 && status !== "loading" && bizStatus === "succeeded",
    [phone, status, bizStatus],
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const payload = { phone };

      if (firstName.trim()) {
        payload.firstName = firstName.trim();
      }

      const { data } = await apiClient.post(`/public/join/${slug}`, payload);

      const directLink = data?.directLink;
      if (!directLink) {
        throw new Error("No directLink returned");
      }

      navigate(directLink);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo registrar. Intenta de nuevo.";

      setError(msg);
      setStatus("failed");
    }
  }

  const resolvedBusinessName =
    bizStatus === "succeeded" && businessName ? businessName : "este negocio";

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-white pt-10 pb-14 sm:pt-14 lg:pt-20 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                Programa de fidelización
              </p>

              <h1 className="mb-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Únete al programa de puntos de{" "}
                <span className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] bg-clip-text text-transparent">
                  {bizStatus === "succeeded" && businessName
                    ? businessName
                    : "tu negocio favorito"}
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-600 lg:mx-0 lg:text-xl">
                Registra tu teléfono en segundos para comenzar a acumular
                puntos, consultar tu tarjeta digital y acceder a futuras
                recompensas.
              </p>

              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600 lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  Sin descargar una app
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  Registro rápido
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  Tarjeta digital al instante
                </div>
              </div>

              {bizStatus === "loading" && (
                <p className="text-sm text-gray-500">Cargando negocio...</p>
              )}

              {bizStatus === "failed" && (
                <p className="text-sm text-red-600">
                  No encontramos este negocio. Revisa el enlace e inténtalo
                  nuevamente.
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute -top-8 -right-8 h-56 w-56 rounded-full bg-gradient-to-br from-[#7B4BB7]/20 to-[#1ECAD3]/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-56 w-56 rounded-full bg-gradient-to-tr from-[#2F7ED8]/20 to-[#7B4BB7]/20 blur-3xl" />

              <Card className="relative rounded-3xl border border-gray-100 bg-white shadow-2xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
                      Registro rápido
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Ingresa tu teléfono
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Con este registro podrás ver tus puntos y tu tarjeta
                      digital del programa.
                    </p>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Teléfono (9 dígitos)
                      </label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(cleanPhone9(e.target.value))}
                        placeholder="987654321"
                        inputMode="numeric"
                        maxLength={9}
                        disabled={bizStatus !== "succeeded"}
                        className="h-11 rounded-lg border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nombre (opcional)
                      </label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ej. José"
                        maxLength={80}
                        disabled={bizStatus !== "succeeded"}
                        className="h-11 rounded-lg border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="h-11 w-full rounded-lg bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-xl"
                    >
                      {status === "loading" ? "Procesando..." : "Continuar"}
                    </Button>

                    <p className="text-center text-xs leading-5 text-gray-500">
                      No necesitas crear una contraseña ni descargar una app
                      para empezar.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* <div className="absolute -left-3 top-10 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-lg lg:block">
                <p className="text-sm text-gray-600">Programa</p>
                <p className="text-lg font-bold text-[#7B4BB7]">
                  {bizStatus === "succeeded" && businessName
                    ? businessName
                    : "Mi Negocio"}
                </p>
              </div>

              <div className="absolute -right-3 bottom-10 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-lg lg:block">
                <p className="text-sm text-gray-600">Acceso</p>
                <p className="text-lg font-bold text-[#1ECAD3]">En segundos</p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="bg-[#F7F9FB] py-16 lg:py-24 scroll-mt-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7B4BB7]">
              Cómo funciona
            </p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Empieza a acumular puntos en tres pasos
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Unirte al programa de {resolvedBusinessName} es rápido, simple y
              pensado para usarlo desde tu celular.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3 lg:gap-12">
            <div
              className="absolute top-16 left-1/6 right-1/6 hidden h-0.5 bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] opacity-20 md:block"
              style={{ top: "4rem" }}
            />

            <div className="relative">
              <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl">
                <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] font-bold text-white shadow-lg">
                  01
                </div>

                <div className="mb-6 pt-4">
                  <div className="inline-flex rounded-xl bg-gray-50 p-4 text-[#7B4BB7]">
                    <QrCode className="h-10 w-10" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Registra tu teléfono
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Completa tus datos en segundos para unirte al programa de{" "}
                  {resolvedBusinessName}.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl">
                <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] font-bold text-white shadow-lg">
                  02
                </div>

                <div className="mb-6 pt-4">
                  <div className="inline-flex rounded-xl bg-gray-50 p-4 text-[#2F7ED8]">
                    <Smartphone className="h-10 w-10" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Accede a tu tarjeta
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Consulta tus puntos y guarda tu tarjeta digital para usarla
                  cada vez que compres.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl">
                <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] font-bold text-white shadow-lg">
                  03
                </div>

                <div className="mb-6 pt-4">
                  <div className="inline-flex rounded-xl bg-gray-50 p-4 text-[#1ECAD3]">
                    <Gift className="h-10 w-10" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Acumula y canjea
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Suma puntos con tus compras y utilízalos en recompensas cuando
                  el negocio las tenga disponibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
