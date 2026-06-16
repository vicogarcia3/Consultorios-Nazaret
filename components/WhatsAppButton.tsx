"use client";

import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [phone, setPhone] = useState("5493517049724");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        if (data?.whatsapp) setPhone(data.whatsapp);
      } catch {}
    }

    load();
  }, []);

  return (
    <>
      {/* ESTILOS ANIMACIÓN */}
      <style>{`
        .wa-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 65px;
          height: 65px;
          background: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          cursor: pointer;
          animation: pulse 1.8s infinite;
          transition: transform 0.2s ease;
        }

        .wa-button:hover {
          transform: scale(1.1);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }
      `}</style>

      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        className="wa-button"
      >
        {/* ICONO WHATSAPP */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="34"
          height="34"
          fill="white"
        >
          <path d="M19.11 17.53c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26 0 1.33.98 2.61 1.12 2.79.14.18 1.91 2.92 4.63 4.1.65.28 1.15.45 1.54.57.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/>
          <path d="M16.02 3C9.38 3 4 8.37 4 15c0 2.12.55 4.18 1.59 6.01L4 29l8.21-1.56A12.93 12.93 0 0016.02 27C22.66 27 28 21.63 28 15S22.66 3 16.02 3z"/>
        </svg>
      </a>
    </>
  );
}