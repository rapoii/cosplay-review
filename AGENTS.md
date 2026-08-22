# AGENTS.md — Petunjuk & Konvensi AI Agent untuk Lilycosrent Review Corner

Dokumen ini ditujukan untuk agen AI yang bekerja di dalam codebase **Lilycosrent Review Corner**.

---

## 1. Ikhtisar Proyek & Arsitektur
- **Nama Aplikasi**: Lilycosrent Review Corner
- **Tujuan**: Platform Web Review & Rating Rental Kostum Cosplay dengan estetika *Claymorphism Kawaii* yang manis, ramah, dan interaktif.
- **Stack Teknologi**: Astro (Static Output), Svelte 5 (Runes `$state`), Tailwind CSS v4, Firebase Firestore & Firebase Authentication.
- **Filosofi UI/UX**: Pastel Pink Postcard Theme, Rounded Clean Aesthetics, Anti-AI Slop, Multi-Device Responsive (Mobile 390x844 / Tablet 768x1024 / Desktop 1280x800), dan 60 FPS Ultra-Smooth Motion.

---

## 2. Struktur Rute & Komponen
- **Rute Publik**:
  - `src/pages/index.astro`: Halaman utama berisi Form Review interaktif dan "Lily's Wall of Love" (Galeri ulasan realtime).
- **Rute Terproteksi**:
  - `src/pages/admin.astro`: Dashboard admin terproteksi dengan tab navigasi ("Statistik Review" dan "Kartu QR & Print Kit").
- **Komponen Utama (`src/components/`)**:
  - `ReviewForm.svelte`: Form penilaian ulasan (Kualitas, Admin, Kecepatan) dengan validasi instan & WhatsApp share.
  - `ReviewGallery.svelte`: Galeri ulasan approved dengan kalkulasi rating rerata realtime.
  - `QrCard.svelte`: Postcard A6 pratinjau kartu cetak QR, tombol unduh PNG QR, salin link, dan direct WhatsApp template.
  - `AdminDashboard.svelte`: Gerbang autentikasi Firebase Auth dan manajemen statistik ulasan.
  - `MusicPlayer.svelte`: Background music player Cupid (Opus & MP3 fallback) dengan auto-unlock interaksi.
  - `MotionEffects.svelte`: Controller animasi reveal 60 FPS ramah low-power device.

---

## 3. Aturan & Standar Desain
1. **Palet Warna**: Wajib mempertahankan palet pastel pink (`--pink-500: #ec5f93`, `--pink-600: #d63d75`, `--plum: #4f3346`, `--plum-soft: #7a5c70`, `--muted: #8b6e82`). Jangan mengubah tone menjadi gelap atau kusam.
2. **Ikon & Tipografi**: Gunakan vektor SVG monoline/outline yang tajam, font display `'Baloo 2'` dan font body `'Nunito'`. Hindari penggunaan emoji OS bawaan untuk tombol fitur.
3. **Privasi & Keamanan**:
   - Kartu QR dan alat print kit wajib berada di dalam Tab Admin (`/admin`), tidak boleh bocor ke rute publik terbuka.
   - Seluruh kunci API / kredensial wajib disimpan di `.env` dan tidak boleh di-hardcode ke template.

---

## 4. Alur Kerja Sebelum Selesai (Definition of Done)
1. **Type-Check**: Pastikan `npm run typecheck` lolos tanpa error.
2. **Build Test**: Pastikan aplikasi dapat di-build dengan lancar (`npm run build`).
3. **Pembersihan Dead Code**: Pastikan tidak meninggalkan variabel, import, atau selector CSS yang yatim/tidak terpakai.
