import React from "react";
import { Settings, Scan, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Settings className="w-10 h-10" />,
      title: "Crea tu programa",
      description:
        "Personaliza tu programa de puntos en minutos. Define cuántos puntos dar por compra y qué recompensas ofrecer.",
      color: "#7B4BB7",
    },
    {
      number: "02",
      icon: <Scan className="w-10 h-10" />,
      title: "Cliente escanea QR",
      description:
        "Tus clientes escanean el código QR en tu negocio o hacen clic en tu link. Se registran en segundos y guardan su tarjeta.",
      color: "#2F7ED8",
    },
    {
      number: "03",
      icon: <TrendingUp className="w-10 h-10" />,
      title: "Acumula y canjea puntos",
      description:
        "Con cada compra, tus clientes acumulan puntos automáticamente. Cuando llegan al objetivo, canjean su recompensa.",
      color: "#1ECAD3",
    },
  ];

  return (
    <section id="como-funciona" className="py-16 lg:py-24 bg-[#F7F9FB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[#7B4BB7] font-semibold mb-3 uppercase tracking-wider text-sm">
            Cómo funciona
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tres pasos simples para fidelizar
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            VINCU hace que sea increíblemente fácil crear y gestionar tu
            programa de lealtad
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection Lines (Desktop) */}
          <div
            className="hidden md:block absolute top-20 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] opacity-20"
            style={{ top: "4rem" }}
          ></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] flex items-center justify-center text-white font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-6 pt-4">
                  <div
                    className="inline-flex p-4 rounded-xl bg-gray-50"
                    style={{ color: step.color }}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Mobile Arrow */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-6">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-[#7B4BB7] to-[#2F7ED8]"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Video/Demo CTA */}
        {/* <div className="mt-12 lg:mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ve VINCU en acción
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Mira nuestro video de 2 minutos para ver lo fácil que es configurar tu programa de lealtad
            </p>
            <button className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white px-8 py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
              Ver demo en video
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
}
