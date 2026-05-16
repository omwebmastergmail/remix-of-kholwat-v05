# Setup Vercel tanpa 404 / routing issue

> Update terbaru: `vite.config.ts` di branch `main` sekarang **otomatis** mendeteksi build Vercel lewat env `VERCEL=1` dan beralih ke `tanstackStart({ target: "vercel" })` saat deploy di Vercel. Jadi untuk kebanyakan kasus, **tidak perlu lagi branch `vercel-ssr`** hanya untuk memperbaiki routing/404.

Tujuan: deploy ke Vercel **tanpa 404 / routing issue**, sambil tetap menjaga preview Lovable tetap normal.

## Rekomendasi sekarang

- Deploy langsung dari branch aktif yang berisi fix terbaru.
- Pastikan di Vercel tidak ada `vercel.json`, `outputDirectory`, atau rewrite manual.
- Build Command cukup default: `npm run build`.

## Opsi lama: branch `vercel-ssr`

Panduan branch terpisah di bawah ini tetap bisa dipakai jika Anda memang ingin memisahkan workflow Vercel, tetapi **sudah tidak wajib**.

## Kenapa dulu dipakai branch terpisah?

- `main` wajib pakai `@lovable.dev/vite-tanstack-config` (Cloudflare-based) supaya preview Lovable & chat-edit jalan.
- Vercel butuh preset berbeda (`tanstackStart({ target: 'vercel' })`) tanpa Cloudflare plugin.
- Kedua hal itu tidak bisa hidup di file yang sama → branch override.

## Penting: JANGAN buat `vercel.json`

Preset `tanstackStart({ target: "vercel" })` membangun output ke
`.vercel/output` mengikuti **Vercel Build Output API**. Vercel auto-detect
output ini — tidak butuh `vercel.json`, `outputDirectory`, atau `rewrites`.

Kalau ada `vercel.json` dengan `outputDirectory: "dist/client"` atau rewrite
ke `/_shell.html`, semua route akan kena **404 NOT_FOUND** karena file-file
itu tidak diproduksi oleh preset Vercel TanStack Start.

## Langkah setup (lakukan di lokal, sekali)

```bash
# 1. Pastikan sudah connect ke GitHub dari Lovable & clone repo lokal.
git checkout main
git pull
git checkout -b vercel-ssr

# 2. Replace vite.config.ts dengan versi Vercel
cp scripts/vercel-overrides/vite.config.ts vite.config.ts

# 3. Hapus file Cloudflare-only DAN vercel.json kalau ada
git rm wrangler.jsonc src/server.ts
git rm -f vercel.json 2>/dev/null || true

# 4. Hapus dependency Cloudflare (opsional tapi disarankan)
npm uninstall @cloudflare/vite-plugin @lovable.dev/vite-tanstack-config wrangler 2>/dev/null || true

# 5. Commit & push
git add -A
git commit -m "init: vercel-ssr branch (Vercel preset, no Cloudflare, no vercel.json)"
git push -u origin vercel-ssr
```

## Setup Vercel

1. Di dashboard Vercel → **Import Project** dari repo GitHub Anda.
2. **Production Branch**: `vercel-ssr` (bukan `main`).
3. Framework Preset: **Other**.
4. Build Command: `npm run build` (default).
5. Output Directory: **kosongkan** (auto-detect `.vercel/output`).
6. Tambahkan env var:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
7. Deploy. Tidak ada 404 — TanStack Start preset Vercel handle SSR + client routing otomatis.

## Sync update dari `main` ke `vercel-ssr`

Setiap kali Anda edit di Lovable (commit ke `main`), jalankan di lokal:

```bash
./scripts/sync-to-vercel.sh
```

Script ini auto-merge `main` → `vercel-ssr` dan **menghapus** file
`vite.config.ts` versi main, `wrangler.jsonc`, `src/server.ts`, dan
`vercel.json` (jika sempat re-introduce). Versi vercel-ssr selalu menang.

## Yang TIDAK akan terjadi lagi

- ❌ 404 NOT_FOUND di Vercel
- ❌ Routing rusak di Vercel
- ❌ Preview Lovable rusak (karena `main` tidak disentuh)

## Yang masih perlu Anda jaga

- Jangan edit `vite.config.ts`, `wrangler.jsonc`, `src/server.ts`, atau `vercel.json` lewat chat Lovable. File-file ini adalah "wilayah override" — biarkan Lovable mengelolanya di `main`, dan branch script yang menyelesaikannya di `vercel-ssr`.
- Jangan pernah membuat `vercel.json` baru — preset menangani semuanya.

## Troubleshooting: masih 404 NOT_FOUND di Vercel

Jika `infokholwat2026.vercel.app` masih balas 404 setelah deploy, cek
berurutan (penyebab paling sering di atas):

1. **Production Branch di Vercel**: dashboard → Project → Settings → Git →
   Production Branch harus `vercel-ssr`, BUKAN `main`. Kalau masih `main`,
   Vercel mem-build `main` yang pakai preset Cloudflare → output `.vercel/output` tidak ada → 404 semua route.
2. **Branch `vercel-ssr` ketinggalan**: jalankan `./scripts/sync-to-vercel.sh`
   lalu pastikan `git log origin/vercel-ssr -1` menunjukkan commit terbaru.
3. **`vite.config.ts` di `vercel-ssr` salah**: harus persis isi
   `scripts/vercel-overrides/vite.config.ts` (preset
   `tanstackStart({ target: "vercel" })`, tanpa `@cloudflare/vite-plugin`).
4. **Output Directory di Vercel**: harus **kosong** (auto-detect). Kalau
   diisi `dist`, `dist/client`, atau apa pun → 404.
5. **Framework Preset**: set ke **Other** (bukan Vite, bukan Next).
6. **Build log Vercel**: cari baris `.vercel/output/config.json`. Kalau tidak
   ada, berarti preset Vercel tidak jalan — kembali ke poin 3.

