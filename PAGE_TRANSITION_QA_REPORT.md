# Lilycosrent Page Transition QA

## Implementasi

Transisi antarhalaman menggunakan **Astro ClientRouter** dan native **View Transitions API**. Motion hanya mengubah `opacity` dan `transform` (translate, scale, dan rotate ringan), sehingga tidak menganimasikan layout, width, height, margin, atau padding. Gaya normal sekarang berupa **kawaii pop-in**: halaman lama mengecil dan memudar cepat, halaman baru muncul dari scale kecil dengan sedikit tilt lalu settle. Durasi normal 105–240ms. Pada `update: slow` serta `html.low-power`, durasi dipangkas menjadi 80–175ms.

Animasi baru tidak memakai library tambahan atau custom wheel handler. Browser yang tidak mendukung View Transitions tetap melakukan navigasi normal. Pada `prefers-reduced-motion: reduce`, animasi pseudo-view-transition dimatikan dengan `animation: none !important`.

## Lifecycle dan audio

Ketiga route memakai ClientRouter yang sama: `/`, `/qr`, dan `/admin`. Link navigasi internal memakai Astro prefetch strategy `viewport`, sehingga dokumen route dipanaskan saat link terlihat sebelum tap. `MotionEffects` dipersist dengan key `motion-runtime` supaya profil `motion-60`, reduced-motion, dan low-power tidak dihitung ulang di setiap navigasi. Musik Cupid dipindahkan menjadi singleton `audio[data-lilycosrent-audio]` yang dibuat di level document, sehingga tidak ikut terhapus ketika body ditukar oleh ClientRouter. Hasilnya audio tetap berjalan dan tidak restart saat berpindah route.

## Diagnosis preview

Pada reproduksi pertama, `document.startViewTransition()` sebenarnya terpanggil dan CSS pseudo-view sudah terpasang, tetapi slide vertikal terasa kurang sesuai dengan karakter kawaii Lilycosrent. Gaya akhirnya diganti menjadi pop-in dengan tilt sangat kecil dan settle overshoot ringan. Jeda tap-to-transition diukur pada tiga perpindahan route dan hasilnya 16,6–21,3ms setelah prefetch viewport diaktifkan. Dev server juga sempat mengembalikan `504 Outdated Optimize Dep` pada bundle optimizer; cache `.vite` dan `.astro` sudah dibersihkan lalu server di-restart. Setelah itu hydration berjalan normal.

## Hasil QA

| Test | Result |
| --- | --- |
| Astro build | Pass; 3 route berhasil dibuat |
| Review → QR | Pass; URL dan lifecycle event berjalan, audio tetap node yang sama |
| QR → Admin | Pass; URL dan lifecycle event berjalan, audio tetap node yang sama |
| Native View Transitions | Pass pada browser test; `document.startViewTransition` tersedia |
| CSS View Transition support | Pass; `CSS.supports('view-transition-name: root')` true pada browser test |
| Mobile 390×844 | Pass; tidak ada horizontal overflow |
| Desktop 1280×900 | Pass; tidak ada horizontal overflow |
| Reduced motion | Pass; navigasi tetap berjalan dan scroll tetap native/auto |
| Low-power | Pass; mode existing tetap aktif dan dekorasi kontinu tetap dipangkas |
| Audio production preview | Pass; Cupid autoplay/loop aktif, status playing, failed request kosong |
| Transition visibility | Pass; computed CSS keluar `105ms` dan masuk `240ms`, API terpanggil, pop-in + tilt ringan aktif |
| Tap-to-transition delay | Pass; 16,6–21,3ms pada `/` → `/qr`, `/qr` → `/admin`, dan `/admin` → `/` |
| Refreshed dev server | Pass; cache optimizer dibersihkan dan rating interaction tetap aktif |
| Existing visual/feature/navigation QA | Pass; tidak ada regresi terdeteksi |

## Catatan teknis

“240fps++” tidak dapat memaksa monitor atau browser menggambar di atas refresh rate perangkat. Implementasi ini menargetkan frame pacing yang sangat ringan dengan compositor-only properties, durasi pendek, tanpa dependency animasi baru, dan fallback adaptif. Dengan demikian efek terasa smooth pada device yang memiliki refresh rate tinggi, tetapi tetap hemat pada device low-end.
