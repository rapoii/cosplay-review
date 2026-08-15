# Deep Research: Animasi dan Scroll Web Sangat Smooth pada 60–240Hz

**Proyek:** Lilycosrent Cosplay Review
**Stack:** Astro 7, Svelte 5, Firebase Firestore
**Status:** Riset dan rekomendasi; belum menerapkan perubahan baru ke source setelah riset
**Penulis:** Manus AI

## Ringkasan eksekutif

Permintaan “240 FPS++ di semua device dan browser” tidak dapat dijamin secara teknis oleh website. **FPS adalah hasil kerja sama antara browser, compositor, GPU, OS, refresh rate layar, thermal state, battery saver, dan beban halaman.** Browser umumnya menjadwalkan `requestAnimationFrame()` mengikuti refresh rate display, tetapi web platform tidak menyediakan API universal untuk mengetahui atau mengunci target refresh rate tersebut. Bahkan refresh rate perangkat dapat berubah ketika jendela berpindah monitor, baterai hemat, perangkat panas, laptop tidak tersambung charger, atau sistem menurunkan refresh rate secara dinamis.[3] [19]

Pada layar 60Hz, satu frame memiliki waktu sekitar **16,67ms**. Pada 120Hz waktunya turun menjadi **8,33ms**, 144Hz sekitar **6,94ms**, dan 240Hz hanya **4,17ms**. Angka 240Hz bukan berarti browser selalu dapat menyajikan 240 frame; satu layout, paint, JavaScript task, atau operasi GPU yang melewati 4,17ms dapat membuat frame terlewat. Karena itu, sasaran teknis yang benar untuk Lilycosrent adalah **refresh-rate-aware smoothness**: animasi mengikuti kemampuan device secara alami, frame pacing stabil, input cepat, scroll manual native, dan dekorasi diturunkan ketika output atau daya terbatas.

> “The scrolling box scrolls in a smooth fashion using a user-agent-defined easing function over a user-agent-defined period of time.” — MDN tentang `scroll-behavior: smooth`.[9]

Kutipan ini menjelaskan mengapa smooth scroll global sebelumnya terasa berat: durasi dan easing ditentukan browser, bukan oleh kode kita. Untuk halaman form review, rekomendasi riset adalah mempertahankan **native user scroll** dan perpindahan anchor yang langsung atau sangat singkat. Custom engine seperti Lenis hanya layak apabila Lilycosrent benar-benar membutuhkan parallax, WebGL synchronization, atau scroll snapping kompleks; repository Lenis sendiri membedakan use case tersebut dari halaman yang cukup memakai native scroll.[18]

## Kesimpulan utama untuk Lilycosrent

| Pertanyaan | Kesimpulan riset |
| --- | --- |
| Apakah 240 FPS dapat dipaksa di semua device? | Tidak. Browser tidak menyediakan kontrol universal untuk mengunci refresh rate. Target harus adaptif terhadap display dan kondisi device.[3] [19] |
| Apakah 240 FPS selalu berarti lebih smooth? | Tidak. Smoothness juga dipengaruhi dropped frames, frame pacing, missing paint, long tasks, dan input latency.[5] [6] |
| Apa strategi animasi paling aman? | CSS/WAAPI pada `transform` dan `opacity`; hindari perubahan layout pada frame loop.[1] [4] [17] |
| Apa strategi scroll terbaik? | Native scroll. Hindari custom wheel/touch interception dan inertia global karena dapat menambah main-thread work serta rasa berat.[9] [10] [18] |
| Apakah harus memakai Motion/GSAP/Lenis? | Tidak untuk UI Lilycosrent saat ini. CSS dan IntersectionObserver sudah cukup; library tambahan hanya untuk kebutuhan kompleks yang terbukti.[17] [18] |
| Apa yang dimaksud full optimization? | Bukan hanya FPS: hydration, JavaScript parsing, fonts, images, audio, blur, memory, power, INP, LCP, CLS, dan cross-browser testing.[7] [11] [12] [21] [22] [23] [24] |

## 1. Realitas teknis target 240 FPS

