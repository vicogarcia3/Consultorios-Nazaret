"use client";

import { useState } from "react";

export default function UploadAttachment({
  patientId,
}: {
  patientId: number;
}) {
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    console.log("CLICK SUBIR");

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("UPLOAD:", data);

    await fetch("/api/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
      }),
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={upload}>
        Subir archivo
      </button>
    </div>
  );
}