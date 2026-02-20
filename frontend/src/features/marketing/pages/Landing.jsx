import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Hero from "../components/Hero";
import ProblemSection from "../components/ProblemSection";
import SolutionSection from "../components/SolutionSection";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import FinalCTA from "../components/FinalCTA";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sectionId = location.state?.scrollTo;
    if (!sectionId) return;

    requestAnimationFrame(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      // limpia el state para que no quede “pegado”
      navigate("/", { replace: true, state: {} });
    });
  }, [location.state, navigate]);
  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <Pricing />
        <FinalCTA />
      </main>
    </div>
  );
}
