
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  HeartPulse,
  Users,
  ShieldCheck,
  MapPin,
  Globe,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import GeneralSettingsForm from "../../components/general-settings-form";
import ServicesSettingsForm from "../../components/services-settings-form";
import ProfessionalsSettingsForm from "../../components/professionals-settings-form";
import BranchesSettingsForm from "../../components/branches-settings-form";
import InsuranceProvidersSettingsForm from "../../components/insurance-providers-settings-form";

const modules = [
  {
    id: "datos",
    title: "Datos generales",
    description: "Logo, nombre, portada, WhatsApp y redes sociales.",
    icon: Settings,
  },
  {
    id: "servicios",
    title: "Servicios",
    description: "Gestionar tratamientos, descripciones e imágenes.",
    icon: HeartPulse,
  },
  {
    id: "profesionales",
    title: "Profesionales",
    description: "Administrar el equipo odontológico.",
    icon: Users,
  },
  {
    id: "obras-sociales",
    title: "Obras sociales",
    description: "Administrar coberturas y logos.",
    icon: ShieldCheck,
  },
  {
    id: "sucursales",
    title: "Sucursales",
    description: "Direcciones, horarios y ubicación.",
    icon: MapPin,
  },
];

export default function AdminPage() {
  const [clinicData, setClinicData] = useState({
    name: "Consultorios Nazaret",
    logoUrl: null as string | null,
  });

  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const configRef = useRef<HTMLDivElement>(null);

  async function loadClinicData() {
    try {
      const response = await fetch("/api/admin/general", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      setClinicData({
        name: data.name,
        logoUrl: data.logoUrl,
      });
    } catch (error) {
      console.error("Error al cargar datos del consultorio:", error);
    }
  }

  useEffect(() => {
    void loadClinicData();
  }, []);

  function openModule(id: string) {
    setActiveModule(id);
    setMobileMenuOpen(false);
    setMessage("");

    setTimeout(() => {
      configRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function closeModule() {
    setActiveModule(null);
    setMobileMenuOpen(false);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSaved() {
    setActiveModule(null);
    setMobileMenuOpen(false);
    setMessage("Configuración guardada correctamente.");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-mobile-header">
          <div className="admin-brand">
            {clinicData.logoUrl ? (
              <img
                src={clinicData.logoUrl}
                alt={`Logo de ${clinicData.name}`}
                className="admin-brand-logo"
              />
            ) : (
              <HeartPulse size={29} strokeWidth={1.5} />
            )}

            <div className="admin-brand-text">
              <strong>{clinicData.name}</strong>
              <span>Administración</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={
              mobileMenuOpen ? "Cerrar menú" : "Abrir menú"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-navigation"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        <div
          id="admin-mobile-navigation"
          className={
            mobileMenuOpen
              ? "admin-menu-content admin-menu-open"
              : "admin-menu-content"
          }
        >
          <nav className="admin-navigation" aria-label="Administración">
            <button
              type="button"
              className={`admin-nav-item admin-nav-button ${
                activeModule === null ? "selected" : ""
              }`}
              onClick={closeModule}
            >
              <LayoutDashboard size={19} />
              Panel general
            </button>

            <div className="admin-nav-group-title">
              CONFIGURACIÓN
            </div>

            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <button
                  key={module.id}
                  type="button"
                  className={`admin-nav-item admin-nav-button ${
                    activeModule === module.id ? "selected" : ""
                  }`}
                  onClick={() => openModule(module.id)}
                >
                  <Icon size={19} />
                  {module.title}
                </button>
              );
            })}
          </nav>

          <div className="admin-sidebar-bottom">
            <Link href="/" className="admin-nav-item">
              <Globe size={19} />
              Ver página web
            </Link>
          </div>
        </div>
      </aside>

      <main
        className={`admin-main ${
          activeModule ? "admin-main-editing" : ""
        }`}
      >
        {message && (
          <div className="admin-success" role="status">
            {message}
          </div>
        )}

        <div className="admin-dashboard-content">
          <section id="resumen" className="admin-welcome">
            <span className="admin-eyebrow">
              PANEL DE ADMINISTRACIÓN
            </span>

            <h1>Bienvenido al panel</h1>

            <p>
              Gestioná la información del consultorio,
              sus servicios, profesionales y sucursales
              desde un solo lugar.
            </p>
          </section>

          <section className="admin-modules admin-module-group">
            <div className="admin-cards-grid">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <button
                    type="button"
                    key={module.id}
                    className="admin-module-card"
                    onClick={() => openModule(module.id)}
                  >
                    <div className="admin-module-icon">
                      <Icon size={24} strokeWidth={1.7} />
                    </div>

                    <h3>{module.title}</h3>
                    <p>{module.description}</p>

                    <span className="admin-module-link">
                      Ver sección <ArrowRight size={16} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {activeModule && (
          <div ref={configRef} className="admin-config-panel">
            <div className="admin-config-header">
              <div>
                <span className="admin-eyebrow">
                  CONFIGURACIÓN
                </span>

                <h2>
                  {modules.find(
                    (module) => module.id === activeModule
                  )?.title}
                </h2>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={closeModule}
              >
                Volver al panel
              </button>
            </div>

            {activeModule === "datos" ? (
              <GeneralSettingsForm
                onSaved={async () => {
                  await loadClinicData();
                  handleSaved();
                }}
              />
            ) : activeModule === "servicios" ? (
              <ServicesSettingsForm onSaved={handleSaved} />
            ) : activeModule === "profesionales" ? (
              <ProfessionalsSettingsForm onSaved={handleSaved} />
            ) : activeModule === "sucursales" ? (
              <BranchesSettingsForm onSaved={handleSaved} />
            ) : activeModule === "obras-sociales" ? (
              <InsuranceProvidersSettingsForm
                onSaved={handleSaved}
              />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
