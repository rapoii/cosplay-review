# Motion 60 FPS QA Report

## Perubahan

Sistem motion sekarang memakai profil `motion-60` pada root document. Reveal transition dipadatkan menjadi 460ms dengan stagger 70/130/190ms, sementara animasi ambient chibi, sticker, dan scroll badge diperlambat agar gerakannya tetap lembut namun tidak agresif pada perangkat refresh-rate tinggi.

Reduced-motion dan low-power fallback tetap aktif. Pada low-power, animasi mascot tetap dimatikan dan transition reveal dipersingkat.

## Hasil QA

| Skenario | Hasil |
| --- | --- |
| Initial desktop/mobile reveal | `motionReady: true`, `motion60: true` |
| Scroll reveal Wall of Love | Terlihat dan seluruh reveal selesai |
| Reduced motion | `motion60: true`, tidak ada reveal tersembunyi |
| Low-power | `motion60: true`, animasi mascot `none` |
| Visual QA | Form, chibi panel, Wall of Love, dan 15 rating buttons tetap terdeteksi |
| Performance QA | Audio tetap `preload="none"`; fallback low-power tetap aktif |
| Build | Astro menghasilkan `/`, `/admin`, dan `/qr` tanpa error |
