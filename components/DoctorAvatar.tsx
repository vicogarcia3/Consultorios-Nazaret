export default function DoctorAvatar({
  photo,
  name,
}: {
  photo?: string | null;
  name: string;
}) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  // 👉 SI NO HAY FOTO: mostramos inicial
  if (!photo) {
    return (
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "#2f80ed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        {initial}
      </div>
    );
  }

  // 👉 SI HAY FOTO: usamos img normal (NO next/image para evitar errores)
  return (
    <img
      src={photo}
      alt={name}
      style={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        objectFit: "cover",
        background: "#f3f4f6",
        display: "block",
      }}
    />
  );
}