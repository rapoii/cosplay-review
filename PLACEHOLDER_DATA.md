# Placeholder Data Lilycosrent

Dokumentasi fixture demo lokal sebelumnya sudah tidak berlaku. Repository saat ini tidak memiliki `src/lib/demoReviews.ts` dan tidak memakai fallback review sintetis.

| Area | Perilaku aktual |
| --- | --- |
| Wall of Love | Hanya menampilkan dokumen Firestore dengan `status == "approved"`. Jika query gagal atau belum ada data, halaman menampilkan empty state. |
| Dashboard admin | Hanya menghitung dokumen `approved` setelah akun berhasil login dan memiliki custom claim `admin: true`. |
| Form review | Menulis dokumen baru dengan `status: "pending"`; review harus dimoderasi sebelum tampil ke publik. |

Sumber kebenaran keamanan dan validasi adalah `firestore.rules` serta query pada `ReviewGallery.svelte` dan `AdminDashboard.svelte`.
