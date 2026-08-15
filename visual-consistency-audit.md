# Visual consistency audit

## Baseline halaman ulasan

Halaman customer memakai background pink sangat pucat, header logo compact di kiri, dropdown Menu di kanan, lalu form-first layout dua kolom pada desktop. Form shell dan panel chibi terasa seperti satu composition besar; hierarchy utama langsung ke form, dengan spacing yang rapat dan visual kawaii.

## Halaman QR & kartu

QR route memakai warna/background global dan header yang sama, tetapi konten utama berbeda secara nyata: `.qr-workspace` adalah shell putih lebar dengan komposisi dua kolom, sementara halaman ulasan memakai form shell + chibi panel sebagai focal composition. Pada screenshot desktop, sisi kiri QR workspace memiliki ruang putih kosong besar karena kartu printable berukuran tetap berada di sisi kanan. Ini membuat halaman QR terasa lebih seperti utility dashboard daripada halaman review.

QR route tetap memakai typography/palette/button treatment yang sama, tetapi density, max-width, whitespace, dan hierarchy belum sepenuhnya mengikuti halaman ulasan. Header subtitle juga sengaja berbeda (`rental package kit` versus `review corner`), tetapi treatment typographic-nya masih satu sistem.

## Perlu dibandingkan pada dashboard

Audit berikutnya harus mengecek apakah `.internal-content`, `.admin-gate/.admin-dashboard`, dan `.qr-workspace` memakai shell, radius, shadow, padding, responsive breakpoint, dan footer yang sama. Kandidat perbaikan utama adalah menyamakan outer shell rhythm tanpa menghilangkan kebutuhan print card QR.

## Dashboard admin

Dashboard admin memakai background/header global yang sama, tetapi gate saat ini adalah card kecil terpusat dengan whitespace vertikal sangat besar. Dibanding halaman ulasan yang memakai konten lebar dan langsung mengisi viewport, admin terasa seperti halaman login terpisah. Setelah unlock, metric dashboard kemungkinan memakai shell internal yang lebih dekat dengan QR route, tetapi initial gate tetap perlu diberi treatment yang lebih konsisten.

## Kesimpulan audit

Semua route berbagi token warna, font, avatar, border-radius, shadow, header, dan footer dari `global.css`, tetapi belum berbagi **layout rhythm** yang sama. Perbedaan paling terasa bukan pada warna, melainkan pada skala dan density: review memakai hero/form composition, QR memiliki whitespace kiri akibat printable card, dan admin gate terlalu kecil di tengah. Perbaikan sebaiknya menyamakan outer background/header/content width, memperbesar dan meng-align internal shell secara konsisten, serta tetap mengisolasi printable card QR agar tidak dipaksa mengikuti ukuran form.

## Verifikasi setelah penyamaan layout

Setelah perubahan CSS, QR workspace menjadi lebih compact: shell padding dan gap lebih dekat ke form-first page, heading scale lebih konsisten, dan printable card turun dari maksimum 390px ke 360px pada layar besar sehingga whitespace vertikal berkurang tanpa mengubah ukuran kartu saat print A6.

Admin gate sekarang memakai max-width 624px dan heading scale yang sama dengan internal/QR heading, sementara internal content memakai padding 18px/24px yang mendekati `.page-content`. Header, menu, warna, radius, shadow, typography, dan footer tetap berasal dari token global yang sama.
