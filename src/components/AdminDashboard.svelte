<script lang="ts">
  import { onMount } from 'svelte';

  type Review = {
    rating_quality?: number;
    rating_service?: number;
    rating_speed?: number;
  };

  const ADMIN_KEY = '.gaktau123';
  const metrics = [
    { key: 'rating_quality', label: 'Kualitas kostum', icon: '✦', tone: 'pink' },
    { key: 'rating_service', label: 'Keramahan admin', icon: '♡', tone: 'lavender' },
    { key: 'rating_speed', label: 'Kecepatan chat', icon: 'ϟ', tone: 'peach' }
  ] as const;

  let passcode = $state('');
  let isUnlocked = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let reviews = $state<Review[]>([]);
  let lastUpdated = $state('');

  // Cooldown state
  let failCount = $state(0);
  let cooldownUntil = $state(0);
  let remainingSeconds = $state(0);
  let cooldownTimer: ReturnType<typeof setInterval> | undefined;

  function getCooldownDuration(fails: number): number {
    if (fails <= 3) return 0;
    // After 3 fails: 3s, then 9s, 15s, 21s... (3 + (fails-3)*6)
    return 3 + (fails - 3) * 6;
  }

  function startCooldown() {
    const duration = getCooldownDuration(failCount);
    if (duration <= 0) return;

    cooldownUntil = Date.now() + duration * 1000;
    remainingSeconds = duration;

    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (left <= 0) {
        remainingSeconds = 0;
        if (cooldownTimer) clearInterval(cooldownTimer);
        cooldownTimer = undefined;
      } else {
        remainingSeconds = left;
      }
    }, 250);
  }

  function safeRating(value?: number) {
    return Math.max(0, Math.min(5, Number(value) || 0));
  }

  function unlock() {
    if (remainingSeconds > 0) {
      errorMessage = `Tunggu ${remainingSeconds} detik sebelum mencoba lagi.`;
      return;
    }

    if (passcode.trim() !== ADMIN_KEY) {
      failCount++;
      const duration = getCooldownDuration(failCount);
      if (duration > 0) {
        startCooldown();
        errorMessage = `Kode salah. Tunggu ${duration} detik sebelum mencoba lagi.`;
      } else {
        errorMessage = 'Kode belum cocok. Coba lagi ya.';
      }
      passcode = '';
      return;
    }

    // Success: reset everything
    failCount = 0;
    cooldownUntil = 0;
    remainingSeconds = 0;
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = undefined;
    }
    errorMessage = '';
    isUnlocked = true;
    loadStats();
  }

  async function loadStats() {
    isLoading = true;
    errorMessage = '';

    try {
      const [{ db }, { collection, getDocs }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]);
      const snapshot = await getDocs(collection(db, 'reviews'));
      const firestoreReviews = snapshot.docs
        .map((doc) => doc.data() as Review & { status?: string })
        .filter((review) => !review.status || review.status === 'approved');
      reviews = firestoreReviews;
      lastUpdated = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
    } catch (error) {
      console.error('Error loading admin stats:', error);
      reviews = [];
      lastUpdated = '';
      errorMessage = '';
    } finally {
      isLoading = false;
    }
  }

  function average(key: (typeof metrics)[number]['key']) {
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((sum, review) => sum + safeRating(review[key]), 0);
    return (total / reviews.length).toFixed(1);
  }

  function progressRatio(value: string) {
    return Math.max(0, Math.min(1, Number(value) / 5));
  }

  onMount(() => {
    const key = new URLSearchParams(window.location.search).get('key');
    if (key) {
      passcode = key;
      unlock();
    }
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  });
</script>

{#if !isUnlocked}
  <section class="admin-gate" aria-labelledby="admin-gate-title">
    <div class="admin-gate-icon" aria-hidden="true">✦</div>
    <p class="mini-label"><span aria-hidden="true">♡</span> OWNER CORNER</p>
    <h2 id="admin-gate-title">Lily's review stats</h2>
    <p>Masukkan kode sederhana untuk melihat ringkasan ulasan customer.</p>
    <form class="admin-key-form" onsubmit={(event) => { event.preventDefault(); unlock(); }}>
      <label for="admin-key">Kode admin</label>
      <input id="admin-key" type="password" bind:value={passcode} placeholder="Masukkan kode" autocomplete="current-password" disabled={remainingSeconds > 0} />
      <button class="submit-button" type="submit" disabled={remainingSeconds > 0}>
        {#if remainingSeconds > 0}
          Tunggu {remainingSeconds}s...
        {:else}
          Buka dashboard <span aria-hidden="true">↗</span>
        {/if}
      </button>
    </form>
    {#if errorMessage}<p class="admin-error" role="alert">{errorMessage}</p>{/if}
    <p class="admin-disclaimer">Gate ini dibuat sebagai akses praktis untuk dashboard sederhana, bukan sistem keamanan untuk data sensitif.</p>
  </section>
{:else}
  <section class="admin-dashboard" aria-labelledby="admin-title">
    <div class="admin-dashboard-head">
      <div>
        <p class="mini-label"><span aria-hidden="true">✦</span> PRIVATE REVIEW STATS</p>
        <h2 id="admin-title">Haii, Lilycosrent!</h2>
        <p>Ringkasan suara customer yang sudah masuk ke Wall of Love.</p>
      </div>
      <button class="admin-refresh-button" type="button" onclick={loadStats} disabled={isLoading}>
        {isLoading ? 'Memuat...' : 'Refresh ↻'}
      </button>
    </div>

    {#if errorMessage}<p class="admin-error" role="alert">{errorMessage}</p>{/if}

    <div class="admin-total-card">
      <div>
        <span class="admin-card-label">Total ulasan masuk</span>
        <strong>{reviews.length}</strong>
        <small>{reviews.length === 1 ? 'cerita customer' : 'cerita customer'}</small>
      </div>
      <span class="admin-total-heart" aria-hidden="true">♡</span>
    </div>

    <div class="admin-metric-grid">
      {#each metrics as metric}
        <article class={`admin-metric-card ${metric.tone}`}>
          <div class="admin-metric-top">
            <span class="rating-icon" class:lightning-icon={metric.key === 'rating_speed'} aria-hidden="true">{metric.icon}</span>
            <span class="admin-card-label">{metric.label}</span>
          </div>
          <strong>{average(metric.key)}<small>/5</small></strong>
          <div class="admin-progress" aria-label={`Rata-rata ${average(metric.key)} dari 5`}>
            <span style={`--progress-scale: ${progressRatio(average(metric.key))}`}></span>
          </div>
          <p>{Number(average(metric.key)) >= 4.5 ? 'Bestie paling suka banget!' : Number(average(metric.key)) >= 3.5 ? 'Sudah bagus, pertahankan yaa.' : 'Bisa jadi bahan evaluasi bersama.'}</p>
        </article>
      {/each}
    </div>

    <div class="admin-dashboard-footer">
      <span>{lastUpdated ? `Terakhir diperbarui ${lastUpdated}` : 'Belum ada data terbaru'}</span>
      <a href="/">Kembali ke halaman review ↗</a>
    </div>
  </section>
{/if}
