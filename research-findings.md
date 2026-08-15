# Riset Performa Animasi Web — Temuan Awal

## Sumber 1 — web.dev: How to create high-performance CSS animations
URL: https://web.dev/articles/animations-guide

Temuan kunci: web.dev merekomendasikan memindahkan animasi ke tahap composite dengan memprioritaskan `transform` dan `opacity`, serta menghindari property yang memicu layout atau paint. Panduan tersebut juga mengarahkan pengujian menggunakan Chrome DevTools untuk memeriksa dropped frames, layout, dan paint. `will-change` diposisikan sebagai teknik yang perlu digunakan secara selektif, bukan default untuk semua elemen.

Implikasi awal untuk Lilycosrent: reveal, hover, floating mascot, sparkle, dan dropdown sebaiknya hanya menganimasikan `transform`/`opacity`; `box-shadow`, filter, dan backdrop-filter perlu diawasi karena dapat menambah paint/compositing cost. Validasi harus menggunakan Performance panel/frames, bukan hanya klaim FPS.

## Sumber 2 — MDN: Performance fundamentals
URL: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Fundamentals

Temuan kunci: performa yang dirasakan pengguna mencakup responsiveness, frame rate, memory usage, dan power usage. MDN menjelaskan bahwa frame rate adalah laju perubahan pixel, dan menekankan bahwa platform browser sudah mengoptimalkan scrolling serta compositing untuk banyak kasus umum. HTML/CSS lebih produktif, sedangkan canvas memberi kontrol pixel dan frame rate lebih rendah-level dengan biaya kompleksitas tambahan.

Implikasi awal untuk Lilycosrent: target harus berbasis perangkat dan user-perceived responsiveness, bukan memaksa 240 FPS. Website form berbasis HTML/CSS sebaiknya tetap memakai pipeline browser native, bukan dipindahkan ke canvas atau custom scroll engine hanya demi angka FPS. High refresh rate perlu diuji, tetapi 240 FPS bukan target universal atau jaminan kualitas.

## Sumber 3 — MDN: Window.requestAnimationFrame()
URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

Temuan kunci: callback `requestAnimationFrame()` umumnya mengikuti refresh rate display; 60Hz adalah umum, sementara 75Hz, 120Hz, dan 144Hz juga digunakan. API ini one-shot dan callback harus meminta frame berikutnya untuk loop berkelanjutan. MDN memperingatkan bahwa progress harus dihitung memakai timestamp agar animasi tidak berjalan terlalu cepat pada layar refresh-rate tinggi. Callback juga biasanya dipause di background tab atau iframe tersembunyi untuk menghemat performa dan baterai.

Implikasi awal: tidak ada angka 240 FPS universal yang bisa dipaksakan lewat rAF. Mengunci loop pada 240 tanpa memperhatikan refresh rate dan timestamp justru berisiko memboroskan CPU atau membuat timing salah. Untuk Lilycosrent, CSS/WAAPI native lebih tepat daripada loop JS untuk dekorasi sederhana.

## Sumber 4 — MDN: Animation performance and frame rate
URL: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate

Temuan kunci: setiap frame melewati recalculate style, layout, paint, lalu composition. Property geometri/posisi seperti `left`, `max-width`, `border-width`, `margin-left`, dan `font-size` dapat memicu layout dan repaint. `transform` dan `opacity` dapat ditangani pada tahap composition ketika berada di layer yang sesuai, sehingga lebih murah.

Implikasi awal: source Lilycosrent sudah banyak memakai transform/opacity untuk reveal dan mascot, tetapi perlu audit `box-shadow`, `filter`, `backdrop-filter`, dan perubahan layout. Performa harus dinilai sebagai kemampuan menyelesaikan frame sebelum deadline display, bukan sekadar menjalankan callback sebanyak mungkin.

## Sumber 5 — Chrome DevTools: Performance features reference
URL: https://developer.chrome.com/docs/devtools/performance/reference

