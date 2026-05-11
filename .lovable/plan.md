
# Clone Aplikasi: KHOLWAT MDTI 2026

Membuat dashboard donasi mirip referensi (hbh-mdti.lovable.app), tapi dengan judul **KHOLWAT MDTI 2026** dan subjudul **Majelis Dzikir Tasbih Indonesia**. Tema hijau islami, backend Lovable Cloud. **Daftar Sumber Donasi di-clone persis (47 cabang)** dari referensi; data Seksi & Transaksi di-seed dummy awal.

## Halaman & Layout

Satu halaman utama (`/`) bergaya seperti referensi:

```text
┌──────────────────────────────────────────────────────┐
│  [icon] KHOLWAT MDTI 2026                  [Login]   │
│         Majelis Dzikir Tasbih Indonesia              │
├──────────────────────────────────────────────────────┤
│  ┌─ TARGET DONASI ─┐   ┌─ REALISASI ────────────┐    │
│  │  Rp xx.xxx.xxx  │   │  Rp xx.xxx.xxx         │    │
│  │  (auto Σ seksi) │   │  xx% - Tercapai        │    │
│  └─────────────────┘   └────────────────────────┘    │
├──────────────────────────────────────────────────────┤
│  [Donasi] [Seksi] [Transaksi] [Grafik]               │
├──────────────────────────────────────────────────────┤
│  <konten tab aktif>                                  │
└──────────────────────────────────────────────────────┘
```

Tab:
- **Donasi** – tabel "Sumber Dana Donasi" + search box, kolom No / Sumber Donasi / Nominal (sortable). Nominal = SUM transaksi pemasukan per sumber.
- **Seksi** – tabel daftar seksi: Nama, Rencana Anggaran, Realisasi Pengeluaran, Sisa.
- **Transaksi** – tabel transaksi: tanggal, sumber, seksi, tipe, nominal, keterangan.
- **Grafik** – chart realisasi vs target (recharts: bar per seksi + pie sumber donasi).

Tombol Login di header → `/login` (admin).

## Backend (Lovable Cloud)

Aktifkan Lovable Cloud. Skema:

- `sumber_donasi` (id, nama, urutan)
- `seksi` (id, nama, rencana_anggaran)
- `transaksi` (id, tanggal, sumber_donasi_id, seksi_id, nominal, tipe ['pemasukan','pengeluaran'], keterangan)
- `user_roles` (user_id, role) + fungsi `has_role` security definer

RLS:
- SELECT publik untuk `sumber_donasi`, `seksi`, `transaksi`.
- INSERT/UPDATE/DELETE hanya `admin`.

### Seed data Sumber Donasi (clone persis 47 entri)

BANDUNG, BATANG, Belum Konfirmasi, BOJONEGORO 1 - KAPAS, BOJONEGORO 2 - SEKAR, CIREBON, DANA PENGURUS PUSAT, DEMAK 1 - WONOKETINGAL, DEMAK 2 - DEMPET, DEMAK 3 (MRANGGEN), GARUT, GROBOGAN 1 - PURWODADI, GROBOGAN 2 - GODONG, JAKARTA SELATAN, JAMBI, JEPARA, KANJENG GURU, KENDAL 1 - CEPIRING, KENDAL 2 - BOJA, KENDAL BOTOMULYO, KLATEN, PALEMBANG - KOTA, PALEMBANG - SEKAYU, PEMALANG 1 - BELIK, PEMALANG 2 - ULUJAMI, PONOROGO, PURWOREJO, RIAU, SEMARANG - CANDILAMA, SEMARANG - GENUK, SEMARANG - KROBOKAN, SEMARANG - MIJEN, SEMARANG - NGALIYAN, SEMARANG - PEDURUNGAN, SEMARANG - PUSAT, SEMARANG KALICARI, SOLO, TANGERANG, TEGAL 1 - KOTA, TEGAL 2 - SLAWI, TEGAL BARU, TEMANGGUNG, UNGARAN 1 - GOGIK, UNGARAN 2 - JATIRUNGGO, UNGARAN 3 - BABADAN, Wali Santri PPTQCT, YOGYAKARTA.

Awalnya semua nominal donasi = Rp 0 (tabel transaksi kosong). Realisasi per sumber akan terisi seiring admin menambah transaksi.

### Seed data Seksi (dummy awal — bisa diedit admin)

Contoh seksi acara KHOLWAT: Konsumsi, Perlengkapan, Transportasi, Dokumentasi, Sound System, Sekretariat, Kebersihan, Keamanan — masing-masing dengan rencana anggaran contoh. Total rencana anggaran = nilai **Target Donasi** yang otomatis tampil di kartu atas.

## Tema Visual

- Palet hijau islami (mirip referensi): primary `oklch(0.42 0.10 155)`, accent emerald, kartu Target hijau gelap, kartu Realisasi hijau lebih terang.
- Token CSS di `src/styles.css` (light + dark), tanpa warna hardcode di komponen.
- shadcn/ui: Card, Tabs, Table, Input, Button. Ikon `lucide-react` (BookOpen, Target, TrendingUp, List, Users, ArrowLeftRight, PieChart, LogIn).
- Rounded-xl, shadow lembut, header hijau penuh.

## Detail Teknis

- Stack: TanStack Start + React Query + Tailwind v4 + shadcn/ui + recharts.
- Routing:
  - `src/routes/index.tsx` — dashboard
  - `src/routes/login.tsx` — login admin
  - `src/routes/_authenticated/admin.tsx` — CRUD ringan transaksi/seksi (fase berikut)
- Data publik via browser supabase client; mutasi via `createServerFn` + `requireSupabaseAuth`.
- Target = `SUM(seksi.rencana_anggaran)`, Realisasi = `SUM(transaksi.nominal WHERE tipe='pemasukan')`.
- Pencarian & sort tabel Donasi client-side.
- SEO `head()`: title "KHOLWAT MDTI 2026 — Majelis Dzikir Tasbih Indonesia" + description + og tags.

## Yang Tidak Dikerjakan Iterasi Ini

- Halaman admin CRUD penuh dengan form lengkap (akan menyusul).
- Payment gateway / donasi online.
- Export PDF/Excel.
