# Resource audit preview

Tanggal audit: 2026-08-14

Preview navigation dan visual berhasil terbuka setelah optimasi. `performance.getEntriesByType('resource')` pada sandbox browser hanya mengembalikan resource toolbar internal (`__x00__astro:toolbar:internal`), sehingga transfer size asset production tidak dapat dijadikan metrik final dari proxy preview ini. Metrik bundle yang dapat dipercaya diambil dari `dist` setelah build.

Build output utama:

- `dist` sekitar 3.7MB, dengan `cupid-lite.mp3` 2.78MB sebagai asset terbesar.
- Self-hosted fonts: Baloo 2 WOFF2 33,188 bytes dan Nunito WOFF2 39,128 bytes.
- ReviewGallery chunk 3,509 bytes dan Firebase chunk 10,872 bytes terpisah dari island.
- Tidak ada URL `fonts.googleapis.com` atau `fonts.gstatic.com` di dist.

Visual customer page tetap tampil dengan form above-the-fold, self-hosted font, navigasi, Wall of Love, maskot, dan audio fallback status. Feature/motion/scroll QA production dijalankan terpisah melalui script yang disimpan pada `qa-motion-optimized.json`, `qa-scroll-optimized.json`, dan `qa-features-optimized.json`.

## Runtime verification

Pada preview final, computed style menunjukkan `body` memakai `Nunito`, `.form-shell` memakai `backdrop-filter: none`, dan `.wall-section` memakai `content-visibility: auto` dengan `contain-intrinsic-size: auto 680px`. Proxy sandbox tidak menampilkan resource asset biasa pada PerformanceResourceTiming selain toolbar internal, sehingga network transfer final tetap dinilai dari dist/build dan bukan dari daftar resource preview.
