# QR Footer Preview Inspection

Preview QR terbaru menunjukkan markup footer tetap berisi `Serang · Tangerang · Jabodetabek` dan `@lilycosrent_`, tetapi inspeksi visual user pada mobile menunjukkan keduanya masih tampak berada terlalu dekat dengan batas bawah kartu atau tertutup saat browser menggunakan viewport mobile. Perbaikan berikutnya harus memberi footer safe area independen di dalam kartu, bukan hanya margin pada footer setelah konten utama.

Browser preview pada desktop memperlihatkan kartu berada di sisi kanan workspace dan footer masih tersusun di bawah CTA. QA mobile lokal sebelumnya menunjukkan footer rect masuk kartu, tetapi inspeksi visual user belum sesuai, sehingga perlu mengubah struktur layout agar footer benar-benar dikunci ke area bawah yang tidak ikut terdorong oleh tinggi konten utama.