`requestAnimationFrame()` adalah callback one-shot yang biasanya mengikuti refresh rate display. MDN mencatat 60Hz sebagai rate umum, dengan 75Hz, 120Hz, dan 144Hz juga digunakan; callback biasanya dipause pada background tab atau iframe tersembunyi untuk menghemat performa dan baterai.[3] Jika display berjalan 240Hz dan browser benar-benar menjadwalkan callback pada rate tersebut, animasi dapat menerima peluang update hingga 240 kali per detik. Namun, hal itu bukan kontrak lintas browser.

Issue WHATWG tentang refresh-rate discovery dan control secara eksplisit menjelaskan bahwa belum ada API browser standar untuk mengetahui expected rate rAF atau mengonfigurasi target rate-nya. Issue tersebut juga mencatat kondisi dinamis seperti multi-monitor, battery saver, panas, charger, dan perubahan pengaturan display.[19] WebKit memang memiliki explainer untuk `Animation.frameRate` dan `document.timeline.maximumFrameRate`, tetapi itu masih proposal/explainer, bukan fondasi production lintas Chrome, Safari, Firefox, Android, iOS, Windows, macOS, dan Linux.[20]

**Konsekuensinya:** kita tidak boleh menulis loop “240 FPS” dengan `setInterval(4.16)` atau memaksa rAF berulang. Pendekatan tersebut dapat memboroskan CPU, tidak sinkron dengan vsync, salah timing pada high-refresh display, dan tetap tidak bisa membuat layar 60Hz menampilkan 240 frame berbeda. Untuk animasi imperative, gunakan timestamp rAF; untuk dekorasi UI sederhana, gunakan CSS/WAAPI agar browser dapat memilih jalur compositor yang tersedia.[3] [4] [17]

## 2. Prinsip rendering yang benar

Browser melewati tahap recalculate style, layout, paint, lalu composition ketika halaman berubah. Property yang mengubah geometry atau posisi, seperti `left`, `width`, `margin`, `font-size`, dan `border-width`, dapat memicu layout dan repaint. `transform` serta `opacity` dapat ditangani pada tahap composition jika browser menempatkan elemen pada layer yang sesuai.[4]

web.dev dan Motion.dev sama-sama menempatkan `transform` dan `opacity` sebagai pilihan paling aman untuk animasi. Sebaliknya, `box-shadow`, `border-radius`, `filter`, dan `backdrop-filter` dapat membawa biaya paint yang lebih besar, terutama ketika area yang dicat luas atau jumlah elemennya banyak.[1] [17] Hal ini tidak berarti semua `box-shadow` atau blur harus dihapus; efek tersebut sebaiknya dipakai sebagai dekorasi statis atau transition singkat, kemudian diukur pada perangkat yang lemah.

`will-change` bukan tombol “GPU turbo”. MDN menyarankan penggunaannya sebagai **last resort** setelah masalah nyata ditemukan melalui profiling. Menerapkannya ke terlalu banyak elemen dapat meningkatkan memory/GPU overhead dan malah memperlambat halaman.[16] Lilycosrent tidak sebaiknya menambahkan `will-change: transform` ke semua card, sparkle, tombol, dan chibi.

## 3. Scroll: halus, responsif, tetapi tidak berat

`scroll-behavior: smooth` hanya mengatur scrolling yang dipicu navigation atau DOM scrolling; durasi dan easing-nya ditentukan user-agent. Nilai `auto` membuat scrolling box berpindah instan, sedangkan scroll yang dilakukan langsung oleh user tetap mengikuti perilaku native browser.[9] Ini cocok dengan temuan pada website Lilycosrent: anchor global smooth sebelumnya membutuhkan sekitar setengah detik atau lebih untuk berpindah ke Wall of Love, sehingga terasa lambat.

MDN juga mengingatkan bahwa `scroll` event dapat menembak dengan frekuensi tinggi dan handler-nya tidak boleh melakukan operasi DOM mahal. Membungkus handler scroll dengan rAF saja tidak menyelesaikan masalah karena scroll event dan rAF dapat berjalan pada rate yang sama; untuk reveal berbasis threshold, `IntersectionObserver` lebih tepat.[10] `MotionEffects.svelte` Lilycosrent sudah menggunakan IntersectionObserver dan tidak memiliki custom wheel/touch handler atau rAF scroll loop.

