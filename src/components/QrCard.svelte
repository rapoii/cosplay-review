<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  let canvas: HTMLCanvasElement;
  let reviewUrl = $state('');
  let qrReady = $state(false);
  let qrError = $state(false);

  onMount(async () => {
    reviewUrl = `${window.location.origin}/#tulis-ulasan`;
    try {
      await QRCode.toCanvas(canvas, reviewUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
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

  function shareTemplate() {
    if (!reviewUrl || typeof window === 'undefined') return;
    const message = [
      'Haii bestie, makasih sudah rental kostum di Lilycosrent ♡',
      'Kalau sudah sempat, boleh bantu isi review singkat di sini yaa:',
      reviewUrl,
      'Cerita kamu berarti banget buat kami ✦'
    ].join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="qr-workspace" aria-labelledby="qr-title">
  <div class="qr-workspace-copy">
    <p class="mini-label"><span aria-hidden="true">✦</span> RENTAL PACKAGE KIT</p>
    <h2 id="qr-title">Sisipkan sedikit <em>love</em> di setiap paket.</h2>
    <p>Print kartu ini atau simpan QR-nya untuk dikirim setelah customer selesai rental. Satu scan langsung menuju form review Lilycosrent.</p>
    <div class="qr-actions">
      <button class="submit-button" type="button" onclick={() => window.print()}>Cetak kartu <span aria-hidden="true">↗</span></button>
      <button class="qr-outline-button" type="button" onclick={downloadQr} disabled={!qrReady}>Download QR PNG</button>
      <button class="qr-outline-button" type="button" onclick={shareTemplate} disabled={!reviewUrl}>Share template WhatsApp ↗</button>
    </div>

    {#if qrError}
      <p class="qr-error" role="status">QR belum siap. Coba refresh halaman ini yaa.</p>
    {/if}
  </div>

  <article class="rental-card" aria-label="Kartu review Lilycosrent untuk paket rental">
    <div class="rental-card-decoration rental-decoration-one" aria-hidden="true">✦</div>
    <div class="rental-card-decoration rental-decoration-two" aria-hidden="true">♡</div>
    <div class="rental-card-brand">
      <span class="brand-avatar" aria-hidden="true"><img src="/lilycosrent-avatar-square.webp" alt="" width="512" height="512" loading="eager" decoding="async" /></span>
      <span><strong>lilycosrent_</strong></span>
    </div>
    <div class="rental-card-main">
      <p class="rental-card-kicker">makasih sudah rental ♡</p>
      <h3>Gimana pengalamanmu,<br /><em>bestie?</em></h3>
      <p>Bantu kami bikin pengalaman rental makin nyaman dengan cerita singkat kamu.</p>
      <div class="qr-frame">
        <canvas bind:this={canvas} width="320" height="320" aria-label="QR code menuju form review Lilycosrent"></canvas>
      </div>
    </div>
    <div class="rental-card-bottom">
      <strong class="rental-card-cta">Scan untuk kasih review ✦</strong>
      <div class="rental-card-footer"><span>Serang · Tangerang · Jabodetabek</span><span>@lilycosrent_</span></div>
    </div>
  </article>
</section>
