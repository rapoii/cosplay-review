# Low-End Optimization Notes

Website Lilycosrent dioptimalkan agar lebih ringan pada perangkat dengan CPU, GPU, memori, atau koneksi terbatas.

## Hasil terukur

| Area | Sebelum | Sesudah | Dampak |
| --- | ---: | ---: | --- |
| Total output `dist` | sekitar 13 MB | sekitar 3,6 MB | Turun sekitar 72% |
| Maskot utama | PNG 3,89 MB | WebP sekitar 133 KB | Turun sekitar 96% |
| Avatar square | PNG 389 KB | WebP sekitar 36 KB | Turun sekitar 91% |
| Audio Cupid | MP3 6,7 MB / 320 kbps | MP3 lite 2,7 MB / 128 kbps | Turun sekitar 60% |
| Firebase initial loading | Chunk sekitar 471 KB | Chunk Firebase sekitar 11 KB dan sisanya lazy | Initial bundle lebih ringan |

## Perubahan implementasi

Asset gambar runtime dialihkan ke WebP yang telah diperkecil secara proporsional. Audio background memakai versi bitrate 128 kbps dan `preload="none"` agar tidak langsung mengunduh 2,7 MB sebelum autoplay atau gesture pengguna benar-benar diterima browser.

Firebase Firestore pada form dipindahkan ke dynamic import dan baru dimuat saat customer menekan submit. Animasi dekoratif tetap aktif pada perangkat yang memadai, tetapi otomatis masuk mode `low-power` ketika terdeteksi Data Saver, koneksi 2G, `deviceMemory` rendah, atau hardware concurrency rendah. Pada mode tersebut, animasi kontinu dan blur GPU dimatikan sementara reveal dan interaksi inti tetap bekerja.

Scroll tetap menggunakan native scrolling browser dengan smooth anchor behavior, tanpa custom wheel/touch hijacking yang berisiko membuat perangkat low-end tersendat.

## Validasi

Build Astro lulus. QA audio memverifikasi asset `/cupid-lite.mp3`, autoplay attribute, loop, dan playback setelah interaksi. QA motion memverifikasi reveal, scroll reveal Wall of Love, reduced-motion, serta mode low-power. QA visual desktop/mobile memverifikasi form, panel chibi, Wall of Love, 15 tombol rating, tidak ada horizontal overflow, dan tidak ada console error.
