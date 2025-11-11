import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ["@prisma/client"], // impede o Vite de tentar empacotar o backend
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001", // apenas para ambiente local
        changeOrigin: true,
      },
    },
  },
});
