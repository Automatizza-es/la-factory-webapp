import type { MetadataRoute } from "next";

// Makes "Añadir a pantalla de inicio" install a standalone app, which iOS
// requires before it lets a web app receive push notifications.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Factory Coworking",
    short_name: "La Factory",
    description: "Reserva de salas y gestión de tu cuenta en La Factory Coworking.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1e9",
    theme_color: "#f5f1e9",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
