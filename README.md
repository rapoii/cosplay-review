# 🎀 Lilycosrent Review Corner

Website ulasan rental kostum cosplay dengan tema **Claymorphism Kawaii** — dibangun pakai Astro, Svelte 5, Tailwind CSS v4, dan Firebase Firestore.

![Design System](./DESIGN_SYSTEM.md)

## ✨ Fitur

- 📝 **Form Review Interaktif** — Rating bintang per kategori (Kualitas, Admin, Kecepatan) + validasi real-time
- 💖 **Wall of Love** — Gallery review realtime dari Firestore dengan animasi smooth
- 🎵 **Music Player** — Background music Cupid (Opus optimized)
- 📱 **QR Card & Print Kit Hub** — Generator printable card A6 terintegrasi aman di dalam Tab Admin Dashboard (`/admin`)
- 🔐 **Admin Dashboard** — Panel admin di `/admin` dengan Firebase Authentication, live review statistics, dan QR print hub
- 🎨 **Unified Design System** — Token warna pastel pink, tipografi (Baloo 2 + Nunito), 60 FPS motion & responsive layout lintas route

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

1. Buat project baru di [Firebase Console](https://console.firebase.google.com/).
2. Tambahkan Web App dan salin konfigurasi ke file `.env` (lihat `.env.example`).
3. Aktifkan **Authentication > Sign-in method > Email/Password** dan buat akun pengelola.
4. Berikan custom claim `admin: true` melalui trusted Admin SDK atau Cloud Function. Jangan membuat custom claim dari browser.
5. Deploy `firestore.rules` dan `firestore.indexes.json` dengan `firebase deploy --only firestore:rules,firestore:indexes`.
6. Jangan menggunakan **Firestore test mode** di production. Uji rules melalui Rules Simulator atau Firebase Emulator Suite terlebih dahulu.

## 📁 Struktur Project

```
/
├── public/             # Static assets (fonts, audio, images)
├── src/
│   ├── components/     # Svelte components (ReviewForm, Gallery, QrCard, AdminDashboard, MotionEffects, MusicPlayer)
│   ├── lib/            # Firebase client config & authentication helpers
│   ├── pages/          # Astro routes (/, /admin)
│   └── styles/         # Global CSS + Design Tokens (Pastel Pink Theme)
├── scripts/            # QA & audit automation scripts
├── firestore.rules     # Firestore Security Rules production
├── firestore.indexes.json # Composite index untuk query review
├── firebase.json       # Konfigurasi Firebase CLI
├── .env.example        # Template environment variables
├── DESIGN_SYSTEM.md    # Unified design tokens & rules
└── README.md           # This file
```

## 🧪 Testing

Jalankan pemeriksaan lokal berikut sebelum deploy:

```bash
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=moderate
```

Review baru berstatus `pending` dan baru tampil di Wall of Love setelah diubah menjadi `approved` oleh proses moderasi tepercaya. Pastikan query publik hanya membaca dokumen `approved`.

## 📄 License

Private project — © 2026 Lilycosrent

---

Made with ♡ by lilycosrent_

</content>