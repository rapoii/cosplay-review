<script lang="ts">
  import { onMount } from 'svelte';
  import { getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
  import { getFirebaseAuth } from '../lib/firebase-auth';
  import QrCard from './QrCard.svelte';

  type Review = {
    rating_quality?: number;
    rating_service?: number;
    rating_speed?: number;
  };

  const metrics = [
    { key: 'rating_quality', label: 'Kualitas kostum', icon: '✦', tone: 'pink' },
    { key: 'rating_service', label: 'Keramahan admin', icon: '♡', tone: 'lavender' },
    { key: 'rating_speed', label: 'Kecepatan chat', icon: 'ϟ', tone: 'peach' }
  ] as const;

  let loginEmail = $state('');
  let loginPassword = $state('');
  let authEmail = $state('');
  let isAuthenticated = $state(false);
  let isAuthReady = $state(false);
  let isAuthLoading = $state(false);
  let isLoading = $state(false);
  let authError = $state('');
  let errorMessage = $state('');
  let reviews = $state<Review[]>([]);
  let lastUpdated = $state('');
  let activeTab = $state<'stats' | 'card'>('stats');
  let adminAuth = $state<Auth | null>(null);

  function safeRating(value?: number) {
    return Math.max(0, Math.min(5, Number(value) || 0));
  }

  async function loadStats() {
    isLoading = true;
    errorMessage = '';

    try {
      const [{ db }, { collection, getDocs, query, where }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]);
      const snapshot = await getDocs(query(collection(db, 'reviews'), where('status', '==', 'approved')));
      reviews = snapshot.docs.map((doc) => doc.data() as Review);
      lastUpdated = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
    } catch (error) {
      console.error('Error loading admin stats:', error);
      reviews = [];
      lastUpdated = '';
      errorMessage = 'Statistik belum dapat dimuat. Periksa koneksi dan Firestore Security Rules.';
    } finally {
      isLoading = false;
    }
  }

  async function handleLogin() {
    if (!loginEmail.trim() || !loginPassword) {
      authError = 'Isi email dan password admin terlebih dahulu.';
      return;
    }

    isAuthLoading = true;
    authError = '';

    try {
      if (!adminAuth) throw new Error('auth-not-ready');
      const credential = await signInWithEmailAndPassword(adminAuth, loginEmail.trim(), loginPassword);
      const token = await getIdTokenResult(credential.user, true);

      if (token.claims.admin !== true) {
        await signOut(adminAuth);
        throw new Error('not-admin');
      }

      authEmail = credential.user.email ?? loginEmail.trim();
      isAuthenticated = true;
      loginPassword = '';
      await loadStats();
    } catch (error) {
      console.error('Admin login failed:', error);
      if (error instanceof Error && error.message === 'not-admin') {
        authError = 'Akun berhasil dikenali, tetapi belum memiliki akses admin.';
      } else {
        authError = 'Email atau password admin tidak cocok.';
      }
    } finally {
      isAuthLoading = false;
    }
  }

  async function logout() {
    try {
      if (!adminAuth) return;
      await signOut(adminAuth);
      isAuthenticated = false;
      authEmail = '';
      reviews = [];
      lastUpdated = '';
      activeTab = 'stats';
    } catch (error) {
      console.error('Admin logout failed:', error);
      authError = 'Logout gagal. Coba muat ulang halaman.';
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
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    const startAuthListener = async () => {
      try {
        const currentAuth = getFirebaseAuth();
        adminAuth = currentAuth;
        unsubscribe = onAuthStateChanged(currentAuth, async (user) => {
          if (disposed) return;
          isAuthReady = true;
          authError = '';

          if (!user) {
            isAuthenticated = false;
            authEmail = '';
            return;
          }

          try {
            const token = await getIdTokenResult(user, true);
            if (token.claims.admin !== true) {
              await signOut(adminAuth);
              authError = 'Akun ini belum memiliki akses admin.';
              return;
            }
            authEmail = user.email ?? '';
            isAuthenticated = true;
            await loadStats();
          } catch (error) {
            console.error('Admin session validation failed:', error);
            await signOut(adminAuth);
            authError = 'Sesi admin tidak dapat divalidasi.';
          }
        });
      } catch (error) {
        if (!(error instanceof Error && error.message === 'firebase-config-missing')) {
          console.error('Firebase Auth initialization failed:', error);
        }
        isAuthReady = true;
        authError = 'Autentikasi admin belum siap. Periksa konfigurasi Firebase.';
      }
    };

    void startAuthListener();

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  });
</script>

