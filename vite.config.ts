import { defineConfig } from "vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  preview: {
    allowedHosts: true
  }
} as any);