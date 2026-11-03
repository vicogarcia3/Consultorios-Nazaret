import Link from "next/link";
import {
  UserRound,
  Award,
  HeartHandshake,
  MapPin,
  MonitorCheck,
  MessageCircle,
  Smile,
  ArrowRight,
  Clock3,
  MapPinned,
  Instagram,
} from "lucide-react";
import Header from "@/components/header";
import { getClinicContent, getWhatsAppUrl } from "@/lib/site-data";
import InsuranceCard from "../components/insurance-card";

export const dynamic = "force-dynamic";
export default async function Home() {
  const data = await getClinicContent();
  return (
    <>
      <Header name={data.name} logoUrl={data.logoUrl} />
      <main>
        <section id="inicio" className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">
              ODONTOLOGÍA INTEGRAL <span />
            </p>
            <h1>
              Tu sonrisa,
              <br />
              <span>nuestra prioridad</span>
            </h1>
            <p className="hero-description">{data.description}</p>
            <div className="hero-actions">
              <a href="#servicios" className="btn btn-outline btn-large">
                Conocé nuestros servicios <ArrowRight size={20} />
              </a>
              {data.whatsapp ? (
                <a
                  href={getWhatsAppUrl(data.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-soft btn-large"
                >
                  <MessageCircle size={23} /> WhatsApp
                </a>
              ) : (
                <span
                  className="btn btn-soft btn-large disabled"
                  title="WhatsApp disponible próximamente"
                >
                  <MessageCircle size={23} /> WhatsApp
                </span>
              )}
            </div>
          </div>

          <div className="hero-visual">
            <div className="shape shape-one" />
            <div className="hero-picture">
              {data.heroImageUrl ? (
                <img
                  src={data.heroImageUrl}
                  alt="Instalaciones de Consultorios Nazaret"
                  className="hero-photo"
                />
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-icon">
                    <Smile size={78} strokeWidth={1} />
                  </span>
                  <strong>Un espacio para cuidar tu sonrisa</strong>
                  <small>
                    Sin imagen
                  </small>
                </div>
              )}
            </div>

            <div className="shape shape-two" />
          </div>
        </section>

        <section className="trust-strip" aria-label="Nuestros valores">
          <div className="container trust-grid">
            <div>
              <HeartHandshake />
              <span>Atención personalizada</span>
            </div>
            <div>
              <Award />
              <span>Experiencia y confianza</span>
            </div>
            <div>
              <MonitorCheck />
              <span>Tecnología y cuidado</span>
            </div>
            <div>
              <MapPin />
              <span>Estamos en Córdoba</span>
            </div>
          </div>
        </section>

        <section className="content-section container" id="servicios">
          <p className="section-kicker">NUESTROS SERVICIOS</p>

          <h2>Tratamientos para tu salud bucal</h2>

          {data.services.length > 0 && (
            <div
              className={`services-carousel ${
                data.services.length > 4 ? "services-animated" : ""
              }`}
            >
              <div className="services-track">
                <div className="services-group">
                  {data.services.map((service) => (
                    <article className="service-card" key={service.id}>
                      <div className="service-image">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="service-image-placeholder">
                            <Smile size={55} strokeWidth={1.3} />
                          </div>
                        )}
                      </div>

                      <div className="service-body">
                        <h3>{service.title}</h3>
                        {service.description && (
                          <p>{service.description}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {data.services.length > 4 && (
                  <div className="services-group" aria-hidden="true">
                    {data.services.map((service) => (
                      <article
                        className="service-card"
                        key={`duplicate-${service.id}`}
                      >
                        <div className="service-image">
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt="" loading="lazy" />
                          ) : (
                            <div className="service-image-placeholder">
                              <Smile size={55} strokeWidth={1.3} />
                            </div>
                          )}
                        </div>

                        <div className="service-body">
                          <h3>{service.title}</h3>
                          <p>{service.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section
          className="content-section section-muted"
          id="equipo"
        >
          <div className="container">

            <p className="section-kicker">
              NUESTRO EQUIPO
            </p>

            <h2>Profesionales que te acompañan</h2>

            {data.team.some((member) => member.active) ? (
              <div className="team-grid">

                {data.team
                  .filter((member) => member.active !== false)
                  .map((member) => (
                  <article
                    className="team-card"
                    key={member.id}
                  >

                    <div className="team-avatar">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          loading="lazy"
                        />
                      ) : (
                        <UserRound
                          size={46}
                          strokeWidth={1.3}
                        />
                      )}
                    </div>

                    <div className="team-info">

                      <h3>{member.name}</h3>

                      <p className="team-specialties">
                        {member.specialties.join(", ")}
                      </p>

                      {member.license && (
                        <p className="team-license">
                          MP {member.license}
                        </p>
                      )}

                    </div>

                  </article>
                ))}

              </div>
            ) : (
              <p className="empty-note">
                Próximamente vas a conocer
                a nuestros profesionales.
              </p>
            )}

          </div>
        </section>

        <section
          className="content-section"
          id="obras-sociales"
        >
          <div className="container">

            <p className="section-kicker">
              COBERTURAS MÉDICAS
            </p>

            <h2>Obras sociales</h2>
            
            {data.insuranceProviders.length > 0 ? (
              <div className="insurance-grid">
                {data.insuranceProviders.map((name) => (
                  <InsuranceCard
                    key={name}
                    name={name}
                    logoUrl={data.insuranceProviderLogos[name] ?? null}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-note">
                Consultanos por las obras sociales y
                coberturas disponibles.
              </p>
            )}

          </div>
        </section>

        <section className="content-section section-muted" id="contacto">
          <div className="container">
            <p className="section-kicker">ENCONTRANOS</p>

            <h2>Nuestras sucursales</h2>

            <p className="branches-description">
              Estamos cerca tuyo. Conocé nuestras sucursales,
              horarios y formas de contacto.
            </p>

            <div className="branches-grid">
              {data.branches.map((branch) => (
                <article className="branch-card" key={branch.id}>
                  <div className="branch-heading">
                    <div className="branch-icon">
                      <MapPin size={23} strokeWidth={1.7} />
                    </div>

                    <div>
                      <h3>{branch.name}</h3>
                      <span>{data.name}</span>
                    </div>
                  </div>

                  <p className="branch-address">{branch.address}</p>

                  <div className="branch-divider" />

                  <div className="branch-hours">
                    <div className="branch-hours-title">
                      <Clock3 size={19} />
                      <strong>Horarios de atención</strong>
                    </div>

                    {branch.hours?.length > 0 ? (
                      branch.hours.map((hour, index) => (
                        <p key={index}>{hour}</p>
                      ))
                    ) : (
                      <p className="branch-hours-optional">
                        Consultar por horarios disponibles
                      </p>
                    )}
                  </div>

                  <div className="branch-actions">
                    {branch.mapsUrl && (
                      <a
                        href={branch.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="branch-map-button"
                      >
                        <MapPinned size={18} />
                        Ver ubicación
                      </a>
                    )}

                    {branch.whatsapp && (
                      <a
                        href={`https://wa.me/${branch.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `${branch.name}: Hola! Quiero consultar por un turno en ${data.name}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="branch-whatsapp-button"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                    )}
                  </div>
          
                  {branch.instagramUrl && (
                    <div className="branch-instagram">
                      <Instagram size={19} />

                      <span>¡Seguinos en Instagram!</span>

                      <a
                        href={
                          branch.instagramUrl.startsWith("https://")
                            ? branch.instagramUrl
                            : `https://www.instagram.com/${branch.instagramUrl.replace(/^@/, "")}/`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @{
                          branch.instagramUrl
                            .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
                            .replace(/^@/, "")
                            .replace(/\/$/, "")
                        }
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="branches-contact">
              <h3>¿Tenés alguna consulta?</h3>

              <p>
                Escribinos y te ayudamos a encontrar
                la atención que necesitás.
              </p>

              {data.whatsapp ? (
                <a
                  href={getWhatsAppUrl(data.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <MessageCircle size={19} />
                  Hola {data.name}!
                </a>
              ) : (
                <span className="branches-whatsapp-pending">
                  WhatsApp próximamente
                </span>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <span>
            © {new Date().getFullYear()} {data.name}
          </span>

          <span>Atención odontológica en Córdoba</span>

          <Link
            href="/iniciar-sesion"
            className="admin-footer-link"
            aria-label="Acceso al administrador"
          >
            <UserRound size={14} strokeWidth={1.6} />
            <span>Acceso administrador</span>
          </Link>
        </div>
      </footer>
    </>
  );
}
