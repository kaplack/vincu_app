import React from "react";
import { Check, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "Gratis para siempre",
      description: "Perfecto para empezar y probar VINCU",
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        "Hasta 30 clientes",
        "Tarjetas digitales en Google Wallet",
        "QR personalizado",
        "Panel de control básico",
        "Soporte por email",
      ],
      cta: "Empezar gratis",
      popular: false,
      gradient: "from-gray-600 to-gray-700",
    },
    {
      name: "Pequeño Negocio",
      price: "5",
      period: "por mes",
      description: "Para negocios en crecimiento",
      icon: <TrendingUp className="w-6 h-6" />,
      features: [
        "Todo del plan Free",
        "Hasta 60 clientes",
        "Estadísticas avanzadas",
        "Notificaciones automáticas",
        "Recompensas personalizadas",
        "Exportación de datos",
        "Soporte prioritario",
      ],
      cta: "Empezar ahora",
      popular: true,
      gradient: "from-[#7B4BB7] to-[#2F7ED8]",
    },
    {
      name: "Pro",
      price: "9",
      period: "por mes",
      description: "Para negocios establecidos",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Todo del plan Pequeño Negocio",
        "Clientes ilimitados",
        "API de integración",
        "Marca personalizada",
        "Multi-ubicación",
        "Analítica predictiva",
        "Soporte dedicado 24/7",
      ],
      cta: "Empezar ahora",
      popular: false,
      gradient: "from-[#2F7ED8] to-[#1ECAD3]",
    },
  ];

  return (
    <section id="precios" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[#7B4BB7] font-semibold mb-3 uppercase tracking-wider text-sm">
            Precios transparentes
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Un plan para cada{" "}
            <span className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] bg-clip-text text-transparent">
              etapa de tu negocio
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Empieza gratis y escala cuando lo necesites. Sin contratos, cancela
            cuando quieras.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl border-2 ${
                plan.popular
                  ? "border-[#7B4BB7] shadow-2xl scale-105"
                  : "border-gray-200 shadow-sm hover:shadow-lg"
              } transition-all duration-300 overflow-hidden`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#7B4BB7] to-[#2F7ED8] text-white px-4 py-1 text-sm font-semibold rounded-bl-xl">
                  Más popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.gradient} text-white mb-4`}
                >
                  {plan.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600">S/</span>
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{plan.period}</p>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 mb-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white hover:shadow-lg hover:scale-105"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features List */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            {/* <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              14 días de prueba gratis
            </div> */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              Sin tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              Cancela cuando quieras
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 max-w-3xl mx-auto bg-[#F7F9FB] rounded-2xl p-8 text-center border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            ¿Tienes una cadena de negocios?
          </h3>
          <p className="text-gray-600 mb-6">
            Contáctanos para planes enterprise con funcionalidades avanzadas y
            descuentos por volumen
          </p>
          <button className="bg-white text-[#7B4BB7] border-2 border-[#7B4BB7] px-8 py-3 rounded-lg font-semibold hover:bg-[#7B4BB7] hover:text-white transition-colors duration-200">
            Hablar con ventas
          </button>
        </div>
      </div>
    </section>
  );
}
