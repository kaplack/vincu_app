import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white px-4 py-2 rounded-lg inline-block mb-4">
              <span className="font-bold text-xl tracking-tight">VINCU</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              La plataforma de fidelización digital más simple para pequeños negocios.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-[#7B4BB7] hover:to-[#2F7ED8] flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-[#7B4BB7] hover:to-[#2F7ED8] flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-[#7B4BB7] hover:to-[#2F7ED8] flex items-center justify-center transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-[#7B4BB7] hover:to-[#2F7ED8] flex items-center justify-center transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Producto</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Casos de uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Integraciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Prensa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Socios
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hola@vincu.pe" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  hola@vincu.pe
                </a>
              </li>
              <li>
                <a href="tel:+51987654321" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  +51 987 654 321
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                  <span>Lima, Perú</span>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Soporte</h4>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors"
              >
                Centro de ayuda
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} VINCU. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Términos de servicio
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Política de privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Política de cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
