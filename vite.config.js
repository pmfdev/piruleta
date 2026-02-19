import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    // Avoid scanning generated Android HTML files as app entries.
    entries: ["index.html"],
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
  },
});
