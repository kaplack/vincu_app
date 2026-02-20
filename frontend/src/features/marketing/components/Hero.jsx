import React from "react";
import { Smartphone, QrCode, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Fideliza a tus clientes{" "}
              <span className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] bg-clip-text text-transparent">
                sin app ni tarjetas físicas
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 lg:mb-10 leading-relaxed">
              Crea tu programa de puntos con tarjetas digitales en Google
              Wallet. Tus clientes solo escanean un QR.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white px-8 py-4 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                onClick={() => navigate("/register")}
              >
                Crear mi programa gratis
              </button>
              <button
                onClick={() => scrollToSection("como-funciona")}
                className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-lg hover:border-[#7B4BB7] hover:text-[#7B4BB7] transition-all duration-200"
              >
                Ver cómo funciona
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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
                Gratis hasta 30 clientes
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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
                Configuración en 5 minutos
              </div>
            </div>
          </div>

          {/* Right Column - Visual Mockup */}
          <div className="relative">
            {/* Card Mockup */}
            <div className="relative max-w-md mx-auto lg:max-w-lg">
              {/* Decorative Background Elements */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-gradient-to-br from-[#7B4BB7]/20 to-[#1ECAD3]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-[#2F7ED8]/20 to-[#7B4BB7]/20 rounded-full blur-3xl"></div>

              {/* Google Wallet Card Mockup */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] rounded-2xl p-6 text-white">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm opacity-90 mb-1">
                        Programa de lealtad
                      </p>
                      <h3 className="text-xl font-bold">Mi Negocio</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <Award size={24} />
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <p className="text-sm opacity-90 mb-1">Puntos acumulados</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold">850</p>
                      <p className="text-lg opacity-90">pts</p>
                    </div>
                    <div className="mt-3 bg-white/20 rounded-full h-2">
                      <div className="bg-white rounded-full h-2 w-[85%]"></div>
                    </div>
                    <p className="text-xs opacity-80 mt-2">
                      150 pts para tu próxima recompensa
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 text-sm mb-1">
                        Escanea para sumar puntos
                      </p>
                      <p className="text-gray-500 text-xs">ID: #VNC-12345</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <QrCode size={40} className="text-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Google Wallet Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                  <Smartphone size={16} />
                  <span className="text-sm">Guardado en Google Wallet</span>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -left-4 top-1/4 hidden lg:block">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600">Clientes activos</p>
                  <p className="text-2xl font-bold text-[#7B4BB7]">+2,500</p>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 hidden lg:block">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600">Tasa de retorno</p>
                  <p className="text-2xl font-bold text-[#1ECAD3]">+68%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
