
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Settings = {
  name: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  whatsapp: string | null;
};

type Props = {
  onSaved: () => void;
};

export default function GeneralSettingsForm({ onSaved }: Props) {
  const [form, setForm] = useState<Settings>({
    name: "",
    logoUrl: null,
    heroImageUrl: null,
    whatsapp: null,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/general", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los datos.");
        return res.json();
      })
      .then((data: Settings) => setForm(data))
      .catch(() => setError("No se pudieron cargar los datos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }

    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!heroFile) {
      setHeroPreview(null);
      return;
    }

    const url = URL.createObjectURL(heroFile);
    setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroFile]);

  function update(field: keyof Settings, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function chooseImage(
    event: ChangeEvent<HTMLInputElement>,
    kind: "logo" | "hero"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Seleccioná una imagen JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    setError("");

    if (kind === "logo") setLogoFile(file);
    else setHeroFile(file);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Ingresá el nombre del consultorio.");
      return;
    }

    setSaving(true);
    setError("");

    const data = new FormData();
    data.set("name", form.name.trim());
    data.set("whatsapp", form.whatsapp ?? "");

    if (logoFile) data.set("logo", logoFile);
    if (heroFile) data.set("hero", heroFile);

    try {
      const response = await fetch("/api/admin/general", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudieron guardar los datos.");
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <form className="general-settings-form" onSubmit={save}>
      <div className="settings-field">
        <label htmlFor="clinic-logo">Logo del consultorio</label>

        {(logoPreview || form.logoUrl) && (
          <img
            className="settings-logo-preview"
            src={logoPreview || form.logoUrl || ""}
            alt="Vista previa del logo"
          />
        )}

        <input
          id="clinic-logo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => chooseImage(event, "logo")}
        />
      </div>

      <div className="settings-field">
        <label htmlFor="clinic-name">Nombre del consultorio</label>

        <input
          id="clinic-name"
          type="text"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />
      </div>

      <div className="settings-field">
        <label htmlFor="clinic-hero">Imagen principal de la página</label>

        {(heroPreview || form.heroImageUrl) && (
          <img
            className="settings-hero-preview"
            src={heroPreview || form.heroImageUrl || ""}
            alt="Vista previa de la portada"
          />
        )}

        <input
          id="clinic-hero"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => chooseImage(event, "hero")}
        />

        <small>
          Se recomienda una fotografía horizontal. Se adaptará
          automáticamente al espacio de la portada.
        </small>
      </div>

      <div className="settings-field">
        <label htmlFor="clinic-whatsapp">Número de WhatsApp</label>

        <input
          id="clinic-whatsapp"
          type="tel"
          inputMode="tel"
          placeholder="Ej. 5493511234567"
          value={form.whatsapp ?? ""}
          onChange={(event) => update("whatsapp", event.target.value)}
        />

        <small>Ingresá el código de país, área y número.</small>
      </div>

      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}

      <div className="settings-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
