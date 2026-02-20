import React from "react";
import { Wallet, QrCode, Gift, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SolutionSection() {
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Tarjeta digital en Google Wallet",
      description:
        "Tus clientes guardan su tarjeta de lealtad directamente en Google Wallet. Siempre disponible, nunca se pierde.",
      gradient: "from-[#7B4BB7] to-[#2F7ED8]",
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Registro por QR o link",
      description:
        "Los clientes se registran en segundos escaneando un código QR o haciendo clic en un enlace. Sin apps, sin complicaciones.",
      gradient: "from-[#2F7ED8] to-[#1ECAD3]",
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Puntos y recompensas automáticas",
      description:
        "Configura reglas de puntos y recompensas. El sistema se actualiza automáticamente con cada compra.",
      gradient: "from-[#1ECAD3] to-[#7B4BB7]",
    },
  ];

  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[#7B4BB7] font-semibold mb-3 uppercase tracking-wider text-sm">
            La solución
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            VINCU: Fidelización digital{" "}
            <span className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] bg-clip-text text-transparent">
              simple y efectiva
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Una plataforma completa para crear y gestionar programas de lealtad
            sin las complicaciones tradicionales
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 lg:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Icon with Gradient Background */}
              <div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative gradient line on hover */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Implementación rápida
                </span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Configura tu programa en menos de 5 minutos
              </h3>
              <p className="text-lg opacity-90 mb-6">
                No necesitas conocimientos técnicos. VINCU es tan simple que lo
                puedes configurar desde tu teléfono.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Sin instalaciones complejas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Integración automática con Google Wallet</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Soporte incluido en todos los planes</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center">
              <button
                className="bg-white text-[#7B4BB7] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform duration-200 shadow-xl"
                onClick={() => navigate("/register")}
              >
                Empezar ahora gratis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
