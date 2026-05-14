# Setup branch `vercel-ssr` (sekali saja)

Tujuan: deploy ke Vercel **tanpa 404 / routing issue**, tanpa merusak preview Lovable di branch `main`.

## Kenapa harus branch terpisah?

- `main` wajib pakai `@lovable.dev/vite-tanstack-config` (Cloudflare-based) supaya preview Lovable & chat-edit jalan.
- Vercel butuh preset berbeda (`tanstackStart({ target: 'vercel' })`) tanpa Cloudflare plugin.
- Kedua hal itu tidak bisa hidup di file yang sama → branch override.

## Langkah setup (lakukan di lokal, sekali)

```bash
# 1. Pastikan sudah connect ke GitHub dari Lovable & clone repo lokal.
git checkout main
git pull
git checkout -b vercel-ssr

# 2. Replace vite.config.ts dengan versi Vercel
cp scripts/vercel-overrides/vite.config.ts vite.config.ts

# 3. Hapus file Cloudflare-only
git rm wrangler.jsonc src/server.ts vercel.json

# 4. Hapus dependency Cloudflare (opsional tapi disarankan)
npm uninstall @cloudflare/vite-plugin @lovable.dev/vite-tanstack-config wrangler 2>/dev/null || true
npm install --save-dev @vercel/vite-plugin || true

# 5. Commit & push
git add -A
git commit -m "init: vercel-ssr branch (Vercel preset, no Cloudflare)"
git push -u origin vercel-ssr
```

## Setup Vercel

1. Di dashboard Vercel → **Import Project** dari repo GitHub Anda.
2. **Production Branch**: `vercel-ssr` (bukan `main`).
3. Framework Preset: **Other** (TanStack Start preset auto-handle output).
4. Build Command: `npm run build` (default).
5. Output Directory: kosongkan (auto-detect).
6. Tambahkan env var:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
7. Deploy. Tidak ada 404 karena TanStack Start preset Vercel handle SSR + SPA fallback otomatis.

## Sync update dari `main` ke `vercel-ssr`

Setiap kali Anda edit di Lovable (commit ke `main`), jalankan di lokal:

```bash
./scripts/sync-to-vercel.sh
```

Script ini auto-merge `main` → `vercel-ssr` dan auto-resolve konflik di
`vite.config.ts`, `wrangler.jsonc`, `src/server.ts`, `vercel.json` (versi
vercel-ssr selalu menang). Push otomatis → Vercel auto-deploy.

## Yang TIDAK akan terjadi lagi

- ❌ 404 saat refresh `/donasi` atau `/admin` di Vercel
- ❌ Routing rusak di Vercel
- ❌ Preview Lovable rusak (karena `main` tidak disentuh)

## Yang masih perlu Anda jaga

- Jangan edit `vite.config.ts`, `wrangler.jsonc`, `src/server.ts`, atau `vercel.json` lewat chat Lovable. File-file ini adalah "wilayah override" — biarkan Lovable mengelolanya di `main`, dan branch script yang menyelesaikannya di `vercel-ssr`.
