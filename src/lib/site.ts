const configuredSiteUrl = import.meta.env.PUBLIC_SITE_URL?.trim();

export function getReviewUrl(origin = typeof window !== 'undefined' ? window.location.origin : '') {
  const baseUrl = configuredSiteUrl || origin;
  if (!baseUrl) return '/#tulis-ulasan';

  try {
    return new URL('/#tulis-ulasan', baseUrl).toString();
  } catch {
    return `${origin || ''}/#tulis-ulasan`;
  }
}
