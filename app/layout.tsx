import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import UserInfo from "./components/UserInfo";
import SidebarMenu from "./components/SidebarMenu";
import Sidebar from "./components/Sidebar";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: "#F6F4EE",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Providers>
          <Sidebar />

        <div
          style={{
            display: "flex",
            minHeight: "100vh",
          }}
        >
          <main
            style={{
              flex: 1,
              padding: 30,
            }}
          >
            {children}
          </main>
        </div>
      </Providers>
      <WhatsAppButton />
    </body>
  </html>
);
}