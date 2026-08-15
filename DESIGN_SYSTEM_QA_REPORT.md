# Lilycosrent Unified Design System QA

## Final decision

Halaman ulasan `/` menjadi **source of truth**. Halaman `/qr` dan `/admin` sekarang menggunakan token visual yang sama untuk role yang sama. Perbedaan yang tersisa hanya konten fungsional dan artwork internal printable QR card.

## Canonical tokens

| Role | Canonical style |
| --- | --- |
| Main title | Baloo 2, weight 800, `clamp(2.12rem, 4.2vw, 3.1rem)`, mobile `2.33rem`, line-height `0.95`, letter-spacing `-0.04em`, normal style |
| Body copy | Nunito, 12px, weight 600, line-height 1.5, normal style |
| UI label | Nunito, 11px, weight 800, line-height 1.5, normal style |
| Primary button | Nunito, 11px, weight 800, radius 14px, pink depth shadow, same hover/active treatment |
| Shell | White translucent surface, 2px white border, radius 31px, `var(--shadow)` |
| Brand | Baloo 2, 19px, weight 800, line-height 0.92, letter-spacing -0.03em; pink name with muted uppercase subtitle |
| Emphasis | Normal style, weight 800, pink color; no unintended italic differences |

## Implemented unification

The QR workspace and admin gate/dashboard now use the same title token as the customer form. QR explanatory text uses the same 12px/600/1.5 body token. Admin title weight was corrected from the previous browser-default 400 to 800. The internal shells now resolve to the same border, radius, shadow, and canonical translucent white surface as the form shell, including low-power fallback. The admin icon now follows the same 45px sticker treatment as the review form sticker.

The printable card uses the same brand typography, body typography, title token, CTA typography, border radius, and shadow system. Its pink gradient and dashed inner border remain as functional print artwork, not a separate typography system. QR canvas is shrink-to-fit and does not change title sizing.

## QA results

| Test | Result |
| --- | --- |
| Build | Pass; `/`, `/qr`, `/admin` generated |
| Computed design-system consistency | Pass: title, body, button, shell, and brand all `true` across three routes |
| Title typography | Pass on desktop and mobile; review/card font, size, weight, line-height, and letter-spacing match |
| Printable card | Pass; heading and QR stay inside card, card content fits, A6 print dimensions remain present |
| Feature QA | Pass; 15 rating buttons, 3 admin metric cards, QR canvas, and no overflow |
| Navigation QA | Pass; unified 3-item menu across routes, no Instagram item, no header review button |
| Audio QA | Pass; Cupid plays after interaction and has no failed requests |
| Motion and scroll QA | Pass; motion-60, reduced-motion, low-power, native instant scroll remain intact |
| Visual and spacing QA | Pass; no new horizontal overflow or trailing whitespace regression |

## Constraint

“Same style” means shared design tokens and role semantics, not forcing every functional artifact to have identical dimensions. The QR canvas must remain square and printable; dashboard metric cards must remain data-oriented. Their typography, controls, shell, and visual language now resolve to the same system as the review page.
