# Audit UI/UX Awal

## Temuan utama

- Proyek menggunakan Astro 7 + Svelte 5 + Firebase Firestore.
- Halaman utama hanya berisi judul, form ulasan, dan galeri ulasan realtime.
- Struktur visual saat ini sangat bergantung pada claymorphism dan emoji, tetapi hierarki informasi masih datar serta banyak elemen besar yang mengulang konteks.
- Form menampilkan dua input identitas, tiga rating bintang, komentar, dan tombol submit. Field nama serta tiga rating wajib; kostum dan komentar opsional.
- Galeri mempertahankan data reviewer_name, costume_type, rating_quality, rating_service, rating_speed, dan comment.
- Screenshot bawaan repositori memperlihatkan teks hampir tidak terbaca / styling tidak ter-render dengan baik, sehingga validasi runtime dan build menjadi prioritas.

## Arah redesign yang dipilih

Membawa tema kawaii ke arah **soft editorial**: latar ivory hangat, aksen fuchsia/coral, teks plum yang kontras, kartu rounded yang lebih ringan, layout dengan hero dan ringkasan rating, form yang lebih terstruktur, serta review card yang lebih mudah dipindai. Emoji akan dipakai sebagai aksen kecil, bukan sebagai pengganti ikon atau hierarki utama.

## Sasaran UX

1. Pengunjung memahami tujuan halaman dalam beberapa detik.
2. CTA untuk menulis ulasan terlihat jelas tanpa harus menggulir terlalu jauh.
3. Tiga dimensi penilaian lebih mudah dipahami dan diisi.
4. Ulasan yang masuk dapat dipindai cepat lewat skor total, metadata kostum, dan kutipan.
5. Fokus keyboard, state disabled, responsivitas, dan reduced motion tetap terjaga.
