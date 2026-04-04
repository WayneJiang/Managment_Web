import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      "/api/blobs": {
        target: "https://vercel.com",
        changeOrigin: true,
        rewrite: (path) => "/api/blob" + path.replace("/api/blobs", ""),
      },
    },
  },
});
