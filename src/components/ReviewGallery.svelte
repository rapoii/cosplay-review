<script lang="ts">
  import { onMount } from 'svelte';
  import { demoReviews } from '../lib/demoReviews';

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

  let reviews = $state<Review[]>(demoReviews);
  let usingDemoData = $state(true);

  onMount(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    const startRealtimeReviews = async () => {
      try {
        const [{ db }, { collection, query, orderBy, onSnapshot }] = await Promise.all([
          import('../lib/firebase'),
          import('firebase/firestore')
        ]);
        if (disposed) return;

        const reviewsQuery = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));
        unsubscribe = onSnapshot(
          reviewsQuery,
          (snapshot) => {
            if (disposed) return;
            const firestoreReviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Review[];
            usingDemoData = firestoreReviews.length === 0;
            reviews = firestoreReviews.length ? firestoreReviews : demoReviews;
          },
          (error) => {
            console.error('Error loading reviews snapshot:', error);
            if (!disposed) {
              usingDemoData = true;
              reviews = demoReviews;
            }
          }
        );
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    void startRealtimeReviews();
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  });

  function safeRating(value?: number) {
    return Math.max(0, Math.min(5, Number(value) || 0));
  }

  function averageRating(review: Review) {
    const total = safeRating(review.rating_quality) + safeRating(review.rating_service) + safeRating(review.rating_speed);
    return (total / 3).toFixed(1);
  }

  function getStars(value?: number) {
    const rating = safeRating(value);
    return Array.from({ length: 5 }, (_, index) => (index < rating ? '★' : '☆')).join('');
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

{#if reviews.length === 0}
  <div class="empty-reviews">
    <div class="empty-icon"><img class="empty-avatar" src="/lilycosrent-avatar-square.webp" alt="Maskot chibi Lilycosrent" width="512" height="512" loading="lazy" decoding="async" /></div>
    <h3>Belum ada cerita di sini.</h3>
    <p>Jadilah yang pertama berbagi pengalaman sewamu dengan komunitas.</p>
    <a href="#tulis-ulasan" class="empty-link">Tulis ulasan pertama <span class="inline-flair" aria-hidden="true">↗</span></a>
  </div>
{:else}
  {#if usingDemoData}
    <div class="demo-data-note" role="status"><span aria-hidden="true">✦</span> Data demo sementara — akan tergantikan otomatis saat ulasan Firebase masuk.</div>
  {/if}
  <div class="review-grid">
    {#each reviews as review, index (review.id)}
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
          <blockquote>“{review.comment}”</blockquote>
        {/if}
      </article>
    {/each}
  </div>
{/if}