Temuan kunci: Performance panel menampilkan aktivitas main thread dalam flame chart, long task di atas 50ms, FPS meter, dan Frames section. Frame merah menandakan dropped frame ketika Chrome tidak dapat merender frame dalam waktu wajar. Trace juga dapat menunjukkan paint, layout shifts, animation, GPU, raster, dan timing detail.

Implikasi awal: benchmark Lilycosrent seharusnya merekam interaksi nyata—load, klik bintang, membuka menu, scroll ke Wall of Love, submit state—di Performance panel. Keberhasilan tidak boleh dinilai dari FPS counter saja; perlu melihat dropped frames, long tasks, paint, layout, dan input latency.

## Sumber 6 — web.dev: Towards an animation smoothness metric
URL: https://web.dev/articles/smoothness

Temuan kunci: smoothness bukan sekadar jumlah frame yang dihasilkan. Artikel ini membahas quality versus quantity, main/compositor thread updates, missing paint updates, percent dropped frames, serta penggunaan Performance HUD, Frame Rendering Stats, DevTools Frames viewer, dan Perfetto.

Implikasi awal: target “240 FPS+++” tidak otomatis berarti lebih smooth. Animasi 240Hz hanya relevan jika display dan browser benar-benar menyajikannya; frame yang hilang, paint yang tertunda, atau input latency tetap menghasilkan jank. Lilycosrent lebih tepat mengejar frame pacing stabil dan tidak ada dropped frame besar pada perangkat target.

## Sumber 7 — Astro Docs: Template directives reference
URL: https://docs.astro.build/en/reference/directives-reference/

Temuan kunci: `client:load` memuat dan hydrate JavaScript segera saat page load; `client:idle` menunggu initial load selesai dan idle callback; `client:visible` menunggu komponen masuk viewport menggunakan IntersectionObserver. Astro menyarankan pemilihan directive sesuai kebutuhan interaktif komponen.

Implikasi awal: `ReviewForm` layak diprioritaskan karena interaktif di viewport awal, sedangkan `ReviewGallery` dapat tetap `client:visible`. `MusicPlayer` dan `MotionEffects` perlu diaudit karena `client:load` memulai kerja awal. Admin/QR route sebaiknya tidak menambah JavaScript ke halaman customer.

## Sumber 8 — Svelte Docs: Best practices
URL: https://svelte.dev/docs/svelte/best-practices

Temuan kunci: `$state` hanya dipakai untuk variabel yang benar-benar reaktif. Object/array `$state` dibuat deeply reactive dan memiliki overhead proxy; `$state.raw` lebih cocok untuk response besar yang hanya di-reassign. `$derived` disarankan untuk nilai turunan, sedangkan `$effect` adalah escape hatch dan sebaiknya dihindari untuk update state yang bisa dilakukan langsung di event handler.

Implikasi awal: state form kecil Lilycosrent aman, tetapi gallery review realtime perlu dievaluasi jika jumlah review membesar. Jangan memasukkan data besar atau perhitungan turunan ke reactive state tanpa alasan; gunakan derived values dan update granular agar interaction tidak memicu rerender berlebihan.

## Sumber 9 — MDN: scroll-behavior
URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior

Temuan kunci: `auto` membuat scrolling box berpindah instan; `smooth` memakai easing dan durasi yang ditentukan user-agent, bukan nilai yang dapat dikontrol developer secara presisi. MDN juga menegaskan scroll lain yang dilakukan user tidak dipengaruhi property ini, sehingga `smooth` terutama memengaruhi navigation/DOM scrolling.

Implikasi awal: rasa “scroll berat” pada Lilycosrent memang dapat berasal dari anchor smooth yang durasinya tidak dikontrol. Jika prioritasnya responsif, `scroll-behavior: auto` untuk anchor adalah pilihan valid; scroll manual tetap native. Jangan memasang custom smooth-scroll engine hanya untuk mengontrol durasi kecuali ada kebutuhan desain yang kuat.

## Sumber 10 — MDN: Document scroll event
URL: https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event