{#if !isAuthReady}
  <section class="admin-gate" aria-live="polite">
    <div class="admin-gate-icon" aria-hidden="true">✦</div>
    <p class="mini-label"><span aria-hidden="true">♡</span> OWNER CORNER</p>
    <h1 id="admin-gate-title">Memuat akses admin</h1>
    <p>Memeriksa sesi aman kamu sebentar yaa.</p>
  </section>
{:else if !isAuthenticated}
  <section class="admin-gate" aria-labelledby="admin-gate-title">
    <div class="admin-gate-icon" aria-hidden="true">✦</div>
    <p class="mini-label"><span aria-hidden="true">♡</span> OWNER CORNER</p>
    <h1 id="admin-gate-title">Lily's review stats</h1>
    <p>Masuk dengan akun admin Firebase untuk melihat statistik ulasan dan kit kartu QR.</p>
    <form class="admin-key-form" onsubmit={(event) => { event.preventDefault(); void handleLogin(); }}>
      <label for="admin-email">Email admin</label>
      <input id="admin-email" type="email" bind:value={loginEmail} placeholder="admin@contoh.com" autocomplete="username" required disabled={isAuthLoading} />
      <label for="admin-password">Password</label>
      <input id="admin-password" type="password" bind:value={loginPassword} placeholder="Masukkan password" autocomplete="current-password" required disabled={isAuthLoading} />
      <button class="submit-button" type="submit" disabled={isAuthLoading}>
        {isAuthLoading ? 'Memeriksa...' : 'Buka dashboard'} <span aria-hidden="true">↗</span>
      </button>
    </form>
    {#if authError}<p class="admin-error" role="alert" aria-live="assertive">{authError}</p>{/if}
    <p class="admin-disclaimer">Akses hanya diberikan kepada akun Firebase yang memiliki custom claim <code>admin: true</code>. Password tidak disimpan di aplikasi.</p>
  </section>
{:else}
  <div class="admin-layout-wrapper">
    <h1 class="sr-only">Dashboard admin Lilycosrent</h1>
    <div class="admin-subtabs" role="tablist" aria-label="Bagian dashboard admin">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'stats'}
        class="admin-tab-btn"
        class:active={activeTab === 'stats'}
        onclick={() => activeTab = 'stats'}
      >
        <span aria-hidden="true">▦</span> Statistik Review
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'card'}
        class="admin-tab-btn"
        class:active={activeTab === 'card'}
        onclick={() => activeTab = 'card'}
      >
        <span aria-hidden="true">▣</span> Kartu QR &amp; Print Kit
      </button>
    </div>

    {#if activeTab === 'stats'}
      <section class="admin-dashboard" aria-labelledby="admin-title">
        <div class="admin-dashboard-head">
          <div>
            <p class="mini-label"><span aria-hidden="true">✦</span> PRIVATE REVIEW STATS</p>
            <h2 id="admin-title">Haii, Lilycosrent!</h2>
            <p>Masuk sebagai {authEmail || 'admin'}.</p>
          </div>
          <div class="admin-dashboard-actions">
            <button class="admin-refresh-button" type="button" onclick={() => void loadStats()} disabled={isLoading}>
              {isLoading ? 'Memuat...' : 'Refresh ↻'}
            </button>
            <button class="admin-logout-button" type="button" onclick={() => void logout()}>Keluar</button>
          </div>
        </div>

        {#if errorMessage}<p class="admin-error" role="alert">{errorMessage}</p>{/if}

        <div class="admin-total-card">
          <div>
            <span class="admin-card-label">Total ulasan approved</span>
            <strong>{reviews.length}</strong>
            <small>cerita customer</small>
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
              <div class="admin-progress" role="progressbar" aria-label={`Rata-rata ${metric.label}`} aria-valuemin="0" aria-valuemax="5" aria-valuenow={Number(average(metric.key))}>
                <span style={`--progress-scale: ${progressRatio(average(metric.key))}`}></span>
              </div>
              <p>{Number(average(metric.key)) >= 4.5 ? 'Bestie paling suka banget!' : Number(average(metric.key)) >= 3.5 ? 'Sudah bagus, pertahankan yaa.' : 'Bisa jadi bahan evaluasi bersama.'}</p>
            </article>
          {/each}
        </div>

        <div class="admin-dashboard-footer">
          <span>{lastUpdated ? `Terakhir diperbarui ${lastUpdated}` : 'Belum ada data terbaru'}</span>
        </div>
      </section>
    {:else}
      <div class="admin-card-tab-view">
        <QrCard />
      </div>
    {/if}
  </div>
{/if}
