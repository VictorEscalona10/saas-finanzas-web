// app/page.tsx
"use client";

import { useEffect, useRef } from "react";

import Hero from "@/src/modules/finance/presentation/components/sections/Hero";
import Plans from "@/src/modules/finance/presentation/components/sections/Plans";
import Functions from "@/src/modules/finance/presentation/components/sections/Functions";
import Ia from "@/src/modules/finance/presentation/components/sections/Ia";
import Contact from "@/src/modules/finance/presentation/components/sections/Contact";

export default function Home() {
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "-100px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          
          // Actualizar URL hash sin scroll
          const id = entry.target.getAttribute("id");
          if (id && window.location.hash !== `#${id}`) {
            history.pushState(null, "", `#${id}`);
          }
        }
      });
    }, observerOptions);

    // Observar todas las secciones
    const sections = ["planes", "funciones", "ia", "contacto"];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
        sectionsRef.current[section] = element;
      }
    });

    // Scroll reveal para elementos individuales
    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
      revealElements.forEach((el) => revealObserver.unobserve(el));
    };
  }, []);

  return (
    <>
      <main className="landing-main">
        <Hero />
        <Plans />
        <Functions />
        <Ia />
        <Contact />
      </main>
    </>
  );
}