Temuan kunci: scroll event dapat terjadi pada rate tinggi; handler tidak boleh melakukan operasi DOM mahal. MDN menyarankan throttling yang benar atau, bila memungkinkan, `IntersectionObserver` untuk threshold-based listening. MDN juga memperingatkan bahwa membungkus scroll handler dengan `requestAnimationFrame()` saja tidak cukup karena callback rAF dan scroll event berjalan pada rate yang sama.

Implikasi awal: `MotionEffects.svelte` yang memakai IntersectionObserver adalah arah yang benar. Hindari menambah scroll listener untuk parallax, progress bar, atau reveal jika tidak diperlukan; jika ditambah, gunakan passive/read-only logic dan ukur biaya sebenarnya.

## Sumber 11 — GitHub: GoogleChrome/web-vitals
URL: https://github.com/GoogleChrome/web-vitals

Temuan kunci: repository resmi menyediakan library modular kecil untuk mengukur Core Web Vitals seperti LCP, INP, dan CLS serta metrik lain dari real users. README menjelaskan library dapat di-defer setelah code yang berdampak pada user dimuat, memakai buffered PerformanceObserver entries, dan dapat memakai attribution build jika diagnosis akar masalah diperlukan.

Implikasi awal: jika nanti Lilycosrent ingin mengukur performa production, web-vitals dapat dimuat secara deferred dan mengirim INP/LCP/CLS secara sampling. Jangan memasukkan telemetry berat ke critical path atau memuat attribution build tanpa kebutuhan diagnosis.

## Sumber 12 — web.dev: Interaction to Next Paint (INP)
URL: https://web.dev/articles/inp

Temuan kunci: INP mengukur latency dari seluruh interaksi user sampai visual feedback pada next paint, lalu melaporkan nilai yang mewakili mayoritas interaksi. Fokusnya bukan waktu seluruh efek async selesai, melainkan apakah visual feedback pertama terblokir oleh input delay, handler, rendering, atau long task.

Implikasi awal: untuk Lilycosrent, test penting bukan hanya FPS ambient, tetapi tap bintang, membuka menu, mengetik, klik submit, dan membuka success state. Tombol harus memberi feedback sinkron secepat mungkin; Firebase network request tidak boleh memblokir feedback pertama. Loading state yang sudah ada adalah arah benar, tetapi dapat diprofilkan dengan INP/TBT.

## Sumber 13 — MDN: `update` media feature
URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/update

Temuan kunci: `(update: fast)` mengindikasikan output device mampu memperbarui tampilan secara cukup cepat untuk hal yang sering berubah seperti CSS animation; `(update: slow)` menandakan output tidak mampu menampilkan perubahan dengan cepat sehingga animasi halus tidak cocok; `(update: none)` untuk output yang tidak dapat diperbarui setelah dirender.

Implikasi awal: ini adalah sinyal capability yang lebih portable daripada mengasumsikan 60/120/240 FPS. Strategi terbaik adalah progressive motion: animasi dekoratif penuh hanya pada `update: fast`, versi sangat ringan atau statis pada `update: slow`, dan tetap mengutamakan interaksi semantik.

## Sumber 14 — MDN: `prefers-reduced-motion`
URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

Temuan kunci: media feature ini mendeteksi preferensi user untuk mengurangi atau menghapus motion non-esensial, termasuk scaling/panning besar yang dapat memicu ketidaknyamanan vestibular. MDN mencatat pengaturan dapat berasal dari Android, iOS, macOS, Windows, Linux/GTK/KDE, maupun Firefox.

Implikasi awal: lintas device bukan hanya soal FPS. Lilycosrent harus mempertahankan reduced-motion sebagai override tertinggi: hapus loop dekoratif dan scroll animation, tetapi tetap beri feedback visual instan untuk aksi penting.

## Sumber 15 — web.dev: content-visibility
URL: https://web.dev/articles/content-visibility

