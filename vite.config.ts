import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercelBuild = process.env.VERCEL === "1";

export default defineConfig({
  cloudflare: isVercelBuild ? false : undefined,
  tanstackStart: isVercelBuild
    ? { target: "vercel" }
    : {
        server: { entry: "server" },
      },
});
