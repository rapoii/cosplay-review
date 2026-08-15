# Scroll 60 FPS QA Report

## Implementasi

Scroll sekarang memakai native browser dengan `scroll-behavior: auto` pada profil `motion-60`. Anchor langsung berpindah tanpa animasi lambat, sementara scroll manual tetap mengikuti perilaku natural browser. Tidak ada wheel handler, touchmove handler, requestAnimationFrame loop, atau custom momentum scrolling.

## Hasil QA

| Skenario | Hasil |
| --- | --- |
| Normal | `motion60: true`, `scrollBehavior: auto` |
| Reduced motion | `scrollBehavior: auto` |
| Low-power | `motion60: true`, `lowPower: true`, `scrollBehavior: auto` |
| Custom scroll marker | Tidak ditemukan |
| Motion regression | Reveal, low-power, dan reduced-motion tetap lulus |
| Build | Astro menghasilkan `/`, `/admin`, dan `/qr` tanpa error |