Lenis adalah repository yang baik untuk memahami custom smooth scroll: ia memakai loop rAF, menangani wheel/touch, nested scroll, dan reduced motion. Namun README-nya sendiri menyatakan custom smooth scrolling terutama berguna untuk parallax, WebGL sync, dan scroll snapping. Jika fitur-fitur tersebut tidak diperlukan, native scroll lebih sederhana, lebih kompatibel, dan lebih kecil risikonya untuk accessibility/performance.[18]

**Rekomendasi scroll Lilycosrent:**

| Area | Rekomendasi |
| --- | --- |
| Scroll jari, wheel, trackpad | Biarkan native browser; jangan intersep wheel/touch secara global. |
| Link ke `#ulasan` | Gunakan `scroll-behavior: auto` atau transisi yang sangat singkat hanya bila benar-benar diperlukan. |
| Reveal Wall of Love | Gunakan IntersectionObserver, bukan scroll listener. |
| Parallax | Jangan tambahkan; tidak memberi nilai besar untuk form review dan berisiko mengurangi readability. |
| Custom engine Lenis/Locomotive | Tidak direkomendasikan sebagai default. Hanya eksperimen terisolasi jika ada kebutuhan visual khusus. |
| Reduced motion | Hapus scroll animation dan loop dekoratif ketika `prefers-reduced-motion: reduce`. |

## 4. Audit terhadap source Lilycosrent

Astro sudah mengirim HTML statis dan memakai hydration island. `ReviewForm` dan `ReviewGallery` menggunakan `client:visible`; `MotionEffects` dan `MusicPlayer` menggunakan `client:load`. Astro mendefinisikan `client:load` sebagai hydration segera, `client:idle` setelah initial load dan idle callback, sedangkan `client:visible` menggunakan IntersectionObserver ketika komponen masuk viewport.[7]

`ReviewGallery client:visible` adalah keputusan yang baik karena Wall of Love berada di bawah form. `ReviewForm client:visible` perlu diuji secara khusus: ia muncul di atas fold dan merupakan alasan utama customer membuka halaman. Jika pada device tertentu ada delay sebelum input bisa disentuh, kandidat perbaikannya adalah `client:load` untuk form saja, dengan konsekuensi JavaScript form masuk critical path. Ini harus diputuskan berdasarkan trace, bukan asumsi.

`MotionEffects.svelte` hanya mengambil elemen `[data-reveal]`, menambahkan class, dan mengamati IntersectionObserver. Itu jauh lebih ringan daripada library parallax atau loop scroll. `MusicPlayer` sebaiknya tetap tidak mem-preload audio karena Cupid berukuran sekitar 2,7MB dan audio bukan critical content. web.dev menjelaskan bahwa `preload` hanyalah hint dan `auto` dapat mengambil banyak data; `none` menunda resource sampai dibutuhkan.[23]

### Kandidat biaya terbesar yang perlu diprofilkan

| Kandidat saat ini | Risiko | Arah investigasi |
| --- | --- | --- |
| `backdrop-filter: blur(14px)` pada form shell | Paint/compositing mahal pada Safari mobile dan Android low-end | Bandingkan blur, background semi-transparan solid, dan blur hanya pada fast-update device. |
| `backdrop-filter: blur(12px)` pada dropdown | Biaya hanya saat menu dibuka, tetapi dapat menambah paint spike | Pertahankan jika trace aman; fallback solid pada `update: slow`. |
| Success sparkle/confetti loops | Beberapa loop dekoratif aktif bersamaan setelah submit | Gunakan finite animation atau matikan loop setelah beberapa siklus; utamakan feedback statis. |
| Hover `box-shadow` dan background | Paint singkat pada pointer device | Pertahankan dengan durasi singkat; hilangkan hover pada touch/slow update. |
| Progress bar mengubah `width` | Bisa memicu layout/paint saat statistik berubah | Uji `transform: scaleX()` bila dashboard sering refresh. |
| Google Fonts CDN | Network/font rendering dapat memengaruhi FCP dan layout shift | Uji self-hosted subset WOFF2 dengan fallback metrics dan `font-display`. |
| Dependency `motion` dan `@formkit/auto-animate` | Tidak ditemukan import di source current | Ukur build lalu hapus jika memang tidak dipakai. |

