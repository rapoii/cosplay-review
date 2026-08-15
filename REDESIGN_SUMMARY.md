# Cosplay Review — Revisi Form-First Kawaii

## Ringkasan

Halaman telah diarahkan ulang menjadi **halaman review setelah rental**, bukan landing page. Saat customer membuka link, bagian pertama yang terlihat adalah form ulasan. Panel karakter chibi berfungsi sebagai pendamping visual di sebelah form pada desktop dan muncul setelah form pada mobile, sehingga alur utama tetap langsung ke pengisian.

Karakter yang digunakan adalah **maskot chibi original** bergaya pink-lavender kawaii, bukan karakter Hello Kitty atau karakter berlisensi. Dengan begitu, nuansanya tetap terasa imut dan anime tanpa bergantung pada aset berhak cipta tertentu.

## Perubahan utama

| Area | Revisi |
| --- | --- |
| Alur halaman | Menghapus hero landing page yang panjang; halaman langsung dimulai dari form review. |
| Form | Heading baru “Gimana kostumnya?”, copy lebih santai, dan CTA submit tetap menjadi fokus utama. |
| Panel chibi | Menambahkan ilustrasi `public/chibi-review-card.png` dengan maskot original yang membawa kostum pink dan menyapa customer. |
| Nuansa kawaii | Menggunakan Baloo 2 + Nunito, palette pink blush/lavender/cream, sticker kecil, speech bubble, pola titik, hati, pita, dan bintang. |
| Mobile | Form ditampilkan lebih dahulu; panel chibi berada setelah form agar link WhatsApp langsung usable. |
| Wall of Love | Ulasan lain tetap tersedia di bawah form, dengan anchor “Lihat ulasan” dari header. |
| Data/backend | Firestore, collection `reviews`, field rating, dan realtime listener tetap dipertahankan. |

## File yang berubah

- `src/pages/index.astro`
- `src/styles/global.css`
- `src/components/ReviewForm.svelte`
- `src/components/ReviewGallery.svelte`
- `public/chibi-review-card.png`
- `scripts/visual-qa.mjs`

## Validasi terbaru

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run build` | Lulus; Astro membangun `/index.html` tanpa error. |
| Desktop QA 1440 px | Form, panel chibi, dan wall terdeteksi; gambar chibi termuat; tidak ada console error atau overflow horizontal. |
| Mobile QA 390 px | Form berada di posisi awal (`formTop: 82`), panel chibi berada setelah form (`chibiTop: 1040.25`), wall tersedia, gambar termuat, dan tidak ada overflow horizontal. |
| Kontrol rating | 15 tombol rating terdeteksi, mencakup tiga kategori dengan lima pilihan bintang. |

## Menjalankan proyek

```bash
npm install
npm run dev
```

Untuk production build:

```bash
npm run build
npm run preview
```

Pastikan environment Firebase dari `.env.example` telah tersedia jika ingin menguji pengiriman review dan sinkronisasi Firestore secara penuh.

## Referensi

[1]: https://github.com/rapoii/cosplay-review "Repositori cosplay-review di GitHub"
