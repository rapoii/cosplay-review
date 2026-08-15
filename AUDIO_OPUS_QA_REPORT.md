# Audio Opus QA Report

## Perubahan

MusicPlayer sekarang memilih `/cupid-lite.opus` sebagai sumber utama ketika browser menyatakan dukungan Opus. `/cupid-lite.mp3` tetap tersedia sebagai fallback untuk browser lama atau kondisi ketika pemuatan Opus gagal. Audio singleton, autoplay best-effort, loop, dan unlock setelah interaksi pertama tetap dipertahankan.

## Asset

| Asset | Codec | Durasi | Ukuran |
|---|---|---:|---:|
| `cupid-lite.mp3` | MP3 stereo 128kbps | 173,897 detik | 2.782.816 byte |
| `cupid-lite.opus` | Opus stereo sekitar 64kbps | 173,866 detik | 1.430.108 byte |

Asset Opus berukuran sekitar 48,6% lebih kecil daripada MP3 sumber.

## Production playback QA

- Asset Opus HTTP status: `200`.
- Content type: `audio/ogg`.
- Audio source runtime: `/cupid-lite.opus`.
- Format runtime: `opus`.
- `autoplay`: aktif.
- `loop`: aktif.
- `currentSrc`: Opus.
- `readyState`: `4`.
- `paused`: `false` setelah interaksi.
- `mediaError`: tidak ada.
- Blocking failed request: tidak ada.

Build Astro dan regression QA route utama berhasil setelah perubahan ini.
