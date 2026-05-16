## Tujuan
Menghilangkan dua issue terpisah yang terlihat dari screenshot dan runtime signal:
1. Preview/app mengalami hydration mismatch.
2. Deploy Vercel mengembalikan 404 NOT_FOUND di level platform.

## Rencana

### 1) Perbaiki hydration mismatch di halaman utama
- Ubah countdown di `src/components/SuratEdaranTab.tsx` agar tidak merender waktu live yang berbeda antara SSR dan client.
- Pakai pola hydration-safe: render nilai awal yang stabil saat SSR, lalu mulai ticking setelah client mount.
- Pastikan tidak ada perbedaan angka awal seperti `52` vs `14` saat hydrate.

### 2) Audit dan koreksi bootstrap error handling router
- Tinjau `src/router.tsx` dan tambahkan fallback error boundary router-wide bila perlu, supaya error runtime tidak berujung blank/regen tanpa fallback yang rapi.
- Tetap biarkan generated route tree tidak disentuh.

### 3) Finalisasi konfigurasi branch/deploy Vercel
- Verifikasi ulang override branch `vercel-ssr` supaya hanya memakai preset Vercel TanStack Start.
- Pastikan tidak ada konfigurasi yang memaksa output salah atau mengandalkan file yang tidak diproduksi preset.
- Rapikan dokumentasi override agar alur sync `main -> vercel-ssr` konsisten dan tidak reintroduce config yang memicu 404.

### 4) Validasi hasil
- Verifikasi preview tidak lagi memunculkan hydration mismatch.
- Verifikasi route utama app normal di preview.
- Konfirmasi checklist deploy Vercel: branch, build command, dan output autodetect sesuai preset.

## Detail teknis
- File utama yang kemungkinan diubah:
  - `src/components/SuratEdaranTab.tsx`
  - `src/router.tsx`
  - `scripts/vercel-overrides/README.md` (jika perlu sinkronisasi instruksi)
  - berkas override/deploy terkait hanya jika memang masih konflik
- Tidak akan mengubah `src/routeTree.gen.ts` karena file generated.
- Fokus hanya pada akar issue yang terlihat: mismatch SSR/client dan konfigurasi deploy Vercel.