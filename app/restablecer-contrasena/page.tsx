
import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña | Consultorios Nazaret",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RestablecerContrasenaPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page">
          <p>Cargando...</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
