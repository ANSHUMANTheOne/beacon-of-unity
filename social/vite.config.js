import { defineConfig } from "vite";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  base: "/social/",
  plugins: [tailwind()],
  server: { proxy: { "/social/api": "http://127.0.0.1:8787" } },
  build: { sourcemap: false },
});
