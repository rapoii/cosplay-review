# Feature QA Report

Tanggal: 14 Agustus 2026

## Hasil

| Route | Viewport | Hasil |
| --- | --- | --- |
| `/` | 1280×900 | 15 tombol rating terdeteksi, label dinamis `5/5 · Puas banget!`, tidak ada horizontal overflow |
| `/` | 390×844 | 15 tombol rating terdeteksi, label dinamis `5/5 · Puas banget!`, tidak ada horizontal overflow |
| `/admin` | 1280×900 | Gate kode tampil, dashboard terbuka dengan 3 kartu metrik, tidak ada horizontal overflow |
| `/admin` | 390×844 | Gate kode tampil, dashboard terbuka dengan 3 kartu metrik, tidak ada horizontal overflow |
| `/qr` | 1280×900 | Canvas QR 320×320, 3 tombol operasional, tidak ada horizontal overflow |
| `/qr` | 390×844 | Canvas QR 320×320, 3 tombol operasional, tidak ada horizontal overflow |

## Catatan

Dashboard menggunakan konfigurasi Firebase existing dan membaca koleksi `reviews`. Pada preview sandbox tanpa `PUBLIC_FIREBASE_*` environment variables, data statistik tidak dapat dimuat; UI error state tetap tampil dan dashboard tidak crash. Pada environment deployment yang sudah memiliki konfigurasi Firebase existing, dashboard akan membaca ulasan approved di Firestore.

Smoke test dijalankan dengan `node scripts/feature-qa.mjs` menggunakan Chromium sistem.
