import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The proxy sends /api requests to the Express backend (no CORS trouble)
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:5000" } },
});
