# QR Footer Visual QA

Screenshot mobile terbaru pada viewport 390px menunjukkan kartu rental sudah stabil setelah layout footer diubah. QR tampil square dan tidak gepeng. CTA `Scan untuk kasih review` memiliki jarak visual yang jelas dari kotak QR. Footer `Serang · Tangerang · Jabodetabek` dan `@lilycosrent_` terlihat utuh di dalam batas kartu, tidak tertutup border bawah, dan tidak overlap dengan CTA. Kartu tetap memiliki ruang bawah yang aman sebelum outer card berakhir.

QA runtime terkait: `qrToCtaGap` 12px pada mobile, `ctaToFooterGap` 11px, `footerInsideCard=true`, tidak ada horizontal overflow, dan QR decode lulus.
