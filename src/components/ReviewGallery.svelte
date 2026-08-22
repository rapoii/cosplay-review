<script lang="ts">
  import { onMount } from 'svelte';

  type Review = {
    id: string;
    instagram_username?: string;
    reviewer_name?: string;
    costume_type?: string;
    rating_quality?: number;
    rating_service?: number;
    rating_speed?: number;
    comment?: string;
  };

  const PAGE_SIZE = 5;
  const ROTATE_INTERVAL_MS = 5000;

  let allReviews = $state<Review[]>([]);
  let showAll = $state(false);
  let pageOffset = $state(0);

  let displayedReviews = $derived(
    showAll ? allReviews : allReviews.slice(pageOffset, pageOffset + PAGE_SIZE)
  );

  let hasMore = $derived(allReviews.length > PAGE_SIZE);

  onMount(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    let rotateTimer: ReturnType<typeof setInterval> | undefined;

    const startRealtimeReviews = async () => {
      try {
        const [{ db }, { collection, query, where, orderBy, onSnapshot }] = await Promise.all([
          import('../lib/firebase'),
          import('firebase/firestore')
        ]);
        if (disposed) return;

        const reviewsQuery = query(collection(db, 'reviews'), where('status', '==', 'approved'), orderBy('created_at', 'desc'));
        unsubscribe = onSnapshot(
          reviewsQuery,
          (snapshot) => {
            if (disposed) return;
            allReviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Review[];
          },
          (error) => {
            console.error('Error loading reviews snapshot:', error);
            if (!disposed) {
              allReviews = [];
            }
          }
        );
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    void startRealtimeReviews();

    rotateTimer = setInterval(() => {
      if (showAll || allReviews.length <= PAGE_SIZE) return;
      pageOffset = (pageOffset + PAGE_SIZE) % allReviews.length;
    }, ROTATE_INTERVAL_MS);

    return () => {
      disposed = true;
      unsubscribe?.();
      if (rotateTimer) clearInterval(rotateTimer);
    };
  });

  function toggleShowAll() {
    showAll = !showAll;
    if (!showAll) pageOffset = 0;
  }

  function safeRating(value?: number) {
    return Math.max(0, Math.min(5, Number(value) || 0));
  }

  function averageRating(review: Review) {
    const total = safeRating(review.rating_quality) + safeRating(review.rating_service) + safeRating(review.rating_speed);
    return (total / 3).toFixed(1);
  }

  function getStars(value?: number) {
    const rating = safeRating(value);
    const roundedRating = Math.round(rating);
    return Array.from({ length: 5 }, (_, index) => (index < roundedRating ? '★' : '☆')).join('');
  }

  function getReviewerHandle(review: Review) {
    return review.instagram_username || review.reviewer_name || 'Anonim';
  }

  function getInitials(name?: string) {
    const words = (name || 'Anonim').trim().replace(/^@/, '').split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  }

  function getMetrics(review: Review) {
    return [
      { label: 'Kualitas', value: review.rating_quality },
      { label: 'Admin', value: review.rating_service },
      { label: 'Kecepatan', value: review.rating_speed }
    ];
  }
</script>

{#if allReviews.length === 0}
  <div class="empty-reviews">
    <div class="empty-icon"><img class="empty-avatar" src="/lilycosrent-avatar-square.webp" alt="Maskot chibi Lilycosrent" width="512" height="512" loading="lazy" decoding="async" /></div>
    <h3>Belum ada cerita di sini.</h3>
    <p>Jadilah yang pertama berbagi pengalaman sewamu dengan komunitas.</p>
    <a href="#tulis-ulasan" class="empty-link">Tulis ulasan pertama <span class="inline-flair" aria-hidden="true">↗</span></a>
  </div>
{:else}
  <div class="review-grid review-rotate-fade" key={showAll ? 'all' : `page-${pageOffset}`}>
    {#each displayedReviews as review, index (review.id)}
      <article class="review-card" style={`--delay: ${index * 55}ms`}>
        <div class="review-card-top">
          <div class="review-person">
            <div class="review-avatar" aria-hidden="true">{getInitials(getReviewerHandle(review))}</div>
            <div>
              <h3>{getReviewerHandle(review)}</h3>
              {#if review.costume_type}
                <p>{review.costume_type}</p>
              {:else}
                <p>Penyewa kostum</p>
              {/if}
            </div>
          </div>
          <div class="review-score" aria-label={`Skor rata-rata ${averageRating(review)} dari 5`}>
            <strong>{averageRating(review)}</strong>
            <span>/ 5</span>
          </div>
        </div>

        <div class="review-stars" aria-label={`${averageRating(review)} dari 5 bintang`}>{getStars(Number(averageRating(review)))} <span>{averageRating(review)}</span></div>

        <div class="review-metrics">
          {#each getMetrics(review) as metric}
            <div class="metric-item">
              <span>{metric.label}</span>
              <strong>{safeRating(metric.value)}<small>/5</small></strong>
            </div>
          {/each}
        </div>

        {#if review.comment}
          <blockquote>"{review.comment}"</blockquote>
        {/if}
      </article>
    {/each}
  </div>

  {#if hasMore}
    <div class="wall-show-more">
      <button class="wall-show-more-button" type="button" onclick={toggleShowAll}>
        {showAll ? 'Tampilkan lebih sedikit' : `Lihat semua ulasan (${allReviews.length})`}
        <span aria-hidden="true">{showAll ? '↑' : '↗'}</span>
      </button>
    </div>
  {/if}
{/if}

<style>
  .review-rotate-fade {
    animation: reviewFadeIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: opacity, transform;
  }

  @keyframes reviewFadeIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .wall-show-more {
    display: flex;
    justify-content: center;
    margin-top: 28px;
  }

  .wall-show-more-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border: 2px solid var(--pink-300, #f9c4d8);
    border-radius: 16px;
    background: #fff;
    color: var(--plum, #4a1942);
    font-family: var(--font-display, 'Baloo 2', cursive);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 0 var(--pink-300, #f9c4d8), 0 8px 16px rgba(236, 95, 147, 0.12);
    transition: transform 160ms var(--ease-out, ease-out), box-shadow 160ms var(--ease-out, ease-out), background 160ms var(--ease-out, ease-out);
  }

  .wall-show-more-button:hover {
    transform: translateY(-2px);
    background: var(--pink-50, #fff5f9);
  }

  .wall-show-more-button:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 0 var(--pink-300, #f9c4d8), 0 4px 8px rgba(236, 95, 147, 0.12);
  }
</style>
