<script lang="ts">
  import { db } from '../lib/firebase';
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { toast } from 'svelte-sonner';
  
  let formData = $state({
    reviewer_name: '',
    costume_type: '',
    rating_quality: 0,
    rating_service: 0,
    rating_speed: 0,
    comment: ''
  });
  
  let isSubmitting = $state(false);

  const categories = [
    { key: 'rating_quality', label: 'Kualitas Baju', icon: '🎭' },
    { key: 'rating_service', label: 'Keramahan Admin', icon: '💖' },
    { key: 'rating_speed', label: 'Kecepatan Chat', icon: '⚡' }
  ];

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!formData.reviewer_name || !formData.rating_quality || !formData.rating_service || !formData.rating_speed) {
      toast.error('Mohon isi nama dan semua rating ya~ ✨');
      return;
    }
    
    isSubmitting = true;
    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        status: 'approved',
        created_at: serverTimestamp(),
        ip_hash: null
      });
      
      toast.success('Ulasan berhasil dikirim! Arigatou~ 🌸');
      
      formData = {
        reviewer_name: '',
        costume_type: '',
        rating_quality: 0,
        rating_service: 0,
        rating_speed: 0,
        comment: ''
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Gagal mengirim ulasan. Coba lagi ya~ 😢');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="clay-card p-6 md:p-8 animate-fade-in-up">
  <h2 class="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
    <span class="text-3xl">✍️</span> Tulis Ulasanmu
  </h2>
  
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
    <!-- Name & Costume Type -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="name" class="text-sm font-bold text-gray-600 ml-1">Nama Kamu</label>
        <input 
          id="name"
          type="text" 
          bind:value={formData.reviewer_name}
          placeholder="Contoh: Miku Chan"
          class="clay-input w-full px-4 py-3 rounded-2xl outline-none transition-all placeholder:text-gray-400"
        />
      </div>
      <div class="space-y-2">
        <label for="costume" class="text-sm font-bold text-gray-600 ml-1">Kostum yang Disewa (Opsional)</label>
        <input 
          id="costume"
          type="text" 
          bind:value={formData.costume_type}
          placeholder="Contoh: Hatsune Miku V4X"
          class="clay-input w-full px-4 py-3 rounded-2xl outline-none transition-all placeholder:text-gray-400"
        />
      </div>
    </div>

    <!-- Ratings -->
    <div class="clay-rating-container p-5 rounded-3xl space-y-4">
      {#each categories as cat}
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-gray-700 flex items-center gap-2">
            <span class="text-xl">{cat.icon}</span> {cat.label}
          </span>
          <div class="flex gap-1 bg-white/50 p-1 rounded-2xl">
            {#each [1, 2, 3, 4, 5] as star}
              <button
                type="button"
                class="text-2xl transition-all duration-200 hover:scale-125 focus:outline-none cursor-pointer active:scale-95"
                class:text-yellow-400={star <= formData[cat.key]}
                class:text-gray-300={star > formData[cat.key]}
                onclick={() => formData[cat.key] = star}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Comment -->
    <div class="space-y-2">
      <label for="comment" class="text-sm font-bold text-gray-600 ml-1">Ceritakan Pengalamanmu~ 💬</label>
      <textarea 
        id="comment"
        bind:value={formData.comment}
        rows="4"
        placeholder="Bajunya bagus banget, adminnya ramah, bales chatnya cepet! Recommended pokoknya~ ✨"
        class="clay-input w-full px-4 py-3 rounded-2xl outline-none transition-all resize-none placeholder:text-gray-400"
      ></textarea>
    </div>

    <!-- Submit Button -->
    <button
      disabled={isSubmitting}
      class="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-2xl shadow-[0_4px_0_rgb(219,39,119)] hover:shadow-[0_6px_0_rgb(219,39,119)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
    >
      {#if isSubmitting}
        <span class="animate-spin">🌸</span> Mengirim...
      {:else}
        <span>Kirim Ulasan ✨</span>
      {/if}
    </button>
  </form>
</div>

<style>
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  
  /* Claymorphism Styles */
  .clay-card {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24px;
    border: 3px solid rgba(255, 182, 193, 0.3);
    box-shadow: 
      inset -2px -2px 8px rgba(255, 255, 255, 0.8),
      inset 2px 2px 8px rgba(236, 72, 153, 0.05),
      8px 8px 16px rgba(236, 72, 153, 0.1),
      -4px -4px 12px rgba(255, 255, 255, 0.9);
  }
  
  .clay-input {
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(255, 182, 193, 0.2);
    box-shadow: 
      inset 2px 2px 6px rgba(236, 72, 153, 0.05),
      inset -1px -1px 4px rgba(255, 255, 255, 0.8);
  }
  .clay-input:focus {
    background: white;
    border-color: #f472b6;
    box-shadow: 
      inset 2px 2px 6px rgba(236, 72, 153, 0.08),
      0 0 0 3px rgba(244, 114, 182, 0.2);
  }
  
  .clay-rating-container {
    background: linear-gradient(135deg, rgba(252, 231, 243, 0.5) 0%, rgba(243, 232, 255, 0.5) 100%);
    border: 2px solid rgba(255, 182, 193, 0.2);
    box-shadow: inset 2px 2px 8px rgba(255, 255, 255, 0.6);
  }
</style>