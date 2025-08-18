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
    proxy: {
      "/api": {
        target: "https://18.218.186.60:8080", // 백엔드 주소 (http면 http로!)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // /api/home -> /home
      },
    },
  },
});
