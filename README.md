# 🎀 Lilycosrent Review Corner

Website ulasan rental kostum cosplay dengan tema **Claymorphism Kawaii** — dibangun pakai Astro, Svelte 5, Tailwind CSS v4, dan Firebase Firestore.

![Design System](./DESIGN_SYSTEM.md)

## ✨ Fitur

- 📝 **Form Review Interaktif** — Rating bintang per kategori (Kualitas, Admin, Kecepatan) + validasi real-time
- 💖 **Wall of Love** — Gallery review realtime dari Firestore dengan animasi smooth
- 🎵 **Music Player** — Background music Cupid (Opus optimized)
- 📱 **QR Card Generator** — Halaman `/qr` untuk printable card A6
- 🔐 **Admin Dashboard** — Panel admin di `/admin`
- 🎨 **Unified Design System** — Token warna, tipografi (Baloo 2 + Nunito), spacing konsisten lintas route

## 🚀 Quick Start

```bash
# Clone repo
git clone https://github.com/rapoii/cosplay-review.git
cd cosplay-review

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan kredensial Firebase kamu

# Run dev server
npm run dev
```

Buka `http://localhost:4321` di browser.

## 🔥 Firebase Setup

1. Buat project baru di [Firebase Console](https://console.firebase.google.com/)
2. Tambahkan Web App → copy config object
3. Aktifkan **Cloud Firestore** → pilih "Start in test mode"
4. Paste config ke file `.env` (lihat `.env.example`)

## 📁 Struktur Project

```
/
├── public/             # Static assets (fonts, audio, images)
├── src/
│   ├── components/     # Svelte components (ReviewForm, Gallery, QR, Admin)
│   ├── lib/            # Firebase config & demo data
│   ├── pages/          # Astro routes (/, /qr, /admin)
│   └── styles/         # Global CSS + Design Tokens
├── scripts/            # QA & audit automation scripts
├── .env.example        # Template environment variables
├── DESIGN_SYSTEM.md    # Unified design tokens & rules
└── README.md           # This file
```

## 🧪 Testing

Jalankan E2E test manual:
1. Buka `http://localhost:4321`
2. Isi form review → klik "Kirim ulasan"
3. Cek Wall of Love — review harus muncul instant
4. Verifikasi data masuk di Firebase Console → Firestore

## 📄 License

Private project — © 2026 Lilycosrent

---

Made with ♡ by lilycosrent_

</content>