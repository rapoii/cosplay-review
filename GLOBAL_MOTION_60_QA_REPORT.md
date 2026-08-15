# Global Motion 60 FPS QA Report

## Perubahan utama

Profil `motion-60` dan native scroll ringan berlaku pada seluruh device. Perbedaan low-power tidak lagi mengubah durasi transition interaksi: low-power hanya mematikan dekorasi kontinu seperti floating mascot, sticker, scroll badge, dan sparkle agar hemat daya.

Scroll anchor memakai perilaku native tanpa animasi lambat. Tidak ada custom wheel/touch handler, momentum buatan, atau requestAnimationFrame scroll loop.

## Hasil QA

| Profil | Motion | Scroll | Reveal transition |
| --- | --- | --- | --- |
| Normal | `motion60: true` | `auto` | `0.46s, 0.46s` |
| Low-power | `motion60: true`, `lowPower: true` | `auto` | `0.46s, 0.46s` |
| Reduced-motion | `motion60: true` | `auto` | Preferensi reduced-motion dihormati |

Visual QA, motion QA, dan build Astro juga lulus. Route yang dihasilkan tetap `/`, `/admin`, dan `/qr`.
