import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const goToSection = (sectionId) => {
    if (location.pathname === "/") {
      scrollToSection(sectionId);
    } else {
      setIsMobileMenuOpen(false);
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              {/* <div className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white px-4 py-2 rounded-lg"> */}
              <div className="">
                {/* <span className="font-bold text-xl tracking-tight">VINCU</span> */}
                <img
                  src="/VincuLogo500x300.png"
                  alt="Logo Vincu"
                  className="h-15 w-auto"
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => goToSection("como-funciona")}
              className="text-gray-700 hover:text-[#7B4BB7] transition-colors"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => goToSection("precios")}
              className="text-gray-700 hover:text-[#7B4BB7] transition-colors"
            >
              Precios
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-gray-700 hover:text-[#7B4BB7] transition-colors"
            >
              Ingresar
            </button>
          </nav>

          {/* CTA Button Desktop */}
          <div className="hidden md:block">
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white px-6 py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Empieza gratis
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("como-funciona")}
                className="text-gray-700 hover:text-[#7B4BB7] transition-colors text-left"
              >
                Cómo funciona
              </button>
              <button
                onClick={() => scrollToSection("precios")}
                className="text-gray-700 hover:text-[#7B4BB7] transition-colors text-left"
              >
                Precios
              </button>
              <a
                href="#"
                className="text-gray-700 hover:text-[#7B4BB7] transition-colors"
              >
                Ingresar
              </a>
              <button
                onClick={() => scrollToSection("hero")}
                className="bg-gradient-to-r from-[#7B4BB7] via-[#2F7ED8] to-[#1ECAD3] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 text-center"
              >
                Empieza gratis
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
