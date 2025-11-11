import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BACKEND_PORT = 8080;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // target: `http://localhost:${BACKEND_PORT}`,
        target: `http://localhost:3001`,
        changeOrigin: true,
      },
    },
  },
});
