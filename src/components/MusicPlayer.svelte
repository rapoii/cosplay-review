<script lang="ts">
  import { onMount } from 'svelte';

  let audio: HTMLAudioElement;
  let status = 'Memuat musik';
  const audioSelector = 'audio[data-lilycosrent-audio]';

  function getOrCreateAudio() {
    const existing = document.documentElement.querySelector<HTMLAudioElement>(audioSelector);
    if (existing) return existing;

    const element = document.createElement('audio');
    const opusPath = '/cupid-lite.opus';
    const mp3FallbackPath = '/cupid-lite.mp3';
    const opusSupport = element.canPlayType('audio/ogg; codecs="opus"');

    element.dataset.lilycosrentAudio = 'true';
    element.dataset.audioFormat = opusSupport ? 'opus' : 'mp3';
    element.src = opusSupport ? opusPath : mp3FallbackPath;
    element.autoplay = true;
    element.loop = true;
    element.preload = 'none';
    element.playsInline = true;
    element.setAttribute('aria-label', 'Musik latar Cupid Lilycosrent');
    element.setAttribute('aria-hidden', 'true');
    element.className = 'lilycosrent-audio';
    element.addEventListener('error', () => {
      if (element.dataset.audioFormat !== 'opus' || element.dataset.audioFallback === 'true') return;
      element.dataset.audioFallback = 'true';
      element.dataset.audioFormat = 'mp3';
      element.src = mp3FallbackPath;
      element.load();
      void element.play().catch(() => undefined);
    });
    document.documentElement.appendChild(element);
    return element;
  }

  async function startMusic() {
    if (!audio) return;

    try {
      await audio.play();
      status = 'Musik Cupid sedang diputar';
    } catch {
      // Chrome may block audible autoplay until the first user gesture.
      status = 'Musik akan mulai setelah interaksi pertama';
    }
  }

  onMount(() => {
    audio = getOrCreateAudio();
    const interactionEvents = ['pointerdown', 'touchstart', 'keydown'];
    let unlockInFlight = false;

    const removeUnlockListeners = () => {
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, unlockAudio, true));
    };

    const unlockAudio = async () => {
      if (unlockInFlight) return;
      unlockInFlight = true;
      try {
        await startMusic();
        if (audio && !audio.paused) removeUnlockListeners();
      } finally {
        unlockInFlight = false;
      }
    };

    // Best-effort autoplay on initial page load.
    void startMusic();

    // Keep trying until one trusted user gesture is accepted by the browser.
    interactionEvents.forEach((eventName) => window.addEventListener(eventName, unlockAudio, { capture: true, passive: true }));

    return removeUnlockListeners;
  });
</script>

<span class="sr-only" aria-live="polite">{status}</span>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
