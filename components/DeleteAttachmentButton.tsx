"use client";

export default function DeleteAttachmentButton({
  id,
}: {
  id: string;
}) {
  const handleDelete = async () => {
    await fetch(`/api/attachments/${id}`, {
      method: "DELETE",
    });

    window.location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      style={{
        background: "red",
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      Eliminar
    </button>
  );
}