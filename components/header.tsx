'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Menu, X, HeartPulse } from 'lucide-react';

const navItems = [
  { label: 'Inicio', id: 'inicio' },
  { label: 'Servicios', id: 'servicios' },
  { label: 'Equipo', id: 'equipo' },
  { label: 'Obras sociales', id: 'obras-sociales' },
  { label: 'Encontranos', id: 'contacto' },
];

type HeaderProps = {
  name: string;
  logoUrl: string | null;
};

export default function Header({ name, logoUrl }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const updateActive = () => {
      // Consideramos activa la última sección que haya alcanzado el encabezado.
      const offset = 140;
      let current = 'inicio';
      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= offset) {
          current = item.id;
        }
      }
      setActiveSection(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link
          className="brand"
          href="/#inicio"
          aria-label={`${name}, ir al inicio`}
          onClick={() => { setOpen(false); setActiveSection('inicio'); }}
        >
          {logoUrl ? (
            <img 
              className="brand-image" 
              src={logoUrl} 
              alt="Logo del consultorio" 
            />
          ) : (
            <HeartPulse 
              aria-hidden="true" 
              className="brand-symbol" 
              strokeWidth={1.5} 
            />
          )}
          <span className="brand-name">{name}</span>
        </Link>

        <nav
          id="mobile-navigation"
          className={open ? "nav-links nav-open" : "nav-links"}
          aria-label="Menú principal"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className={
                activeSection === item.id
                  ? "nav-link active"
                  : "nav-link"
              }
              aria-current={
                activeSection === item.id ? "location" : undefined
              }
              onClick={() => {
                setOpen(false);
                setActiveSection(item.id);
              }}
            >
              {item.label}
            </a>
          ))}

          <div className="mobile-actions">
            <Link
              href="/iniciar-sesion"
              className="btn btn-outline"
              onClick={() => setOpen(false)}
            >
              Iniciar sesión
            </Link>

            <Link
              href="/#contacto"
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              <CalendarDays size={18} />
              Reservar turno
            </Link>
          </div>
        </nav>

        <div className="nav-actions">
          <Link href="/iniciar-sesion" className="btn btn-outline">Iniciar sesión</Link>
          <Link href="/#contacto" className="btn btn-primary">
            Contactanos
          </Link>
        </div>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
    </header>
  );
}
