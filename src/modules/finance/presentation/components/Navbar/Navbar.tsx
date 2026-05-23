// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./Navbar.css";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            // Detecta si el scroll supera los 50px
            setIsScrolled(window.scrollY > 50);

            // Detecta sección activa basada en scroll
            const sections = ["planes", "funciones"];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveLink(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Planes", href: "/#planes", id: "planes" },
        { name: "Funciones", href: "/#funciones", id: "funciones" },
        { name: "Inteligencia Artificial", href: "/#ia", id: "ia" },
        { name: "Contacto", href: "/#contacto", id: "contacto" },
    ];

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace("/#", "");
        const element = document.getElementById(targetId);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
            <div className="navbar-container">
                {/* Logo con efecto 3D líquido */}
                <Link href="/" className="logo-wrapper">
                    <div className="logo-3d-container">
                        <div className="logo-glow"></div>
                        <div className="logo-icon">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 4L36 20L20 36L4 20L20 4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <path d="M20 12L28 20L20 28L12 20L20 12Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <circle cx="20" cy="20" r="3" fill="currentColor" />
                            </svg>
                        </div>
                    </div>
                    <div className="logo-text">
                        <span className="logo-text-light">Liquid</span>
                        <span className="logo-text-dark">Glass</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="nav-links desktop-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`nav-link ${activeLink === link.id ? "nav-link-active" : ""}`}
                            onClick={(e) => handleSmoothScroll(e, link.href)}
                        >
                            <span className="nav-link-text">{link.name}</span>
                            <span className="nav-link-glow"></span>
                        </Link>
                    ))}
                </div>

                {/* Desktop Auth Buttons */}
                <div className="nav-auth desktop-auth">
                    <Link href="/login" className="btn btn-glass">
                        <span>Iniciar Sesión</span>
                    </Link>
                    <Link href="/register" className="btn btn-primary">
                        <span>Registrarse</span>
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`mobile-menu-btn ${isMobileMenuOpen ? "active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Abrir menú"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}>
                <div className="mobile-menu-container">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="mobile-nav-link"
                            onClick={(e) => handleSmoothScroll(e, link.href)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="mobile-auth">
                        <Link href="/login" className="mobile-btn mobile-btn-glass">
                            Iniciar Sesión
                        </Link>
                        <Link href="/register" className="mobile-btn mobile-btn-primary">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}