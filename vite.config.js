import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,
    https: {
      key: "./localhost-key.pem",
      cert: "./localhost.pem",
    },
  },
});
