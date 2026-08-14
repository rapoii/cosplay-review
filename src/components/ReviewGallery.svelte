<script lang="ts">
  import { db } from '../lib/firebase';
  import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
  import { onMount } from 'svelte';

  let reviews = $state<any[]>([]);

  onMount(() => {
    const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
    return () => unsubscribe();
  });

  function getStars(rating: number) {
    return Array(5).fill(0).map((_, i) => i < rating ? '★' : '☆');
  }
</script>

<div class="mt-12">
  <div class="flex items-center justify-center gap-3 mb-8">
    <span class="text-3xl animate-sparkle">💖</span>
    <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
      Wall of Love
    </h2>
    <span class="text-3xl animate-sparkle" style="animation-delay: 0.5s">💖</span>
  </div>

  {#if reviews.length === 0}
    <div class="clay-card p-12 text-center animate-float-in">
      <p class="text-6xl mb-4 animate-bounce-slow">🌸</p>
      <p class="text-xl font-semibold text-pink-400">Belum ada ulasan nih~</p>
      <p class="text-sm text-slate-400 mt-2">Jadi yang pertama review yuk! ✨</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each reviews as review, index (review.id)}
        <div 
          class="clay-card p-6 hover:scale-[1.02] transition-transform duration-300 animate-float-in"
          style="animation-delay: {index * 0.1}s"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-700 text-lg">{review.reviewer_name}</h3>
              {#if review.costume_type}
                <span class="inline-block mt-1 text-xs font-semibold text-pink-500 bg-pink-100 px-3 py-1 rounded-full border border-pink-200">
                  🎭 {review.costume_type}
                </span>
              {/if}
            </div>
            <span class="text-2xl animate-sparkle">✨</span>
          </div>

          <!-- Ratings -->
          <div class="space-y-2 mb-4 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 font-medium">Kualitas</span>
              <span class="text-yellow-400 tracking-wider text-base">{getStars(review.rating_quality).join('')}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 font-medium">Admin</span>
              <span class="text-yellow-400 tracking-wider text-base">{getStars(review.rating_service).join('')}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 font-medium">Kecepatan</span>
              <span class="text-yellow-400 tracking-wider text-base">{getStars(review.rating_speed).join('')}</span>
            </div>
          </div>

          <!-- Comment -->
          {#if review.comment}
            <p class="text-slate-600 text-sm italic leading-relaxed border-l-4 border-pink-300 pl-4 py-1">
              "{review.comment}"
            </p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes float-in {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.2) rotate(15deg); opacity: 0.8; }
  }

  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-float-in {
    animation: float-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .animate-sparkle {
    animation: sparkle 2.5s ease-in-out infinite;
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
</style>