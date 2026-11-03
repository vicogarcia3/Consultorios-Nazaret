"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  HeartPulse,
  Users,
  ShieldCheck,
  MapPin,
  UserCog,
  Globe,
  ArrowRight,
  LogOut,
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
    group: "configuracion",
  },
  {
    id: "servicios",
    title: "Servicios",
    description: "Gestionar tratamientos, descripciones e imágenes.",
    icon: HeartPulse,
    group: "configuracion",
  },
  {
    id: "profesionales",
    title: "Profesionales",
    description: "Administrar el equipo odontológico.",
    icon: Users,
    group: "configuracion",
  },
  {
    id: "obras-sociales",
    title: "Obras sociales",
    description: "Administrar coberturas y logos.",
    icon: ShieldCheck,
    group: "configuracion",
  },
  {
    id: "sucursales",
    title: "Sucursales",
    description: "Direcciones, horarios y ubicación.",
    icon: MapPin,
    group: "configuracion",
  },
];

export default function AdminPage() {
  const [clinicData, setClinicData] = useState({
    name: "Consultorios Nazaret",
    logoUrl: null as string | null,
  });

  useEffect(() => {
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

    loadClinicData();
  }, []);

  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const configRef = useRef<HTMLDivElement>(null);

  function openModule(id: string) {
    setActiveModule(id);
    setMessage("");

    setTimeout(() => {
        configRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        });
    }, 50);
  }

  function closeModule() {
    setActiveModule(null);
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
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
        
        <nav className="admin-navigation">
          <a href="#resumen" className="admin-nav-item selected">
            <LayoutDashboard size={19} />
            Panel general
          </a>

          <div className="admin-nav-group-title">
            CONFIGURACIÓN
          </div>

          {modules
            .filter((module) => module.group === "configuracion")
            .map((module) => {
              const Icon = module.icon;

              return (
                <button
                  key={module.id}
                  type="button"
                  className="admin-nav-item admin-nav-button"
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

          <Link href="/" className="admin-nav-item">
            <LogOut size={19} />
            Volver al inicio
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        {message && (
          <div className="admin-success" role="status">
            {message}
          </div>
        )}
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
        
        {[
          {
            id: "configuracion",
          },
  
        ].map((group) => (
          <section
            key={group.id}
            className="admin-modules admin-module-group"
          >
            <div className="admin-cards-grid">
              {modules
                .filter((module) => module.group === group.id)
                .map((module) => {
                  const Icon = module.icon;

                  return (
                    <button
                      type="button"
                      onClick={() => openModule(module.id)}
                      className="admin-module-card"
                      key={module.id}
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
        ))}

        {activeModule && (
        <div
            ref={configRef}
            className="admin-config-panel"
        >
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
                Cerrar
            </button>
            </div>

            {activeModule === "datos" ? (
              <GeneralSettingsForm
                onSaved={async () => {
                  try {
                    const response = await fetch("/api/admin/general", {
                      cache: "no-store",
                    });

                    if (response.ok) {
                      const data = await response.json();

                      setClinicData({
                        name: data.name,
                        logoUrl: data.logoUrl,
                      });
                    }
                  } catch (error) {
                    console.error(error);
                  }

                  setActiveModule(null);
                  setMessage("Configuración exitosa");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            ) : activeModule === "servicios" ? (
              <ServicesSettingsForm
                onSaved={() => {
                  setActiveModule(null);
                  setMessage("Configuración exitosa");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            ) : activeModule === "profesionales" ? (
              <ProfessionalsSettingsForm
                onSaved={() => {
                  setActiveModule(null);
                  setMessage("Configuración exitosa");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            ) : activeModule === "sucursales" ? (
              <BranchesSettingsForm
                onSaved={() => {
                  setActiveModule(null);
                  setMessage("Configuración exitosa");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            ) : activeModule === "obras-sociales" ? (
              <InsuranceProvidersSettingsForm
                onSaved={() => {
                  setActiveModule(null);
                  setMessage("Configuración exitosa");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            ) : (
              <p>Próximamente configuraremos este módulo.</p>
            )}

        </div>
        )}
      </main>
    </div>
  );
}