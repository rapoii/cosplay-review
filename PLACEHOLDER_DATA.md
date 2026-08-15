# Placeholder Data Lilycosrent

Website memiliki fixture lokal di `src/lib/demoReviews.ts` yang dipakai sebagai fallback demo pada dua tempat:

| Area | Perilaku |
| --- | --- |
| Wall of Love | Menampilkan enam kartu review demo ketika koleksi `reviews` di Firestore kosong atau snapshot gagal dimuat |
| Dashboard admin | Menampilkan total enam review dan tiga metrik rata-rata dari fixture yang sama ketika tidak ada review approved di Firestore |

Fixture ini bersifat **read-only** dan tidak memanggil `addDoc`, `setDoc`, `updateDoc`, atau operasi tulis Firestore. Konfigurasi Firebase juga tidak diubah.

Ketika satu atau lebih review Firestore yang sesuai tersedia, data demo otomatis digantikan oleh data Firestore. Badge `Data demo sementara` memberi tanda bahwa data yang sedang tampil bukan ulasan customer asli.
