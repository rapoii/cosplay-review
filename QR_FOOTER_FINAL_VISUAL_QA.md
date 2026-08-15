# QR Footer Final Visual QA

Screenshot mobile terbaru setelah gap QR–CTA diperbesar menunjukkan kotak QR dan tulisan `Scan untuk kasih review` sudah memiliki ruang kosong yang lebih jelas. Footer `Serang · Tangerang · Jabodetabek` dan `@lilycosrent_` tetap terlihat utuh di dalam kartu, tidak tertutup border bawah, dan tidak overlap dengan CTA.

Runtime geometry pada semua viewport: `footerInsideCard=true`, tidak ada horizontal overflow, dan QR tetap square. Nilai spacing terbaru adalah `qrToCtaGap` 18px pada small-mobile dan 22px pada mobile/tablet/desktop. `ctaToFooterGap` berada di kisaran 10–20px.
