## Development Commands

```bash
# Start Astro dev server
npm run dev

# Run full type-check
npm run typecheck

# Build for production
npm run build
```

## Architecture & Conventions

- **Astro + Svelte 5**: Modern reactivity with `$state` runes.
- **Admin Hub & Security**: Admin panel at `/admin` with Firebase Auth. QR Print Kit is securely hosted in the Admin tab view.
- **Unified Design Tokens**: Pure Kawaii pastel pink theme (`--pink-500: #ec5f93`, `--pink-600: #d63d75`, `--font-display: 'Baloo 2'`).
- **DoD (Definition of Done)**: Always verify with `npm run build` (0 error) and visual audit before committing.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
