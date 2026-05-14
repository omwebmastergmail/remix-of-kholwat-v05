// === FILE OVERRIDE UNTUK BRANCH `vercel-ssr` ===
// Copy isi file ini menjadi `vite.config.ts` di branch `vercel-ssr`.
// JANGAN merge file ini ke `main` — `main` harus tetap pakai
// @lovable.dev/vite-tanstack-config agar preview Lovable jalan.
//
// Stack di branch vercel-ssr:
//   - TanStack Start preset target: 'vercel'  (SSR via Vercel Functions)
//   - Tailwind v4 via @tailwindcss/vite
//   - vite-tsconfig-paths untuk alias "@/*"
//   - React plugin
// Tidak ada: @cloudflare/vite-plugin, wrangler, src/server.ts, vercel.json.
// Vercel auto-detect output dari preset — tidak perlu vercel.json.

import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ target: "vercel" }),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
});
