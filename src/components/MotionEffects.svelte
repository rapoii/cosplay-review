<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slowUpdate = window.matchMedia('(update: slow)').matches;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
    }).connection;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
    const slowConnection = ['slow-2g', '2g'].includes(connection?.effectiveType ?? '');
    const lowPower = reducedMotion || slowUpdate || Boolean(connection?.saveData) || slowConnection || hardwareConcurrency <= 4 || (deviceMemory ?? 8) <= 4;

    root.classList.add('motion-ready', 'motion-60');
    if (lowPower) root.classList.add('low-power');

    if (reducedMotion) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove('motion-ready', 'motion-60', 'low-power');
    };
  });
</script>
