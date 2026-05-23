// components/Footer.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("footer-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    producto: [
      { name: "Planes", href: "/#planes" },
      { name: "Funciones", href: "/#funciones" },
      { name: "Inteligencia Artificial", href: "/#ia" },
      { name: "Precios", href: "/#precios" },
    ],
    empresa: [
      { name: "Sobre nosotros", href: "/about" },
      { name: "Carreras", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Prensa", href: "/press" },
    ],
    legal: [
      { name: "Términos y condiciones", href: "/terms" },
      { name: "Política de privacidad", href: "/privacy" },
      { name: "Seguridad", href: "/security" },
      { name: "Cookies", href: "/cookies" },
    ],
    soporte: [
      { name: "Centro de ayuda", href: "/help" },
      { name: "Contacto", href: "/#contacto" },
      { name: "API", href: "/api" },
      { name: "Estado del servicio", href: "/status" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: "𝕏", href: "https://twitter.com" },
    { name: "LinkedIn", icon: "in", href: "https://linkedin.com" },
    { name: "GitHub", icon: "⌨️", href: "https://github.com" },
    { name: "Discord", icon: "🎮", href: "https://discord.com" },
  ];

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer ref={footerRef} className="footer">
      {/* Gradiente superior para transición líquida */}
      <div className="footer-gradient-top"></div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <div className="footer-logo-mark">
                <svg viewBox="0 0 40 40" fill="none">
                  <path
                    d="M20 4L36 20L20 36L4 20L20 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M20 12L28 20L20 28L12 20L20 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                </svg>
              </div>
              <div className="footer-logo-text">
                Liquid<span>Glass</span>
              </div>
            </Link>
            <p className="footer-description">
              La plataforma financiera premium que combina inteligencia artificial
              y diseño de vidrio líquido para una experiencia de inversión sin precedentes.
            </p>
            <div className="footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-links">
            <div className="footer-links-column">
              <h3 className="footer-links-title">Producto</h3>
              <ul className="footer-links-list">
                {footerLinks.producto.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Empresa</h3>
              <ul className="footer-links-list">
                {footerLinks.empresa.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Legal</h3>
              <ul className="footer-links-list">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3 className="footer-links-title">Soporte</h3>
              <ul className="footer-links-list">
                {footerLinks.soporte.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => {
                        if (link.href === "/#contacto") {
                          handleSmoothScroll(e, link.href);
                        }
                      }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="footer-newsletter-content">
            <h3 className="footer-newsletter-title">
              Suscríbete a nuestro newsletter
            </h3>
            <p className="footer-newsletter-description">
              Recibe las últimas novedades y consejos financieros directamente en tu correo.
            </p>
          </div>
          <form className="footer-newsletter-form">
            <div className="footer-newsletter-input-group">
              <input
                type="email"
                placeholder="tu@email.com"
                className="footer-newsletter-input"
                required
              />
              <button type="submit" className="footer-newsletter-btn">
                Suscribirse
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
            <p className="footer-newsletter-note">
              Al suscribirte aceptas nuestra{" "}
              <Link href="/privacy">Política de privacidad</Link>
            </p>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} LiquidGlass. Todos los derechos reservados.
            </p>
            <div className="footer-bottom-links">
              <Link href="/terms">Términos</Link>
              <span className="footer-bottom-separator">•</span>
              <Link href="/privacy">Privacidad</Link>
              <span className="footer-bottom-separator">•</span>
              <Link href="/cookies">Cookies</Link>
            </div>
          </div>
          <div className="footer-back-to-top">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="footer-back-to-top-btn"
              aria-label="Volver arriba"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M12 5L5 12M12 5L19 12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Efectos decorativos líquidos */}
      <div className="footer-glow-1"></div>
      <div className="footer-glow-2"></div>
    </footer>
  );
}