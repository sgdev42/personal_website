# Change Analysis - 2026-03-29

## Scope

This update replaced the duplicated multilingual page stack with a single-source, runtime translation architecture.

Main goal:
- Keep one English content source.
- Translate at runtime for Chinese, French, and Japanese.
- Avoid maintaining multiple static page trees (`zh/`, `fr/`, `ja/`).

## What Changed

1. Added runtime translation layer:
- `assets/js/i18n.js`
- Language selector supported on all core pages:
  - `index.html`
  - `pages/about.html`
  - `pages/projects.html`
  - `pages/blog.html`
  - `pages/contact.html`

2. Translation model integration strategy:
- Uses a LibreTranslate-style HTTP endpoint by default.
- Reads from `window.TRANSLATION_ENDPOINT` if provided.
- Caches translated strings in `localStorage`.
- Persists language preference in `localStorage`.

3. Resilience improvements:
- Added built-in fallback dictionary for common UI strings.
- If translation endpoint is unavailable, core navigation and UI still translate.

4. Content architecture changes:
- Removed duplicated Chinese static pages:
  - `zh/index.html`
  - `zh/pages/about.html`
  - `zh/pages/projects.html`
  - `zh/pages/blog.html`
  - `zh/pages/contact.html`
- Updated sitemap to keep only canonical single-source URLs.

5. Blog language behavior:
- Blog cards are still localStorage-based.
- Storage now buckets by selected language (`en`, `zh-CN`, `fr`, `ja`).

## Test Results

### Test 1: Local link and asset integrity
Command:
- Python script validating all local `href`/`src` targets across HTML pages.

Result:
- PASS (`OK: all local href/src targets exist`)

### Test 2: i18n script wiring
Command:
- Python script validating language selector and `i18n.js` inclusion on all core pages.

Result:
- PASS (`OK: language switch + i18n script present on all pages`)

### Test 3: External translation endpoint reachability (environment-level)
Command:
- `curl` POST to default endpoint `https://translate.argosopentech.com/translate`

Result:
- FAIL in this terminal environment (`Could not resolve host`)

Interpretation:
- DNS/network resolution for that host is unavailable in this environment.
- Site remains functional due to fallback dictionary and source-text fallback behavior.
- For production reliability, provide your own translation endpoint.

## Risk Notes

- Runtime machine translation quality can vary by provider and sentence complexity.
- Network-based translation introduces latency on first render per uncached string.
- For predictable results and uptime, point `window.TRANSLATION_ENDPOINT` to a controlled backend translation service.

## Recommended Next Step

- Add a first-party translation proxy endpoint (serverless function or API route) to stabilize reliability and control model/provider quality.