Svelte juga mengingatkan agar `$state` hanya dipakai untuk nilai yang benar-benar reaktif; object/array deeply reactive memiliki overhead proxy, sementara `$derived` lebih tepat untuk nilai turunan dan `$effect` sebaiknya tidak menjadi default.[8] State form Lilycosrent kecil dan aman, tetapi gallery realtime perlu diperhatikan jika jumlah review bertambah besar.

## 5. Strategi adaptif untuk semua device dan browser

Strategi terbaik bukan membuat satu animasi 240 FPS yang dipaksakan ke semua device, melainkan **progressive motion**. CSS media feature `(update: fast)` menunjukkan output yang tidak unusually constrained sehingga regular CSS animations dapat digunakan, sementara `(update: slow)` menandakan output tidak mampu menampilkan perubahan cukup cepat untuk smooth animation.[13] Feature ini lebih portable daripada menebak kemampuan dari `hardwareConcurrency` atau `deviceMemory` saja.

Lilycosrent dapat memakai tiga profil berikut.

| Profil | Kondisi | Motion | Scroll | Efek visual |
| --- | --- | --- | --- | --- |
| Baseline | Semua browser/device | Transform/opacity, finite transition, no long loop | Native | Form dan feedback tetap lengkap |
| Fast update | Output mendukung update cepat dan reduced motion tidak aktif | Ambient mascot/sticker dengan durasi lambat, bukan loop 240 paksa | Native | Blur boleh setelah profiling |
| Slow update / save-data / low power | Output terbatas, Data Saver, koneksi lambat, atau hardware terbatas | Matikan loop dekoratif dan blur berat | Native tanpa animation | Background solid, feedback instan |

`prefers-reduced-motion` harus mengalahkan profil fast. MDN menjelaskan bahwa preferensi ini dapat berasal dari Android, iOS, macOS, Windows, Linux/GTK/KDE, dan Firefox, serta motion besar seperti scaling/panning dapat memicu discomfort bagi pengguna dengan vestibular motion disorders.[14] High FPS tidak boleh dijadikan alasan untuk mengabaikan aksesibilitas.

### Matriks browser/device yang harus diuji

| Keluarga | Contoh target | Fokus pengujian |
| --- | --- | --- |
| Chromium desktop | Chrome/Edge di Windows, macOS, Linux | 60/120/144/240Hz, DevTools Frames, menu, input, high-DPI |
| Firefox desktop | Firefox Windows/macOS/Linux | CSS animation, IntersectionObserver, font fallback, reduced motion |
| Safari desktop | Safari macOS | Backdrop blur, font rendering, audio fallback, scroll anchor |
| iOS | Safari dan WebView | Touch scroll, autoplay policy, memory, safe area, reduced motion |
| Android | Chrome dan WebView | Save Data, thermal throttling, low memory, touch input, font/image loading |
| Samsung/Chromium variant | Samsung Internet bila customer menggunakannya | CSS compatibility, audio, QR canvas, nav dropdown |

Tidak ada satu sandbox browser yang dapat membuktikan semua kombinasi tersebut. Preview lokal dan Playwright cocok untuk regression/smoke testing, tetapi high-refresh frame pacing dan mobile Safari tetap perlu diuji pada hardware nyata atau remote device lab.

## 6. Full optimization yang realistis

Full optimization harus dimulai dari critical path. Astro client directives dan dynamic import sudah membantu memecah JavaScript; web.dev menjelaskan bahwa parsing/compile/execute JavaScript dapat memblokir main thread sehingga elemen tampak tetapi belum responsif. Code splitting menurunkan kerja startup dan input delay.[24]

Font juga penting. web.dev mencatat font web dapat memengaruhi FCP dan rendering; `font-display: swap` menampilkan fallback lebih cepat, `optional` dapat menghindari visual shift bila font terlambat, dan WOFF2/subset/self-hosting dapat mengurangi payload.[21] Untuk Lilycosrent, self-hosted Baloo 2 dan Nunito subset Latin/Latin-ext layak dibandingkan dengan Google Fonts CDN.

