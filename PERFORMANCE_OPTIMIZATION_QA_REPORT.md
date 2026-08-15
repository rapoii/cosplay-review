# Performance Optimization QA Report

**Project:** Lilycosrent Cosplay Review
**Optimization scope:** research-driven motion, scroll, critical path, dependency, font, Firebase, audio, blur, and offscreen rendering improvements
**Build:** Astro static output with Svelte islands
**Status:** Build and regression QA passed

## Implemented changes

| Area | Implementation |
| --- | --- |
| Unused dependencies | Removed `motion`, `@formkit/auto-animate`, and `lucide-svelte` because no source import used them. |
| Motion capability | `MotionEffects.svelte` now treats `(update: slow)` as a low-power signal in addition to reduced motion, Save Data, slow connection, CPU, and memory hints. |
| Animation properties | Existing reveal/ambient motion remains based on transform/opacity; success sparkle/confetti changed from infinite loops to three finite cycles. |
| Blur/compositing | Form, admin, QR, and nav shells default to no `backdrop-filter`; blur is progressive enhancement only under `(update: fast)` and no reduced-motion preference. Slow/update-limited and low-power profiles use a solid translucent background. |
| Admin progress | Progress bars now use `transform: scaleX()` rather than changing width, avoiding layout updates during metric refresh. |
| Scroll | `scroll-behavior: auto` remains global; no custom wheel/touch handler or rAF scroll loop was introduced. |
| Customer form hydration | `ReviewForm` changed to `client:load` because it is the primary above-the-fold interaction. |
| Wall of Love | Firestore imports in `ReviewGallery` moved into dynamic imports executed when the visible island mounts. The section uses `content-visibility: auto` with intrinsic size only offscreen. |
| Firebase | Removed unused Firebase Storage import/export; Firestore credential object was not changed. |
| Fonts | Google Fonts CDN links replaced by two self-hosted variable WOFF2 files with `font-display: swap` and local preload on all three routes. |
| Audio | Cupid remains `preload="none"`; MusicPlayer fallback reduced from eight global listeners to `pointerdown`, `touchstart`, and `keydown`, with an in-flight guard. |

## Build metrics

| Metric | Baseline | Release | Interpretation |
| --- | ---: | ---: | --- |
| `dist` total | ~3.7MB | ~3.7MB | Total is dominated by deferred `cupid-lite.mp3`; no critical-path increase. |
| Cupid MP3 | 2,782,816B | 2,782,816B | Intentionally unchanged; it remains `preload="none"` and does not block the form. |
| Main shared JS chunk | 580,784B | 580,464B | Slightly smaller after dependency and Firebase cleanup; Vite still reports a shared chunk warning. |
| Wall of Love chunk | 3,509B | 3,509B | Gallery UI remains a small island; Firestore is dynamically requested on visibility. |
| Self-hosted Baloo 2 | — | 33,188B | One variable WOFF2, replacing external font connection. |
| Self-hosted Nunito | — | 39,128B | One variable WOFF2, replacing external font connection. |
| External Google font references | Present | 0 in `dist` | Initial font rendering no longer depends on Google Fonts DNS/CDN. |

The build still reports a Vite warning for a shared JavaScript chunk above 500KB. This is a warning, not a build failure. The chunk graph shows Firebase and framework internals in shared output; the customer page still uses Astro island boundaries and dynamic Firestore imports. Further vendor splitting should be considered only after a real production trace proves that this shared chunk is on the initial critical network path.

## QA results

| Suite | Result | Key verification |
| --- | --- | --- |
| Build | Pass | Three routes generated: `/`, `/admin`, `/qr`. |
| Motion | Pass | `motion-ready` and `motion-60` active; reveal works after scroll; reduced motion exposes all reveal elements; simulated `update: slow` activates low-power and disables mascot animation. |
| Scroll | Pass | Scroll behavior is `auto` in normal, reduced-motion, and low-power profiles; no wheel handler marker; no heavy scroll loop. |
| Audio | Pass | Cupid source, autoplay attribute, loop, fallback play, and status verified; after fresh Vite restart, `failedRequests` is empty. |
| Features | Pass | 15 rating buttons detected on desktop/mobile, dashboard has three metric cards, QR canvas is 320×320, all target pages have no horizontal overflow. |
| Navigation | Pass | Four menu items on desktop/mobile; `/`, `/qr`, and `/admin` cross-links present; no overflow. |
| Visual | Pass | Customer form, Wall of Love, avatar, chibi, and responsive layout remain visible. |
| Spacing | Pass | Five viewport audit completed without new trailing whitespace or overflow; Wall of Love content-visibility did not break measured layout. |

## Interpretation and remaining limits

The optimization now follows a browser-native adaptive strategy. It does not and cannot promise literal 240 FPS on every screen. A 240Hz display can naturally receive more compositor updates when the browser and hardware are capable, while 60Hz, 90Hz, 120Hz, low-power, and thermally constrained devices receive a lighter profile without custom physics or forced rAF loops.

The sandbox QA uses Chromium and simulated profiles. It cannot prove real 240Hz frame pacing on physical high-refresh hardware, iOS Safari, Android WebView, Firefox, or a thermal/battery-constrained phone. The next validation step for a literal high-refresh target should use real device hardware and Chrome DevTools/Perfetto traces, checking presented frames, long tasks, paint/layout cost, INP, LCP, and CLS rather than an FPS counter alone.
