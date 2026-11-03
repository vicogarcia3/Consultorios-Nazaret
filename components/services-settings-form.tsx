
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Pencil, Trash2, Smile, X } from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
};

type Props = {
  onSaved: () => void;
};

export default function ServicesSettingsForm({
  onSaved,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/services", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los servicios.");
        }

        setServices(await response.json());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setError("Seleccioná una imagen JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageFile(null);
    setCurrentImage(null);
    setRemoveImage(false);
    setError("");
  }

  function editService(service: Service) {
    setEditingId(service.id);
    setTitle(service.title);
    setDescription(service.description ?? "");
    setCurrentImage(service.imageUrl ?? null);
    setImageFile(null);
    setRemoveImage(false);
    setError("");
    setNotice("");

    document.getElementById("service-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Ingresá el nombre del servicio.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const data = new FormData();

    data.set("action", "save");
    data.set("title", title.trim());
    data.set("description", description.trim());

    if (editingId) {
      data.set("id", editingId);
    }

    if (imageFile) {
      data.set("image", imageFile);
    }

    if (removeImage) {
      data.set("removeImage", "true");
    }

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo guardar el servicio."
        );
      }

      setServices(result.services);
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

  async function deleteService(service: Service) {
    const confirmed = window.confirm(
      `¿Querés eliminar el servicio "${service.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    const data = new FormData();
    data.set("action", "delete");
    data.set("id", service.id);

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo eliminar el servicio."
        );
      }

      setServices(result.services);

      if (editingId === service.id) resetForm();

      setNotice("Servicio eliminado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar."
      );
    }
  }

  if (loading) {
    return <p>Cargando servicios...</p>;
  }

  return (
    <div className="services-admin">
      <form
        id="service-form"
        className="general-settings-form"
        onSubmit={save}
      >
        <h3>
          {editingId ? "Editar servicio" : "Agregar servicio"}
        </h3>

        <div className="settings-field">
          <label htmlFor="service-title">
            Nombre del servicio *
          </label>

          <input
            id="service-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Odontología general"
            required
          />
        </div>

        <div className="settings-field">
          <label htmlFor="service-image">
            Imagen del servicio (opcional)
          </label>

          <div className="service-admin-preview">
            {preview || (currentImage && !removeImage) ? (
              <img
                src={preview || currentImage || ""}
                alt="Vista previa del servicio"
              />
            ) : (
              <Smile size={55} strokeWidth={1.3} />
            )}
          </div>

          <input
            id="service-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectImage}
          />

          {(preview || (currentImage && !removeImage)) && (
            <button
              type="button"
              className="service-remove-image"
              onClick={() => {
                setImageFile(null);
                setRemoveImage(true);
              }}
            >
              <X size={16} />
              Quitar imagen
            </button>
          )}

          <small>
            Si no cargás una imagen, se mostrará una sonrisa.
          </small>
        </div>

        <div className="settings-field">
          <label htmlFor="service-description">
            Descripción (opcional)
          </label>

          <textarea
            id="service-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Breve descripción del tratamiento..."
            rows={4}
          />
        </div>

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
              onClick={resetForm}
              disabled={saving}
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
                : "Agregar servicio"}
          </button>
        </div>
      </form>

      <div className="services-admin-list">
        <h3>Servicios registrados</h3>

        {notice && (
          <p className="admin-success" role="status">
            {notice}
          </p>
        )}

        {services.length === 0 ? (
          <p className="empty-note">
            Todavía no hay servicios registrados.
          </p>
        ) : (
          services.map((service) => (
            <div className="service-admin-item" key={service.id}>
              <div className="service-admin-thumbnail">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt=""
                  />
                ) : (
                  <Smile size={26} strokeWidth={1.4} />
                )}
              </div>

              <div className="service-admin-info">
                <strong>{service.title}</strong>

                {service.description && (
                  <p>{service.description}</p>
                )}
              </div>

              <div className="service-admin-buttons">
                <button
                  type="button"
                  onClick={() => editService(service)}
                  aria-label={`Editar ${service.title}`}
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => deleteService(service)}
                  aria-label={`Eliminar ${service.title}`}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