Asset image WebP, dimensi width/height, dan lazy-loading sudah menjadi fondasi yang benar. Image di atas fold tidak boleh ditunda secara membabi buta, sedangkan asset offscreen dapat lazy-load; atribut dimensi mencegah layout shift.[22] Audio Cupid sebaiknya tetap deferred karena bukan critical content.[23]

`content-visibility: auto` dapat melewati layout dan paint subtree offscreen, sementara konten tetap berada di DOM dan accessibility tree.[15] Wall of Love adalah kandidat eksperimen, tetapi perlu `contain-intrinsic-size` yang masuk akal dan pengujian anchor/CLS. Jangan menerapkannya pada form di atas fold.

Untuk observability production, repository GoogleChrome/web-vitals menyediakan library modular untuk LCP, INP, CLS, dan metrik lain; README menyarankan loading yang dapat ditunda setelah code berdampak ke user dimuat.[11] Telemetry opsional dapat menjadi tahap lanjutan, bukan syarat agar animasi terasa smooth.

## 7. Benchmark dan acceptance criteria

Riset menyarankan benchmark berbasis trace, bukan hanya penghitung FPS. Chrome DevTools Performance panel memperlihatkan flame chart, long task di atas 50ms, Frames section, paint, layout, GPU, raster, dan dropped frames.[5] web.dev juga menekankan bahwa smoothness adalah quality/quantity metric dan perlu melihat frame yang benar-benar dipresentasikan, bukan sekadar callback yang dipanggil.[6]

### Skenario benchmark

1. Cold load halaman customer pada koneksi cepat dan throttled mobile.
2. Tap lima nilai bintang pada mobile dan keyboard navigation pada desktop.
3. Mengetik nama, kostum, dan komentar selama initial page load.
4. Membuka dan menutup dropdown navigation berkali-kali.
5. Scroll native dari form ke Wall of Love dengan finger, wheel, dan trackpad.
6. Memicu success state dan share WhatsApp tanpa network response memblokir feedback pertama.
7. Membuka route `/admin` dan `/qr` secara terpisah.
8. Menguji reduced motion, save-data, slow update, dan background tab.

### Acceptance criteria yang disarankan

| Area | Kriteria internal yang disarankan |
| --- | --- |
| Frame pacing | Tidak ada dropped-frame spike yang terlihat pada animasi utama; pada device high-refresh, animasi harus mengikuti kemampuan display tanpa memaksa 240 loop. |
| Frame budget | Trace 60Hz memakai sekitar 16,67ms/frame, 120Hz 8,33ms, 144Hz 6,94ms, dan 240Hz 4,17ms sebagai budget teoritis; hasil harus dilaporkan per device. |
| Input | Tap bintang, buka menu, dan typing harus memberi visual feedback sebelum network/Firebase selesai. Ukur INP, bukan hanya FPS.[12] |
| Scroll | Tidak ada wheel/touch interception global, tidak ada inertia panjang yang membuat user merasa tertahan, dan tidak ada expensive DOM update pada scroll event.[9] [10] |
| Motion property | Animasi runtime baru harus memprioritaskan transform/opacity. Property layout tidak boleh masuk frame loop.[1] [4] |
| Accessibility | `prefers-reduced-motion: reduce` menghapus loop dekoratif dan scroll animation; keyboard/focus tetap bekerja.[14] |
| Startup | Form HTML terlihat sebelum island siap; JS noncritical dan audio tidak memblokir critical path.[7] [23] [24] |
| Layout | Tidak ada layout shift saat font, image, Wall of Love, atau success state muncul. |
| Cross-browser | Lulus pada Chromium, Firefox, Safari desktop, Safari iOS, Chrome Android, serta minimal satu Chromium variant. |

Kriteria di atas adalah **proposal engineering**, bukan standar browser yang menjamin angka tertentu. Device high-end 240Hz dapat diberi kesempatan menampilkan frame lebih banyak secara natural; device 60Hz tidak perlu dan tidak dapat dipaksa menjadi 240 FPS.

## 8. Rencana implementasi yang direkomendasikan

Tahap pertama sebaiknya bukan menambahkan library, melainkan merekam baseline dengan Chrome DevTools Performance dan menguji perangkat nyata. Setelah itu, hapus dependency `motion` dan `@formkit/auto-animate` bila build/QA membuktikan keduanya memang tidak dipakai. Langkah ini mengurangi surface area tanpa mengubah visual.