Temuan kunci: `content-visibility: auto` memungkinkan user agent melewati rendering, layout, dan painting subtree yang offscreen sampai diperlukan. Offscreen content tetap berada di DOM dan accessibility tree, sehingga berbeda dari `visibility: hidden`. Teknik ini dapat mempercepat initial load dan interaksi on-screen, tetapi perlu perhatian pada ukuran intrinsic dan layout shift.

Implikasi awal: section Wall of Love atau kartu review yang jauh di bawah dapat dievaluasi dengan `content-visibility: auto` + ukuran intrinsic yang benar. Jangan menerapkannya ke form above-the-fold, anchor target yang harus langsung akurat, atau komponen yang membutuhkan measurement terus-menerus tanpa uji CLS/accessibility.

## Sumber 16 — MDN: will-change
URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change

Temuan kunci: `will-change` adalah rendering hint untuk browser, tetapi MDN memperingatkan penggunaannya sebagai last resort. Menaruhnya pada banyak elemen atau subtree besar dapat meningkatkan memory/GPU overhead dan justru memperlambat page. Animated properties sering sudah diperlakukan sebagai kandidat optimasi; `will-change` tidak perlu ditambahkan ke keyframes secara otomatis.

Implikasi awal: jangan menambahkan `will-change: transform` ke semua card, chibi, sparkle, dan tombol Lilycosrent. Jika profiling membuktikan satu elemen mahal, apply selektif dan sementara; default source sebaiknya tanpa will-change global.

## Audit source Lilycosrent saat ini

### Arsitektur dan hydration

- Astro + Svelte 5, dengan dependencies `motion`, `@formkit/auto-animate`, `svelte-sonner`, Firebase, dan QRCode.
- `ReviewForm` dan `ReviewGallery` memakai `client:visible`; ini sesuai prinsip Astro untuk menunda JavaScript sampai komponen masuk viewport, tetapi form di atas fold perlu diuji karena customer langsung membutuhkannya.
- `MotionEffects` dan `MusicPlayer` memakai `client:load`; MotionEffects dibutuhkan untuk reveal, tetapi MusicPlayer dapat dievaluasi apakah wajib load segera atau bisa idle setelah first interaction tanpa mengubah UX audio.
- Route `/admin` dan `/qr` hanya memuat island yang relevan dan tidak menambah kerja ke route customer.

### Animasi dan styling

- Reveal sudah menggunakan `opacity` + `transform`, dengan durasi 460ms dan stagger 70/130/190ms.
- Loop dekoratif yang aktif: mascot float 8,6s, sticker breathe 5,4s, scroll badge 2,8s, serta success sparkle/confetti sekitar 1,3–1,5s. Loop ini lebih aman daripada animasi layout karena berbasis transform, tetapi jumlah elemen dan compositing tetap perlu diukur.
- Hover/interaction transition saat ini mengubah `transform`, `box-shadow`, dan background. Box-shadow/background tidak semurah transform/opacity; perlu dipertahankan hanya untuk interaksi singkat dan diprofilkan.
- Terdapat `backdrop-filter: blur(14px)` pada form shell dan `blur(12px)` pada nav menu. Ini adalah kandidat paint/compositing cost paling jelas, terutama mobile Safari/Android low-end.
- `admin-progress span` mengubah `width` saat update, sehingga layout/paint cost perlu dibandingkan dengan transform scaleX bila dashboard sering diperbarui.
- Tidak ditemukan custom wheel/touch scroll handler atau rAF scroll loop. Scroll anchor saat ini `auto`, jadi tidak ada user-agent smooth duration yang terasa berat.

### Prioritas investigasi

1. Uji apakah `backdrop-filter` perlu dikurangi pada mobile/low-power atau diganti background solid semi-transparan.
2. Uji apakah MusicPlayer dapat idle/deferred tanpa mengorbankan fallback audio setelah interaction.
3. Uji jumlah dan durasi ambient loops pada high-refresh dan low-end device; jangan menambahkan `will-change` global.
4. Uji `client:visible` pada form di viewport awal dengan Lighthouse/trace agar tidak menimbulkan delay input.
5. Uji progress bar berbasis transform hanya bila memang terlihat dalam alur admin.

