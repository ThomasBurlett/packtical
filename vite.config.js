import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "camping-checklist";
const basePath = process.env.VITE_BASE_PATH
  ?? (process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : "/");

export default defineConfig({
  base: basePath,
  plugins: [react()],
});
