
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  MapPin,
  Pencil,
  Trash2,
  Instagram,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  address: string;
  hours: string[];
  mapsUrl: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
};

type Props = {
  onSaved: () => void;
};

export default function BranchesSettingsForm({
  onSaved,
}: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadBranches() {
      try {
        const response = await fetch("/api/admin/branches", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudieron cargar las sucursales."
          );
        }

        setBranches(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setAddress("");
    setHours("");
    setMapsUrl("");
    setWhatsapp("");
    setInstagramUrl("");
    setError("");
  }

  function editBranch(branch: Branch) {
    setEditingId(branch.id);
    setName(branch.name);
    setAddress(branch.address);
    setHours((branch.hours ?? []).join("\n"));
    setMapsUrl(branch.mapsUrl ?? "");
    setWhatsapp(branch.whatsapp ?? "");
    setInstagramUrl(branch.instagramUrl ?? "");
    setError("");
    setNotice("");

    document.getElementById("branch-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setNotice("");
    setSaving(true);

    const data = new FormData();

    data.set("action", "save");
    data.set("name", name);
    data.set("address", address);
    data.set("hours", hours);
    data.set("mapsUrl", mapsUrl);
    data.set("whatsapp", whatsapp);
    data.set("instagramUrl", instagramUrl);

    if (editingId) {
      data.set("id", editingId);
    }

    try {
      const response = await fetch("/api/admin/branches", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo guardar la sucursal."
        );
      }

      setBranches(result.branches);
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

  async function deleteBranch(branch: Branch) {
    if (
      !window.confirm(
        `¿Querés eliminar la sucursal "${branch.name}"?`
      )
    ) {
      return;
    }

    setDeletingId(branch.id);
    setError("");
    setNotice("");

    const data = new FormData();
    data.set("action", "delete");
    data.set("id", branch.id);

    try {
      const response = await fetch("/api/admin/branches", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "No se pudo eliminar la sucursal."
        );
      }

      setBranches(result.branches);

      if (editingId === branch.id) {
        resetForm();
      }

      setNotice("Sucursal eliminada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p>Cargando sucursales...</p>;
  }

  return (
    <div className="branches-admin">
      <form
        id="branch-form"
        className="general-settings-form"
        onSubmit={save}
      >
        <h3>
          {editingId ? "Editar sucursal" : "Agregar sucursal"}
        </h3>

        <div className="settings-field">
          <label htmlFor="branch-name">
            Localidad *
          </label>

          <input
            id="branch-name"
            type="text"
            required
            maxLength={120}
            placeholder="Ej. Córdoba Capital"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="branch-address">
            Dirección *
          </label>

          <input
            id="branch-address"
            type="text"
            required
            maxLength={250}
            placeholder="Ej. Av. Colón 1234"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="branch-hours">
            Horarios de atención
          </label>

          <textarea
            id="branch-hours"
            rows={4}
            placeholder={
              "Lunes a viernes de 9 a 18 hs\nSábados de 9 a 13 hs"
            }
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />

          <small>
            Escribí cada horario en una línea diferente.
          </small>
        </div>

        <div className="settings-field">
          <label htmlFor="branch-maps">
            Enlace de Google Maps (opcional)
          </label>

          <input
            id="branch-maps"
            type="url"
            placeholder="https://maps.app.goo.gl/..."
            value={mapsUrl}
            onChange={(event) => setMapsUrl(event.target.value)}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="branch-whatsapp">
            WhatsApp de la sucursal (opcional)
          </label>

          <input
            id="branch-whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="Ej. 5493511234567"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
          />

          <small>
            Incluí el código de país y de área.
          </small>
        </div>

        <div className="settings-field">
          <label htmlFor="branch-instagram">
            Instagram de la sucursal (opcional)
          </label>

          <input
            id="branch-instagram"
            type="text"
            placeholder="@usuario o https://www.instagram.com/usuario/"
            value={instagramUrl}
            onChange={(event) =>
              setInstagramUrl(event.target.value)
            }
          />

          <small>
            Podés escribir solamente el usuario. El sistema
            generará el enlace automáticamente.
          </small>
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
                : "Agregar sucursal"}
          </button>
        </div>
      </form>

      <div className="branches-admin-list">
        <h3>Sucursales registradas</h3>

        {notice && (
          <p className="admin-success" role="status">
            {notice}
          </p>
        )}

        {branches.length === 0 ? (
          <p className="empty-note">
            Todavía no hay sucursales registradas.
          </p>
        ) : (
          branches.map((branch) => (
            <article
              key={branch.id}
              className="branch-admin-item"
            >
              <div className="branch-admin-icon">
                <MapPin size={24} />
              </div>

              <div className="branch-admin-info">
                <strong>{branch.name}</strong>
                <p>{branch.address}</p>

                {(branch.hours ?? []).map((hour, index) => (
                  <p key={index}>{hour}</p>
                ))}

                {branch.whatsapp && (
                  <p>WhatsApp: {branch.whatsapp}</p>
                )}

                {branch.instagramUrl && (
                  <p className="branch-admin-instagram">
                    <Instagram size={14} />
                    {branch.instagramUrl}
                  </p>
                )}
              </div>

              <div className="service-admin-buttons">
                <button
                  type="button"
                  title="Editar"
                  aria-label={`Editar ${branch.name}`}
                  onClick={() => editBranch(branch)}
                >
                  <Pencil size={18} />
                </button>

                <button
                  type="button"
                  title="Eliminar"
                  aria-label={`Eliminar ${branch.name}`}
                  disabled={deletingId === branch.id}
                  onClick={() => deleteBranch(branch)}
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