## Sumber 17 — Motion.dev: Animation performance
URL: https://motion.dev/docs/performance

Temuan kunci: Motion menjelaskan layout → paint → composite, frame budget sekitar 16,7ms pada 60fps dan sekitar 8ms pada 120fps, serta bahwa `transform` dan `opacity` adalah property paling aman untuk animasi lintas device. `box-shadow` dan `border-radius` dapat membutuhkan paint mahal; layer promotion dan `will-change` memiliki biaya GPU/memory. JavaScript animation selalu berjalan di main thread, sedangkan CSS/WAAPI dapat menjalankan sebagian animasi di compositor.

Implikasi awal: dependency `motion` di package Lilycosrent tidak otomatis membuat semua animasi lebih cepat. Untuk UI sederhana, CSS transition/keyframes pada transform/opacity lebih ringan dan lebih sedikit JS. Motion/WAAPI layak dipakai bila perlu orchestration, spring, atau gesture kompleks yang benar-benar diuji.

## Sumber 18 — GitHub: darkroomengineering/lenis
URL: https://github.com/darkroomengineering/lenis

Temuan kunci: Lenis mengimplementasikan custom smooth scroll dengan loop `requestAnimationFrame`, menerima wheel/touch events, dan memiliki opsi nested scroll serta respect reduced motion. Repository-nya sendiri menyatakan custom smooth scroll cocok bila membutuhkan parallax, WebGL sync, atau scroll snapping; jika tidak, native scroll lebih sederhana, kompatibel, dan mengurangi risiko performa/accessibility.

Implikasi awal: Lenis atau engine sejenis tidak cocok sebagai default Lilycosrent hanya demi klaim 240 FPS++ karena halaman ini tidak membutuhkan WebGL/parallax. Ia dapat membuat scroll terasa berat bila easing terlalu panjang, menambah main-thread work, serta menuntut pengujian iOS Safari, Android WebView, Firefox, dan nested scrolling.

## Audit dependency tambahan

`motion` dan `@formkit/auto-animate` tercantum di `package.json` tetapi tidak ditemukan import di source saat ini. Animasi utama menggunakan CSS/IntersectionObserver, sehingga dua dependency tersebut kandidat pengurangan dependency/bundle jika tidak dibutuhkan fitur lain. `svelte-sonner` dipakai oleh ReviewForm dan Toaster, QRCode dipakai oleh route `/qr`, dan Firebase dipakai oleh gallery serta lazy-loaded submit/admin.

Implikasi: sebelum menghapus dependency, lakukan `npm run build` dan smoke QA, lalu ukur perubahan bundle. Menghapus package yang tidak dipakai dapat mengurangi install/build surface, tetapi tidak otomatis mengubah FPS runtime jika bundler sudah tree-shake module yang tidak diimport.

## Sumber 19 — WHATWG HTML issue #8031: Improve support for refresh rate discovery and control
URL: https://github.com/whatwg/html/issues/8031

Temuan kunci: issue ini menjelaskan bahwa web saat ini tidak menyediakan API browser standar untuk mengetahui expected refresh rate `requestAnimationFrame()` atau mengonfigurasi target rate-nya. Refresh rate dapat berubah karena multi-monitor, battery saver, panas, charger, atau pengaturan user. Benchmark rAF sendiri dapat bias saat CPU/GPU sibuk.

Implikasi utama: website tidak dapat menjamin 240 FPS lintas Android, iOS, desktop, Linux, dan browser. Target yang benar adalah refresh-rate-aware rendering, timestamp-based animation, low work per frame, dan adaptasi bila refresh rate/device berubah. Tidak boleh mendesain acceptance criteria berdasarkan angka 240 pada semua environment.

## Sumber 20 — WebKit Explainer: Controlling Animation Frame Rate
URL: https://github.com/WebKit/explainers/tree/main/animation-frame-rate

