# Lilycosrent Unified Design System

**Status:** Baseline keputusan visual sebelum implementasi lintas route
**Source of truth:** Halaman ulasan customer (`/`)
**Scope:** `/`, `/qr`, dan `/admin`

## Prinsip utama

Seluruh halaman harus terlihat seperti bagian dari satu produk Lilycosrent. Perbedaan fungsi boleh mengubah konten dan komposisi, tetapi tidak boleh mengubah bahasa visual. Halaman ulasan menjadi acuan utama karena merupakan pengalaman customer dan memiliki hierarchy paling lengkap.

> **Rule:** satu token, satu makna, satu treatment. Jangan membuat versi typography atau control baru hanya karena komponen berada di route QR atau admin.

## Typography

Font wajib di seluruh route adalah **Baloo 2** untuk display/brand heading dan **Nunito** untuk body/UI. Keduanya menggunakan WOFF2 lokal dengan `font-display: swap`.

| Role | Font | Size desktop | Size mobile | Weight | Line-height | Letter-spacing | Italic |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Page title / main title | Baloo 2 | `clamp(2.12rem, 4.2vw, 3.1rem)`; computed 49.6px pada desktop baseline | 2.33rem; computed 37.28px | 800 | 0.95 | -0.04em | Tidak, kecuali emphasis kata tertentu |
| Emphasis dalam title | Baloo 2 | mengikuti parent | mengikuti parent | 800 | mengikuti parent | mengikuti parent | Tidak; gunakan warna pink, bukan italic default |
| Section title | Baloo 2 | 2.0–2.8rem sesuai hierarchy | 1.95–2.33rem | 800 | 0.95–0.98 | -0.04em | Tidak |
| Body / explanatory copy | Nunito | 12px | 10–12px sesuai ruang | 600 | 1.5 | normal | Tidak |
| UI label / form label | Nunito | 11px | 11px | 800 | 1.25–1.4 | normal | Tidak |
| Kicker / eyebrow | Nunito | 10px | 8–10px | 800 | 1.2 | 0.11em | Tidak; uppercase |
| Supporting microcopy | Nunito | 9px | 8–9px | 600–800 | 1.35–1.5 | normal | Tidak |
| Brand name | Baloo 2 | 19px | 18px | 800 | 0.92 | -0.03em | Tidak |
| Brand subtitle | Nunito | 8px | 8px | 800 | normal | 0.08em | Tidak; uppercase |
| Primary button | Nunito | 11px | 11px | 800 | normal | normal | Tidak |

Judul utama pada QR card dan dashboard harus memakai token page title yang sama, bukan ukuran khusus berdasarkan route. Jika ruang sempit, yang boleh dipadatkan lebih dulu adalah gap, supporting copy, atau QR frame—bukan font title.

## Color tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--pink-50` | `#fff8fb` | Base pale surface |
| `--pink-100` | `#fff0f6` | Soft background, icon tile |
| `--pink-200` | `#ffdce9` | Border, divider, input outline |
| `--pink-300` | `#fdb3cc` | Soft accent |
| `--pink-400` | `#f785ae` | Active decoration |
| `--pink-500` | `#ec5f93` | Primary brand/action accent |
| `--pink-600` | `#cd3f73` | Strong text/accent/CTA |
| `--lavender-100` | `#eee8ff` | Secondary pastel surface |
| `--lavender-300` | `#c9b9f0` | Secondary accent |
| `--plum` | `#54354a` | Primary text and heading |
| `--plum-soft` | `#836b7c` | Body copy |
| `--muted` | `#ac99a6` | Supporting/helper text |
| `--line` | `#f4dce7` | Fine separators |
| `--yellow` | `#ffbe54` | Small sparkle/kicker accent only |

## Surfaces and containers

All main route shells use the same base surface: a white translucent card with `2px` white border, `31px` radius, and `var(--shadow)`. The shell may use a route-specific background decoration, but the outer treatment must remain the same.

| Component level | Border | Radius | Shadow | Padding |
| --- | --- | ---: | --- | --- |
| Main page shell | 2px white translucent | 31px | `var(--shadow)` | `clamp(24px, 4vw, 38px)` |
| Secondary card | 1–1.5px `--pink-200` | 13–18px | `var(--shadow-soft)` or none | 12–19px |
| Small icon tile | 1px translucent pink | 10–13px | small soft shadow | fixed 27–46px |
| Button | 0px primary / 1px outline | 13–14px | primary depth shadow | min-height 40px |
| Avatar | 2px white | 13px | avatar shadow | 46×46px header baseline |

`backdrop-filter` is optional progressive enhancement only on fast-update output devices. Solid translucent backgrounds remain the canonical fallback.

## Controls and states

Primary submit/action buttons use the same pink gradient, white text, `11px/800` typography, `min-height: 40px`, `13–14px` radius, and tactile depth shadow. Outline buttons use white background, `1px --pink-200` border, `--pink-600` text, and the same height/radius. Hover transforms are limited to `translateY(-2px)`; active state uses a small press transform. Low-power and reduced-motion profiles remove nonessential transforms.

Inputs, textarea, and admin fields use the same `1.5px --pink-200` border, `13px` radius, white/pale-pink background, `--plum` text, and pink focus ring. Placeholder text uses a muted pink-gray. Disabled state reduces opacity but keeps layout unchanged.

## Spacing and layout

The global content width is `min(100% - 40px, 1120px)` on desktop and `min(100% - 22px, 460px)` on small mobile. Main sections use the same vertical rhythm: compact header, 18px content top padding, 24px bottom padding, and 20–25px gaps between primary blocks. Route-specific composition may use grid, but it must not introduce unexplained whitespace or different outer margins.

## Route mapping

| Route | Canonical shell | Route-specific content |
| --- | --- | --- |
| `/` | Form shell + chibi panel + Wall of Love | Customer form, ratings, success state, realtime reviews |
| `/qr` | Same main shell treatment | QR utility copy, same controls, printable card as an inner artifact |
| `/admin` | Same main shell treatment | Admin access gate or metric dashboard using the same title/body/control tokens |

The printable QR card may retain its pink internal artwork and A6-specific composition, but its brand, title, body, controls, colors, radius, border, shadow, and type tokens must resolve to this same system.

## Responsive and print rules

On mobile, typography hierarchy remains the same; only the page title token changes to the baseline `2.33rem`. Controls remain touch-friendly and never shrink below 40px height. The QR canvas must shrink-to-fit without changing the title token. Print mode hides navigation and utility copy, preserves only the rental card, and maintains A6 portrait dimensions without clipping heading, QR, CTA, or footer.

## Acceptance criteria

A route is considered visually consistent only when computed styles for the same role match across pages, all required content stays within its shell at desktop and mobile, no horizontal overflow exists, the QR card remains printable at A6, and reduced-motion/low-power behavior does not alter typography or layout semantics.
