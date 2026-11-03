"use client";

import { useState } from "react";

type InsuranceCardProps = {
  name: string;
  logoUrl?: string | null;
};

export default function InsuranceCard({
  name,
  logoUrl,
}: InsuranceCardProps) {
  const displayName = name;

  const [failedLogo, setFailedLogo] = useState<string | null>(null);

  const showLogo = Boolean(
    logoUrl && failedLogo !== logoUrl
  );

  return (
    <article className="insurance-card">
      <div className="insurance-logo">
        {showLogo ? (
          <img
            src={logoUrl!}
            alt={`Logo de ${displayName}`}
            loading="lazy"
            onError={() => setFailedLogo(logoUrl ?? null)}
          />
        ) : (
          <div className="insurance-no-logo">
            {displayName}
          </div>
        )}
      </div>

      <h3>{displayName}</h3>
    </article>
  );
}