Temuan kunci: WebKit mengusulkan `Animation.frameRate` serta `document.timeline.maximumFrameRate` untuk meminta rate yang selaras dengan display, termasuk rate lebih tinggi atau lebih rendah. Explainer menyebut nilai pembagian bulat dari maximum frame rate biasanya paling masuk akal. Proposal ini masih berupa explainer/standardization work, bukan API lintas browser yang dapat dijadikan dependency production universal.

Implikasi utama: jangan mengandalkan API eksperimental untuk Lilycosrent. CSS/WAAPI/rAF native tetap harus adaptif dan graceful fallback; fitur khusus 240Hz hanya dapat menjadi progressive enhancement setelah feature detection dan cross-browser testing.

## Sumber 21 — web.dev: Optimize web fonts
URL: https://web.dev/learn/performance/optimize-web-fonts

Temuan kunci: font web dapat memengaruhi FCP dan rendering; `font-display: block` dapat menahan text, `swap` menampilkan fallback segera lalu mengganti font, sedangkan `optional` membatasi penggunaan font bila tidak cepat tersedia. WOFF2 adalah format modern yang cukup untuk browser modern; subset dan self-hosting dapat mengurangi payload serta ketergantungan network.

Implikasi awal: Google Fonts Baloo 2/Nunito adalah kandidat optimasi terbesar untuk first paint. Lilycosrent dapat mengukur versi CDN saat ini versus self-hosted WOFF2 subset, memakai font-display yang tepat, dan menjaga fallback metrics agar layout tidak meloncat. Ini lebih berpengaruh pada perceived smoothness awal daripada mengejar FPS ambient.

## Sumber 22 — web.dev: Browser-level image lazy loading
URL: https://web.dev/articles/browser-level-image-lazy-loading

Temuan kunci: browser-level `loading="lazy"` menunda image offscreen, sementara resource priority dan ukuran/dimensi image perlu dipilih sesuai posisi image. Image above-the-fold tidak boleh ditunda secara membabi buta; image offscreen lebih aman di-lazy-load, dan atribut dimensi membantu mencegah layout shift.

Implikasi awal: chibi greeting dan avatar header yang terlihat awal tetap eager dengan width/height yang sudah ada; asset Wall of Love dan asset offscreen dapat lazy. WebP yang sudah dipakai adalah arah tepat, tetapi perlu audit ukuran responsive dan preload hanya untuk LCP candidate.

## Sumber 23 — web.dev: Fast playback with audio and video preload
URL: https://web.dev/articles/fast-playback-with-preload

Temuan kunci: `preload` adalah hint yang dapat diabaikan browser; `auto` berpotensi mengunduh banyak data, sedangkan `none` menunda resource sampai dibutuhkan. Link preload cocok untuk media kecil yang benar-benar critical, tetapi preload berlebihan dapat bersaing dengan resource utama dan koneksi.

Implikasi awal: Cupid 2,7MB dengan `preload="none"` adalah pilihan aman untuk halaman review. Autoplay/fallback setelah interaksi perlu dipertahankan, tetapi tidak boleh mengorbankan form initial load. Jangan preload audio hanya demi membuat first-play lebih cepat kecuali ada bukti UX membutuhkannya.

## Sumber 24 — web.dev: Code-split JavaScript
URL: https://web.dev/learn/performance/code-split-javascript

Temuan kunci: parsing dan execution JavaScript dapat memblokir main thread sehingga elemen terlihat tetapi tidak responsif. Code splitting dan dynamic `import()` memuat JavaScript saat fitur benar-benar digunakan; Astro client directives membantu pemisahan island. Lighthouse memberi sinyal ketika JavaScript execution terlalu lama, dan Coverage/Performance panel membantu menemukan code yang tidak terpakai.

Implikasi awal: lazy Firebase submit/admin sudah sesuai prinsip. `ReviewGallery` realtime dan Toaster perlu diukur; MotionEffects sebaiknya tetap kecil dan tidak mengimpor library animation besar. Dependency `motion`/`auto-animate` yang tidak diimport sebaiknya dipertimbangkan untuk dihapus pada implementasi berikutnya.
