
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Pencil, Trash2, ImagePlus, X } from "lucide-react";

type InsuranceProvider = {
  id: string;
  name: string;
  logoUrl: string | null;
  active: boolean;
};

type Props = {
  onSaved: () => void;
};

export default function InsuranceProvidersSettingsForm({
  onSaved,
}: Props) {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/insurance-providers", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "No se pudieron cargar las obras sociales."
          );
        }

        setProviders(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(logoFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setActive(true);
    setLogoFile(null);
    setCurrentLogo(null);
    setRemoveLogo(false);
    setError("");

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("El logo no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    setLogoFile(file);
    setRemoveLogo(false);
    setError("");
  }

  function editProvider(provider: InsuranceProvider) {
    setEditingId(provider.id);
    setName(provider.name);
    setActive(provider.active);
    setCurrentLogo(provider.logoUrl);
    setLogoFile(null);
    setRemoveLogo(false);
    setError("");
    setNotice("");

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Ingresá el nombre de la obra social.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const data = new FormData();

    data.set("action", "save");
    data.set("name", name.trim());
    data.set("active", String(active));

    if (editingId) data.set("id", editingId);
    if (logoFile) data.set("logo", logoFile);
    if (removeLogo) data.set("removeLogo", "true");

    try {
      const response = await fetch("/api/admin/insurance-providers", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo guardar la obra social."
        );
      }

      setProviders(result.providers);
      resetForm();
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProvider(provider: InsuranceProvider) {
    if (
      !window.confirm(
        `¿Querés eliminar la obra social "${provider.name}"?`
      )
    ) {
      return;
    }

    setDeletingId(provider.id);
    setError("");
    setNotice("");

    const data = new FormData();
    data.set("action", "delete");
    data.set("id", provider.id);

    try {
      const response = await fetch("/api/admin/insurance-providers", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo eliminar la obra social."
        );
      }

      setProviders(result.providers);

      if (editingId === provider.id) resetForm();

      setNotice("Obra social eliminada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p>Cargando obras sociales...</p>;

  return (
    <div className="insurance-admin">
      <form
        ref={formRef}
        className="general-settings-form"
        onSubmit={save}
      >
        <h3>
          {editingId ? "Editar obra social" : "Agregar obra social"}
        </h3>

        <div className="settings-field">
          <label htmlFor="insurance-name">
            Nombre de la obra social *
          </label>

          <input
            id="insurance-name"
            type="text"
            required
            maxLength={120}
            placeholder="Ej. OSDE"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="insurance-logo">
            Logo (opcional)
          </label>

          <div className="insurance-logo-preview">
            {preview || (currentLogo && !removeLogo) ? (
              <img
                src={preview || currentLogo || ""}
                alt="Vista previa del logo"
              />
            ) : (
              <ImagePlus size={42} strokeWidth={1.4} />
            )}
          </div>

          <input
            ref={logoInputRef}
            id="insurance-logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectLogo}
          />

          {(preview || (currentLogo && !removeLogo)) && (
            <button
              type="button"
              className="service-remove-image"
              onClick={() => {
                setLogoFile(null);
                setRemoveLogo(true);

                if (logoInputRef.current) {
                  logoInputRef.current.value = "";
                }
              }}
            >
              <X size={16} />
              Quitar logo
            </button>
          )}

          <small>
            Formatos JPG, PNG o WebP. Máximo 5 MB.
          </small>
        </div>

        <label className="professional-active">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />

          <span>
            <strong>Obra social activa</strong>
            <small>Mostrar en la página pública</small>
          </span>
        </label>

        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}

        <div className="settings-actions">
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={saving}
              onClick={resetForm}
            >
              Cancelar edición
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : editingId
                ? "Guardar cambios"
                : "Agregar obra social"}
          </button>
        </div>
      </form>

      <div className="insurance-admin-list">
        <h3>Obras sociales registradas</h3>

        {notice && (
          <p className="admin-success" role="status">
            {notice}
          </p>
        )}

        {providers.length === 0 ? (
          <p className="empty-note">
            Todavía no hay obras sociales registradas.
          </p>
        ) : (
          providers.map((provider) => (
            <article className="insurance-admin-item" key={provider.id}>
              <div className="insurance-admin-logo">
                {provider.logoUrl ? (
                  <img src={provider.logoUrl} alt="" />
                ) : (
                  <span>{provider.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="insurance-admin-info">
                <strong>{provider.name}</strong>

                <span
                  className={
                    provider.active
                      ? "professional-status active"
                      : "professional-status inactive"
                  }
                >
                  {provider.active ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className="service-admin-buttons">
                <button
                  type="button"
                  title="Editar"
                  aria-label={`Editar ${provider.name}`}
                  onClick={() => editProvider(provider)}
                >
                  <Pencil size={18} />
                </button>

                <button
                  type="button"
                  title="Eliminar"
                  aria-label={`Eliminar ${provider.name}`}
                  disabled={deletingId === provider.id}
                  onClick={() => deleteProvider(provider)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
