import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "packtical";
const basePath =
  process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : "/");

export default defineConfig({
  base: basePath,
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
