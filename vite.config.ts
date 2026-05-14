import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    // SPA mode: build emits a static index.html shell + client-side routing.
    // No SSR runtime needed on Vercel — just serve dist/client/ with SPA rewrite.
    tanstackStart({
      spa: { enabled: true, maskPath: "/" },
      pages: [{ path: "/" }],
    }),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
});
