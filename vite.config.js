import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,
    https: {
      key: "./localhost-key.pem", // 3단계에서 생성된 키 파일
      cert: "./localhost.pem", // 3단계에서 생성된 인증서 파일
    },
  },
});
