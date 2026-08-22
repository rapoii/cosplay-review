<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import { getReviewUrl } from '../lib/site';

  let canvas: HTMLCanvasElement;
  let reviewUrl = $state('');
  let qrReady = $state(false);
  let qrError = $state(false);
  let copyFeedback = $state(false);

  onMount(async () => {
    reviewUrl = getReviewUrl(window.location.origin);
    try {
      await QRCode.toCanvas(canvas, reviewUrl, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#4a2941', light: '#ffffff' }
      });
      canvas.style.removeProperty('width');
      canvas.style.removeProperty('height');
      qrReady = true;
    } catch (error) {
      qrError = true;
      console.error('QR generation failed:', error);
    }
  });

  function downloadQr() {
    if (!qrReady || typeof window === 'undefined') return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'lilycosrent-review-qr.png';
      link.href = objectUrl;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }, 'image/png');
  }

  async function copyLink() {
    if (!reviewUrl || typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(reviewUrl);
      copyFeedback = true;
      setTimeout(() => {
        copyFeedback = false;
      }, 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  function shareTemplate() {
    if (!reviewUrl || typeof window === 'undefined') return;
    const message = [
      'Haii bestie, makasih sudah rental kostum di Lilycosrent ♡',
      'Kalau sudah senggang, boleh bantu luangkan 1 menit untuk isi ulasan singkat di sini yaa:',
      reviewUrl,
      'Cerita & rating dari kamu berharga banget buat kami! ✦'
    ].join('\n\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="qr-workspace-modern" aria-labelledby="qr-main-title">
  <!-- Left Side: Interactive Hub / Actions -->
  <div class="qr-hub-pane">
    <div class="qr-hub-header">
      <span class="hub-pill">
        <span class="hub-pill-dot"></span>
        RENTAL PACKAGE KIT
      </span>
      <h2 id="qr-main-title">Sisipkan sentuhan <em>hangat</em> di setiap paket.</h2>
      <p class="hub-description">
        Cetak kartu ucapan estetik ini untuk diselipkan ke dalam box rental, atau bagikan link QR langsung ke WhatsApp pelanggan setelah selesai sewa.
      </p>
    </div>

    <div class="qr-hub-features">
      <div class="feature-item">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9V2h12v7"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect width="12" height="8" x="6" y="14"/>
          </svg>
        </div>
        <div class="feature-text">
          <strong>A6 Print-Ready Standard</strong>
          <span>Ukuran pas (105×148mm) untuk postcard atau thank you card.</span>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div class="feature-text">
          <strong>Instant Scan to Review</strong>
          <span>Otomatis scroll langsung ke formulir rating &amp; ulasan.</span>
        </div>
      </div>
    </div>

    <div class="qr-hub-actions">
      <button class="action-btn-primary" type="button" onclick={() => window.print()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Cetak Kartu Sekarang (A6)</span>
      </button>

      <div class="action-btn-group">
        <button class="action-btn-secondary" type="button" onclick={downloadQr} disabled={!qrReady} title="Download file QR Code">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          <span>Download QR</span>
        </button>

        <button class="action-btn-secondary" type="button" onclick={copyLink} disabled={!reviewUrl} title="Salin tautan form review">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>{copyFeedback ? 'Tersalin! ♡' : 'Salin Link'}</span>
        </button>
      </div>

      <button class="action-btn-whatsapp" type="button" onclick={shareTemplate} disabled={!reviewUrl}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.764.847 2.796.847 3.18 0 5.767-2.586 5.768-5.766.001-3.182-2.585-5.769-5.768-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
        <span>Kirim Template ke WhatsApp</span>
      </button>
    </div>

    {#if qrError}
      <div class="qr-alert-error" role="alert">
        <span>⚠️ Gagal memuat QR Code. Coba muat ulang halaman.</span>
      </div>
    {/if}
  </div>

  <!-- Right Side: Beautiful Physical Card Live Preview -->
  <div class="qr-preview-pane">
    <div class="qr-preview-badge">Live Card Preview (A6)</div>

    <article class="postcard-card" aria-label="Kartu ucapan dan review Lilycosrent">
      <!-- Decorative background effects -->
      <div class="postcard-deco deco-tl" aria-hidden="true">✦</div>
      <div class="postcard-deco deco-tr" aria-hidden="true">♡</div>
      <div class="postcard-deco deco-br" aria-hidden="true">✦</div>
      <div class="postcard-deco deco-bl" aria-hidden="true">♡</div>

      <!-- Card Top / Brand -->
      <header class="postcard-header">
        <div class="postcard-brand">
          <div class="brand-avatar-box">
            <img src="/lilycosrent-avatar-square.webp" alt="Lilycosrent" width="512" height="512" loading="eager" decoding="async" />
          </div>
          <div class="brand-titles">
            <span class="brand-name">lilycosrent_</span>
            <span class="brand-tagline">cosplay &amp; costume rental</span>
          </div>
        </div>
        <div class="postcard-stamp">
          <span>THANKS ♡</span>
        </div>
      </header>

      <!-- Card Body / Invitation -->
      <div class="postcard-body">
        <span class="postcard-kicker">Special for you ♡</span>
        <h3 class="postcard-title">Gimana pengalamanmu, <em>bestie?</em></h3>
        <p class="postcard-subtitle">Bantu kami bikin pengalaman rental makin nyaman &amp; seru lewat cerita singkat kamu.</p>
        
        <div class="postcard-qr-wrapper">
          <div class="postcard-qr-box">
            <canvas bind:this={canvas} width="360" height="360" aria-label="QR Code formulir review Lilycosrent"></canvas>
          </div>
          <div class="postcard-qr-hint">
            <span class="hint-sparkle">✦</span>
            <span>Arahkan kamera HP ke QR Code</span>
            <span class="hint-sparkle">✦</span>
          </div>
        </div>
      </div>

      <!-- Card Footer -->
      <footer class="postcard-footer">
        <div class="footer-coverage">
          <span class="coverage-dot"></span>
          <span>Serang · Tangerang · Jabodetabek</span>
        </div>
        <div class="footer-ig">
          <span>Instagram: <strong>@lilycosrent_</strong></span>
        </div>
      </footer>
    </article>
  </div>
</section>
