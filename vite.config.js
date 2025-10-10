import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify("v.10.10.1") },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        importScripts: ["firebase-messaging-sw.js"],
      },

      devOptions: { enabled: true },
      manifest: {
        theme_color: "#F9FAFB",
        background_color: "#fbc125",

        icons: [
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        orientation: "portrait",
        display: "standalone",
        lang: "en-US",
        name: "Ibex attendance",
        short_name: "Ibex",
        start_url: "/",
        scope: "/",
        id: "ibex0.1",
      },
      injectRegister: "auto",
    }),
  ],
  server: {
    host: true, // lets you hit it from LAN if needednpm
    port: 5173,
    proxy: {
      "/api": {
        target: "http://10.0.0.16:4000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
