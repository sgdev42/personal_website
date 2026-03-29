# Personal Website

Personal website for Simon Guo, deployed with GitHub Pages.

## What this includes

- Multi-page site: Home, About, Projects, Blog, Contact
- Single English source pages with runtime language switching
- Translation-ready support for English, Chinese, French, and Japanese
- Futuristic, minimal visual style with subtle motion accents
- Lightweight JavaScript for mobile menu, reveal effects, footer year, and blog cards
- Runtime translation engine with cache to avoid maintaining duplicated page trees
- 404 page, `robots.txt`, `sitemap.xml`, `.nojekyll`
- GitHub Actions workflow to deploy to GitHub Pages on push to `main`

## Project structure

```text
.
├── .github/workflows/deploy.yml
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── i18n.js
│       └── main.js
├── pages/
│   ├── about.html
│   ├── blog.html
│   ├── contact.html
│   └── projects.html
├── 404.html
├── index.html
├── robots.txt
└── sitemap.xml
```

## Current customization status

Already configured:
- Name and branding updated to Simon Guo (`SG`)
- Site domain configured to `https://sgdev42.github.io/personal_website/`
- Contact email and LinkedIn links configured
- GitHub profile link configured to `https://github.com/sgdev42`

Still recommended to customize:
1. Replace `Coming Soon` project slots in `pages/projects.html` with real project details later.
2. Refine hero/about copy in `index.html` and `pages/about.html` with your final bio and focus areas.
3. If you want more accurate translations, point `window.TRANSLATION_ENDPOINT` to your own translation service.

## Translation architecture

- Pages are authored once in English.
- `assets/js/i18n.js` translates visible text at runtime and caches translations in `localStorage`.
- Language selection is persisted per visitor.
- No duplicated `zh/` page tree is needed anymore.
- Includes a fallback dictionary for common UI labels when translation API is unreachable.

Current language targets:
- `en` (source)
- `zh-CN`
- `fr`
- `ja`

Optional custom translation endpoint:

```html
<script>
  window.TRANSLATION_ENDPOINT = "https://your-translation-service/translate";
</script>
```

Expected endpoint contract (LibreTranslate-style):
- POST JSON: `{ "q": "...", "source": "en", "target": "fr", "format": "text" }`
- Response JSON: `{ "translatedText": "..." }`

## Blog cards

- Blog cards are created from `pages/blog.html` and saved to browser `localStorage`.
- Cards are stored separately by selected language.
- Cards are client-side only (per browser/device); they are not synced to GitHub automatically.

## Validation and analysis

- Detailed change log and test summary:
  - `CHANGE_ANALYSIS_2026-03-29.md`

Checks run for this update:
- Local link and asset integrity across all HTML pages.
- i18n script + language switch wiring on all core pages.
- Translation endpoint reachability probe (environment-level).

Note:
- If your selected translation endpoint is unavailable, the site gracefully falls back to source English text plus dictionary-based UI translations.

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main`; the workflow at `.github/workflows/deploy.yml` will deploy.

Live site URL:

`https://sgdev42.github.io/personal_website/`
