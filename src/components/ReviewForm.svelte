<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { getReviewUrl } from '../lib/site';

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
  const MAX_USERNAME_LENGTH = 31;
  const MAX_COSTUME_LENGTH = 120;
  const MAX_COMMENT_LENGTH = 500;
  const instagramPattern = /^@?[A-Za-z0-9._]{1,30}$/;

  let formData = $state<FormData>(emptyForm());
  let submittedReview = $state<SubmittedReview | null>(null);
  let isSubmitting = $state(false);

  const categories = [
    { key: 'rating_quality', label: 'Kualitas kostum', helper: 'Bahan, ukuran, dan detail', icon: '✦' },
    { key: 'rating_service', label: 'Keramahan admin', helper: 'Respons dan komunikasinya', icon: '♡' },
    { key: 'rating_speed', label: 'Kecepatan chat', helper: 'Seberapa cepat dibalas', icon: 'ϟ' }
  ] as const;

  function setRating(key: RatingKey, value: number) {
    formData[key] = Math.max(1, Math.min(5, Math.round(value)));
  }

  function getRatingTabIndex(key: RatingKey, star: number) {
    const selected = formData[key];
    return selected ? (selected === star ? 0 : -1) : (star === 1 ? 0 : -1);
  }

  function handleRatingKeydown(event: KeyboardEvent, key: RatingKey, star: number) {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;

    event.preventDefault();
    const target = event.key === 'Home' ? 1 : event.key === 'End' ? 5 : ((star - 1 + direction + 5) % 5) + 1;
    setRating(key, target);
    document.getElementById(`${key}-${target}`)?.focus();
  }

  function getRatingLabel(value: number) {
    return value ? `${value}/5 · ${ratingDescriptions[value]}` : 'Belum diisi';
  }

  function shareToWhatsApp() {
    if (!submittedReview || typeof window === 'undefined') return;

    const reviewUrl = getReviewUrl(window.location.origin);
    const message = [
      `Aku baru aja kasih review di Lilycosrent! ⭐`,
      ``,
      `Pengalamanku:`,
      `${submittedReview.rating_quality}/5 untuk kostum`,
      `${submittedReview.rating_service}/5 untuk admin`,
      `${submittedReview.rating_speed}/5 untuk kecepatan chat`,
      ``,
      `Kalau kamu juga pernah rental, boleh ikutan cerita di sini yaa:`,
      reviewUrl,
      ``,
      `Follow juga @lilycosrent_ ♡`
    ].join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  function scrollToWall(e: MouseEvent) {
    e.preventDefault();
    document.getElementById('ulasan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function writeAnotherReview() {
    submittedReview = null;
    formData = emptyForm();
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const username = formData.instagram_username.trim();
    const costume = formData.costume_type.trim();
    const comment = formData.comment.trim();
    const ratings = [formData.rating_quality, formData.rating_service, formData.rating_speed];

    if (!instagramPattern.test(username) || username.length > MAX_USERNAME_LENGTH) {
      toast.error('Isi username Instagram yang valid, tanpa spasi atau simbol khusus ya.');
      return;
    }
    if (costume.length > MAX_COSTUME_LENGTH || comment.length > MAX_COMMENT_LENGTH || ratings.some((rating) => !Number.isInteger(rating) || rating < 1 || rating > 5)) {
      toast.error('Periksa kembali panjang teks dan rating yang kamu isi ya.');
      return;
    }

    isSubmitting = true;
    const cleanReview: FormData = {
      instagram_username: username,
      costume_type: costume,
      rating_quality: formData.rating_quality,
      rating_service: formData.rating_service,
      rating_speed: formData.rating_speed,
      comment
    };

    try {
      const [{ db }, { collection, addDoc, serverTimestamp }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]);

      await addDoc(collection(db, 'reviews'), {
        ...cleanReview,
        status: 'pending',
        created_at: serverTimestamp()
      });

      submittedReview = cleanReview;
      formData = emptyForm();
      toast.success('Ulasanmu sudah diterima dan menunggu moderasi.');
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
    <p class="success-copy">Cerita kamu sudah diterima dan akan tampil di <em>Wall of Love</em> setelah moderasi. Makasih sudah bantu bestie cosplay lainnya rental dengan lebih tenang ♡</p>

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
      <a class="success-secondary-button" href="#ulasan" onclick={scrollToWall}>Lihat Wall of Love <span aria-hidden="true">↗</span></a>
      <button class="success-reset-button" type="button" onclick={writeAnotherReview}>Tulis ulasan lain</button>
    </div>
  </section>
{:else}
  <form class="review-form" onsubmit={handleSubmit}>
    <div class="form-grid">
      <div class="field-group">
        <label for="instagram-username">Username Instagram <span>*</span></label>
        <input id="instagram-username" type="text" bind:value={formData.instagram_username} placeholder="Contoh: @miku_chan" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength={MAX_USERNAME_LENGTH} pattern="@?[A-Za-z0-9._]{1,30}" aria-describedby="instagram-hint" required />
        <small id="instagram-hint" class="field-hint-text">Maksimal 30 karakter, tanpa spasi.</small>
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
                  id={`${category.key}-${star}`}
                  type="button"
                  class:active={star <= formData[category.key]}
                  class="star-button"
                  role="radio"
                  tabindex={getRatingTabIndex(category.key, star)}
                  aria-checked={star === formData[category.key]}
                  aria-label={`${star} bintang untuk ${category.label} — ${ratingDescriptions[star]}`}
                  onclick={() => setRating(category.key, star)}
                  onkeydown={(event) => handleRatingKeydown(event, category.key, star)}
                >★</button>
              {/each}
              <span class:filled={Boolean(formData[category.key])} class="rating-value" aria-live="polite">{getRatingLabel(formData[category.key])}</span>
            </div>
          </div>
        {/each}
      </div>
    </fieldset>

    <div class="field-group">
      <label for="comment">Ceritakan sedikit <small>opsional</small></label>
      <textarea id="comment" bind:value={formData.comment} rows="4" maxlength={MAX_COMMENT_LENGTH} aria-describedby="comment-hint" placeholder="Apa yang paling kamu suka dari pengalaman sewamu?"></textarea>
      <div id="comment-hint" class="field-hint"><span>Jujur, santai, dan tetap ramah.</span><span>{formData.comment.length} / {MAX_COMMENT_LENGTH}</span></div>
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
