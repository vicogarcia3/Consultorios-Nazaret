import prisma from "./prisma";

export type Service = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  license: string;
  specialties: string[];
  branchIds: string[];
  imageUrl: string | null;
  active: boolean;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  hours: string[];
  mapsUrl: string | null;
  whatsapp: string | null;
  instagramUrl?: string | null;
};

export type ClinicContent = {
  name: string;
  slogan: string;
  description: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  instagramUrl: string | null;
  address: string | null;
  mapsUrl: string | null;
  services: Service[];
  team: TeamMember[];
  insuranceProviders: string[];
  insuranceProviderLogos: Record<string, string | null>;
  branches: Branch[];
};

const demo: ClinicContent = {
  name: "Consultorios Nazaret",
  slogan: "Tu sonrisa, nuestra prioridad",
  description:
    "Trabajamos para que cada paciente reciba una atención odontológica cálida, profesional y de confianza.",
  logoUrl: "/logo.png",
  heroImageUrl: null,
  whatsapp: null,
  phone: null,
  email: null,
  instagramUrl: null,
  address: null,
  mapsUrl: null,
  services: [],
  team: [],
  insuranceProviders: [],
  insuranceProviderLogos: {},
  branches: [],
};

export async function getClinicContent(): Promise<ClinicContent> {
  const [
    settings,
    services,
    professionalRows,
    branches,
    insuranceRows,
  ] = await Promise.all([
    prisma.siteConfig.findUnique({
      where: { id: 1 },
    }),

    prisma.service.findMany({
      orderBy: { createdAt: "asc" },
    }),

    // Profesionales ahora se leen desde Neon.
    prisma.professional.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        branches: {
          select: {
            branchId: true,
          },
        },
      },
    }),

    prisma.branch.findMany({
      orderBy: { createdAt: "asc" },
    }),

    prisma.insuranceProvider.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const publicServices: Service[] = services.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description ?? "",
    imageUrl: service.imageUrl,
  }));

  // Adaptamos los datos al formato de la página.
  const team: TeamMember[] = professionalRows.map(
    (person) => ({
      id: person.id,
      name: person.name,
      license: person.license,
      specialties: person.specialties,
      imageUrl: person.imageUrl,
      active: person.active,
      branchIds: person.branches.map(
        (branch) => branch.branchId
      ),
    })
  );

  const insuranceProviders = insuranceRows.map(
    (provider) => provider.name
  );

  const insuranceProviderLogos = Object.fromEntries(
    insuranceRows.map((provider) => [
      provider.name,
      provider.logoUrl,
    ])
  );

  return {
    ...demo,

    name: settings?.name ?? demo.name,
    slogan: settings?.slogan ?? demo.slogan,
    description: settings?.description ?? demo.description,
    logoUrl: settings?.logoUrl ?? demo.logoUrl,
    heroImageUrl: settings?.heroImageUrl ?? demo.heroImageUrl,
    whatsapp: settings?.whatsapp ?? demo.whatsapp,
    phone: settings?.phone ?? demo.phone,
    email: settings?.email ?? demo.email,
    address: settings?.address ?? demo.address,
    mapsUrl: settings?.mapsUrl ?? demo.mapsUrl,
    instagramUrl: settings?.instagramUrl ?? demo.instagramUrl,

    services: publicServices,
    team,
    branches,
    insuranceProviders,
    insuranceProviderLogos,
  };
}

export function getWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  return `https://wa.me/${digits}?text=${encodeURIComponent(
    "Hola! Quisiera consultar por un turno en Consultorios Nazaret."
  )}`;
}