Tahap kedua adalah memperbaiki critical path: bandingkan `ReviewForm client:visible` dan `client:load`, audit Google Fonts dengan subset WOFF2 serta font-display, dan pertahankan Firebase/audio tetap deferred. Tahap ketiga adalah profil visual: kurangi atau fallback `backdrop-filter` pada `update: slow`, pertahankan transform/opacity, batasi success decoration, dan pertimbangkan `content-visibility` hanya pada Wall of Love setelah uji CLS dan anchor.

Tahap terakhir adalah observability dan cross-device matrix. Jika setelah semua itu diperlukan scroll inertia khusus untuk pengalaman brand, buat eksperimen terpisah dengan durasi pendek, respect reduced-motion, nonaktif pada touch/save-data/slow update, dan bandingkan dengan native scroll. Jangan menjadikan Lenis atau engine serupa sebagai default tanpa bukti bahwa native scroll tidak memenuhi kebutuhan.

## Jawaban langsung untuk target “240 FPS++”

Untuk website Lilycosrent, solusi terbaik bukan **memaksa 240 FPS++**, karena itu tidak portable dan tidak selalu dapat diobservasi secara jujur. Solusi terbaik adalah membuat website **mampu tampil sehalus mungkin pada refresh rate yang tersedia**: HTML/CSS statis sebanyak mungkin, hydration minimal, animasi transform/opacity, compositor-friendly rendering, native scroll, no long tasks, no expensive scroll listener, audio/image/font loading yang terkontrol, dan progressive enhancement berdasarkan `update: fast`, reduced motion, save-data, dan hasil profiling.

Dengan pendekatan itu, monitor 240Hz dapat menerima animasi pada rate tinggi ketika browser/device mampu; layar 120Hz, 90Hz, 60Hz, dan device low-end tetap mendapat gerakan stabil tanpa dipaksa mengejar angka yang tidak dapat dicapai. Inilah bentuk **smooth 240-capable, adaptive, cross-browser**, bukan klaim 240 FPS universal.

## Referensi

[1]: https://web.dev/articles/animations-guide “How to create high-performance CSS animations — web.dev”
[2]: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Fundamentals “Performance fundamentals — MDN”
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame “Window.requestAnimationFrame() — MDN”
[4]: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate “Animation performance and frame rate — MDN”
[5]: https://developer.chrome.com/docs/devtools/performance/reference “Performance features reference — Chrome DevTools”
[6]: https://web.dev/articles/smoothness “Towards an animation smoothness metric — web.dev”
[7]: https://docs.astro.build/en/reference/directives-reference/ “Template directives reference — Astro Docs”
[8]: https://svelte.dev/docs/svelte/best-practices “Best practices — Svelte Docs”
[9]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior “scroll-behavior — MDN”
[10]: https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event “Document: scroll event — MDN”
[11]: https://github.com/GoogleChrome/web-vitals “GoogleChrome/web-vitals — GitHub”
[12]: https://web.dev/articles/inp “Interaction to Next Paint — web.dev”
[13]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/update “update media feature — MDN”
[14]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion “prefers-reduced-motion — MDN”
[15]: https://web.dev/articles/content-visibility “content-visibility — web.dev”
[16]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change “will-change — MDN”
[17]: https://motion.dev/docs/performance “Animation performance — Motion.dev”
[18]: https://github.com/darkroomengineering/lenis “Lenis: Smooth scroll as it should be — GitHub”
[19]: https://github.com/whatwg/html/issues/8031 “Improve support for refresh rate discovery and control — WHATWG HTML issue #8031”
[20]: https://github.com/WebKit/explainers/tree/main/animation-frame-rate “Controlling Animation Frame Rate — WebKit Explainer”
[21]: https://web.dev/learn/performance/optimize-web-fonts “Optimize web fonts — web.dev”
[22]: https://web.dev/articles/browser-level-image-lazy-loading “Browser-level image lazy loading — web.dev”
[23]: https://web.dev/articles/fast-playback-with-preload “Fast playback with audio and video preload — web.dev”
[24]: https://web.dev/learn/performance/code-split-javascript “Code-split JavaScript — web.dev”
