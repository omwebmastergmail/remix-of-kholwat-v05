import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `main` HARUS pakai preset Lovable agar preview & published Lovable
// (Cloudflare Worker) jalan. Konfigurasi khusus Vercel disimpan di
// `scripts/vercel-overrides/vite.config.ts` dan hanya dipakai di branch
// `vercel-ssr`. Jangan merge file override itu ke main.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
