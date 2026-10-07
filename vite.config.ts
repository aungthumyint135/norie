import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        // three.js / R3F are only reached through the lazy ProductScene import, so they split out
        // naturally; GSAP + Lenis get their own long-cached chunk.
        manualChunks(id) {
          if (id.includes("node_modules/gsap") || id.includes("node_modules/lenis")) return "motion";
        },
      },
    },
  },
});
