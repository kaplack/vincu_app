import React from 'react';
import { XCircle, Smartphone, UserX } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: <XCircle className="w-12 h-12" />,
      title: 'Tarjetas físicas que se pierden',
      description: 'Los clientes olvidan o pierden sus tarjetas de lealtad constantemente, perdiendo sus puntos y beneficios.'
    },
    {
      icon: <Smartphone className="w-12 h-12" />,
      title: 'Apps que nadie descarga',
      description: 'Las aplicaciones móviles requieren descarga, registro y ocupan espacio. La mayoría de clientes nunca las instalan.'
    },
    {
      icon: <UserX className="w-12 h-12" />,
      title: 'Clientes que no regresan',
      description: 'Sin un sistema efectivo de fidelización, los clientes no tienen incentivos para volver a tu negocio.'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#F7F9FB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[#7B4BB7] font-semibold mb-3 uppercase tracking-wider text-sm">
            El problema
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Los programas de lealtad tradicionales no funcionan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Los pequeños negocios pierden clientes porque los sistemas antiguos son complicados e ineficientes
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className="text-red-500 mb-6">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-12 lg:mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-red-500 mb-2">73%</p>
              <p className="text-gray-600">de tarjetas de lealtad se pierden o se olvidan</p>
            </div>
            <div className="border-l-0 md:border-l border-gray-200">
              <p className="text-4xl font-bold text-red-500 mb-2">80%</p>
              <p className="text-gray-600">de apps de negocios nunca se descargan</p>
            </div>
            <div className="border-l-0 md:border-l border-gray-200">
              <p className="text-4xl font-bold text-red-500 mb-2">60%</p>
              <p className="text-gray-600">de clientes no regresan sin incentivos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
