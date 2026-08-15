<script lang="ts">
  import { toast } from 'svelte-sonner';

  type RatingKey = 'rating_quality' | 'rating_service' | 'rating_speed';
  type FormData = {
    instagram_username: string;
    costume_type: string;
    rating_quality: number;
    rating_service: number;
    rating_speed: number;
    comment: string;
  };
  type SubmittedReview = FormData;

  const emptyForm = (): FormData => ({
    instagram_username: '',
    costume_type: '',
    rating_quality: 0,
    rating_service: 0,
    rating_speed: 0,
    comment: ''
  });

  const ratingDescriptions: Record<number, string> = {
    1: 'Kurang puas',
    2: 'Lumayan',
    3: 'Cukup oke',
    4: 'Bagus banget',
    5: 'Puas banget!'
  };

  let formData = $state<FormData>(emptyForm());
  let submittedReview = $state<SubmittedReview | null>(null);
  let isSubmitting = $state(false);

  const categories = [
    { key: 'rating_quality', label: 'Kualitas kostum', helper: 'Bahan, ukuran, dan detail', icon: '✦' },
    { key: 'rating_service', label: 'Keramahan admin', helper: 'Respons dan komunikasinya', icon: '♡' },
    { key: 'rating_speed', label: 'Kecepatan chat', helper: 'Seberapa cepat dibalas', icon: 'ϟ' }
  ] as const;

  function setRating(key: RatingKey, value: number) {
    formData[key] = value;
  }

  function getRatingLabel(value: number) {
    return value ? `${value}/5 · ${ratingDescriptions[value]}` : 'Belum diisi';
  }

  function shareToWhatsApp() {
    if (!submittedReview || typeof window === 'undefined') return;

    const reviewUrl = `${window.location.origin}/#tulis-ulasan`;
    const message = [
      `Aku baru aja kasih review di Lilycosrent! ⭐`,
      `Pengalamanku: ${submittedReview.rating_quality}/5 untuk kostum, ${submittedReview.rating_service}/5 untuk admin, dan ${submittedReview.rating_speed}/5 untuk kecepatan chat.`,
      `Kalau kamu juga pernah rental, boleh ikutan cerita di sini yaa: ${reviewUrl}`,
      `Follow juga @lilycosrent_ ♡`
    ].join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  function writeAnotherReview() {
    submittedReview = null;
    formData = emptyForm();
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!formData.instagram_username.trim() || !formData.rating_quality || !formData.rating_service || !formData.rating_speed) {
      toast.error('Isi username Instagram dan tiga rating dulu ya.');
      return;
    }

    isSubmitting = true;
    const cleanReview: FormData = {
      instagram_username: formData.instagram_username.trim(),
      costume_type: formData.costume_type.trim(),
      rating_quality: formData.rating_quality,
      rating_service: formData.rating_service,
      rating_speed: formData.rating_speed,
      comment: formData.comment.trim()
    };

    try {
      const [{ db }, { collection, addDoc, serverTimestamp }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]);

      await addDoc(collection(db, 'reviews'), {
        ...cleanReview,
        status: 'approved',
        created_at: serverTimestamp(),
        ip_hash: null
      });

      submittedReview = cleanReview;
      formData = emptyForm();
      toast.success('Ulasanmu sudah masuk ke Wall of Love!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Ulasan belum terkirim. Coba lagi sebentar ya.');
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if submittedReview}
  <section class="review-success" aria-live="polite">
    <div class="success-sparkles" aria-hidden="true">
      <span class="success-sparkle success-sparkle-one">✦</span>
      <span class="success-sparkle success-sparkle-two">♡</span>
      <span class="success-sparkle success-sparkle-three">✦</span>
      <span class="success-confetti success-confetti-one"></span>
      <span class="success-confetti success-confetti-two"></span>
      <span class="success-confetti success-confetti-three"></span>
    </div>
    <div class="success-badge" aria-hidden="true">♡</div>
    <p class="mini-label"><span aria-hidden="true">✦</span> REVIEW RECEIVED</p>
    <h2>Makasih, {submittedReview.instagram_username}!</h2>
    <p class="success-copy">Cerita kamu sudah masuk ke <em>Wall of Love</em>. Makasih sudah bantu bestie cosplay lainnya rental dengan lebih tenang ♡</p>

    <div class="success-summary" aria-label="Ringkasan rating yang baru dikirim">
      {#each categories as category}
        <div class="success-rating-item">
          <span class:lightning-icon={category.key === 'rating_speed'} class="rating-icon" aria-hidden="true">{category.icon}</span>
          <span>
            <strong>{submittedReview[category.key]}/5</strong>
            <small>{ratingDescriptions[submittedReview[category.key]]}</small>
          </span>
        </div>
      {/each}
    </div>

    <div class="success-actions">
      <button class="whatsapp-button" type="button" onclick={shareToWhatsApp}>
        <span class="whatsapp-mark" aria-hidden="true">↗</span> Share ke WhatsApp
      </button>
      <a class="success-secondary-button" href="#ulasan">Lihat Wall of Love <span aria-hidden="true">↗</span></a>
      <button class="success-reset-button" type="button" onclick={writeAnotherReview}>Tulis ulasan lain</button>
    </div>
  </section>
{:else}
  <form class="review-form" onsubmit={handleSubmit}>
    <div class="form-grid">
      <div class="field-group">
        <label for="instagram-username">Username Instagram <span>*</span></label>
        <input id="instagram-username" type="text" bind:value={formData.instagram_username} placeholder="Contoh: @miku_chan" autocomplete="username" autocapitalize="none" spellcheck="false" required />
      </div>
      <div class="field-group">
        <label for="costume">Kostum yang disewa <small>opsional</small></label>
        <input id="costume" type="text" bind:value={formData.costume_type} placeholder="Contoh: Hatsune Miku V4X" />
      </div>
    </div>

    <fieldset class="rating-fieldset">
      <legend>Bagaimana pengalamanmu? <span class="legend-note">Pilih 1–5 bintang</span></legend>
      <div class="rating-list">
        {#each categories as category}
          <div class="rating-row">
            <div class="rating-label">
              <span class:lightning-icon={category.key === 'rating_speed'} class="rating-icon" aria-hidden="true">{category.icon}</span>
              <span><strong>{category.label}</strong><small>{category.helper}</small></span>
            </div>
            <div class="rating-control" role="radiogroup" aria-label={category.label}>
              {#each [1, 2, 3, 4, 5] as star}
                <button
                  type="button"
                  class:active={star <= formData[category.key]}
                  class="star-button"
                  role="radio"
                  aria-checked={star === formData[category.key]}
                  aria-label={`${star} bintang untuk ${category.label} — ${ratingDescriptions[star]}`}
                  onclick={() => setRating(category.key, star)}
                >★</button>
              {/each}
              <span class:filled={Boolean(formData[category.key])} class="rating-value">{getRatingLabel(formData[category.key])}</span>
            </div>
          </div>
        {/each}
      </div>
    </fieldset>

    <div class="field-group">
      <label for="comment">Ceritakan sedikit <small>opsional</small></label>
      <textarea id="comment" bind:value={formData.comment} rows="4" maxlength="500" placeholder="Apa yang paling kamu suka dari pengalaman sewamu?"></textarea>
      <div class="field-hint"><span>Jujur, santai, dan tetap ramah.</span><span>{formData.comment.length} / 500</span></div>
    </div>

    <div class="form-submit-row">
      <p><span class="form-note-flair" aria-hidden="true">♡</span> Ulasanmu akan langsung tampil di wall.</p>
      <button class="submit-button" type="submit" disabled={isSubmitting}>
        {#if isSubmitting}
          <span class="submit-spinner" aria-hidden="true"></span> Mengirim...
        {:else}
          Kirim ulasan <span class="submit-flair" aria-hidden="true">✦</span>
        {/if}
      </button>
    </div>
  </form>
{/if}
