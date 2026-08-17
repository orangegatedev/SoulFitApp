import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/layout/app-providers";

const localServiceWorkerCleanupScript = `
(() => {
  if (!("serviceWorker" in navigator)) return;

  const host = window.location.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") return;

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister()))
    )
    .catch(() => undefined);

  if ("caches" in window) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => undefined);
  }
})();
`;

export const metadata: Metadata = {
  applicationName: "SoulFit",
  title: "SoulFit",
  description: "SoulFit analytics y gestión administrativa para gimnasios.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SoulFit",
    statusBarStyle: "black-translucent"
  },
  icons: {
    apple: "/icons/apple-touch-icon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#dc143c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/icons/icon-192.png" data-soulfit-favicon="fallback" />
        <link rel="shortcut icon" href="/icons/icon-192.png" data-soulfit-favicon="fallback" />
        <script dangerouslySetInnerHTML={{ __html: localServiceWorkerCleanupScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
