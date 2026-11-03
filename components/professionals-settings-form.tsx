
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  UserRound,
  Pencil,
  Trash2,
  X,
  Plus,
} from "lucide-react";

type Professional = {
  id: string;
  name: string;
  license: string;
  specialties: string[];
  branchIds: string[];
  imageUrl: string | null;
  active: boolean;
};

type Branch = {
  id: string;
  name: string;
};

type Props = {
  onSaved: () => void;
};

export default function ProfessionalsSettingsForm({
  onSaved,
}: Props) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/professionals", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los profesionales.");
        }

        const data = await response.json();

        setProfessionals(data.professionals);
        setBranches(data.branches);
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

  function resetForm() {
    setEditingId(null);
    setName("");
    setLicense("");
    setSpecialties([]);
    setNewSpecialty("");
    setBranchIds([]);
    setActive(true);
    setImageFile(null);
    setCurrentImage(null);
    setRemoveImage(false);
    setError("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function addSpecialty() {
    const value = newSpecialty.trim();

    if (!value) return;

    if (
      !specialties.some(
        (specialty) =>
          specialty.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSpecialties((previous) => [...previous, value]);
    }

    setNewSpecialty("");
  }

  function toggleBranch(id: string) {
    setBranchIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }
  
  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    // El servidor verificará el formato real de la imagen.
    // No rechazamos el archivo solamente por su extensión.

    if (file.size > 15 * 1024 * 1024) {
      setError("La imagen supera el límite de 15 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    setError("");
  }

  function editProfessional(person: Professional) {
    setEditingId(person.id);
    setName(person.name);
    setLicense(person.license);
    setSpecialties([...(person.specialties ?? [])]);
    setBranchIds([...(person.branchIds ?? [])]);
    setActive(person.active ?? true);
    setCurrentImage(person.imageUrl);
    setImageFile(null);
    setRemoveImage(false);
    setNewSpecialty("");
    setError("");
    setNotice("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
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
    setError("");
    setNotice("");

    const pendingSpecialty = newSpecialty.trim();
    const finalSpecialties = [...specialties];

    if (
      pendingSpecialty &&
      !finalSpecialties.some(
        (s) => s.toLowerCase() === pendingSpecialty.toLowerCase()
      )
    ) {
      finalSpecialties.push(pendingSpecialty);
    }

    if (!name.trim() || !license.trim()) {
      setError("El nombre y la matrícula son obligatorios.");
      return;
    }

    if (finalSpecialties.length === 0) {
      setError("Agregá al menos una especialidad.");
      return;
    }

    if (branchIds.length === 0) {
      setError("Seleccioná al menos una sucursal.");
      return;
    }

    setSaving(true);

    const data = new FormData();

    data.set("action", "save");
    data.set("name", name.trim());
    data.set("license", license.trim());
    data.set("specialties", JSON.stringify(finalSpecialties));
    data.set("branchIds", JSON.stringify(branchIds));
    data.set("active", String(active));

    if (editingId) data.set("id", editingId);
    if (imageFile) data.set("image", imageFile);
    if (removeImage) data.set("removeImage", "true");

    try {
      const response = await fetch("/api/admin/professionals", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo guardar el profesional."
        );
      }

      setProfessionals(result.professionals);
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

  async function deleteProfessional(person: Professional) {
    const confirmed = window.confirm(
      `¿Querés eliminar a ${person.name}?`
    );

    if (!confirmed) return;

    setDeletingId(person.id);
    setError("");
    setNotice("");

    const data = new FormData();
    data.set("action", "delete");
    data.set("id", person.id);

    try {
      const response = await fetch("/api/admin/professionals", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo eliminar el profesional."
        );
      }

      setProfessionals(result.professionals);
      if (editingId === person.id) resetForm();
      setNotice("Profesional eliminado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p>Cargando profesionales...</p>;
  }

  return (
    <div className="professionals-admin">
      <form
        ref={formRef}
        className="general-settings-form"
        onSubmit={save}
      >
        <h3>
          {editingId ? "Editar profesional" : "Agregar profesional"}
        </h3>

        <div className="settings-field">
          <label htmlFor="professional-name">
            Nombre y apellido *
          </label>

          <input
            id="professional-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. María Agustina Gelos"
          />
        </div>

        <div className="settings-field">
          <label htmlFor="professional-license">
            Número de matrícula profesional *
          </label>

          <input
            id="professional-license"
            type="text"
            required
            value={license}
            onChange={(event) => setLicense(event.target.value)}
            placeholder="Ej. 10556"
          />
        </div>

        <div className="settings-field">
          <label htmlFor="professional-specialty">
            Especialidades *
          </label>

          <div className="professional-tags">
            {specialties.map((specialty) => (
              <span className="professional-tag" key={specialty}>
                {specialty}
                <button
                  type="button"
                  aria-label={`Quitar ${specialty}`}
                  onClick={() =>
                    setSpecialties((previous) =>
                      previous.filter((s) => s !== specialty)
                    )
                  }
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <div className="professional-specialty-entry">
            <input
              id="professional-specialty"
              type="text"
              value={newSpecialty}
              onChange={(event) =>
                setNewSpecialty(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSpecialty();
                }
              }}
              placeholder="Ej. Implantología"
            />

            <button
              type="button"
              className="btn btn-outline"
              onClick={addSpecialty}
            >
              <Plus size={17} />
              Agregar
            </button>
          </div>

          <small>
            Podés agregar varias especialidades.
          </small>
        </div>

        <fieldset className="professional-branches">
          <legend>Sucursales donde atiende *</legend>

          {branches.length === 0 ? (
            <p>
              No hay sucursales configuradas.
            </p>
          ) : (
            branches.map((branch) => (
              <label key={branch.id}>
                <input
                  type="checkbox"
                  checked={branchIds.includes(branch.id)}
                  onChange={() => toggleBranch(branch.id)}
                />
                {branch.name}
              </label>
            ))
          )}
        </fieldset>

        <div className="settings-field">
          <label htmlFor="professional-photo">
            Fotografía (opcional)
          </label>

          <div className="professional-photo-preview">
            {preview || (currentImage && !removeImage) ? (
              <img
                src={preview || currentImage || ""}
                alt="Vista previa del profesional"
              />
            ) : (
              <UserRound size={50} strokeWidth={1.3} />
            )}
          </div>

          <input
            ref={imageInputRef}
            id="professional-photo"
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
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
              }}
            >
              <X size={16} />
              Quitar fotografía
            </button>
          )}
        </div>

        <label className="professional-active">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) =>
              setActive(event.target.checked)
            }
          />
          <span>
            <strong>Profesional activo</strong>
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
            className="btn btn-primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : editingId
                ? "Guardar cambios"
                : "Agregar profesional"}
          </button>
        </div>
      </form>

      <div className="professionals-admin-list">
        <h3>Profesionales registrados</h3>

        {notice && (
          <p className="admin-success" role="status">
            {notice}
          </p>
        )}

        {professionals.length === 0 ? (
          <p>No hay profesionales registrados.</p>
        ) : (
          professionals.map((person) => (
            <article
              className="professional-admin-item"
              key={person.id}
            >
              <div className="professional-admin-avatar">
                {person.imageUrl ? (
                  <img src={person.imageUrl} alt="" />
                ) : (
                  <UserRound size={26} />
                )}
              </div>

              <div className="professional-admin-info">
                <strong>{person.name}</strong>
                <p>MP {person.license}</p>
                <p>{person.specialties.join(", ")}</p>
                <p>
                  {(person.branchIds ?? [])
                    .map(
                      (id) =>
                        branches.find((branch) => branch.id === id)?.name
                    )
                    .filter(Boolean)
                    .join(" · ") || "Sin sucursal asignada"}
                </p>

                <span
                  className={
                    person.active
                      ? "professional-status active"
                      : "professional-status inactive"
                  }
                >
                  {person.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="service-admin-buttons">
                <button
                  type="button"
                  title="Editar"
                  aria-label={`Editar ${person.name}`}
                  onClick={() => editProfessional(person)}
                >
                  <Pencil size={18} />
                </button>

                <button
                  type="button"
                  title="Eliminar"
                  aria-label={`Eliminar ${person.name}`}
                  disabled={deletingId === person.id}
                  onClick={() => deleteProfessional(person)}
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
