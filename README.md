# Personal Website

Personal website for Simon Guo, deployed with GitHub Pages.

## What this includes

- Multi-page site: Home, About, Projects, Blog, Contact
- Single-source pages with runtime language switching
- Bidirectional translation support for English and Chinese
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
├── data/blog_cards.json
├── scripts/add_blog_card.py
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
3. Point `window.TRANSLATION_ENDPOINT` to your own translation service for reliability in production.

## Translation architecture

- Pages can be authored in either English or Chinese.
- `assets/js/i18n.js` translates full visible content at runtime (text nodes + key attributes).
- Language selection is persisted per visitor.
- No duplicated `zh/` page tree is needed.
- Element-level source language is supported via `data-source-lang` (optional override).
- Includes built-in EN↔ZH translation memory for current site copy so language switch still works when external translation API is unavailable.

Current language targets:
- `en`
- `zh-CN`

Authoring workflow:
- For page-level content, keep `<html data-source-lang="en">` (or set `zh-CN` if page is authored in Chinese).
- For section-level mixed language content, set `data-source-lang` on that section/element.
- The site translates from each block's source language to the selected display language.

Optional custom translation endpoint:

```html
<script>
  window.TRANSLATION_ENDPOINT = "https://your-translation-service/translate";
</script>
```

Expected endpoint contract (LibreTranslate-style):
- POST JSON: `{ "q": "...", "source": "en", "target": "zh", "format": "text" }`
- Response JSON: `{ "translatedText": "..." }`

## Blog cards

- Blog cards are loaded from `data/blog_cards.json`.
- Add cards from the repo (not via browser form):

```bash
python3 scripts/add_blog_card.py \
  --lang en \
  --title "Post title" \
  --excerpt "Main thought to share" \
  --tags "tag1,tag2"
```

- To author directly in Chinese, use `--lang zh-CN`.
- Each card stores `source_lang`; the opposite language is generated at runtime via translation.

## Validation and analysis

- Detailed change log and test summary:
  - `CHANGE_ANALYSIS_2026-03-29.md`

Checks run for this update:
- Local link and asset integrity across all HTML pages.
- i18n script + language switch wiring on all core pages.
- Translation endpoint reachability probe (environment-level).

Note:
- If your translation endpoint is unavailable, the site gracefully falls back to source text.

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main`; the workflow at `.github/workflows/deploy.yml` will deploy.

Live site URL:

`https://sgdev42.github.io/personal_website/`
