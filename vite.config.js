import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      srcDir: "src",
      filename: "SW.js",
      registerType: "autoUpdate", // ✅ auto register + update
      devOptions: { enabled: true },
      manifest: {
        theme_color: "#F9FAFB",
        background_color: "#F9FAFB",

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
    host: true, // lets you hit it from LAN if needed
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
